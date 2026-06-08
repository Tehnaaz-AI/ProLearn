import React from "react";
import { ChevronLeft, LogOut } from "lucide-react";
import { navItems } from "../../utils/helpers";

export function Sidebar({ user, route, setRoute, logout, open, setOpen }) {
    const handleMouseEnter = () => setOpen(true);
    const handleMouseLeave = () => setOpen(false);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 border-r border-slate-800 bg-slate-950 py-6 shadow-2xl shadow-teal-900/50 backdrop-blur transition-all duration-300 flex flex-col ${open ? "w-72 px-5" : "w-20 px-3"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={() => setOpen(!open)}
                className="absolute -right-3 top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-lg transition-all hover:text-white hover:bg-slate-700 hover:scale-110"
            >
                <ChevronLeft size={14} className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`} />
            </button>
            <div className={`flex items-center overflow-hidden mb-6 ${open ? "gap-3 px-1" : "justify-center"}`}>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 text-xl font-black text-white shadow-lg shadow-teal-900/50">PL</div>
                <div className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 w-0"}`}>
                    <div className="text-2xl font-black tracking-tight whitespace-nowrap text-white">ProLearn</div>
                </div>
            </div>
            
            {user && (
                <div className={`mb-8 rounded-2xl bg-slate-900/50 border border-slate-800/50 text-white transition-all overflow-hidden ${open ? "p-3" : "p-2 py-3"}`}>
                    {open ? (
                        <div className="flex items-center gap-3">
                            {user.profilePictureUrl ? (
                                <img 
                                    src={user.profilePictureUrl} 
                                    alt={user.username}
                                    className="h-11 w-11 rounded-xl object-cover ring-2 ring-teal-500/30"
                                />
                            ) : (
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-teal-500/30 text-lg font-bold uppercase">{user.username[0]}</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold tracking-widest uppercase text-teal-400 mb-0.5">Signed in as</div>
                                <div className="truncate font-bold text-sm text-slate-200">{user.username}</div>
                                <div className="mt-1 inline-flex rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase text-slate-400">{user.role}</div>
                            </div>
                        </div>
                    ) : (
                        user.profilePictureUrl ? (
                            <img 
                                src={user.profilePictureUrl} 
                                alt={user.username}
                                className="mx-auto h-10 w-10 rounded-xl object-cover ring-2 ring-teal-500/30"
                                title={user.username}
                            />
                        ) : (
                            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-teal-500/30 font-bold uppercase" title={user.username}>{user.username[0]}</div>
                        )
                    )}
                </div>
            )}
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
                <nav className="space-y-1.5">
                    {navItems(user).map(([key, label, Icon]) => {
                        const isActive = route === key;
                        return (
                            <button 
                                key={key} 
                                onClick={() => setRoute(key)} 
                                title={!open ? label : ""} 
                                className={`w-full flex items-center overflow-hidden rounded-xl transition-all duration-300 group ${!open ? "justify-center p-3" : "px-4 py-3"} ${isActive ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                            >
                                <Icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span className={`transition-all duration-300 whitespace-nowrap text-sm ${open ? "opacity-100 ml-3" : "opacity-0 w-0"} ${isActive ? "font-bold" : "font-medium"}`}>{label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
            {user && (
                <div className="mt-2 pt-4 border-t border-slate-800/50">
                    <button 
                        onClick={logout} 
                        title={!open ? "Logout" : ""} 
                        className={`w-full flex items-center overflow-hidden rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ${!open ? "justify-center p-3" : "px-4 py-3"}`}
                    >
                        <LogOut size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                        <span className={`transition-all duration-300 whitespace-nowrap text-sm font-bold ${open ? "opacity-100 ml-3" : "opacity-0 w-0"}`}>Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
}
