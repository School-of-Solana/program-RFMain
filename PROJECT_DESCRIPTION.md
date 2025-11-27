Project Description

Deployed Frontend URL:
https://solana-program-task.vercel.app/

Solana Program ID:
9FtgoQ4gZoCSj6zk2LyUDH1FCk3UBxLFhhJaiVJ6adpr

Project Overview
Description

PunchCard It is an on-chain workforce time-tracking application built on Solana Devnet using the Anchor framework. It enables employers to manage worker attendance while ensuring all shift activity is recorded immutably on the blockchain.

The system provides employees with the ability to clock in and out, begin and end intermittent breaks, and manage lunch periods. Administrators can initialize employee accounts, monitor shift activity, and verify work history. All interactions are processed through a Program Derived Address (PDA) that stores individualized employee timestamps.

This project demonstrates PDA usage, multi-instruction Solana program architecture, frontend integration, and comprehensive test coverage.

Key Features

Employee time-tracking stored entirely on-chain

PDA-based employee account initialization

Shift management: clock in and clock out

Break management: start and end intermittent breaks

Lunch management: start and end lunch breaks

Admin view for monitoring employees

Employee dashboard with real-time status updates

Toast notifications and clean UI state handling

Full TypeScript test suite covering successful and failing cases

How to Use the dApp

Connect Wallet
The user connects a wallet (a local devnet wallet is used for development).

Initialize Employee Account (Admin Panel)

Enter a seed (i128)

Generate the PDA

Initialize the employee account on-chain

Employee Actions (Employee Panel)

Clock in to start a shift

Clock out to end the shift

Start and end intermittent breaks

Start and end lunch periods

Admin Monitoring

View employee PDA

Check shift start/end

Check break and lunch activity

Verify active/inactive status

Program Architecture

Punchcard It uses a single PDA-based employee account to store shift-related data. The Anchor program exposes several instructions allowing controlled updates to this PDA, enforcing logical state transitions.

PDA Usage

Each employee account is derived using:

[b"employee", seed_i128_bytes]


PDAs Used:

Employee PDA
Stores all shift, break, and lunch timestamps for a single worker.
The seed value allows deterministic and unique generation of employee accounts.
The PDA ensures that no external signer controls the account directly, and only the program may modify it.

Program Instructions

Instructions Implemented:

initialize(seed)
Creates the employee PDA and initializes all timestamps to zero.

clockIn
Starts a shift by recording the current timestamp as shift_start.

clockOut
Ends the shift by recording the current timestamp as shift_end.

clockIntermittentIn
Starts an intermittent break.

clockIntermittentOut
Ends an intermittent break.

clockLunchIn
Starts lunch break.

clockLunchOut
Ends lunch break.

All instructions validate:

The signer

The PDA

Appropriate logical state transitions

Account Structure

The PDA stores all timestamped employee activity:

#[account]
pub struct EmployeeAccount {
pub shift_start: i64,
pub shift_end: i64,
pub intermittent_start: i64,
pub intermittent_end: i64,
pub lunch_start: i64,
pub lunch_end: i64,
}


Each field is updated only through valid program instructions.

Testing
Test Coverage

The project includes TypeScript tests covering both successful and intentionally failing scenarios.

Happy Path Tests:

Initialize employee PDA

Clock in successfully

Clock out successfully

Start and end intermittent break

Start and end lunch break

Unhappy Path Tests:

Attempting to clock in twice

Attempting to clock out before clocking in

Attempting to start lunch while already on break

Attempting to interact with an uninitialized PDA

Attempting to write to a PDA not derived for the signer

These tests ensure correct error handling and logical safety.

Running Tests
anchor test
