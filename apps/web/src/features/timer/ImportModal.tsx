import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { Upload } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { useAuthStore } from '@/stores/authStore';
import { parseCsTimer, type CsTimerSession } from '@/lib/cstimer';

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
    const [sessions, setSessions] = useState<CsTimerSession[] | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !busy) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, busy, onClose]);

    useEffect(() => {
        if (open) {
            setStatus(null);
            setSessions(null);
            setSelected([]);
            setExpanded(null);
        }
    }, [open]);

    if (!open) return null;

    const handleFile = async (file: File | undefined) => {
        if (!file || busy) return;
        try {
            const parsed = parseCsTimer(await file.text());
            if (parsed.length === 0) {
                setStatus('No solves found in that file.');
                return;
            }
            setSessions(parsed);
            setSelected(parsed.map((s) => s.key));
            setStatus(null);
        } catch (err) {
            console.error('Failed to read csTimer export', err);
            setStatus('Could not read that file.');
        }
    };

    const chosen = (sessions ?? []).filter((s) => selected.includes(s.key));
    const chosenSolves = chosen.flatMap((s) => s.solves);

    const handleImport = async () => {
        if (!token || busy || chosenSolves.length === 0) return;
        setBusy(true);
        try {
            // Convex caps writes per mutation, so send in chunks.
            for (let i = 0; i < chosenSolves.length; i += 200) {
                setStatus(`Importing ${i} / ${chosenSolves.length}...`);
                await importSolves({ token, solves: chosenSolves.slice(i, i + 200) });
            }
            setStatus(`Imported ${chosenSolves.length} solves.`);
            setSessions(null);
        } catch (err) {
            console.error('Failed to import solves', err);
            setStatus('Import failed.');
        } finally {
            setBusy(false);
        }
    };

    const toggle = (key: string) =>
        setSelected((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );

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

                {!sessions ? (
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
                ) : (
                    <div className="max-h-80 overflow-y-auto -mx-2 px-2 space-y-1">
                        {sessions.map((session) => (
                            <div key={session.key} className="rounded-lg border border-foreground/5">
                                <label className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(session.key)}
                                        onChange={() => toggle(session.key)}
                                        disabled={busy}
                                    />
                                    <span className="text-sm text-foreground/80 flex-1 truncate">
                                        {session.name}
                                    </span>
                                    <span className="text-xs text-foreground/40">
                                        {session.cubeType} &middot; {session.solves.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setExpanded(expanded === session.key ? null : session.key);
                                        }}
                                        className="text-xs text-foreground/40 hover:text-foreground/80"
                                    >
                                        {expanded === session.key ? 'hide' : 'preview'}
                                    </button>
                                </label>

                                {expanded === session.key && (
                                    <div className="px-3 pb-2 space-y-1">
                                        {session.solves.slice(0, 10).map((solve, i) => (
                                            <div key={i} className="flex gap-3 text-xs text-foreground/50">
                                                <span className="w-12 tabular-nums">
                                                    {solve.dnf ? 'DNF' : solve.time.toFixed(2)}
                                                </span>
                                                <span className="truncate">{solve.scramble}</span>
                                            </div>
                                        ))}
                                        {session.solves.length > 10 && (
                                            <div className="text-xs text-foreground/30">
                                                +{session.solves.length - 10} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

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

                <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-foreground/5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="px-4 py-2 text-sm font-medium text-foreground/60 rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-40"
                    >
                        Close
                    </button>
                    {sessions && (
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={busy || chosenSolves.length === 0}
                            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                            Import {chosenSolves.length} solves
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
