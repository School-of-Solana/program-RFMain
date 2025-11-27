import {Clock4} from 'lucide-react';

interface HeaderProps {
    isWalletConnected: boolean;
    onConnectWallet: () => void;
}

export function Header({isWalletConnected, onConnectWallet}: HeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <Clock4 className="w-6 h-6 text-white"/>
                    </div>
                    <h1 className="text-slate-900">Punchcard It</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-600 text-sm">Devnet</span>
                    </div>
                    <button
                        onClick={onConnectWallet}
                        className={`px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg ${
                            isWalletConnected
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                        }`}
                    >
                        {isWalletConnected ? 'Disconnect' : 'Connect Wallet'}
                    </button>
                </div>
            </div>
        </header>
    );
}
