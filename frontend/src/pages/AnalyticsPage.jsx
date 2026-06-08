
import { useEffect, useState } from "react";
import { Zap, Target, BookOpen, Award } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Panel } from "../components/common/Panel";

export function AnalyticsPage({ user, api, flash }) {
    const [analytics, setAnalytics] = useState(null);
    const [courseProgress, setCourseProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        try {
            const data = await api("/analytics/me");
            setAnalytics(data.userAnalytics);
            setCourseProgress(data.courseProgress);
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="space-y-6">
            <SectionHeader title="Analytics & Progress" text="Your personal learning journey" />
            
            {analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <Zap size={32} className="text-teal-100" />
                            <div>
                                <div className="text-3xl font-black">{analytics.totalXP}</div>
                                <div className="text-teal-100 text-sm">Total XP</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <Target size={32} className="text-amber-100" />
                            <div>
                                <div className="text-3xl font-black">Level {analytics.maxLevel}</div>
                                <div className="text-amber-100 text-sm">Max Level</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <BookOpen size={32} className="text-blue-100" />
                            <div>
                                <div className="text-3xl font-black">{analytics.totalCompletedLessons}</div>
                                <div className="text-blue-100 text-sm">Lessons Completed</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <Award size={32} className="text-purple-100" />
                            <div>
                                <div className="text-3xl font-black">{analytics.enrolledCourses}</div>
                                <div className="text-purple-100 text-sm">Enrolled Courses</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Panel title="Course Progress">
                {courseProgress.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Not enrolled in any courses yet.</p>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {courseProgress.map((entry, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">{entry.course?.title}</div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            {entry.completedLessons} lessons completed • {entry.xp} XP • Level {entry.level}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-teal-600">{entry.percentage || Math.min(Math.round((entry.completedLessons / 20) * 100), 100)}%</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${entry.percentage || Math.min(Math.round((entry.completedLessons / 20) * 100), 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}
