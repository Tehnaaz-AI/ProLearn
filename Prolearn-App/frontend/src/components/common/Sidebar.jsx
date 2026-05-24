import React from "react";
import { ChevronLeft, LogOut } from "lucide-react";
import { navItems } from "../../utils/helpers";

export function Sidebar({ user, route, setRoute, logout, open, setOpen }) {
    const handleMouseEnter = () => setOpen(true);
    const handleMouseLeave = () => setOpen(false);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white/95 py-5 shadow-2xl shadow-slate-200/70 backdrop-blur transition-all duration-300 flex flex-col ${open ? "w-72 px-4" : "w-20 px-2"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={() => setOpen(!open)}
                className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-transform hover:text-slate-900"
            >
                <ChevronLeft size={14} className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`} />
            </button>
            <div className={`flex items-center overflow-hidden ${open ? "gap-3 px-2" : "justify-center"}`}>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-700 text-lg font-black text-white shadow-lg shadow-teal-700/20">PL</div>
                <div className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 w-0"}`}>
                    <div className="text-xl font-black tracking-tight whitespace-nowrap">ProLearn</div>
                </div>
            </div>
            {user && (
                <div className={`mt-6 rounded-2xl bg-slate-950 text-white transition-all overflow-hidden ${open ? "p-4" : "p-2 py-4"}`}>
                    {open ? (
                        <div className="flex items-center gap-3">
                            {user.profilePictureUrl ? (
                                <img 
                                    src={user.profilePictureUrl} 
                                    alt={user.username}
                                    className="h-12 w-12 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-lg font-bold uppercase">{user.username[0]}</div>
                            )}
                            <div className="flex-1">
                                <div className="text-sm text-slate-300 whitespace-nowrap">Signed in as</div>
                                <div className="truncate font-bold">{user.username}</div>
                                <div className="mt-1 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize">{user.role}</div>
                            </div>
                        </div>
                    ) : (
                        user.profilePictureUrl ? (
                            <img 
                                src={user.profilePictureUrl} 
                                alt={user.username}
                                className="mx-auto h-10 w-10 rounded-xl object-cover"
                                title={user.username}
                            />
                        ) : (
                            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/10 font-bold uppercase" title={user.username}>{user.username[0]}</div>
                        )
                    )}
                </div>
            )}
            <div className="mt-5 flex-1 overflow-y-auto pr-1">
                <nav className="space-y-1">
                    {navItems(user).map(([key, label, Icon]) => (
                        <button key={key} onClick={() => setRoute(key)} title={!open ? label : ""} className={`nav-item flex items-center overflow-hidden ${!open ? "justify-center px-0" : ""} ${route === key ? "nav-active" : ""}`}>
                            <Icon size={18} className="shrink-0" />
                            <span className={`transition-opacity duration-300 whitespace-nowrap ${open ? "opacity-100 ml-3" : "opacity-0 w-0"}`}>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {user && (
                <button onClick={logout} title={!open ? "Logout" : ""} className={`nav-item flex items-center overflow-hidden text-red-700 hover:bg-red-50 mt-2 ${!open ? "justify-center px-0" : ""}`}>
                    <LogOut size={18} className="shrink-0" />
                    <span className={`transition-opacity duration-300 whitespace-nowrap ${open ? "opacity-100 ml-3" : "opacity-0 w-0"}`}>Logout</span>
                </button>
            )}
        </aside>
    );
}
