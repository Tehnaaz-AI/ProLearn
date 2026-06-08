import { BookOpen, GraduationCap, Video, Users, Settings, BarChart, User } from "lucide-react";

export function Dashboard({ user, courses, setRoute }) {
    const paid = courses.filter(c => Boolean(c.is_paid ?? c.isPaid)).length;
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 max-w-6xl mx-auto">
            {/* Dashboard Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-10 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900 to-slate-950"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="shrink-0">
                        <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-3xl font-black shadow-lg shadow-teal-500/50 border-4 border-slate-900">
                            {user.firstName ? user.firstName[0] : "U"}
                        </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-3">
                            <User className="w-3.5 h-3.5" /> {user.role} Dashboard
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm mb-2">
                            Welcome back, {user.firstName || user.username}!
                        </h1>
                        <p className="text-slate-300 font-medium text-sm sm:text-base">
                            Ready to continue your learning journey today?
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="panel bg-gradient-to-br from-white to-slate-50 border-white shadow-lg shadow-slate-200/50 flex items-center gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="p-4 bg-teal-100 text-teal-600 rounded-2xl shrink-0"><BookOpen className="w-7 h-7" /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Published Courses</p>
                        <p className="text-3xl font-black text-slate-900">{courses.length}</p>
                    </div>
                </div>
                <div className="panel bg-gradient-to-br from-white to-slate-50 border-white shadow-lg shadow-slate-200/50 flex items-center gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shrink-0"><GraduationCap className="w-7 h-7" /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Paid Courses</p>
                        <p className="text-3xl font-black text-slate-900">{paid}</p>
                    </div>
                </div>
                <div className="panel bg-gradient-to-br from-white to-slate-50 border-white shadow-lg shadow-slate-200/50 flex items-center gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0"><Video className="w-7 h-7" /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Free Courses</p>
                        <p className="text-3xl font-black text-slate-900">{courses.length - paid}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="pt-4">
                <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-600" /> Quick Actions
                </h3>
                <section className="grid gap-5 lg:grid-cols-3">
                    <div onClick={() => setRoute("courses")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors"><BookOpen className="w-6 h-6" /></div>
                        <h4 className="text-lg font-black text-slate-900 mb-2">Browse Courses</h4>
                        <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed min-h-[40px]">Search, preview, enroll, and continue learning.</p>
                        <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Open Catalog &rarr;</div>
                    </div>
                    
                    <div onClick={() => setRoute("my-courses")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors"><GraduationCap className="w-6 h-6" /></div>
                        <h4 className="text-lg font-black text-slate-900 mb-2">My Enrollments</h4>
                        <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed min-h-[40px]">View enrolled courses and unlocked content.</p>
                        <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Continue Learning &rarr;</div>
                    </div>

                    {user.role === "student" && (
                        <div onClick={() => setRoute("become-instructor")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors"><Video className="w-6 h-6" /></div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">Become Instructor</h4>
                            <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed min-h-[40px]">Share your knowledge and start earning today.</p>
                            <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Apply Now &rarr;</div>
                        </div>
                    )}

                    {user.role === "instructor" && (
                        <>
                            <div onClick={() => setRoute("create-course")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white border-teal-100">
                                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors"><Video className="w-6 h-6" /></div>
                                <h4 className="text-lg font-black text-slate-900 mb-2">Instructor Desk</h4>
                                <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed min-h-[40px]">Create courses, upload lessons, and manage content.</p>
                                <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Create Course &rarr;</div>
                            </div>
                            <div onClick={() => setRoute("instructor-courses")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors"><BarChart className="w-6 h-6" /></div>
                                <h4 className="text-lg font-black text-slate-900 mb-2">Manage Courses</h4>
                                <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed min-h-[40px]">View enrollments, reviews, and answer doubts.</p>
                                <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Open Dashboard &rarr;</div>
                            </div>
                        </>
                    )}

                    {user.role === "admin" && (
                        <div onClick={() => setRoute("admin-users")} className="group cursor-pointer panel p-6 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-teal-50/50 border border-teal-100">
                            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors"><Users className="w-6 h-6" /></div>
                            <h4 className="text-lg font-black text-teal-900 mb-2">Admin Controls</h4>
                            <p className="text-sm text-teal-700/80 mb-5 font-medium leading-relaxed min-h-[40px]">Review users, applications, payments, and system blocks.</p>
                            <div className="text-sm font-black text-teal-600 group-hover:text-teal-700 flex items-center gap-1">Open Admin Panel &rarr;</div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
