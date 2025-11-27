import {CheckCircle2, XCircle} from 'lucide-react';
import {motion} from 'motion/react';

interface ToastProps {
    type: 'success' | 'error';
    message: string;
}

export function Toast({type, message}: ToastProps) {
    const isSuccess = type === 'success';

    return (
        <motion.div
            initial={{opacity: 0, y: -20, scale: 0.95}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -20, scale: 0.95}}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border-2 ${
                isSuccess
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
            {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600"/>
            ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 text-red-600"/>
            )}
            <p className="text-sm font-medium">{message}</p>
        </motion.div>
    );
}
