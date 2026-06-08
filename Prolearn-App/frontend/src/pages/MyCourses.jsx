import { useEffect, useState } from "react";
import { CourseGrid } from "../components/course/CourseGrid";
import { GraduationCap, BookOpen } from "lucide-react";

export function MyCourses({ api, openCourse, flash, user }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        api("/my/enrollments")
            .then((data) => setItems(data.courses || []))
            .catch((err) => flash(err.message, "error"))
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
                <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-6"></div>
                <p className="text-lg font-black text-slate-700 tracking-tight">Loading your courses...</p>
                <p className="text-sm text-slate-500 font-medium mt-2">Preparing your learning environment</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-7xl mx-auto">
            {/* Beautiful Page Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <GraduationCap className="w-3.5 h-3.5" /> Enrolled
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        My Courses
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed">
                        Access all your enrolled courses, pick up where you left off, and track your progress.
                    </p>
                </div>
            </div>

            <div className="pt-2">
                {items.length === 0 ? (
                    <div className="panel flex flex-col items-center text-center p-12 bg-white/60 backdrop-blur-md border-white">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6 shadow-inner">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No enrollments yet</h3>
                        <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">You haven't enrolled in any courses yet. Browse our catalog to discover new skills and start learning!</p>
                        <button className="btn px-8" onClick={() => window.location.hash = "#/courses"}>Browse Catalog</button>
                    </div>
                ) : (
                    <CourseGrid courses={items} openCourse={openCourse} user={user} />
                )}
            </div>
        </div>
    );
}
