import {Key, Users, Info, Plus} from "lucide-react";

import {web3, BN} from "@coral-xyz/anchor";
import {PROGRAM_ID} from "../idl/anchorClient";

interface Employee {
    pda: string;
    active: boolean;
    lastShiftStart: string;
    lastShiftEnd: string;
}

interface AdminViewProps {
    seed: string;
    derivedPDA: string;
    onSeedChange: (value: string) => void;
    onInitialize: () => void;
    employees: Employee[];
}

export function AdminView({
                              seed,
                              derivedPDA,
                              onSeedChange,
                              onInitialize,
                              employees,
                          }: AdminViewProps) {
    const trimmedSeed = seed.trim();
    const isSeedValidInteger = /^-?\d+$/.test(trimmedSeed);

    return (
        <div className="space-y-8">
            {/* Info Panel */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5"/>
                    <div className="space-y-1">
                        <p className="text-violet-900">
                            Employee accounts are PDAs derived from an i128 seed
                            and managed by the Punchcard It program on Solana Devnet.
                        </p>
                    </div>
                </div>
            </div>

            {/* PDA Management */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-slate-700"/>
                    <h3 className="text-slate-700">PDA Management</h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                    {/* Seed Input */}
                    <div className="space-y-2">
                        <label htmlFor="seed" className="block text-sm text-slate-600">
                            Seed (i128)
                        </label>
                        <input
                            type="text"
                            id="seed"
                            value={seed}
                            onChange={(e) => onSeedChange(e.target.value)}
                            placeholder="Enter integer seed..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl
                                       focus:outline-none focus:ring-2 focus:ring-violet-500
                                       focus:border-transparent transition-all"
                        />
                        {!trimmedSeed && (
                            <p className="text-xs text-slate-500">
                                Enter any integer value to derive a PDA.
                            </p>
                        )}
                        {trimmedSeed && !isSeedValidInteger && (
                            <p className="text-xs text-red-500">
                                Seed must be a valid integer (i128 compatible).
                            </p>
                        )}
                    </div>

                    {/* Derived PDA Output */}
                    <div className="space-y-2">
                        <label htmlFor="derivedPDA" className="block text-sm text-slate-600">
                            Derived PDA Address
                        </label>
                        <input
                            type="text"
                            id="derivedPDA"
                            value={derivedPDA}
                            readOnly
                            placeholder="PDA will appear here..."
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200
                                       rounded-xl font-mono text-sm text-slate-700
                                       cursor-not-allowed"
                        />
                    </div>

                    {/* Initialize Button */}
                    <button
                        onClick={onInitialize}
                        disabled={!isSeedValidInteger}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 
                                    px-6 py-3 rounded-xl transition-all ${
                            isSeedValidInteger
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-purple-700"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                        <Plus className="w-4 h-4"/>
                        Create Employee Account (initialize)
                    </button>
                </div>
            </div>

            {/* Monitor Employees */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-700"/>
                    <h3 className="text-slate-700">Monitor Employees</h3>
                </div>

                <div className="bg-slate-50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs text-slate-600">
                                    PDA
                                </th>
                                <th className="px-6 py-4 text-left text-xs text-slate-600">
                                    Active?
                                </th>
                                <th className="px-6 py-4 text-left text-xs text-slate-600">
                                    Last Shift Start
                                </th>
                                <th className="px-6 py-4 text-left text-xs text-slate-600">
                                    Last Shift End
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {employees.map((employee, index) => (
                                <tr
                                    key={employee.pda + index}
                                    className={`border-b border-slate-200 hover:bg-white transition-colors ${
                                        index === employees.length - 1 ? "border-b-0" : ""
                                    }`}
                                >
                                    {/* PDA */}
                                    <td className="px-6 py-4">
                                        <code className="text-sm text-slate-800 bg-slate-200 px-2 py-1 rounded">
                                            {employee.pda || "—"}
                                        </code>
                                    </td>

                                    {/* Active */}
                                    <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
                                                    employee.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-200 text-slate-600"
                                                }`}
                                            >
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        employee.active
                                                            ? "bg-green-500"
                                                            : "bg-slate-400"
                                                    }`}
                                                ></div>
                                                {employee.active ? "Active" : "Inactive"}
                                            </span>
                                    </td>

                                    {/* Last Shift Start */}
                                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                                        {employee.lastShiftStart
                                            ? new Date(
                                                employee.lastShiftStart
                                            ).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "– –"}
                                    </td>

                                    {/* Last Shift End */}
                                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                                        {employee.lastShiftEnd
                                            ? new Date(
                                                employee.lastShiftEnd
                                            ).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "– –"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function derivePdaFromSeed(seed: string): web3.PublicKey {
    const bn = new BN(seed, 10);
    const seedBytes = bn.toTwos(128).toArrayLike(Buffer, "le", 16);
    const [pda] = web3.PublicKey.findProgramAddressSync(
        [seedBytes],
        PROGRAM_ID
    );
    return pda;
}
