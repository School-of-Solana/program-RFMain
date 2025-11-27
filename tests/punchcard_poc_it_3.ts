import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PunchcardIt3 } from "../target/types/punchcard_it_3";
import BN from "bn.js";
import fs from "fs";
import assert from "node:assert";

interface EmployeeData {
    active: boolean;
    shiftStartClock: number;         // u64
    shiftEndClock: number;           // u64
    intermittentStartClock: number;  // u64
    intermittentEndClock: number;    // u64
    lunchStartClock: number;         // u64
    lunchEndClock: number;           // u64
}

let signer: anchor.web3.Keypair;
let connection: anchor.web3.Connection;
let wallet: anchor.Wallet;
let provider: anchor.AnchorProvider;
let program: Program<PunchcardIt3>;

const exampleSeed = new BN(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
const predefinedSeed = new BN(59222433202251);

let predefinedDataAccount: anchor.web3.PublicKey;
let exampleDataAccount: anchor.web3.PublicKey;

function loadKeypair(keypairPath: string): anchor.web3.Keypair {
    const secretKeyString = fs.readFileSync(keypairPath, "utf8");
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return anchor.web3.Keypair.fromSecretKey(secretKey);
}

function expectAnchorError(
    err: unknown,
    code: "AlreadyClockedIn" | "NotClockedIn",
    number: 6000 | 6001
) {
    const e = err as anchor.AnchorError;
    assert.ok((e as any).error?.errorCode, `Expected AnchorError with errorCode, got: ${err}`);
    assert.strictEqual(e.error.errorCode.code, code);
    assert.strictEqual(e.error.errorCode.number, number);
}

before(async () => {
    const idJsonPath = "/home/redacted/.config/solana/id.json";

    signer = loadKeypair(idJsonPath);
    connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
    wallet = new anchor.Wallet(signer);
    provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
    });

    anchor.setProvider(provider);

    program = anchor.workspace["punchcard_it_3"] as Program<PunchcardIt3>;
    if (!program) throw new Error("Program not found: punchcard_it_3");

    [predefinedDataAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [predefinedSeed.toArrayLike(Buffer, "le", 16)],
        program.programId
    );

    [exampleDataAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [exampleSeed.toArrayLike(Buffer, "le", 16)],
        program.programId
    );

    console.log("Predefined PDA:", predefinedDataAccount.toBase58());
});

describe("Initialize Fresh Employee PDA (exampleSeed)", () => {
    it("Initializes Example PDA", async () => {
        const tx = await program.methods
            .initialize(exampleSeed)
            .accounts({
                signer: signer.publicKey,
                // @ts-ignore
                systemProgram: anchor.web3.SystemProgram.programId,
                dataAccount: exampleDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Initialized example PDA. TX:", tx);
    });
});

describe("Fails to initialize predefined PDA", () => {
    it("Fails with 'already in use'", async () => {
        try {
            await program.methods
                .initialize(predefinedSeed)
                .accounts({
                    signer: signer.publicKey,
                    // @ts-ignore
                    systemProgram: anchor.web3.SystemProgram.programId,
                    dataAccount: predefinedDataAccount,
                })
                .signers([signer])
                .rpc();

            assert.fail("Expected failure but succeeded");
        } catch (err) {
            assert(
                err.toString().includes("already in use") ||
                err.toString().includes("custom program error: 0x0"),
                `Unexpected error: ${err}`
            );
        }
    });
});

/* --- CLOCK IN --- */

describe("Clock In (example PDA)", () => {
    it("Clocked in and set shift_start_clock (u64)", async () => {
        const tx = await program.methods
            .clockIn()
            .accounts({
                signer: signer.publicKey,
                dataAccount: exampleDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Clock In TX:", tx);

        const data = await program.account.employeeData.fetch(exampleDataAccount);
        assert.strictEqual(data.active, true);
        assert.ok(Number(data.shiftStartClock) > 0, "Expected valid timestamp");
    });
});

describe("Fails to clock in when already clocked in", () => {
    it("Rejects second clock-in", async () => {
        try {
            await program.methods
                .clockIn()
                .accounts({
                    signer: signer.publicKey,
                    dataAccount: exampleDataAccount,
                })
                .signers([signer])
                .rpc();

            assert.fail("Expected AlreadyClockedIn");
        } catch (err) {
            expectAnchorError(err, "AlreadyClockedIn", 6000);
        }
    });
});

/* --- CLOCK OUT --- */

describe("Clock Out (predefined PDA)", () => {
    it("Clocked out and set shift_end_clock (u64)", async () => {
        const tx = await program.methods
            .clockOut()
            .accounts({
                signer: signer.publicKey,
                dataAccount: predefinedDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Clock Out TX:", tx);

        const data = await program.account.employeeData.fetch(predefinedDataAccount);
        assert.strictEqual(data.active, false);
        assert.ok(Number(data.shiftEndClock) > 0, "Expected valid timestamp");
    });
});

describe("Fails to clock out when not clocked in", () => {
    it("Throws NotClockedIn", async () => {
        try {
            await program.methods
                .clockOut()
                .accounts({
                    signer: signer.publicKey,
                    dataAccount: predefinedDataAccount,
                })
                .signers([signer])
                .rpc();

            assert.fail("Expected NotClockedIn error");
        } catch (err) {
            expectAnchorError(err, "NotClockedIn", 6001);
        }
    });
});

/* --- INTERMITTENT --- */

describe("Intermittent Clock In", () => {
    it("Clocked intermittent in (example PDA)", async () => {
        const tx = await program.methods
            .clockIntermittentIn()
            .accounts({
                signer: signer.publicKey,
                dataAccount: exampleDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Intermittent In TX:", tx);
    });
});

describe("Intermittent Clock Out (predefined PDA)", () => {
    it("Clocked intermittent out", async () => {
        const tx = await program.methods
            .clockIntermittentOut()
            .accounts({
                signer: signer.publicKey,
                dataAccount: predefinedDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Intermittent Out TX:", tx);
    });
});

/* --- LUNCH --- */

describe("Lunch Clock In", () => {
    it("Clocked lunch in (predefined PDA)", async () => {
        const tx = await program.methods
            .clockLunchIn()
            .accounts({
                signer: signer.publicKey,
                dataAccount: predefinedDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Lunch In TX:", tx);
    });
});

describe("Lunch Clock Out", () => {
    it("Clocked lunch out (predefined PDA)", async () => {
        const tx = await program.methods
            .clockLunchOut()
            .accounts({
                signer: signer.publicKey,
                dataAccount: predefinedDataAccount,
            })
            .signers([signer])
            .rpc();

        console.log("✔ Lunch Out TX:", tx);
    });
});

/* --- READ ACCOUNT --- */

async function getEmployeeDataDecoded(
    pda: anchor.web3.PublicKey
): Promise<EmployeeData> {
    const data = await program.account.employeeData.fetch(pda);
    return data as unknown as EmployeeData;
}

describe("Read Employee Data (predefined PDA)", () => {
    it("Reads Employee PDA", async () => {
        const data = await getEmployeeDataDecoded(predefinedDataAccount);

        console.log("Employee Data (decoded):", {
            active: data.active,
            shiftStartClock: Number(data.shiftStartClock),
            shiftEndClock: Number(data.shiftEndClock),
            intermittentStartClock: Number(data.intermittentStartClock),
            intermittentEndClock: Number(data.intermittentEndClock),
            lunchStartClock: Number(data.lunchStartClock),
            lunchEndClock: Number(data.lunchEndClock),
        });
    });
});
