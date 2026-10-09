use anchor_lang::prelude::*;

#[event]
pub struct PoolInitializedEvent {
    pub pool: Pubkey,
    pub admin: Pubkey,
    pub disaster_id: [u8; 32],
    pub total_budget: u64,
    pub order_cap: u64,
    pub daily_cap: u64,
    pub expiry_ts: i64,
}

#[event]
pub struct MerchantRegisteredEvent {
    pub pool: Pubkey,
    pub merchant: Pubkey,
    pub merchant_wallet: Pubkey,
    pub district_code: u16,
    pub business_name: String,
    pub baseline_price: u64,
}

#[event]
pub struct AidReleasedEvent {
    pub pool: Pubkey,
    pub household: Pubkey,
    pub beneficiary_wallet: Pubkey,
    pub district_code: u16,
    pub amount: u64,
}

#[event]
pub struct AidSpentEvent {
    pub pool: Pubkey,
    pub household: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub district_code: u16,
    pub remaining_aid: u64,
    pub timestamp: i64,
}

#[event]
pub struct MerchantSuspendedEvent {
    pub pool: Pubkey,
    pub merchant: Pubkey,
    pub reason_code: u8,
    pub suspended_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PriceUpdatedEvent {
    pub merchant: Pubkey,
    pub old_price: u64,
    pub new_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct AidReclaimedEvent {
    pub pool: Pubkey,
    pub household: Pubkey,
    pub reclaimed_amount: u64,
    pub timestamp: i64,
}
