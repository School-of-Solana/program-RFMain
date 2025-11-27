import { Plus, Users, Clock, Coffee, BarChart3 } from 'lucide-react';
import type { BottomBarView } from '../App';

interface BottomBarProps {
    activeView: BottomBarView;
    onViewChange: (view: BottomBarView) => void;
    isWalletConnected: boolean;
}

const navItems: Array<{ id: BottomBarView; label: string; icon: any; disabled?: boolean }> = [
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'monitor', label: 'Monitor', icon: Users },
    { id: 'shift', label: 'Shift', icon: Clock },
    { id: 'breaks', label: 'Breaks', icon: Coffee },
    { id: 'history', label: 'History', icon: BarChart3, disabled: true },
];

export function BottomBar({ activeView, onViewChange, isWalletConnected }: BottomBarProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-2xl z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-around max-w-2xl mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        const isDisabled = item.disabled || !isWalletConnected;

                        return (
                            <button
                                key={item.id}
                                onClick={() => !isDisabled && onViewChange(item.id)}
                                disabled={isDisabled}
                                className={`relative flex flex-col items-center gap-1 px-4 py-3 transition-all ${
                                    isDisabled
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'hover:scale-105'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-b-full"></div>
                                )}
                                <Icon
                                    className={`w-5 h-5 transition-colors ${
                                        isActive
                                            ? 'text-violet-600'
                                            : isDisabled
                                                ? 'text-slate-300'
                                                : 'text-slate-500'
                                    }`}
                                />
                                <span
                                    className={`text-xs transition-colors ${
                                        isActive
                                            ? 'text-violet-600'
                                            : isDisabled
                                                ? 'text-slate-300'
                                                : 'text-slate-600'
                                    }`}
                                >
                  {item.label}
                </span>
                                {item.disabled && (
                                    <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
