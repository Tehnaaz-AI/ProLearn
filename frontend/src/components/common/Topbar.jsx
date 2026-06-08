import { Bell } from "lucide-react";

export function Topbar({ user, route, setRoute, unreadCount }) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-sm">{route.replaceAll("-", " ")}</div>
                        <h1 className="text-sm font-bold text-slate-600 hidden sm:block">Build skills with guided courses</h1>
                    </div>
                </div>
                <div className="hidden items-center gap-4 sm:flex">
                    <button className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors" onClick={() => setRoute("courses")}>Browse Courses</button>
                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                            <button 
                                className="relative text-slate-500 hover:text-teal-700 transition-colors"
                                onClick={() => setRoute("notifications")}
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setRoute("dashboard")} className="flex items-center gap-2 group">
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/20 group-hover:ring-teal-500 transition-all" alt="Profile" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold ring-2 ring-teal-500/20 group-hover:ring-teal-500 transition-all uppercase">{user.username?.[0]}</div>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <button className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors" onClick={() => setRoute("login")}>Sign in</button>
                            <button className="btn px-5 py-2 text-sm shadow-lg shadow-teal-900/20" onClick={() => setRoute("register")}>Get Started</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
