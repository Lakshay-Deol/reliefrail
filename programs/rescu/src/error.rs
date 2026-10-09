use anchor_lang::prelude::*;

#[error_code]
pub enum ReliefRailError {
    #[msg("Relief pool is currently inactive or closed")]
    PoolInactive,

    #[msg("This aid allocation has expired (30-day window passed)")]
    AidExpired,

    #[msg("Recipient is not a registered merchant")]
    UnregisteredMerchant,

    #[msg("Merchant is outside this household's disaster district (OutOfZone)")]
    OutOfZone,

    #[msg("Merchant is suspended due to price gouging or policy violation")]
    MerchantSuspended,

    #[msg("Order amount exceeds the single transaction limit (order cap)")]
    OverOrderCap,

    #[msg("Order would exceed the rolling 24-hour spending limit")]
    OverDailyCap,

    #[msg("Household has insufficient unspent aid balance")]
    InsufficientAidBalance,

    #[msg("Disbursement would exceed total declared pool budget")]
    BudgetExceeded,

    #[msg("Unauthorized signer for this action")]
    Unauthorized,

    #[msg("Aid pool has not expired yet; cannot reclaim early")]
    ClawbackTooEarly,

    #[msg("Invalid parameters provided")]
    InvalidParameters,

    #[msg("Math calculation overflow")]
    MathOverflow,
}
