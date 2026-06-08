
import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Zap, Target, Users, Star, User } from "lucide-react";

export function LeaderboardPage({ user, api, flash }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [currentUserEntry, setCurrentUserEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadLeaderboard() {
        setLoading(true);
        try {
            const data = await api("/leaderboard");
            setLeaderboard(data.leaderboard || []);
            setAnalytics(data.analytics || null);
            setCurrentUserEntry(data.currentUserEntry || null);
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Award className="text-orange-600" size={24} />;
        return <span className="text-lg font-bold text-slate-500">{rank}</span>;
    };

    const renderEntry = (entry, index, isCurrentUser = false) => {
        const entryData = entry.user ? entry : { user: entry };
        const entryRank = entry.rank ?? (index + 1);
        const styleClass = isCurrentUser
            ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 shadow-md ring-2 ring-teal-400"
            : index === 0
                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-md"
                : index === 1
                    ? "bg-gradient-to-r from-slate-50 to-gray-100 border-slate-200"
                    : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
                        : "bg-white border-slate-200";

        const avatarClass = isCurrentUser
            ? "bg-linear-to-br from-teal-600 to-emerald-700"
            : index === 0
                ? "bg-linear-to-br from-yellow-500 to-amber-600"
                : index === 1
                    ? "bg-linear-to-br from-slate-500 to-gray-600"
                    : index === 2
                        ? "bg-linear-to-br from-orange-500 to-amber-600"
                        : "bg-linear-to-br from-teal-600 to-teal-700";

        const textClass = isCurrentUser
            ? "text-teal-900"
            : index === 0
                ? "text-yellow-900"
                : index === 1
                    ? "text-slate-800"
                    : index === 2
                        ? "text-orange-900"
                        : "text-slate-900";

        return (
            <div key={entry._id || entry.id} className={`flex items-center gap-4 p-5 rounded-2xl border shadow-sm transition-all duration-200 ${styleClass}`}>
                <div className="flex items-center justify-center w-14 h-14">
                    {getRankIcon(entryRank)}
                </div>
                <div className="flex items-center gap-4 flex-1">
                    {entryData.user?.profilePictureUrl ? (
                        <img src={entryData.user.profilePictureUrl} alt={entryData.user?.username} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                    ) : (
                        <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl ${avatarClass}`}>
                            {entryData.user?.username?.[0]?.toUpperCase() || entryData.firstName?.[0] || "U"}
                        </div>
                    )}
                    <div>
                        <div className={`font-black text-lg ${textClass}`}>
                            {entryData.user?.firstName || entryData.firstName} {entryData.user?.lastName || entryData.lastName}
                            <span className="text-sm font-semibold text-slate-500 ml-2">@{entryData.user?.username || entryData.username}</span>
                            {isCurrentUser && <span className="ml-2 text-teal-600 text-sm font-semibold">(You)</span>}
                        </div>
                        {isCurrentUser && entryRank && (
                            <div className="mt-1 text-sm font-semibold text-teal-700">Your rank: {entryRank}</div>
                        )}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-xl">
                        <Zap size={18} className="text-amber-600" />
                        <span className="text-xl font-black text-amber-700">{entry.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-xl">
                            <Target size={16} className="text-blue-600" />
                            <span className="text-base font-bold text-blue-700">
                                {entry.level != null ? `Level ${entry.level}` : `Instructor`}
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            {entry.completedLessons != null ? `${entry.completedLessons} lessons` : entry.totalEnrollments != null ? `${entry.totalEnrollments} enrollments` : "No stats yet"}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-5xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <Trophy className="w-3.5 h-3.5" /> Global Rankings
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Leaderboard
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed mx-auto">
                        See how you stack up against top performers across all courses. Earn XP by completing lessons and engaging with the community.
                    </p>
                </div>
            </div>

            {analytics?.topPerformer && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg max-w-lg">
                        <div className="flex items-center gap-3">
                            <Star size={32} className="text-purple-100" />
                            <div>
                                <div className="text-xl font-black truncate">
                                    {analytics.topPerformer.user?.firstName} {analytics.topPerformer.user?.lastName}
                                </div>
                                <div className="text-purple-100 text-sm">
                                    Level {analytics.topPerformer.level} • {analytics.topPerformer.xp} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="max-h-[60vh] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-slate-600 font-semibold">Loading leaderboard...</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {currentUserEntry && (
                        <div className="bg-white rounded-3xl border border-teal-200 p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-slate-500 uppercase tracking-[0.2em] text-xs font-semibold">Your leaderboard standing</div>
                                    <div className="mt-2 text-2xl font-black text-slate-900">
                                        {currentUserEntry.user?.firstName || currentUserEntry.firstName || "You"} {currentUserEntry.user?.lastName || currentUserEntry.lastName || ""}
                                        <span className="text-base font-semibold text-slate-500 ml-2">@{currentUserEntry.user?.username || currentUserEntry.username}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                        <div className="text-sm font-semibold text-slate-500">Rank</div>
                                        <div className="mt-1 text-3xl font-black text-teal-700">{currentUserEntry.rank || "—"}</div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                        <div className="text-sm font-semibold text-slate-500">XP</div>
                                        <div className="mt-1 text-3xl font-black text-amber-700">{currentUserEntry.xp ?? "—"}</div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                        <div className="text-sm font-semibold text-slate-500">Progress</div>
                                        <div className="mt-1 text-3xl font-black text-slate-900">
                                            {currentUserEntry.completedLessons != null ? `${currentUserEntry.completedLessons} lessons` : currentUserEntry.totalEnrollments != null ? `${currentUserEntry.totalEnrollments} enrollments` : "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <Users className="mx-auto text-slate-300" size={48} />
                                <p className="text-slate-500 mt-4 text-lg">No data yet. Keep learning to appear on the leaderboard!</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => renderEntry(entry, index))
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
