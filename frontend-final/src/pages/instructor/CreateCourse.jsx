import { useState } from "react";
import { Panel } from "../../components/common/Panel";
import { SmartForm } from "../../components/forms/SmartForm";
import { Loader2, Plus, Trash2, Video, CheckCircle2 } from "lucide-react";

export function CreateCourse({ api, flash, loadCourses, setRoute }) {
    const [courseData, setCourseData] = useState({
        title: "",
        category: "General",
        level: "Beginner",
        price: 0,
        description: ""
    });
    const [lessons, setLessons] = useState([
        { title: "", content: "", videoFile: null, videoUrl: "" }
    ]);
    const [quizQuestions, setQuizQuestions] = useState([
        { question: "", options: ["", ""], answer: 0 }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function addLesson() {
        setLessons([...lessons, { title: "", content: "", videoFile: null, videoUrl: "" }]);
    }

    function removeLesson(index) {
        if (lessons.length > 1) {
            setLessons(lessons.filter((_, i) => i !== index));
        }
    }

    function updateLesson(index, field, value) {
        const newLessons = [...lessons];
        newLessons[index][field] = value;
        setLessons(newLessons);
    }

    function addQuizQuestion() {
        setQuizQuestions([...quizQuestions, { question: "", options: ["", ""], answer: 0 }]);
    }

    function removeQuizQuestion(index) {
        if (quizQuestions.length > 1) {
            setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
        }
    }

    function updateQuizQuestion(index, field, value) {
        const newQuestions = [...quizQuestions];
        newQuestions[index][field] = value;
        setQuizQuestions(newQuestions);
    }

    function updateQuizOption(questionIndex, optionIndex, value) {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setQuizQuestions(newQuestions);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        
        try {
            if (!courseData.title || !courseData.description) {
                flash("Course title and description are required.", "error");
                return;
            }

            const validLessons = lessons.filter(l => l.title.trim());
            if (validLessons.length === 0) {
                flash("At least one lesson with a title is required.", "error");
                return;
            }

            const uploadedLessons = [];
            for (const lesson of validLessons) {
                let videoUrl = lesson.videoUrl;
                if (lesson.videoFile) {
                    const formData = new FormData();
                    formData.append("video", lesson.videoFile);
                    try {
                        const uploadRes = await api("/courses/upload-video", { 
                            method: "POST", 
                            body: formData 
                        });
                        videoUrl = uploadRes.videoUrl;
                    } catch (uploadErr) {
                    }
                }
                uploadedLessons.push({
                    title: lesson.title,
                    content: lesson.content,
                    videoUrl
                });
            }

            const validQuiz = quizQuestions.filter(q => q.question.trim());
            const body = {
                ...courseData,
                price: Number(courseData.price || 0),
                is_paid: Number(courseData.price || 0) > 0,
                lessons: uploadedLessons,
                quiz: validQuiz
            };

            await api("/courses", { 
                method: "POST", 
                body: JSON.stringify(body) 
            });
            
            await loadCourses();
            flash("Course created and published successfully!");
            setRoute("instructor-courses");
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-5xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <Plus className="w-3.5 h-3.5" /> Course Creator
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Publish Your Course
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed">
                        Design your curriculum, upload videos, and create quizzes to share your knowledge with students worldwide.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Panel title="Course Details">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                Course Title <span className="text-red-600 font-bold">*</span>
                            </label>
                            <input 
                                className="input" 
                                value={courseData.title} 
                                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">Category</label>
                                <input 
                                    className="input" 
                                    value={courseData.category} 
                                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">Level</label>
                                <select 
                                    className="input" 
                                    value={courseData.level} 
                                    onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">Price (INR)</label>
                                <input 
                                    className="input" 
                                    type="number" 
                                    value={courseData.price} 
                                    onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                Course Description <span className="text-red-600 font-bold">*</span>
                            </label>
                            <textarea 
                                className="input min-h-32" 
                                value={courseData.description} 
                                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </Panel>

                <Panel title="Lessons">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {lessons.map((lesson, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Video size={18} className="text-teal-700" />
                                        Lesson {idx + 1}
                                    </h3>
                                    <button 
                                        type="button" 
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => removeLesson(idx)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1 block">Lesson Title</label>
                                        <input 
                                            className="input" 
                                            placeholder="Enter lesson title"
                                            value={lesson.title}
                                            onChange={(e) => updateLesson(idx, "title", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1 block">Lesson Description</label>
                                        <textarea 
                                            className="input min-h-24" 
                                            placeholder="Enter lesson description"
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(idx, "content", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Video URL (optional)</label>
                                            <input 
                                                className="input" 
                                                placeholder="https://example.com/video.mp4"
                                                value={lesson.videoUrl}
                                                onChange={(e) => updateLesson(idx, "videoUrl", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-1 block">Upload Video (optional)</label>
                                            <input 
                                                className="input" 
                                                type="file" 
                                                accept="video/*"
                                                onChange={(e) => updateLesson(idx, "videoFile", e.target.files?.[0] || null)}
                                            />
                                            {lesson.videoFile && (
                                                <p className="text-sm text-teal-700 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 size={16} />
                                                    {lesson.videoFile.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="btn-secondary flex items-center justify-center gap-2 w-full"
                            onClick={addLesson}
                        >
                            <Plus size={20} />
                            Add Lesson
                        </button>
                    </div>
                </Panel>

                <Panel title="Quiz">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {quizQuestions.map((q, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-lg">Question {idx + 1}</h3>
                                    <button 
                                        type="button" 
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => removeQuizQuestion(idx)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1 block">Question</label>
                                        <input 
                                            className="input" 
                                            placeholder="Enter question"
                                            value={q.question}
                                            onChange={(e) => updateQuizQuestion(idx, "question", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1 block">Options</label>
                                        <div className="space-y-2">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name={`answer-${idx}`}
                                                        checked={q.answer === optIdx}
                                                        onChange={() => updateQuizQuestion(idx, "answer", optIdx)}
                                                    />
                                                    <input 
                                                        className="input flex-1" 
                                                        placeholder={`Option ${optIdx + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updateQuizOption(idx, optIdx, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="btn-secondary flex items-center justify-center gap-2 w-full"
                            onClick={addQuizQuestion}
                        >
                            <Plus size={20} />
                            Add Question
                        </button>
                    </div>
                </Panel>

                <button 
                    type="submit" 
                    className="btn w-full flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Publishing Course...
                        </>
                    ) : (
                        "Publish Course"
                    )}
                </button>
            </form>
        </div>
    );
}
