// src/App.tsx
import React, {useMemo, useState} from "react";
import {BN, web3} from "@coral-xyz/anchor";

import {usePunchcard} from "./hooks/usePunchcard";
import {createLocalWallet} from "./lib/localWallet";

import {Header} from "./components/Header";
import {EmployeeView} from "./components/EmployeeView";
import {AdminView} from "./components/AdminView";
import {BottomBar} from "./components/BottomBar";
import {Toast} from "./components/Toast";
import {PROGRAM_ID} from "./idl/anchorClient";

export type EmployeeStatus =
    | "off-shift"
    | "on-shift"
    | "on-break"
    | "on-lunch";

export type BottomBarView =
    | "create"
    | "monitor"
    | "shift"
    | "breaks"
    | "history";

export interface EmployeeData {
    pdaAddress: string;
    shiftStartClock: string;
    shiftEndClock: string;
    intermittentStartClock: string;
    intermittentEndClock: string;
    lunchStartClock: string;
    lunchEndClock: string;
}

interface ToastMessage {
    id: number;
    type: "success" | "error";
    message: string;
}

export const derivePdaFromSeed = (seed: string): web3.PublicKey => {
    const bn = new BN(seed, 10);
    const seedBytes = bn.toTwos(128).toArrayLike(Buffer, "le", 16);

    const [pda] = web3.PublicKey.findProgramAddressSync(
        [seedBytes],
        PROGRAM_ID
    );

    return pda;
};

