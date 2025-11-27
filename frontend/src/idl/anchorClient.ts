import {AnchorProvider, Program,} from "@coral-xyz/anchor";
import {Connection, PublicKey} from "@solana/web3.js";
import idl from "../idl/punchcard_it_3.json";
import type {PunchcardIt3} from "./punchcard_it_3";

export const PROGRAM_ID = new PublicKey(idl.address);

export function getProvider(wallet: any) {
    const connection = new Connection(
        "https://api.devnet.solana.com",
        {commitment: "confirmed"}
    );

    return new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
    );
}

export function getProgram(provider: AnchorProvider) {
    return new Program(idl as any, provider) as Program<PunchcardIt3>;
}

