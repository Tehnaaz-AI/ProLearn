import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { Detail } from "../../components/ui/Detail";
import { formatDate } from "../../utils/helpers";

export function AdminUsers({ api, flash, user }) {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const load = () => api("/admin/users").then((data) => setUsers(data.users || []));
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
    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
            <Panel title="All users and instructors">
                <List items={users} render={(u) => (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                            !["password", "passwordHash", "_id", "id", "created_at", "createdAt", "updatedAt"].includes(key)
                        ).map(([key, value]) => {
                            let label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                            label = label.charAt(0).toUpperCase() + label.slice(1);
                            return <Detail key={key} label={label} value={value || "Not provided"} />;
                        })}
                    </div>
                ) : <p className="text-slate-500">Open a user to view details except password.</p>}
            </Panel>
        </section>
    );
}
