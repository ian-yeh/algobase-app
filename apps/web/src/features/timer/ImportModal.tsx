import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { Upload } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { useAuthStore } from '@/stores/authStore';
import { parseCsTimer } from '@/lib/cstimer';

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose }) => {
    const token = useAuthStore((s) => s.token);
    const importSolves = useMutation(api.solve.importSolves);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !busy) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, busy, onClose]);

    useEffect(() => {
        if (open) setStatus(null);
    }, [open]);

    if (!open) return null;

    const handleFile = async (file: File | undefined) => {
        if (!file || !token || busy) return;

        setBusy(true);
        try {
            const imported = parseCsTimer(await file.text());
            if (imported.length === 0) {
                setStatus('No solves found in that file.');
                return;
            }
            // Convex caps writes per mutation, so send in chunks.
            for (let i = 0; i < imported.length; i += 200) {
                setStatus(`Importing ${i} / ${imported.length}...`);
                await importSolves({ token, solves: imported.slice(i, i + 200) });
            }
            setStatus(`Imported ${imported.length} solves.`);
        } catch (err) {
            console.error('Failed to import solves', err);
            setStatus('Could not read that file.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm font-sans"
            onClick={() => !busy && onClose()}
        >
            <div
                className="bg-background rounded-2xl shadow-2xl border border-foreground/5 max-w-md w-full mx-4 p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">
                    Import
                </div>
                <div className="text-2xl mb-6 text-black">Import solves from csTimer</div>

                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => !busy && fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors ${
                        dragging ? 'border-foreground/40 bg-foreground/5' : 'border-foreground/10 hover:bg-foreground/5'
                    } ${busy ? 'pointer-events-none opacity-60' : ''}`}
                >
                    <Upload size={20} className="mx-auto text-foreground/30 mb-3" />
                    <div className="text-sm text-foreground/80">
                        Drop your csTimer export here
                    </div>
                    <div className="text-xs text-foreground/40 mt-1">
                        or click to choose a .txt file
                    </div>
                </div>

                {status && (
                    <p className="text-xs text-foreground/60 mt-4 text-center">{status}</p>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.json,application/json,text/plain"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        handleFile(file);
                    }}
                    className="hidden"
                />

                <div className="flex justify-end mt-8 pt-6 border-t border-foreground/5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
