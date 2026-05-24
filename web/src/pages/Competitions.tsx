import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Calendar } from "lucide-react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import Loading from "@/components/Loading";
import { COUNTRIES, DEFAULT_COUNTRY, findCountry } from "@/lib/countries";

interface WcaCompetition {
    id: string;
    name: string;
    short_name?: string;
    city?: string;
    country_iso2?: string;
    start_date?: string;
    end_date?: string;
    registration_open?: string | null;
    registration_close?: string | null;
    website?: string | null;
    venue?: string | null;
}

type Tab = "all" | "bookmarked";

const formatDateRange = (start?: string, end?: string) => {
    if (!start) return "";
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const s = new Date(start).toLocaleDateString(undefined, opts);
    if (!end || end === start) return s;
    const e = new Date(end).toLocaleDateString(undefined, opts);
    return `${s} – ${e}`;
};

const Competitions = () => {
    const token = useAuthStore((s) => s.token);
    const me = useQuery(api.user.getMe, token ? { token } : "skip");

    const setCountryMutation = useMutation(api.user.setCountry);
    const addBookmark = useMutation(api.competitions.addBookmark);
    const removeBookmark = useMutation(api.competitions.removeBookmark);
    const listByCountry = useAction(api.competitions.listByCountry);
    const listBookmarks = useAction(api.competitions.listBookmarks);

    const [country, setCountry] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("all");
    const [comps, setComps] = useState<WcaCompetition[]>([]);
    const [bookmarked, setBookmarked] = useState<WcaCompetition[]>([]);
    const [compsLoading, setCompsLoading] = useState(false);
    const [bookmarksLoading, setBookmarksLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize country from user profile (or default) once `me` resolves
    useEffect(() => {
        if (!me) return;
        const resolved = me.country ?? DEFAULT_COUNTRY;
        setCountry(resolved);
        // Backfill the user's profile with the default so it persists
        if (!me.country && token) {
            setCountryMutation({ token, country: DEFAULT_COUNTRY }).catch(() => {});
        }
    }, [me, token, setCountryMutation]);

    // Fetch competitions whenever country changes
    useEffect(() => {
        if (!country) return;
        let cancelled = false;
        setCompsLoading(true);
        setError(null);
        listByCountry({ country })
            .then((data) => {
                if (!cancelled) setComps(data);
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load competitions");
            })
            .finally(() => {
                if (!cancelled) setCompsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [country, listByCountry]);

    // Fetch bookmarked comps whenever the bookmark list changes
    useEffect(() => {
        if (!me) return;
        const ids = me.bookmarkedCompetitions ?? [];
        if (ids.length === 0) {
            setBookmarked([]);
            return;
        }
        let cancelled = false;
        setBookmarksLoading(true);
        listBookmarks({ ids })
            .then((data) => {
                if (!cancelled) setBookmarked(data);
            })
            .finally(() => {
                if (!cancelled) setBookmarksLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [me, listBookmarks]);

    const handleCountryChange = useCallback(
        async (newCountry: string) => {
            if (!token) return;
            setCountry(newCountry);
            try {
                await setCountryMutation({ token, country: newCountry });
            } catch (e) {
                console.error("Failed to update country", e);
            }
        },
        [token, setCountryMutation]
    );

    const handleToggleBookmark = useCallback(
        async (competitionId: string, isBookmarked: boolean) => {
            if (!token) return;
            try {
                if (isBookmarked) {
                    await removeBookmark({ token, competitionId });
                } else {
                    await addBookmark({ token, competitionId });
                }
            } catch (e) {
                console.error("Failed to toggle bookmark", e);
            }
        },
        [token, addBookmark, removeBookmark]
    );

    if (!token || !me || !country) {
        return <Loading />;
    }

    const bookmarkedIds = new Set(me.bookmarkedCompetitions ?? []);
    const list = tab === "all" ? comps : bookmarked;
    const isLoading = tab === "all" ? compsLoading : bookmarksLoading;
    const selectedCountry = findCountry(country);

    return (
        <div className="h-full overflow-y-auto font-sans">
            <div className="max-w-4xl mx-auto py-12 px-6">
                <header className="mb-8">
                    <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-black mb-2">
                        Competitions
                    </h1>
                    <p className="text-foreground/50 text-sm">
                        Upcoming WCA competitions in your region. Bookmark the ones you want to attend.
                    </p>
                </header>

                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-1 border border-foreground/10 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setTab("all")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "all" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"}`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("bookmarked")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${tab === "bookmarked" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"}`}
                        >
                            Bookmarked
                            <span className="text-[10px] tabular-nums opacity-70">
                                {bookmarkedIds.size}
                            </span>
                        </button>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/50">Country:</span>
                        <select
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="border border-foreground/10 rounded-lg px-3 py-1.5 bg-background hover:border-foreground/30 focus:outline-none focus:border-foreground/30 font-medium"
                        >
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-16 text-center text-foreground/30 text-sm">Loading competitions…</div>
                ) : list.length === 0 ? (
                    <div className="py-16 text-center text-foreground/30 text-sm">
                        {tab === "bookmarked"
                            ? "No bookmarked competitions yet."
                            : `No upcoming competitions in ${selectedCountry?.name ?? country}.`}
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {list.map((comp) => {
                            const isBookmarked = bookmarkedIds.has(comp.id);
                            return (
                                <li
                                    key={comp.id}
                                    className="border border-foreground/10 rounded-xl p-5 hover:border-foreground/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-black truncate">{comp.name}</h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                                                {comp.start_date && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDateRange(comp.start_date, comp.end_date)}
                                                    </span>
                                                )}
                                                {(comp.city || comp.country_iso2) && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {[comp.city, findCountry(comp.country_iso2)?.name ?? comp.country_iso2]
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    </span>
                                                )}
                                                {comp.website && (
                                                    <a
                                                        href={comp.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-foreground/60 hover:text-foreground transition-colors"
                                                    >
                                                        WCA page <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBookmark(comp.id, isBookmarked)}
                                            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                            className={`shrink-0 p-2 rounded-lg transition-colors ${isBookmarked ? "text-foreground" : "text-foreground/30 hover:text-foreground hover:bg-foreground/5"}`}
                                        >
                                            {isBookmarked ? (
                                                <BookmarkCheck className="w-5 h-5 fill-current" />
                                            ) : (
                                                <Bookmark className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Competitions;
