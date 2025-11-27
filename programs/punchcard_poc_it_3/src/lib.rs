use anchor_lang::prelude::*;

declare_id!("9FtgoQ4gZoCSj6zk2LyUDH1FCk3UBxLFhhJaiVJ6adpr");

fn timestamp_u64() -> Result<u64> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp as u64)
}

#[program]
pub mod punchcard_it_3 {
    use super::*;

    pub fn initialize(_ctx: Context<PdeascAccount>, _seed: i128) -> Result<()> {
        Ok(())
    }

    pub fn clock_in(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if data.active {
            return err!(ErrorCode::AlreadyClockedIn);
        }
        data.active = true;
        data.shift_start_clock = timestamp_u64()?;
        Ok(())
    }

    pub fn clock_out(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if !data.active {
            return err!(ErrorCode::NotClockedIn);
        }
        data.active = false;
        data.shift_end_clock = timestamp_u64()?;
        Ok(())
    }

    pub fn clock_intermittent_in(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if !data.active {
            return err!(ErrorCode::NotClockedIn);
        }
        data.active = false;
        data.intermittent_start_clock = timestamp_u64()?;
        Ok(())
    }

    pub fn clock_intermittent_out(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if data.active {
            return err!(ErrorCode::AlreadyClockedIn);
        }
        data.active = true;
        data.intermittent_end_clock = timestamp_u64()?;
        Ok(())
    }

    pub fn clock_lunch_in(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if !data.active {
            return err!(ErrorCode::NotClockedIn);
        }
        data.active = false;
        data.lunch_start_clock = timestamp_u64()?;
        Ok(())
    }

    pub fn clock_lunch_out(ctx: Context<EmployeeAccount>) -> Result<()> {
        let data = &mut ctx.accounts.data_account;
        if data.active {
            return err!(ErrorCode::AlreadyClockedIn);
        }
        data.active = true;
        data.lunch_end_clock = timestamp_u64()?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(seed: i128)]
pub struct PdeascAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init,
        payer = signer,
        space = 57,
        seeds = [&seed.to_le_bytes()],
        bump
    )]
    pub data_account: Account<'info, EmployeeData>,
}

#[derive(Accounts)]
pub struct EmployeeAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub data_account: Account<'info, EmployeeData>,
}

#[account]
pub struct EmployeeData {
    pub active: bool,
    pub shift_start_clock: u64,
    pub shift_end_clock: u64,
    pub intermittent_start_clock: u64,
    pub intermittent_end_clock: u64,
    pub lunch_start_clock: u64,
    pub lunch_end_clock: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Already clocked in")]
    AlreadyClockedIn,
    #[msg("Not clocked in")]
    NotClockedIn,
}
