import {BN, type Wallet, web3} from "@coral-xyz/anchor";
import {useMemo} from "react";
import {getProgram, getProvider} from "../idl/anchorClient";

export function usePunchcard(wallet: Wallet) {
    const {provider, program, signer} = useMemo(() => {
        const provider = getProvider(wallet);
        const program = getProgram(provider);
        const signer = wallet.payer;
        return {provider, program, signer};
    }, [wallet]);

    const tx = async (fn: () => Promise<string>) => {
        try {
            return await fn();
        } catch (err: any) {
            console.error(err);
            throw new Error(err?.message ?? "Transaction failed");
        }
    };

    const signers = [signer];

    return {
        initialize: (seed: BN, pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .initialize(seed)
                    .accounts({
                        signer: signer.publicKey,
                        //@ts-ignore
                        systemProgram: web3.SystemProgram.programId,
                        dataAccount: pda,
                    })
                    .signers(signers)
                    .rpc()
            ),

        clockIn: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockIn()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),

        clockOut: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockOut()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),

        clockIntermittentIn: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockIntermittentIn()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),

        clockIntermittentOut: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockIntermittentOut()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),

        clockLunchIn: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockLunchIn()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),

        clockLunchOut: (pda: web3.PublicKey) =>
            tx(() =>
                program.methods
                    .clockLunchOut()
                    .accounts({signer: signer.publicKey, dataAccount: pda})
                    .signers(signers)
                    .rpc()
            ),
    };
}
