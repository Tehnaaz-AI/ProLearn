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

            <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                <Panel title="All users and instructors">
                    <List items={users} render={(u) => (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-2">
                        <div>
                            <strong>{u.username}</strong>
                            <p className="text-sm text-slate-600">{u.email} | {u.role} | {u.status}</p>
                            {u.block_reason && <small className="text-red-700">Reason: {u.block_reason}</small>}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button className="btn-secondary" onClick={() => open(u.id)}>Details</button>
                            {u.id !== user.id && u.status !== "blocked" && <button className="btn-danger" onClick={() => block(u.id)}>Block</button>}
                            {u.id !== user.id && u.status === "blocked" && <button className="btn" onClick={() => unblock(u.id)}>Unblock</button>}
                            {u.id !== user.id && <button className="btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>}
                        </div>
                    </div>
                )} />
            </Panel>
            <Panel title="Selected user details">
                {selected ? (
                    <div className="space-y-2">
                        {Object.entries(selected).filter(([key]) => 
                            !["password", "passwordHash", "_id", "id", "created_at", "createdAt", "updatedAt", "enrollments", "lessons", "completedLessons", "totalEnrollments"].includes(key)
                        ).map(([key, value]) => {
                            let label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                            label = label.charAt(0).toUpperCase() + label.slice(1);
                            return <Detail key={key} label={label} value={value || "Not provided"} />;
                        })}
                    </div>
                ) : <p className="text-slate-500">Open a user to view details except password.</p>}
            </Panel>
        </section>
        </div>
    );
}
