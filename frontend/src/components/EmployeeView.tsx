import {Clock, Coffee, LogIn, LogOut, Utensils} from 'lucide-react';
import type {BottomBarView, EmployeeData, EmployeeStatus} from '../App';
import {StatusPill} from './StatusPill';


interface EmployeeViewProps {
    employeeStatus: EmployeeStatus;
    employeeData: EmployeeData;
    bottomBarView: BottomBarView;
    onClockIn: () => void;
    onClockOut: () => void;
    onIntermittentIn: () => void;
    onIntermittentOut: () => void;
    onLunchIn: () => void;
    onLunchOut: () => void;
}


export function EmployeeView({
                                 employeeStatus,
                                 employeeData,
                                 bottomBarView,
                                 onClockIn,
                                 onClockOut,
                                 onIntermittentIn,
                                 onIntermittentOut,
                                 onLunchIn,
                                 onLunchOut,
                             }: EmployeeViewProps) {
    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return '– –';
        const d = new Date(timestamp);
        if (Number.isNaN(d.getTime())) return '– –';
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatTimeRange = (start: string, end: string) => {
        if (!start) return '– –';
        const startDate = new Date(start);
        if (Number.isNaN(startDate.getTime())) return '– –';

        const startStr = startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (!end) return `${startStr} – ongoing`;

        const endDate = new Date(end);
        if (Number.isNaN(endDate.getTime())) return `${startStr} – ongoing`;

        const endStr = endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return `${startStr} – ${endStr}`;
    };

    // ----------------------------------------------------
    //   MODE & AVAILABILITY
    // ----------------------------------------------------

    const hasPda = !!employeeData.pdaAddress;

    const canClockIn = hasPda && employeeStatus === 'off-shift';
    const canClockOut = hasPda && employeeStatus === 'on-shift';

    const canIntermittentIn = hasPda && employeeStatus === 'on-shift';
    const canIntermittentOut = hasPda && employeeStatus === 'on-break';

    const canLunchIn = hasPda && employeeStatus === 'on-shift';
    const canLunchOut = hasPda && employeeStatus === 'on-lunch';

    const isShiftMode = bottomBarView === 'shift';
    const isBreakMode = bottomBarView === 'breaks';

    // If bottomBarView is something else (create/monitor/history) but EmployeeView is active,
    // default to the safer "Shift Actions" layout.
    const showShiftLayout = isShiftMode || (!isShiftMode && !isBreakMode);

    const actionTitle = showShiftLayout ? 'Shift Actions' : 'Break Actions';

    return (
        <div className="space-y-8">
            {/* Status Section */}
            <div className="space-y-4">
                <StatusPill status={employeeStatus}/>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-6">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">Shift start</p>
                        <p className="text-slate-800 font-mono text-sm">
                            {formatTimestamp(employeeData.shiftStartClock)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">Shift end</p>
                        <p className="text-slate-800 font-mono text-sm">
                            {formatTimestamp(employeeData.shiftEndClock)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">Last intermittent break</p>
                        <p className="text-slate-800 font-mono text-sm">
                            {formatTimeRange(
                                employeeData.intermittentStartClock,
                                employeeData.intermittentEndClock
                            )}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">Last lunch break</p>
                        <p className="text-slate-800 font-mono text-sm">
                            {formatTimeRange(
                                employeeData.lunchStartClock,
                                employeeData.lunchEndClock
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div>
                <h3 className="text-slate-700 mb-4">
                    {actionTitle}
                    {!hasPda && (
                        <span className="ml-2 text-xs text-red-500 align-middle">
                            (PDA not initialized – contact admin)
                        </span>
                    )}
                </h3>

                {showShiftLayout ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onClockIn}
                            disabled={!canClockIn}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canClockIn
                                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <LogIn className="w-5 h-5"/>
                                        <span className="font-medium">Clock In</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canClockIn ? 'text-violet-100' : 'text-slate-400'
                                        }`}
                                    >
                                        Start your shift
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 opacity-20"/>
                            </div>
                        </button>

                        <button
                            onClick={onClockOut}
                            disabled={!canClockOut}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canClockOut
                                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <LogOut className="w-5 h-5"/>
                                        <span className="font-medium">Clock Out</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canClockOut ? 'text-violet-100' : 'text-slate-400'
                                        }`}
                                    >
                                        End your shift
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 opacity-20"/>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onIntermittentIn}
                            disabled={!canIntermittentIn}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canIntermittentIn
                                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Coffee className="w-5 h-5"/>
                                        <span className="font-medium">Intermittent In</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canIntermittentIn ? 'text-teal-100' : 'text-slate-400'
                                        }`}
                                    >
                                        Start break
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onIntermittentOut}
                            disabled={!canIntermittentOut}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canIntermittentOut
                                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Coffee className="w-5 h-5"/>
                                        <span className="font-medium">Intermittent Out</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canIntermittentOut ? 'text-teal-100' : 'text-slate-400'
                                        }`}
                                    >
                                        End break
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onLunchIn}
                            disabled={!canLunchIn}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canLunchIn
                                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Utensils className="w-5 h-5"/>
                                        <span className="font-medium">Lunch In</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canLunchIn ? 'text-orange-100' : 'text-slate-400'
                                        }`}
                                    >
                                        Start lunch
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onLunchOut}
                            disabled={!canLunchOut}
                            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                                canLunchOut
                                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Utensils className="w-5 h-5"/>
                                        <span className="font-medium">Lunch Out</span>
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            canLunchOut ? 'text-orange-100' : 'text-slate-400'
                                        }`}
                                    >
                                        End lunch
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Raw Data Section */}
            <div className="space-y-3">
                <h3 className="text-slate-700">Raw Data</h3>
                <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono leading-relaxed">
{`{
  "pda_address": "${employeeData.pdaAddress}",
  "shift_start_clock": "${employeeData.shiftStartClock || ''}",
  "shift_end_clock": "${employeeData.shiftEndClock || ''}",
  "intermittent_start_clock": "${employeeData.intermittentStartClock || ''}",
  "intermittent_end_clock": "${employeeData.intermittentEndClock || ''}",
  "lunch_start_clock": "${employeeData.lunchStartClock || ''}",
  "lunch_end_clock": "${employeeData.lunchEndClock || ''}"
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
