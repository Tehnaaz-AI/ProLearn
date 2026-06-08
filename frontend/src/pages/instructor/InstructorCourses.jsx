import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { Info } from "../../components/ui/Info";
import { Stars } from "../../components/ui/Stars";
import { isPaid } from "../../utils/helpers";
import { Loader2, Edit2, Trash2, Video, CheckCircle2 } from "lucide-react";

export function InstructorCourses({ api, flash, setRoute }) {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [editingLesson, setEditingLesson] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState({ course: null, lesson: null });
    const [loading, setLoading] = useState(true);
    
    const load = () => {
        setLoading(true);
        return api("/instructor/courses/details")
            .then((data) => setCourses(data.courses || []))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    async function saveLesson(event) {
        event.preventDefault();
        if (!editingLesson) return;
        
        setIsSaving(true);
        try {
            let videoUrl = editingLesson.videoUrl;
            if (editingLesson.videoFile) {
                const formData = new FormData();
                formData.append("video", editingLesson.videoFile);
                const uploadRes = await api("/courses/upload-video", { method: "POST", body: formData });
                videoUrl = uploadRes.videoUrl;
            }

            const updatedLessons = [...(selectedCourse.lessons || [])];
            updatedLessons[editingLesson.index] = {
                title: editingLesson.title,
                content: editingLesson.content,
                videoUrl
            };

            await api(`/courses/${selectedCourseId}`, {
                method: "PUT",
                body: JSON.stringify({ lessons: updatedLessons })
            });

            flash("Lesson saved successfully!");
            setEditingLesson(null);
            await load();
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteCourse(courseId) {
        if (!window.confirm("Are you sure you want to delete this course permanently?")) return;
        
        setIsDeleting({ course: courseId, lesson: null });
        try {
            await api(`/courses/${courseId}`, { method: "DELETE" });
            flash("Course deleted permanently.");
            if (selectedCourseId === courseId) {
                setSelectedCourseId("");
                setEditingLesson(null);
            }
            await load();
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsDeleting({ course: null, lesson: null });
        }
    }

    async function deleteLesson(courseId, lessonIdx) {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        
        setIsDeleting({ course: courseId, lesson: lessonIdx });
        try {
            await api(`/courses/${courseId}/lessons/${lessonIdx}`, { method: "DELETE" });
            flash("Lesson deleted.");
            if (selectedCourseId === courseId && editingLesson?.index === lessonIdx) {
                setEditingLesson(null);
            }
            await load();
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsDeleting({ course: null, lesson: null });
        }
    }

    function startEditLesson(lesson, index) {
        setEditingLesson({
            ...lesson,
            index,
            videoFile: null
        });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-7xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        Instructor Panel
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Manage Your Courses
                    </h1>
                </div>
            </div>

            {editingLesson ? (
                <Panel title={`Edit Lesson ${editingLesson.index + 1}`}>
                    <form onSubmit={saveLesson} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Lesson Title</label>
                            <input 
                                className="input" 
                                value={editingLesson.title}
                                onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Lesson Description</label>
                            <textarea 
                                className="input min-h-32" 
                                value={editingLesson.content}
                                onChange={(e) => setEditingLesson({...editingLesson, content: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">Video URL (optional)</label>
                                <input 
                                    className="input" 
                                    value={editingLesson.videoUrl}
                                    onChange={(e) => setEditingLesson({...editingLesson, videoUrl: e.target.value})}
                                    placeholder="https://example.com/video.mp4"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">Upload New Video (optional)</label>
                                <input 
                                    className="input" 
                                    type="file" 
                                    accept="video/*"
                                    onChange={(e) => setEditingLesson({...editingLesson, videoFile: e.target.files?.[0] || null})}
                                />
                                {editingLesson.videoFile && (
                                    <p className="text-sm text-teal-700 mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={16} />
                                        {editingLesson.videoFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="submit" 
                                className="btn flex items-center justify-center gap-2"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Saving Lesson...
                                    </>
                                ) : "Save Lesson"}
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setEditingLesson(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Panel>
            ) : (
                <Panel title="Published Courses and Performance">
                    <List items={courses} empty="No published courses yet." render={(course) => (
                        <div className="space-y-3">
                            <div className="flex flex-col justify-between gap-3 md:flex-row">
                                <div>
                                    <strong className="text-xl">{course.title}</strong>
                                    <p className="text-sm text-slate-600">{course.category} | {isPaid(course) ? `INR ${course.price}` : "Free"}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => setSelectedCourseId(selectedCourseId === course.id ? "" : course.id)}
                                    >
                                        {selectedCourseId === course.id ? "Hide Details" : "Manage Lessons"}
                                    </button>
                                    <button 
                                        className="btn-danger flex items-center gap-1" 
                                        onClick={() => deleteCourse(course.id)}
                                        disabled={isDeleting.course === course.id}
                                    >
                                        {isDeleting.course === course.id ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Delete Course
                                            </>
                                        )}
                                    </button>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <Info label="Students" value={course.enrollment_count || 0} />
                                        <Info label="Reviews" value={course.reviews?.length || 0} />
                                        <Info label="Doubts" value={course.doubts?.length || 0} />
                                    </div>
                                </div>
                            </div>
                            
                            {selectedCourseId === course.id && (
                                <div className="mt-4 space-y-4">
                                    <Panel title="Lessons">
                                        <div className="mb-4">
                                            {!editingLesson?.isNew ? (
                                                <button 
                                                    type="button" 
                                                    className="btn flex items-center justify-center gap-2 w-full"
                                                    onClick={() => {
                                                        setEditingLesson({
                                                            title: "",
                                                            content: "",
                                                            videoUrl: "",
                                                            videoFile: null,
                                                            index: course.lessons?.length || 0,
                                                            isNew: true
                                                        });
                                                    }}
                                                >
                                                    <Edit2 size={20} />
                                                    Add New Lesson
                                                </button>
                                            ) : (
                                                <form onSubmit={async (event) => {
                                                    event.preventDefault();
                                                    if (!editingLesson.title.trim()) {
                                                        flash("Lesson title is required!", "error");
                                                        return;
                                                    }
                                                    
                                                    setIsSaving(true);
                                                    try {
                                                        let videoUrl = editingLesson.videoUrl;
                                                        if (editingLesson.videoFile) {
                                                            const formData = new FormData();
                                                            formData.append("video", editingLesson.videoFile);
                                                            const uploadRes = await api("/courses/upload-video", { 
                                                                method: "POST", 
                                                                body: formData 
                                                            });
                                                            videoUrl = uploadRes.videoUrl;
                                                        }

                                                        const updatedLessons = [...(course.lessons || []), {
                                                            title: editingLesson.title,
                                                            content: editingLesson.content,
                                                            videoUrl
                                                        }];

                                                        await api(`/courses/${course.id}`, {
                                                            method: "PUT",
                                                            body: JSON.stringify({ lessons: updatedLessons })
                                                        });

                                                        flash("New lesson added successfully!");
                                                        setEditingLesson(null);
                                                        await load();
                                                    } catch (err) {
                                                        flash(err.message, "error");
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }} className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                                            Lesson Title <span className="text-red-600 font-bold">*</span>
                                                        </label>
                                                        <input 
                                                            className="input" 
                                                            placeholder="Enter lesson title"
                                                            value={editingLesson.title}
                                                            onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold text-slate-700 mb-1 block">Lesson Description</label>
                                                        <textarea 
                                                            className="input min-h-32" 
                                                            placeholder="Enter lesson description"
                                                            value={editingLesson.content}
                                                            onChange={(e) => setEditingLesson({...editingLesson, content: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div>
                                                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Video URL (optional)</label>
                                                            <input 
                                                                className="input" 
                                                                value={editingLesson.videoUrl}
                                                                onChange={(e) => setEditingLesson({...editingLesson, videoUrl: e.target.value})}
                                                                placeholder="https://example.com/video.mp4"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Upload Video (optional)</label>
                                                            <input 
                                                                className="input" 
                                                                type="file" 
                                                                accept="video/*"
                                                                onChange={(e) => setEditingLesson({...editingLesson, videoFile: e.target.files?.[0] || null})}
                                                            />
                                                            {editingLesson.videoFile && (
                                                                <p className="text-sm text-teal-700 mt-1 flex items-center gap-1">
                                                                    <CheckCircle2 size={16} />
                                                                    {editingLesson.videoFile.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            type="submit" 
                                                            className="btn flex items-center justify-center gap-2"
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? (
                                                                <>
                                                                    <Loader2 className="animate-spin" size={20} />
                                                                    Adding Lesson...
                                                                </>
                                                            ) : "Add Lesson"}
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="btn-secondary"
                                                            onClick={() => setEditingLesson(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                        <List items={course.lessons || []} empty="No lessons yet. Click 'Add New Lesson' to get started!" render={(lesson, idx) => (
                                            <div className="flex justify-between items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <Video size={16} className="text-teal-700" />
                                                        Lesson {idx + 1}: {lesson.title}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1">{lesson.content}</p>
                                                    {lesson.videoUrl && (
                                                        <p className="text-sm text-teal-700 mt-1 flex items-center gap-1">
                                                            <CheckCircle2 size={14} />
                                                            Video attached
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="btn-secondary text-sm flex items-center gap-1" 
                                                        onClick={() => startEditLesson(lesson, idx)}
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn-danger text-sm flex items-center gap-1" 
                                                        onClick={() => deleteLesson(course.id, idx)}
                                                        disabled={isDeleting.course === course.id && isDeleting.lesson === idx}
                                                    >
                                                        {isDeleting.course === course.id && isDeleting.lesson === idx ? (
                                                            <Loader2 className="animate-spin" size={16} />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )} />
                                    </Panel>
                                    
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <Panel title="Recent Reviews">
                                            <List items={course.reviews || []} empty="No reviews yet." render={(review) => (
                                                <div><Stars count={review.stars} /><p>{review.comment}</p><small className="text-slate-500">{review.username}</small></div>
                                            )} />
                                        </Panel>
                                        <Panel title="Doubts">
                                            <List items={course.doubts || []} empty="No doubts yet." render={(doubt) => (
                                                <div><p>{doubt.question}</p><small className="text-slate-500">{doubt.answer ? `Answered: ${doubt.answer}` : "Pending"}</small></div>
                                            )} />
                                        </Panel>
                                    </div>
                                </div>
                            )}
                        </div>
                    )} />
                </Panel>
            )}
        </div>
    );
}
