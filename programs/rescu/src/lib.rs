//! ReliefRail: Event-Triggered, Rule-Restricted Disaster Relief on Solana (India).
//!
//! Enforces disaster zone boundaries, per-order caps, rolling 24-hour limits,
//! merchant suspensions for price gouging, and post-30-day aid expiry on-chain.

pub mod error;
pub mod events;
pub mod state;

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use error::ReliefRailError;
use events::*;
use state::*;

declare_id!("GrxgRShVcGaESyztvHHtaCF8YMXVhK3Wq7AesbQCaLy5");

#[program]
pub mod rescu {
    use super::*;

    /// Initialize a disaster relief pool with total budget, caps, and expiry timestamp.
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        disaster_id: [u8; 32],
        name: String,
        total_budget: u64,
        order_cap: u64,
        daily_cap: u64,
        duration_seconds: i64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        pool.admin = ctx.accounts.admin.key();
        pool.oracle = ctx.accounts.oracle.key();
        pool.disaster_id = disaster_id;
        pool.name = name;
        pool.mint = ctx.accounts.mint.key();
        pool.vault = ctx.accounts.vault.key();
        pool.total_budget = total_budget;
        pool.total_disbursed = 0;
        pool.total_spent = 0;
        pool.order_cap = order_cap;
        pool.daily_cap = daily_cap;
        pool.start_ts = clock.unix_timestamp;
        pool.expiry_ts = clock.unix_timestamp + duration_seconds;
        pool.is_active = true;
        pool.bump = ctx.bumps.pool;

        emit!(PoolInitializedEvent {
            pool: pool.key(),
            admin: pool.admin,
            disaster_id: pool.disaster_id,
            total_budget: pool.total_budget,
            order_cap: pool.order_cap,
            daily_cap: pool.daily_cap,
            expiry_ts: pool.expiry_ts,
        });

