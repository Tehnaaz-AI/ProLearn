
import { useEffect, useState } from "react";
import { MessageSquare, Plus, Send, EyeOff, Eye, Trash2, Pin, Heart, Reply, User } from "lucide-react";

export function ForumsPage({ user, api, courses, enrollments, flash, setRoute }) {
    const [posts, setPosts] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "", course: "" });
    const [replyingTo, setReplyingTo] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Filter courses to only enrolled ones
    const enrolledCourseIds = new Set(enrollments.map(e => e.course?.id || e.course));
    const availableCourses = courses.filter(c => enrolledCourseIds.has(c.id));

    async function loadPosts(courseId = "") {
        try {
            setLoading(true);
            const url = courseId ? `/forums/posts?courseId=${courseId}` : "/forums/posts";
            const data = await api(url);
            setPosts(data.posts || []);
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPosts(selectedCourse);
    }, [selectedCourse]);

    async function handleCreatePost(e) {
        e.preventDefault();
        try {
            await api("/forums/posts", {
                method: "POST",
                body: JSON.stringify(newPost),
            });
            flash("Post created successfully!", "success");
            setShowCreatePost(false);
            setNewPost({ title: "", content: "", course: "" });
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handleAddComment(postId) {
        try {
            await api(`/forums/posts/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content: newComment }),
            });
            flash("Comment added!", "success");
            setReplyingTo(null);
            setNewComment("");
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handleToggleStatus(postId, currentStatus) {
        try {
            await api(`/forums/posts/${postId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: currentStatus === "active" ? "hidden" : "active" }),
            });
            flash("Post status updated!", "success");
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handleDeletePost(postId) {
        try {
            await api(`/forums/posts/${postId}`, {
                method: "DELETE",
            });
            flash("Post deleted!", "success");
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }
    
    async function handleLikePost(postId) {
        try {
            await api(`/forums/posts/${postId}/like`, {
                method: "PUT",
            });
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function handlePinPost(postId) {
        try {
            await api(`/forums/posts/${postId}/pin`, {
                method: "PUT",
            });
            flash("Post pin status updated!", "success");
            loadPosts(selectedCourse);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    const canModifyPost = (post) => {
        if (!user) return false;
        if (user.role === "admin") return true;
        return String(post.user?._id || post.user) === String(user._id);
    };

    const canPinPost = (post) => {
        if (!user) return false;
        if (user.role === "admin") return true;
        const course = courses.find(c => c.id === post.course?._id || c.id === post.course);
        return course && String(course.instructor) === String(user._id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading forum posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-6xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                            <MessageSquare className="w-3.5 h-3.5" /> Community
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                            Forums
                        </h1>
                        <p className="text-slate-300 font-medium text-base max-w-xl leading-relaxed">
                            Discuss courses with other learners, ask questions, and share your knowledge.
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowCreatePost(!showCreatePost)}
                            className="btn flex items-center gap-2"
                        >
                            <Plus size={18} />
                            New Post
                        </button>
                    )}
                </div>
                <div className="pb-2">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCourse("")}
                            className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer active:scale-95 ${selectedCourse === "" ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-500 ring-offset-2" : "bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 shadow-sm"}`}
                        >
                            All Courses
                        </button>
                        {availableCourses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course.id)}
                                    className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer active:scale-95 ${selectedCourse === course.id ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-500 ring-offset-2" : "bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 shadow-sm"}`}
                                >
                                    {course.title}
                                </button>
                        ))}
                    </div>
                </div>
            </div>

            {showCreatePost && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Create a new post</h3>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Post title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="input"
                            required
                        />
                        <select
                            value={newPost.course}
                            onChange={(e) => setNewPost({ ...newPost, course: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="">Select a course</option>
                            {availableCourses.map((course) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Write your post..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="input h-40"
                            required
                        />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreatePost(false)} className="btn-secondary flex items-center justify-center">Cancel</button>
                            <button type="submit" className="btn flex items-center justify-center">Create Post</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <MessageSquare className="mx-auto text-slate-300" size={48} />
                        <p className="text-slate-500 mt-4">No posts yet. Be the first to start a discussion!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {post.user?.profilePictureUrl ? (
                                        <img src={post.user.profilePictureUrl} alt={post.user?.username} className="w-10 h-10 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                                            {post.user?.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-slate-900">{post.user?.firstName} {post.user?.lastName}</div>
                                        <div className="text-sm text-slate-500">@{post.user?.username} • {post.course?.title}</div>
                                    </div>
                                </div>
                                {canModifyPost(post) && (
                                    <div className="flex items-center gap-2">
                                        {canPinPost(post) && (
                                            <button
                                                onClick={() => handlePinPost(post._id)}
                                                className={post.pinned ? "text-yellow-500" : "text-slate-500 hover:text-yellow-600"}
                                                title={post.pinned ? "Unpin post" : "Pin post"}
                                            >
                                                <Pin size={20} fill={post.pinned ? "currentColor" : "none"} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleStatus(post._id, post.status)}
                                            className="text-slate-500 hover:text-slate-700"
                                            title={post.status === "active" ? "Hide post" : "Show post"}
                                        >
                                            {post.status === "active" ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete post"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mt-4">{post.title}</h3>
                            <p className="text-slate-700 mt-2 whitespace-pre-wrap">{post.content}</p>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => user && handleLikePost(post._id)}
                                        disabled={!user}
                                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                                            post.likes?.some(id => String(id) === String(user?._id)) 
                                                ? "text-red-500" 
                                                : "text-slate-600 hover:text-red-500"
                                        }`}
                                    >
                                        <Heart 
                                            size={20} 
                                            fill={post.likes?.some(id => String(id) === String(user?._id)) ? "currentColor" : "none"} 
                                        />
                                        {post.likes?.length || 0}
                                    </button>
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                                        className="flex items-center gap-2 text-sm text-teal-700 font-semibold hover:text-teal-800"
                                    >
                                        <Reply size={20} />
                                        {replyingTo === post._id ? "Cancel reply" : "Reply"} ({post.comments?.length || 0})
                                    </button>
                                </div>

                                {replyingTo === post._id && (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="input flex-1"
                                        />
                                        <button
                                            onClick={() => handleAddComment(post._id)}
                                            className="btn px-4"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                )}

                                {post.comments?.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        {post.comments.map((comment, idx) => (
                                            <div key={idx} className="flex gap-3 bg-slate-50 rounded-xl p-4">
                                                {comment.user?.profilePictureUrl ? (
                                                    <img src={comment.user.profilePictureUrl} alt={comment.user?.username} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-300 text-slate-700 flex items-center justify-center font-bold shrink-0">
                                                        {comment.user?.username?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{comment.user?.username}</div>
                                                    <div className="text-slate-700 text-sm mt-1">{comment.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
