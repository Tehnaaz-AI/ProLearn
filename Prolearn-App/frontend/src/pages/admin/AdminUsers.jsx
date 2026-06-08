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

            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900">Registered Users</h2>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm font-bold">
                        {users.length} Total
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">User</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Contact</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Role</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className={`group hover:bg-slate-50/80 transition-colors ${selected?.id === u.id ? 'bg-teal-50/30' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black shadow-inner ${u.status === "blocked" ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}`}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-bold text-slate-900">{u.username}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'instructor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {u.status === "blocked" ? (
                                            <div>
                                                <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">Blocked</span>
                                                {u.block_reason && <div className="text-[10px] text-red-500 mt-1 max-w-[120px] truncate" title={u.block_reason}>Reason: {u.block_reason}</div>}
                                            </div>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap" onClick={() => open(u.id)}>View Details</button>
                                            {u.id !== user.id && u.status !== "blocked" && <button className="btn-danger py-1.5 px-3 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white whitespace-nowrap" onClick={() => block(u.id)}>Block</button>}
                                            {u.id !== user.id && u.status === "blocked" && <button className="btn py-1.5 px-3 text-xs whitespace-nowrap" onClick={() => unblock(u.id)}>Unblock</button>}
                                            {u.id !== user.id && <button className="btn-danger py-1.5 px-3 text-xs whitespace-nowrap" onClick={() => deleteUser(u.id)}>Delete</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500 font-medium">
                                        No users found in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Selected User Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-black text-slate-900">User Profile</h3>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 mb-6">
                                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-3xl font-black text-white shadow-lg shadow-teal-500/30">
                                    {selected.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{selected.username}</h3>
                                    <p className="text-slate-500 font-medium text-lg">{selected.email}</p>
                                </div>
                            </div>
                            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                                {Object.entries(selected).filter(([key]) => 
                                    !["password", "passwordHash", "_id", "id", "created_at", "createdAt", "updatedAt", "enrollments", "lessons", "completedLessons", "totalEnrollments", "username", "email"].includes(key)
                                ).map(([key, value]) => {
                                    let label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                                    label = label.charAt(0).toUpperCase() + label.slice(1);
                                    return (
                                        <div key={key} className="flex flex-col py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">{label}</span>
                                            <span className="text-sm font-bold text-slate-900 break-words">{String(value) || "Not provided"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
