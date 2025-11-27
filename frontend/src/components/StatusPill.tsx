import type {EmployeeStatus} from '../App';

interface StatusPillProps {
    status: EmployeeStatus;
}

export function StatusPill({status}: StatusPillProps) {
    const statusConfig = {
        'off-shift': {
            label: 'Off Shift',
            color: 'bg-slate-100 text-slate-700 border-slate-200',
            dotColor: 'bg-slate-500',
        },
        'on-shift': {
            label: 'On Shift',
            color: 'bg-green-100 text-green-700 border-green-200',
            dotColor: 'bg-green-500',
        },
        'on-break': {
            label: 'On Break (Intermittent)',
            color: 'bg-teal-100 text-teal-700 border-teal-200',
            dotColor: 'bg-teal-500',
        },
        'on-lunch': {
            label: 'On Lunch',
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            dotColor: 'bg-orange-500',
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 ${config.color}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} animate-pulse`}></div>
                <span className="font-medium">{config.label}</span>
            </div>
        </div>
    );
}
