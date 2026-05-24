
import { useEffect, useState } from "react";
import { UsersRound, Plus, Send, Video, Trash2, Pin } from "lucide-react";

export function StudyGroupsPage({ user, api, courses, flash, setRoute }) {
    const [groups, setGroups] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", course: "" });

    async function loadGroups(courseId = "") {
        try {
            const url = courseId ? `/study-groups?courseId=${courseId}` : "/study-groups";
            const data = await api(url);
            setGroups(data.groups || []);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function loadMessages(groupId) {
        try {
            const data = await api(`/study-groups/${groupId}/messages`);
            setMessages(data.messages || []);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    useEffect(() => {
        loadGroups(selectedCourse);
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedGroup) {
            loadMessages(selectedGroup._id);
        }
    }, [selectedGroup]);

    async function handleCreateGroup(e) {
        e.preventDefault();
        try {
            await api("/study-groups", {
                method: "POST",
                body: JSON.stringify(newGroup),
            });
            flash("Study group created!", "success");
            setShowCreateGroup(false);
            setNewGroup({ name: "", description: "", course: "" });
            loadGroups(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handleJoinGroup(groupId) {
        try {
            await api(`/study-groups/${groupId}/join`, {
                method: "POST",
            });
            flash("Joined study group!", "success");
            loadGroups(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handleDeleteGroup(groupId) {
        try {
            await api(`/study-groups/${groupId}`, {
                method: "DELETE",
            });
            flash("Study group deleted!", "success");
            if (selectedGroup?._id === groupId) {
                setSelectedGroup(null);
            }
            loadGroups(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handlePinGroup(groupId) {
        try {
            await api(`/study-groups/${groupId}/pin`, {
                method: "PUT",
            });
            flash("Group pin status updated!", "success");
            loadGroups(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    const canPinGroup = (group) => {
        if (!user) return false;
        if (user.role === "admin") return true;
        const course = courses.find(c => c.id === group.course?._id || c.id === group.course);
        return course && String(course.instructor) === String(user._id);
    };

    async function handleSendMessage() {
        if (!newMessage && !videoUrl) return;
        try {
            await api(`/study-groups/${selectedGroup._id}/messages`, {
                method: "POST",
                body: JSON.stringify({ content: newMessage, videoUrl }),
            });
            setNewMessage("");
            setVideoUrl("");
            loadMessages(selectedGroup._id);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    const isMember = (group) => {
        return group.members?.some(m => String(m._id || m) === String(user?._id));
    };

    const canModifyGroup = (group) => {
        if (!user) return false;
        if (user.role === "admin") return true;
        return String(group.createdBy?._id || group.createdBy) === String(user._id);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            <div className="lg:col-span-1 space-y-4 flex flex-col">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Study Groups</h1>
                            <p className="text-slate-500 text-sm">Learn together</p>
                        </div>
                        {user && (
                            <button
                                onClick={() => setShowCreateGroup(!showCreateGroup)}
                                className="btn flex items-center gap-2"
                            >
                                <Plus size={16} />
                                New
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto pb-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedCourse("")}
                                className={`px-4 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedCourse === "" ? "bg-teal-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                            >
                                All Courses
                            </button>
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course.id)}
                                    className={`px-4 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedCourse === course.id ? "bg-teal-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                >
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {showCreateGroup && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Group name"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                className="input"
                                required
                            />
                            <select
                                value={newGroup.course}
                                onChange={(e) => setNewGroup({ ...newGroup, course: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="">Select course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Description"
                                value={newGroup.description}
                                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                className="input h-32"
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreateGroup(false)} className="btn-secondary flex items-center justify-center">Cancel</button>
                                <button type="submit" className="btn flex items-center justify-center">Create</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[400px]">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <div
                                onClick={() => setSelectedGroup(group)}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-100 p-3 rounded-xl">
                                        <UsersRound size={20} className="text-teal-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-slate-900 truncate">{group.name}</div>
                                            {group.pinned && <Pin size={14} className="text-yellow-500" fill="currentColor" />}
                                        </div>
                                        <div className="text-sm text-slate-500">{group.course?.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">{group.members?.length || 0} members</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {canPinGroup(group) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePinGroup(group._id);
                                        }}
                                        className={group.pinned ? "text-yellow-500" : "text-slate-500 hover:text-yellow-600"}
                                        title={group.pinned ? "Unpin group" : "Pin group"}
                                    >
                                        <Pin size={16} fill={group.pinned ? "currentColor" : "none"} />
                                    </button>
                                )}
                                {canModifyGroup(group) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGroup(group._id);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Delete Group
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                {selectedGroup ? (
                    <>
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{selectedGroup.name}</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Created by {selectedGroup.createdBy?.firstName} {selectedGroup.createdBy?.lastName} (@{selectedGroup.createdBy?.username})
                                </p>
                                <p className="text-slate-500 mt-1">{selectedGroup.description || selectedGroup.course?.title}</p>
                            </div>
                            {!isMember(selectedGroup) && user?.role !== "admin" && (
                                <button onClick={() => handleJoinGroup(selectedGroup._id)} className="btn">
                                    Join Group
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <UsersRound className="mx-auto text-slate-300" size={48} />
                                    <p className="text-slate-500 mt-4">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg._id} className={`flex gap-3 ${String(msg.user?._id || msg.user) === String(user?._id) ? "justify-end" : ""}`}>
                                        <div className={`flex gap-3 ${String(msg.user?._id || msg.user) === String(user?._id) ? "flex-row-reverse" : ""}`}>
                                            {msg.user?.profilePictureUrl ? (
                                                <img src={msg.user.profilePictureUrl} alt={msg.user?.username} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
                                                    {msg.user?.username?.[0]?.toUpperCase() || "U"}
                                                </div>
                                            )}
                                            <div className={`max-w-xs lg:max-w-md ${String(msg.user?._id || msg.user) === String(user?._id) ? "text-right" : ""}`}>
                                                <div className="text-sm font-semibold text-slate-700">{msg.user?.username}</div>
                                                <div className={`mt-1 rounded-2xl p-4 ${String(msg.user?._id || msg.user) === String(user?._id) ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                                                    {msg.videoUrl && (
                                                        <div className="mb-2">
                                                            <video src={msg.videoUrl} controls className="w-full rounded-lg" />
                                                        </div>
                                                    )}
                                                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {(isMember(selectedGroup) || user?.role === "admin") && (
                            <div className="p-6 border-t border-slate-200 space-y-3">
                                {isMember(selectedGroup) && (
                                    <>
                                    <input
                                        type="text"
                                        placeholder="Video URL (optional)"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="input"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                            className="input flex-1"
                                        />
                                        <button onClick={handleSendMessage} className="btn px-6 flex items-center gap-2">
                                            <Send size={18} />
                                            Send
                                        </button>
                                    </div>
                                </>
                                )}
                                {user?.role === "admin" && !isMember(selectedGroup) && (
                                    <p className="text-sm text-slate-500">Admin view only - join the group to send messages</p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div>
                            <UsersRound className="mx-auto text-slate-300" size={64} />
                            <p className="text-slate-500 mt-4 text-lg">Select a study group to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
