
import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Zap, Target, Users, Star, User } from "lucide-react";

export function LeaderboardPage({ user, api, flash }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [currentUserEntry, setCurrentUserEntry] = useState(null);

    async function loadLeaderboard() {
        try {
            const data = await api("/leaderboard");
            setLeaderboard(data.leaderboard || []);
            setAnalytics(data.analytics || null);
            setCurrentUserEntry(data.currentUserEntry || null);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
        if (index === 1) return <Medal className="text-gray-400" size={24} />;
        if (index === 2) return <Award className="text-orange-600" size={24} />;
        return <span className="text-lg font-bold text-slate-500">{index + 1}</span>;
    };

    const renderEntry = (entry, index, isCurrentUser = false) => {
        const entryData = entry.user ? entry : { user: entry };
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
            ? "bg-gradient-to-br from-teal-600 to-emerald-700" 
            : index === 0 
                ? "bg-gradient-to-br from-yellow-500 to-amber-600" 
                : index === 1 
                    ? "bg-gradient-to-br from-slate-500 to-gray-600" 
                    : index === 2 
                        ? "bg-gradient-to-br from-orange-500 to-amber-600" 
                        : "bg-gradient-to-br from-teal-600 to-teal-700";

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
                    {isCurrentUser ? <User className="text-teal-600" size={24} /> : getRankIcon(index)}
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
                        <div className="text-sm text-slate-500">{entry.course?.title || "All courses"}</div>
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
                            <span className="text-base font-bold text-blue-700">Level {entry.level}</span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium">{entry.completedLessons} lessons</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Leaderboard</h1>
                <p className="text-slate-500 mt-1">Top performers across all courses</p>
            </div>

            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analytics?.topPerformer && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg max-w-lg">
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
                </div>
            )}

            <div className="grid gap-4">
                <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300">
                    {/* Show current user's entry at the top for students */}
                    {currentUserEntry && user?.role === "student" && renderEntry(currentUserEntry, 0, true)}

                    {/* Show leaderboard entries (all users) in a scrollable list */}
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
            
        </div>
    );
}
