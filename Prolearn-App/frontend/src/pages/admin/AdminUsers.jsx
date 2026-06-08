import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { Detail } from "../../components/ui/Detail";
import { formatDate } from "../../utils/helpers";

export function AdminUsers({ api, flash, user }) {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const load = () => {
        setLoading(true);
        return api("/admin/users")
            .then((data) => setUsers(data.users || []))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);
    async function open(id) {
        const data = await api(`/admin/users/${id}`);
        setSelected(data.user);
    }
    async function block(id) {
        const reason = window.prompt("Valid reason for blocking this account");
        if (!reason) return;
        await api(`/admin/users/${id}/block`, { method: "POST", body: JSON.stringify({ reason }) });
        flash("User blocked.");
        load();
    }
    async function unblock(id) {
        await api(`/admin/users/${id}/unblock`, { method: "POST", body: "{}" });
        flash("User unblocked.");
        load();
    }
    async function deleteUser(id) {
        const reason = window.prompt("Please enter a reason for deleting this user:");
        if (!reason) return;
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        await api(`/admin/users/${id}`, { method: "DELETE", body: JSON.stringify({ reason }) });
        flash("User deleted.");
        if (selected?.id === id) {
            setSelected(null);
        }
        load();
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading users...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-7xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900 to-slate-950"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                            Admin Controls
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                            User Management
                        </h1>
                    </div>
                </div>
            </div>

            <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-slate-900">All Users</h2>
                        <span className="text-sm font-semibold text-slate-500">{users.length} total</span>
                    </div>
                    <div className="grid gap-4">
                        {users.map(u => (
                            <div key={u.id} className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300 ${selected?.id === u.id ? "border-teal-500 bg-teal-50/50 shadow-md shadow-teal-500/10" : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-slate-200/50"}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-black shadow-inner ${u.status === "blocked" ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}`}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-lg">{u.username}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'instructor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role}
                                            </span>
                                            {u.status === "blocked" && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Blocked</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 mt-0.5">{u.email}</p>
                                        {u.block_reason && <p className="text-xs font-semibold text-red-600 mt-1">Reason: {u.block_reason}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                    <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => open(u.id)}>View</button>
                                    {u.id !== user.id && u.status !== "blocked" && <button className="btn-danger py-1.5 px-3 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white" onClick={() => block(u.id)}>Block</button>}
                                    {u.id !== user.id && u.status === "blocked" && <button className="btn py-1.5 px-3 text-xs" onClick={() => unblock(u.id)}>Unblock</button>}
                                    {u.id !== user.id && <button className="btn-danger py-1.5 px-3 text-xs" onClick={() => deleteUser(u.id)}>Delete</button>}
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <p className="text-slate-500 font-medium">No users found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-900 mb-6">User Details</h2>
                        {selected ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-2xl font-black text-white shadow-lg shadow-teal-500/30">
                                        {selected.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">{selected.username}</h3>
                                        <p className="text-slate-500 font-medium">{selected.email}</p>
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    {Object.entries(selected).filter(([key]) => 
                                        !["password", "passwordHash", "_id", "id", "created_at", "createdAt", "updatedAt", "enrollments", "lessons", "completedLessons", "totalEnrollments", "username", "email"].includes(key)
                                    ).map(([key, value]) => {
                                        let label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                                        label = label.charAt(0).toUpperCase() + label.slice(1);
                                        return (
                                            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                                <span className="text-sm font-semibold text-slate-500">{label}</span>
                                                <span className="text-sm font-bold text-slate-900 text-right">{String(value) || "Not provided"}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                                    <span className="text-slate-400 text-2xl">👤</span>
                                </div>
                                <p className="text-slate-500 font-medium">Select a user to view full details</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
