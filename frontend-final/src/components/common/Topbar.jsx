export function Topbar({ user, route, setRoute, unreadCount }) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{route.replaceAll("-", " ")}</div>
                        <h1 className="text-xl font-black md:text-2xl">Build skills with guided courses</h1>
                    </div>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                    <button className="btn-secondary" onClick={() => setRoute("courses")}>Browse</button>
                    {user && (
                        <button 
                            className="relative btn-secondary flex items-center gap-2"
                            onClick={() => setRoute("notifications")}
                        >
                            <span>🔔</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    )}
                    {!user && (
                        <>
                            <button className="btn-secondary" onClick={() => setRoute("register")}>Register</button>
                            <button className="btn" onClick={() => setRoute("login")}>Login</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
