import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuthStore } from '@/stores/authStore';

// Bump VERSION when you edit FEATURES so everyone sees the modal once more.
const VERSION = '2026-10-27';
const FEATURES = [
    'Dark mode - toggle it from the sidebar.',
    'Square-1 cubeshape trainer replaces CSP training.',
    '3BLD tracing now supports custom scrambles.',
];

const WhatsNewModal = () => {
    const token = useAuthStore((s) => s.token);
    const me = useQuery(api.user.getMe, token ? { token } : "skip");
    const setSeen = useMutation(api.user.setWhatsNewSeen);
    const [dismissed, setDismissed] = useState(false);

    const open = !!me && me.whatsNewSeen !== VERSION && !dismissed;

    const close = () => {
        setDismissed(true);
        if (token) setSeen({ token, version: VERSION });
    };

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, close]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm font-sans"
            onClick={close}
        >
            <div
                className="bg-background rounded-2xl shadow-2xl border border-foreground/5 max-w-md w-full mx-4 p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">
                    What's new
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-foreground/80 list-disc pl-5">
                    {FEATURES.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className="flex justify-end mt-8 pt-6 border-t border-foreground/5">
                    <button
                        type="button"
                        onClick={close}
                        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsNewModal;