        Ok(())
    }

    /// Register a verified merchant in an affected district.
    pub fn register_merchant(
        ctx: Context<RegisterMerchant>,
        district_code: u16,
        business_name: String,
        baseline_price: u64,
    ) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        merchant.merchant_wallet = ctx.accounts.merchant_wallet.key();
        merchant.pool = ctx.accounts.pool.key();
        merchant.district_code = district_code;
        merchant.business_name = business_name.clone();
        merchant.baseline_price = baseline_price;
        merchant.current_price = baseline_price;
        merchant.is_suspended = false;
        merchant.total_received = 0;
        merchant.bump = ctx.bumps.merchant;

        emit!(MerchantRegisteredEvent {
            pool: ctx.accounts.pool.key(),
            merchant: merchant.key(),
            merchant_wallet: merchant.merchant_wallet,
            district_code,
            business_name,
            baseline_price,
        });

        Ok(())
    }

    /// Release aid allocation to an eligible household in an affected district.
    pub fn release_aid(
        ctx: Context<ReleaseAid>,
        district_code: u16,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(pool.is_active, ReliefRailError::PoolInactive);

        let clock = Clock::get()?;
        require!(clock.unix_timestamp < pool.expiry_ts, ReliefRailError::AidExpired);

        let new_disbursed = pool.total_disbursed.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;
        require!(new_disbursed <= pool.total_budget, ReliefRailError::BudgetExceeded);
        pool.total_disbursed = new_disbursed;

        let household = &mut ctx.accounts.household;
        household.beneficiary_wallet = ctx.accounts.beneficiary_wallet.key();
        household.pool = pool.key();
        household.district_code = district_code;
        household.allocated_amount = household.allocated_amount.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;
        household.spent_amount = household.spent_amount;
        household.last_spent_ts = 0;
        household.rolling_24h_spent = 0;
        household.bump = ctx.bumps.household;

        emit!(AidReleasedEvent {
            pool: pool.key(),
            household: household.key(),
            beneficiary_wallet: household.beneficiary_wallet,
            district_code,
            amount,
        });

        Ok(())
    }

    /// Spend relief tokens at a registered merchant with full on-chain rule verification.
    pub fn spend(ctx: Context<Spend>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let merchant = &mut ctx.accounts.merchant;
        let household = &mut ctx.accounts.household;
        let clock = Clock::get()?;

        // Rule 1: Pool must be active and not expired
        require!(pool.is_active, ReliefRailError::PoolInactive);
        require!(clock.unix_timestamp < pool.expiry_ts, ReliefRailError::AidExpired);

        // Rule 2: Merchant must not be suspended
        require!(!merchant.is_suspended, ReliefRailError::MerchantSuspended);

        // Rule 3: Disaster Zone Confinement (Household district must match Merchant district)
        require!(household.district_code == merchant.district_code, ReliefRailError::OutOfZone);

        // Rule 4: Per-Order Cap
        require!(amount <= pool.order_cap, ReliefRailError::OverOrderCap);

        // Rule 5: Rolling 24-Hour Cap
        let window_seconds: i64 = 86400; // 24 hours
        let is_new_window = clock.unix_timestamp.saturating_sub(household.last_spent_ts) >= window_seconds;
        let current_window_spent = if is_new_window { 0 } else { household.rolling_24h_spent };
        let new_window_spent = current_window_spent.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;
        require!(new_window_spent <= pool.daily_cap, ReliefRailError::OverDailyCap);

        // Rule 6: Sufficient Aid Balance
        let unspent = household.allocated_amount.saturating_sub(household.spent_amount);
        require!(amount <= unspent, ReliefRailError::InsufficientAidBalance);

        // State Updates
        household.spent_amount = household.spent_amount.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;
        household.rolling_24h_spent = new_window_spent;
        household.last_spent_ts = clock.unix_timestamp;

        merchant.total_received = merchant.total_received.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;
        pool.total_spent = pool.total_spent.checked_add(amount).ok_or(ReliefRailError::MathOverflow)?;

        // Execute Token Transfer CPI from Household Token Account to Merchant Token Account
        let cpi_accounts = Transfer {
            from: ctx.accounts.household_token_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.beneficiary.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        emit!(AidSpentEvent {
            pool: pool.key(),
            household: household.key(),
            merchant: merchant.key(),
            amount,
            district_code: household.district_code,
            remaining_aid: household.allocated_amount.saturating_sub(household.spent_amount),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Update merchant price index (tracked by oracle for price-gouging detection).
    pub fn update_merchant_price(ctx: Context<UpdatePrice>, new_price: u64) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        let old_price = merchant.current_price;
        merchant.current_price = new_price;
        let clock = Clock::get()?;

        emit!(PriceUpdatedEvent {
            merchant: merchant.key(),
            old_price,
            new_price,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Suspend merchant on-chain when anomaly rule flags price gouging or unauthorized conduct.
    pub fn suspend_merchant(ctx: Context<SuspendMerchant>, reason_code: u8) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        merchant.is_suspended = true;
        let clock = Clock::get()?;

        emit!(MerchantSuspendedEvent {
            pool: ctx.accounts.pool.key(),
            merchant: merchant.key(),
            reason_code,
            suspended_by: ctx.accounts.authority.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Reclaim unspent aid after pool expiry (returns remaining tokens to treasury).
    pub fn reclaim_expired_aid(ctx: Context<ReclaimExpiredAid>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let household = &mut ctx.accounts.household;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= pool.expiry_ts, ReliefRailError::ClawbackTooEarly);

        let unspent = household.allocated_amount.saturating_sub(household.spent_amount);
        require!(unspent > 0, ReliefRailError::InvalidParameters);

        // Mark household as reclaimed
        household.spent_amount = household.allocated_amount;

        emit!(AidReclaimedEvent {
            pool: pool.key(),
            household: household.key(),
            reclaimed_amount: unspent,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// ---------------- Contexts ----------------

#[derive(Accounts)]
#[instruction(disaster_id: [u8; 32])]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Pool::INIT_SPACE,
        seeds = [b"pool", disaster_id.as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Oracle authority
    pub oracle: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = pool,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RegisterMerchant<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Merchant::INIT_SPACE,
        seeds = [b"merchant", pool.key().as_ref(), merchant_wallet.key().as_ref()],
        bump
    )]
    pub merchant: Account<'info, Merchant>,
    pub pool: Account<'info, Pool>,
    /// CHECK: Merchant recipient wallet
    pub merchant_wallet: AccountInfo<'info>,
    #[account(mut, address = pool.admin @ ReliefRailError::Unauthorized)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseAid<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Household::INIT_SPACE,
        seeds = [b"household", pool.key().as_ref(), beneficiary_wallet.key().as_ref()],
        bump
    )]
    pub household: Account<'info, Household>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    /// CHECK: Beneficiary wallet
    pub beneficiary_wallet: AccountInfo<'info>,
    #[account(
        mut,
        constraint = authority.key() == pool.admin || authority.key() == pool.oracle @ ReliefRailError::Unauthorized
    )]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Spend<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(
        mut,
        seeds = [b"merchant", pool.key().as_ref(), merchant.merchant_wallet.as_ref()],
        bump = merchant.bump
    )]
    pub merchant: Account<'info, Merchant>,
    #[account(
        mut,
        seeds = [b"household", pool.key().as_ref(), beneficiary.key().as_ref()],
        bump = household.bump
    )]
    pub household: Account<'info, Household>,
    pub beneficiary: Signer<'info>,
    #[account(
        mut,
        token::mint = pool.mint,
        token::authority = beneficiary,
    )]
    pub household_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = pool.mint,
        token::authority = merchant.merchant_wallet,
    )]
    pub merchant_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(
        mut,
        has_one = merchant_wallet @ ReliefRailError::Unauthorized
    )]
    pub merchant: Account<'info, Merchant>,
    pub merchant_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct SuspendMerchant<'info> {
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = pool)]
    pub merchant: Account<'info, Merchant>,
    #[account(
        constraint = authority.key() == pool.admin || authority.key() == pool.oracle @ ReliefRailError::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReclaimExpiredAid<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = pool)]
    pub household: Account<'info, Household>,
    #[account(
        constraint = authority.key() == pool.admin || authority.key() == pool.oracle @ ReliefRailError::Unauthorized
    )]
    pub authority: Signer<'info>,
}
