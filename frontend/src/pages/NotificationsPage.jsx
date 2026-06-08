import React, { useState, useEffect } from "react";

export function NotificationsPage({ user, api, flash, setRoute, loadUnreadCount }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            setLoading(true);
            const data = await api("/notifications");
            setNotifications(data.notifications || []);
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id) {
        try {
            await api(`/notifications/${id}/read`, { method: "PUT" });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            flash(err.message, "error");
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case "content_deleted":
                return "📝";
            case "user_blocked":
                return "🚫";
            case "user_deleted":
                return "❌";
            default:
                return "🔔";
        }
    };

    const getBgColor = (read) => read ? "bg-white" : "bg-blue-50";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Notifications</h2>
                    <p className="text-slate-600 mt-1">Stay updated with your account activity</p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications</h3>
                    <p className="text-slate-600">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`${getBgColor(notification.read)} rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-md`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-3xl flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">
                                                {notification.title}
                                            </h3>
                                            <p className="text-slate-700 mt-1">
                                                {notification.message}
                                            </p>
                                            {notification.reason && (
                                                <div className="mt-3 bg-slate-100 rounded-xl p-4">
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-semibold">Reason:</span> {notification.reason}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-sm text-slate-500 mt-3">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
