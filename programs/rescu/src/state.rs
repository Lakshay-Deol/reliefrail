use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Pool {
    /// Authority who initialized the pool (or multisig)
    pub admin: Pubkey,
    /// Oracle authority for automatic disaster triggers and fraud suspensions
    pub oracle: Pubkey,
    /// Unique identifier for the disaster (e.g. hash of "ODISHA-FANI-2019")
    pub disaster_id: [u8; 32],
    /// Human-readable name of the event (e.g. "Cyclone Fani 2019")
    #[max_len(32)]
    pub name: String,
    /// SPL Token Mint for Relief Token (rINR)
    pub mint: Pubkey,
    /// Treasury vault holding unallocated tokens
    pub vault: Pubkey,
    /// Total budget in relief currency base units (paise: ₹1 = 100)
    pub total_budget: u64,
    /// Total aid released to households
    pub total_disbursed: u64,
    /// Total aid successfully spent at registered merchants
    pub total_spent: u64,
    /// Maximum allowed spend per individual transaction (e.g. ₹1,500 = 150,000)
    pub order_cap: u64,
    /// Maximum allowed spend per rolling 24-hour window (e.g. ₹2,500 = 250,000)
    pub daily_cap: u64,
    /// Unix timestamp when the pool was created
    pub start_ts: i64,
    /// Unix timestamp when the pool expires (30 days post-event)
    pub expiry_ts: i64,
    /// Flag indicating whether the pool is active
    pub is_active: bool,
    /// PDA bump
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    /// Owner wallet of the merchant
    pub merchant_wallet: Pubkey,
    /// Pool this merchant is registered under
    pub pool: Pubkey,
    /// District code (Census / LGD code, e.g. 374 for Puri)
    pub district_code: u16,
    /// Business / Store name
    #[max_len(32)]
    pub business_name: String,
    /// Pre-disaster baseline price index (in paise)
    pub baseline_price: u64,
    /// Current reported price index (in paise)
    pub current_price: u64,
    /// Whether the store is suspended by admin/oracle for price gouging
    pub is_suspended: bool,
    /// Cumulative relief funds received (in paise)
    pub total_received: u64,
    /// PDA bump
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Household {
    /// Beneficiary's wallet address
    pub beneficiary_wallet: Pubkey,
    /// Pool this household received aid from
    pub pool: Pubkey,
    /// District code (e.g. 374 for Puri)
    pub district_code: u16,
    /// Total aid allocated to this household (in paise)
    pub allocated_amount: u64,
    /// Total aid spent so far (in paise)
    pub spent_amount: u64,
    /// Timestamp of last purchase (for rolling 24-hour calculation)
    pub last_spent_ts: i64,
    /// Amount spent within the current rolling 24-hour window (in paise)
    pub rolling_24h_spent: u64,
    /// PDA bump
    pub bump: u8,
}
