import { useEffect, useState } from "react";
import { isPaid } from "../../utils/helpers";
import { Loader2, Trash2, BookOpen, Clock, FileText } from "lucide-react";

export function AdminCourses({ api, flash, openCourse }) {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [isDeleting, setIsDeleting] = useState({ course: null, lesson: null });
    const [loading, setLoading] = useState(true);
    
    const load = () => {
        setLoading(true);
        return api("/admin/courses")
            .then((data) => setCourses(data.courses || []))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);

    async function deleteCourse(courseId) {
        const reason = window.prompt("Please enter a reason for deleting this course:");
        if (!reason) return;
        
        setIsDeleting({ course: courseId, lesson: null });
        try {
            await api(`/courses/${courseId}`, { 
                method: "DELETE", 
                body: JSON.stringify({ reason }) 
            });
            flash("Course deleted.");
            if (selectedCourseId === courseId) setSelectedCourseId("");
            await load();
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsDeleting({ course: null, lesson: null });
        }
    }

    async function deleteLesson(courseId, lessonIdx) {
        const reason = window.prompt("Please enter a reason for deleting this lesson:");
        if (!reason) return;
        
        setIsDeleting({ course: courseId, lesson: lessonIdx });
        try {
            await api(`/courses/${courseId}/lessons/${lessonIdx}`, { 
                method: "DELETE", 
                body: JSON.stringify({ reason }) 
            });
            flash("Lesson deleted.");
            await load();
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsDeleting({ course: null, lesson: null });
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading courses...</p>
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
                            Course Management
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course.id} className="group flex flex-col rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-300 transition-all duration-300 overflow-hidden">
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${isPaid(course) ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                    {isPaid(course) ? `INR ${course.price}` : "Free"}
                                </span>
                                <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600">
                                    {course.category}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                {course.title}
                            </h3>
                            
                            <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">
                                {course.description || "No description provided."}
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructor Details</div>
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-700 font-bold">
                                        {(course.instructor_name || "I").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-slate-900 truncate">{course.instructor_name || "Unknown Instructor"}</div>
                                        <div className="text-xs text-slate-500 truncate">{course.instructor_email || "No email available"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 mb-6">
                                <div className="flex items-center gap-1.5" title="Lessons">
                                    <FileText size={16} className="text-slate-400" />
                                    {course.lessons?.length || 0} Lessons
                                </div>
                                <div className="flex items-center gap-1.5" title="Created On">
                                    <Clock size={16} className="text-slate-400" />
                                    {new Date(course.created_at || course.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-sm" 
                                    onClick={() => setSelectedCourseId(selectedCourseId === course.id ? "" : course.id)}
                                >
                                    <FileText size={16} />
                                    {selectedCourseId === course.id ? "Hide Lessons" : "Lessons"}
                                </button>
                                <button 
                                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-sm" 
                                    onClick={() => openCourse(course.id)}
                                >
                                    <BookOpen size={16} />
                                    Open
                                </button>
                                <button 
                                    className="flex-1 btn-danger flex items-center justify-center gap-2 py-3 text-sm" 
                                    onClick={() => deleteCourse(course.id)}
                                    disabled={isDeleting.course === course.id}
                                >
                                    {isDeleting.course === course.id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                            
                            {selectedCourseId === course.id && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">Course Lessons</h4>
                                    {(!course.lessons || course.lessons.length === 0) && (
                                        <p className="text-sm text-slate-500 italic">No lessons available.</p>
                                    )}
                                    {course.lessons?.map((lesson, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm truncate">
                                                    Lesson {idx + 1}: {lesson.title}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lesson.content}</p>
                                            </div>
                                            <button 
                                                className="btn-danger p-2 h-auto" 
                                                onClick={() => deleteLesson(course.id, idx)}
                                                disabled={isDeleting.course === course.id && isDeleting.lesson === idx}
                                                title="Delete Lesson"
                                            >
                                                {isDeleting.course === course.id && isDeleting.lesson === idx ? (
                                                    <Loader2 className="animate-spin" size={14} />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                        <p className="text-slate-500">There are currently no courses on the platform.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
