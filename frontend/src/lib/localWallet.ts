import {
    Keypair,
    Transaction,
    VersionedTransaction,
} from "@solana/web3.js";
import type { Wallet } from "@coral-xyz/anchor";

export function createLocalWallet(keypair: Keypair): Wallet {
    return {
        publicKey: keypair.publicKey,

        async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
            if (tx instanceof Transaction) {
                tx.partialSign(keypair);
                return tx;
            }
            tx.sign([keypair]);
            return tx;
        },

        async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
            return txs.map((tx) => {
                if (tx instanceof Transaction) {
                    tx.partialSign(keypair);
                    return tx;
                }
                tx.sign([keypair]);
                return tx;
            });
        },

        payer: keypair,
    };
}