export default function App() {
    // ----------------------------------------
    //  WALLET SETUP
    // ----------------------------------------
    const {signer, wallet} = useMemo(() => {
        const signer = web3.Keypair.generate();
        return {signer, wallet: createLocalWallet(signer)};
    }, []);

    const {
        initialize,
        clockIn: onChainClockIn,
        clockOut: onChainClockOut,
        clockIntermittentIn: onChainIntermittentIn,
        clockIntermittentOut: onChainIntermittentOut,
        clockLunchIn: onChainLunchIn,
        clockLunchOut: onChainLunchOut,
    } = usePunchcard(wallet);

    // ----------------------------------------
    //  UI STATE
    // ----------------------------------------
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [activeView, setActiveView] =
        useState<"employee" | "admin">("employee");

    const [bottomBarView, setBottomBarView] =
        useState<BottomBarView>("shift");

    const [employeeStatus, setEmployeeStatus] =
        useState<EmployeeStatus>("off-shift");

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const [employeeData, setEmployeeData] = useState<EmployeeData>({
        pdaAddress: "",
        shiftStartClock: "",
        shiftEndClock: "",
        intermittentStartClock: "",
        intermittentEndClock: "",
        lunchStartClock: "",
        lunchEndClock: "",
    });

    const [adminSeed, setAdminSeed] = useState("");
    const [derivedPDA, setDerivedPDA] = useState("");
    const [walletInput, setWalletInput] = useState("");

    // ----------------------------------------
    //  TOAST SYSTEM
    // ----------------------------------------
    const showToast = (type: "success" | "error", message: string) => {
        const id = Date.now();
        setToasts((p) => [...p, {id, type, message}]);
        setTimeout(() => {
            setToasts((p) => p.filter((t) => t.id !== id));
        }, 4000);
    };

    // ----------------------------------------
    //  CONNECT EMPLOYEE WALLET
    // ----------------------------------------
    const handleWalletConnect = () => {
        try {
            const pubkey = new web3.PublicKey(walletInput);
            setDerivedPDA(pubkey.toBase58());
            setEmployeeData((p) => ({
                ...p,
                pdaAddress: pubkey.toBase58(),
            }));
            setIsWalletConnected(true);
            setActiveView("employee");
        } catch {
            showToast("error", "Invalid wallet address");
        }
    };

    // ----------------------------------------
    //  ADMIN SEED HANDLER (RESOLUTE FIX)
    // ----------------------------------------
    const handleSeedChange = (value: string) => {
        setAdminSeed(value);

        const clean = value.trim();

        // Integer check (safe for BN)
        if (!/^-?\d+$/.test(clean)) {
            setDerivedPDA("");
            return;
        }

        try {
            const pda = derivePdaFromSeed(clean);
            setDerivedPDA(pda.toBase58());
        } catch (err) {
            console.error("PDA derive failed:", err);
            setDerivedPDA("");
        }
    };

    // ----------------------------------------
    //  INITIALIZE EMPLOYEE PDA
    // ----------------------------------------
    const handleInitializeEmployee = async () => {
        if (!adminSeed || !derivedPDA)
            return showToast("error", "Seed & PDA required");

        let acc: web3.PublicKey;
        try {
            acc = new web3.PublicKey(derivedPDA);
        } catch {
            return showToast("error", "Invalid PDA");
        }

        try {
            const bn = new BN(adminSeed, 10);
            await initialize(bn, acc);

            setEmployeeData((p) => ({
                ...p,
                pdaAddress: derivedPDA,
            }));

            showToast("success", "Employee PDA initialized ✓");
        } catch (e: any) {
            console.error(e);
            showToast("error", e?.message ?? "Initialization failed");
        }
    };

    // ----------------------------------------
    //  SAFE TRY WRAPPER (FIXED — PROMISE<any>)
    // ----------------------------------------
    const safeTry = async (
        fn: () => Promise<any>,        // ← FIXED HERE
        onSuccess: () => void
    ) => {
        const acc = ensureDataAccount();
        if (!acc) return;

        try {
            await fn();                // ← accepts Promise<string> now
            onSuccess();
        } catch (e: any) {
            showToast("error", e?.message ?? "Transaction failed");
        }
    };

    // ----------------------------------------
    //  HELPER
    // ----------------------------------------
    const ensureDataAccount = () => {
        if (!employeeData.pdaAddress) {
            showToast("error", "No PDA configured yet");
            return null;
        }
        try {
            return new web3.PublicKey(employeeData.pdaAddress);
        } catch {
            showToast("error", "Invalid PDA");
            return null;
        }
    };

    // ----------------------------------------
    //  CLOCK / BREAK / LUNCH HANDLERS
    // ----------------------------------------
    const handleClockIn = () =>
        safeTry(
            () =>
                onChainClockIn(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("on-shift");
                setEmployeeData((p) => ({
                    ...p,
                    shiftStartClock: new Date().toISOString(),
                }));
                showToast("success", "Clock In ✓");
            }
        );

    const handleClockOut = () =>
        safeTry(
            () =>
                onChainClockOut(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("off-shift");
                setEmployeeData((p) => ({
                    ...p,
                    shiftEndClock: new Date().toISOString(),
                }));
                showToast("success", "Clock Out ✓");
            }
        );

    const handleIntermittentIn = () =>
        safeTry(
            () =>
                onChainIntermittentIn(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("on-break");
                setEmployeeData((p) => ({
                    ...p,
                    intermittentStartClock: new Date().toISOString(),
                }));
                showToast("success", "Break started ✓");
            }
        );

    const handleIntermittentOut = () =>
        safeTry(
            () =>
                onChainIntermittentOut(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("on-shift");
                setEmployeeData((p) => ({
                    ...p,
                    intermittentEndClock: new Date().toISOString(),
                }));
                showToast("success", "Break ended ✓");
            }
        );

    const handleLunchIn = () =>
        safeTry(
            () =>
                onChainLunchIn(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("on-lunch");
                setEmployeeData((p) => ({
                    ...p,
                    lunchStartClock: new Date().toISOString(),
                }));
                showToast("success", "Lunch started ✓");
            }
        );

    const handleLunchOut = () =>
        safeTry(
            () =>
                onChainLunchOut(
                    new web3.PublicKey(employeeData.pdaAddress)
                ),
            () => {
                setEmployeeStatus("on-shift");
                setEmployeeData((p) => ({
                    ...p,
                    lunchEndClock: new Date().toISOString(),
                }));
                showToast("success", "Lunch ended ✓");
            }
        );

    // ----------------------------------------
    //  ADMIN MONITOR VIEW
    // ----------------------------------------
    const employees = [
        {
            pda: employeeData.pdaAddress || "—",
            active: ["on-shift", "on-break", "on-lunch"].includes(
                employeeStatus
            ),
            lastShiftStart: employeeData.shiftStartClock,
            lastShiftEnd: employeeData.shiftEndClock,
        },
    ];

    // ----------------------------------------
    //  RENDER
    // ----------------------------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
            <Header
                isWalletConnected={isWalletConnected}
                onConnectWallet={handleWalletConnect}
            />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {!isWalletConnected && activeView !== "admin" ? (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                        <h2 className="text-slate-800 mb-6 font-semibold text-lg">
                            Choose an Option
                        </h2>

                        {}
                        <div className="mb-8">
                            <input
                                type="text"
                                placeholder="Enter base58 wallet address"
                                value={walletInput}
                                onChange={(e) =>
                                    setWalletInput(e.target.value)
                                }
                                className="w-full mb-4 px-4 py-2 border border-slate-300 rounded-xl"
                            />
                            <button
                                onClick={handleWalletConnect}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg"
                            >
                                Connect Wallet (Employee Mode)
                            </button>
                        </div>

                        {/* Admin Mode */}
                        <button
                            onClick={() => setActiveView("admin")}
                            className="w-full bg-slate-800 text-white px-8 py-4 rounded-xl shadow-lg"
                        >
                            Continue to Admin (No Wallet Required)
                        </button>
                    </div>
                ) : (
                    // MAIN VIEW
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50/50 flex">
                            <button
                                onClick={() => setActiveView("employee")}
                                disabled={!isWalletConnected}
                                className={`flex-1 px-6 py-4 ${
                                    activeView === "employee"
                                        ? "bg-white text-violet-600 border-b-2 border-violet-600"
                                        : !isWalletConnected
                                            ? "text-slate-300 cursor-not-allowed"
                                            : "text-slate-500"
                                }`}
                            >
                                Employee
                            </button>

                            <button
                                onClick={() => setActiveView("admin")}
                                className={`flex-1 px-6 py-4 ${
                                    activeView === "admin"
                                        ? "bg-white text-violet-600 border-b-2 border-violet-600"
                                        : "text-slate-500"
                                }`}
                            >
                                Admin
                            </button>
                        </div>

                        <div className="p-8">
                            {activeView === "employee" ? (
                                <EmployeeView
                                    employeeStatus={employeeStatus}
                                    employeeData={employeeData}
                                    bottomBarView={bottomBarView}
                                    onClockIn={handleClockIn}
                                    onClockOut={handleClockOut}
                                    onIntermittentIn={handleIntermittentIn}
                                    onIntermittentOut={handleIntermittentOut}
                                    onLunchIn={handleLunchIn}
                                    onLunchOut={handleLunchOut}
                                />
                            ) : (
                                <AdminView
                                    seed={adminSeed}
                                    derivedPDA={derivedPDA}
                                    onSeedChange={handleSeedChange}
                                    onInitialize={handleInitializeEmployee}
                                    employees={employees}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>

            <BottomBar
                activeView={bottomBarView}
                onViewChange={setBottomBarView}
                isWalletConnected={isWalletConnected}
            />

            <div className="fixed top-20 right-4 z-50 space-y-2">
                {toasts.map((t) => (
                    <Toast key={t.id} type={t.type} message={t.message}/>
                ))}
            </div>
        </div>
    );
}
