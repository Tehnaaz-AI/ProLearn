import React, { useEffect, useState } from "react";
import { ShieldCheck, Video, CheckCircle2, Bookmark, StickyNote, Plus, Trash2, Edit2 } from "lucide-react";
import { Panel } from "../components/common/Panel";
import { Detail } from "../components/ui/Detail";
import { List } from "../components/ui/List";
import { Stars } from "../components/ui/Stars";
import { SmartForm } from "../components/forms/SmartForm";
import { PaymentPanel } from "../components/course/PaymentPanel";
import { isPaid } from "../utils/helpers";

export function CourseDetailPage({ course, user, api, flash, refresh, setRoute }) {
    const isInstructor = user && (
        String(course.instructor_id) === String(user.id) ||
        String(course.instructorId) === String(user.id) ||
        String(course.instructor) === String(user.id)
    );
    const isAdmin = user && user.role === "admin";
    const locked = Boolean(course.locked) && !isInstructor && !isAdmin;
    const [payment, setPayment] = useState(course.payment || null);
    const [progress, setProgress] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [editingNote, setEditingNote] = useState(null);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const [videoTimestamp, setVideoTimestamp] = useState(0);
    const videoRef = React.useRef(null);
    
    const allLessonsWatched = progress?.allLessonsWatched;
    const hasAttemptedQuiz = quizAttempts.length > 0;
    
    async function loadCertificate() {
        if (!user || (!isInstructor && !isAdmin && !course.isEnrolled)) return;
        try {
            const data = await api(`/courses/${course.id}/certificate`);
            setCertificate(data.certificate);
        } catch (err) {
            // No certificate yet is okay
        }
    }
    
    async function loadQuizAttempts() {
        if (!user || (!isInstructor && !isAdmin && !course.isEnrolled)) return;
        try {
            const data = await api(`/courses/${course.id}/quiz/attempts`);
            setQuizAttempts(data.attempts || []);
        } catch (err) {
            // No attempts yet is okay
        }
    }

    async function loadBookmarks() {
        if (!user) return;
        try {
            const data = await api("/bookmarks");
            setBookmarks(data.bookmarks || []);
        } catch (err) {
            // No bookmarks yet is okay
        }
    }

    async function loadNotes() {
        if (!user) return;
        try {
            const data = await api(`/notes?courseId=${course.id}`);
            setNotes(data.notes || []);
        } catch (err) {
            // No notes yet is okay
        }
    }

    useEffect(() => {
        setPayment(course.payment || null);
    }, [course.payment]);

    useEffect(() => {
        async function loadProgress() {
            if (!user || (!isInstructor && !isAdmin && !course.isEnrolled)) return;
            try {
                const data = await api(`/courses/${course.id}/progress`);
                setProgress(data.progress);
            } catch (err) {
                // No progress yet is okay
            }
        }
        loadProgress();
        loadCertificate();
        loadQuizAttempts();
        loadBookmarks();
        loadNotes();
    }, [course.id, user, isInstructor, isAdmin, course.isEnrolled]);

    async function markLessonWatched(lessonIndex) {
        try {
            await api(`/courses/${course.id}/progress/watch-lesson`, { 
                method: "POST", 
                body: JSON.stringify({ lessonIndex }) 
            });
            const data = await api(`/courses/${course.id}/progress`);
            setProgress(data.progress);
            flash("Lesson marked as watched!");
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function toggleBookmark(lessonIndex) {
        try {
            await api("/bookmarks", {
                method: "POST",
                body: JSON.stringify({ course: course.id, lessonIndex }),
            });
            loadBookmarks();
            flash("Bookmark toggled!");
        } catch (err) {
            flash(err.message, "error");
        }
    }

    function isBookmarked(lessonIndex) {
        return bookmarks.some(b => b.course?._id === course.id || b.course === course.id && b.lessonIndex === lessonIndex);
    }

    async function addNote() {
        try {
            await api("/notes", {
                method: "POST",
                body: JSON.stringify({ course: course.id, lessonIndex: activeLessonIndex, timestamp: videoTimestamp, content: newNoteContent }),
            });
            setNewNoteContent("");
            loadNotes();
            flash("Note added!");
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function updateNote(noteId) {
        try {
            await api(`/notes/${noteId}`, {
                method: "PUT",
                body: JSON.stringify({ content: newNoteContent, timestamp: videoTimestamp }),
            });
            setEditingNote(null);
            setNewNoteContent("");
            loadNotes();
            flash("Note updated!");
        } catch (err) {
            flash(err.message, "error");
        }
    }

    function handleTimeUpdate() {
        if (videoRef.current) {
            setVideoTimestamp(videoRef.current.currentTime);
        }
    }

    function jumpToTimestamp(timestamp) {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
        }
    }

    async function deleteNote(noteId) {
        try {
            await api(`/notes/${noteId}`, {
                method: "DELETE",
            });
            loadNotes();
            flash("Note deleted!");
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function enroll() {
        try {
            let payment_id = null;
            if (isPaid(course)) {
                const paymentData = await api(`/courses/${course.id}/payments/create`, { method: "POST", body: "{}" });
                setPayment(paymentData);
                const provider = await collectPayment(paymentData, course, user);
                await api(`/payments/${paymentData.payment_id}/verify`, { method: "POST", body: JSON.stringify(provider) });
                payment_id = paymentData.payment_id;
                flash(`Payment completed.`);
            }
            await api(`/courses/${course.id}/enroll`, { method: "POST", body: JSON.stringify({ payment_id }) });
            flash("Enrollment complete. Course content unlocked.");
            refresh();
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function submitReview(payload) {
        if (isInstructor) {
            flash("Instructors cannot review their own courses.", "error");
            return;
        }
        await api(`/courses/${course.id}/reviews`, { method: "POST", body: JSON.stringify(payload) });
        flash("Review saved.");
        refresh();
    }

    async function postDoubt(payload) {
        if (isInstructor) {
            flash("Instructors cannot post doubts on their own courses.", "error");
            return;
        }
        await api(`/courses/${course.id}/doubts`, { method: "POST", body: JSON.stringify(payload) });
        flash("Doubt posted to the instructor.");
        refresh();
    }

    return (
        <div className="space-y-6">
            <section className="panel overflow-hidden">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div>
                        <span className={isPaid(course) ? "tag-amber" : "tag-teal"}>{isPaid(course) ? `Paid INR ${course.price}` : "Free"}</span>
                        <h2 className="mt-4 text-4xl font-black">{course.title}</h2>
                        <p className="mt-3 text-slate-600">{course.description || "Course details not available."}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            {!isInstructor && !isAdmin && (
                                <button 
                                    className="btn" 
                                    onClick={locked ? enroll : undefined}
                                    disabled={!locked}
                                >
                                    {locked ? "Enroll to unlock" : certificate ? "Course Completed" : "Enrolled"}
                                </button>
                            )}
                            {!locked && !isInstructor && !isAdmin && (
                                <>
                                    {!certificate && !hasAttemptedQuiz && (
                                        <button 
                                            className={`btn-secondary ${!allLessonsWatched ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={() => allLessonsWatched && setRoute(`quiz/${course.id}`)}
                                            disabled={!allLessonsWatched}
                                        >
                                            Take Quiz {!allLessonsWatched && "(complete all lessons first)"}
                                        </button>
                                    )}
                                    {!certificate && hasAttemptedQuiz && (
                                        <button className="btn-secondary" onClick={() => setRoute(`quiz/${course.id}`)}>
                                            Take Quiz Again
                                        </button>
                                    )}
                                    {certificate && (
                                        <button className="btn-secondary" onClick={() => setRoute(`quiz/${course.id}`)}>
                                            Take Quiz Again
                                        </button>
                                    )}
                                    {certificate && (
                                        <button className="btn" onClick={() => setRoute(`certificate/${course.id}`)}>View Certificate</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 text-white">
                        <div className="text-sm text-slate-300">Course access</div>
                        <div className="mt-2 text-2xl font-black">{locked ? "Locked preview" : "Unlocked"}</div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">Lessons, videos, quizzes, and doubts are available after enrollment. Course owners can always access their own content.</p>
                    </div>
                </div>
            </section>
            <section className="panel">
                <h2 className="section-title">About the instructor</h2>
                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                    <div className="flex items-start gap-4">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-lg font-black text-white shadow-lg shadow-teal-700/20">
                            {course.instructor_name?.charAt(0).toUpperCase() || "I"}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black">{typeof course.instructor_name === 'string' ? course.instructor_name : "Unknown Instructor"}</h3>
                            {typeof course.instructor_email === 'string' && course.instructor_email.trim() && <p className="text-sm text-slate-600 mt-1">{course.instructor_email}</p>}
                            {typeof course.instructor_bio === 'string' && course.instructor_bio.trim() && <p className="mt-3 text-slate-700 leading-6">{course.instructor_bio}</p>}
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {typeof course.instructor_education === 'string' && course.instructor_education.trim() && (
                            <div className="rounded-lg bg-white p-4 border border-slate-200">
                                <p className="font-semibold text-slate-700">Education</p>
                                <p className="mt-1 text-slate-600 text-sm">{course.instructor_education}</p>
                            </div>
                        )}
                        {typeof course.instructor_qualifications === 'string' && course.instructor_qualifications.trim() && (
                            <div className="rounded-lg bg-white p-4 border border-slate-200">
                                <p className="font-semibold text-slate-700">Qualifications</p>
                                <p className="mt-1 text-slate-600 text-sm">{course.instructor_qualifications}</p>
                            </div>
                        )}
                        {typeof course.instructor_experience === 'string' && course.instructor_experience.trim() && (
                            <div className="rounded-lg bg-white p-4 border border-slate-200 md:col-span-2">
                                <p className="font-semibold text-slate-700">Experience</p>
                                <p className="mt-1 text-slate-600 text-sm">{course.instructor_experience}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {locked ? (
                <section className="panel text-center">
                    <ShieldCheck className="mx-auto text-teal-700" size={42} />
                    <h3 className="mt-3 text-2xl font-black">Enroll before opening course content</h3>
                    <p className="mx-auto mt-2 max-w-2xl text-slate-600">Students can preview this page, but lessons, quizzes, videos, and doubts stay protected until enrollment and payment verification for paid courses.</p>
                </section>
            ) : (
                <>
                    {payment && <PaymentPanel payment={payment} />}
                    <section className="grid gap-5 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-5">
                            <Panel title="Lessons">
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {course.lessons.map((lesson, index) => {
                                        const isWatched = progress?.watchedLessons?.includes(index);
                                        return (
                                            <div 
                                                key={index}
                                                onClick={() => setActiveLessonIndex(index)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all border ${activeLessonIndex === index ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {isWatched ? <CheckCircle2 className="text-teal-600" size={17} /> : <Video size={17} className="text-slate-500" />}
                                                        <span className="font-bold">{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(index);
                                                            }}
                                                            className={`p-1 rounded ${isBookmarked(index) ? 'text-yellow-500' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            <Bookmark size={18} fill={isBookmarked(index) ? 'currentColor' : 'none'} />
                                                        </button>
                                                        {!isWatched && !isInstructor && !isAdmin && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markLessonWatched(index);
                                                                }}
                                                                className="btn-secondary text-sm"
                                                            >
                                                                Mark as Watched
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {course.lessons.length === 0 && <p className="text-slate-500 text-center py-8">No lessons yet.</p>}
                                </div>
                            </Panel>

                            {course.lessons[activeLessonIndex] && (
                                <Panel title={`Lesson ${activeLessonIndex + 1}: ${course.lessons[activeLessonIndex].title}`}>
                                    {course.lessons[activeLessonIndex].videoUrl && (
                                        <video
                                            ref={videoRef}
                                            className="w-full rounded-2xl border border-slate-200 mb-4"
                                            controls
                                            controlsList="nodownload"
                                            preload="metadata"
                                            onTimeUpdate={handleTimeUpdate}
                                        >
                                            <source src={course.lessons[activeLessonIndex].videoUrl} type="video/mp4" />
                                            Your browser does not support video playback.
                                        </video>
                                    )}
                                    <p className="text-slate-700">{course.lessons[activeLessonIndex].content}</p>
                                </Panel>
                            )}
                        </div>

                        <div className="space-y-5">
                            <Panel title="Reviews">
                                <List items={course.reviews} empty="No reviews yet." render={(review) => (
                                    <div><Stars count={review.stars} /><p className="mt-1">{review.comment}</p><small className="text-slate-500">{review.username}</small></div>
                                )} />
                            </Panel>

                            <Panel title="My Notes">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a note..."
                                            value={newNoteContent}
                                            onChange={(e) => setNewNoteContent(e.target.value)}
                                            className="input flex-1"
                                        />
                                        {course.lessons[activeLessonIndex].videoUrl && (
                                            <button
                                                onClick={() => flash(`Timestamp saved: ${Math.floor(videoTimestamp / 60)}:${String(Math.floor(videoTimestamp % 60)).padStart(2, '0')}`)}
                                                className="btn-secondary px-3 py-2 text-sm"
                                                title="Save current video timestamp"
                                            >
                                                🕒
                                            </button>
                                        )}
                                        <button
                                            onClick={editingNote ? () => updateNote(editingNote._id) : addNote}
                                            className="btn px-3 py-2 text-sm"
                                        >
                                            {editingNote ? "Save" : <Plus size={16} />}
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {notes.filter(n => n.lessonIndex === activeLessonIndex).map((note) => (
                                            <div key={note._id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                {editingNote?._id === note._id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={newNoteContent}
                                                            onChange={(e) => setNewNoteContent(e.target.value)}
                                                            className="input min-h-20"
                                                            placeholder="Edit your note..."
                                                        />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => updateNote(note._id)} className="btn text-sm">Save</button>
                                                            <button onClick={() => { setEditingNote(null); setNewNoteContent(""); }} className="btn-secondary text-sm">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            {note.timestamp > 0 && course.lessons[activeLessonIndex].videoUrl && (
                                                                <button
                                                                    onClick={() => jumpToTimestamp(note.timestamp)}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-200 transition"
                                                                >
                                                                    <Video size={12} />
                                                                    {Math.floor(note.timestamp / 60)}:{String(Math.floor(note.timestamp % 60)).padStart(2, '0')}
                                                                </button>
                                                            )}
                                                            <div className="text-xs text-slate-400">
                                                                {new Date(note.createdAt || note.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-700">{note.content}</p>
                                                        <div className="flex gap-2 mt-3">
                                                            <button
                                                                onClick={() => { setEditingNote(note); setNewNoteContent(note.content); }}
                                                                className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm"
                                                            >
                                                                <Edit2 size={14} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteNote(note._id)}
                                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {notes.filter(n => n.lessonIndex === activeLessonIndex).length === 0 && (
                                            <div className="text-center py-8">
                                                <StickyNote className="mx-auto text-slate-300" size={40} />
                                                <p className="text-slate-500 mt-3">No notes for this lesson yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </section>
                    {!isInstructor && (
                        <section className="grid gap-5 lg:grid-cols-2">
                            <SmartForm title="Give review" button="Save review" fields={[["stars", "Stars 1-5", "number"], ["comment", "Comment"]]} defaults={{ stars: 5 }} onSubmit={submitReview} />
                            <SmartForm title="Post doubt" button="Send doubt" fields={[["question", "Ask a question", "textarea"]]} onSubmit={postDoubt} />
                        </section>
                    )}
                    <Panel title="Doubts and answers">
                        <List items={course.doubts} empty="No doubts yet." render={(doubt) => (
                            <div><strong>{doubt.username}</strong><p>{doubt.question}</p><small className="text-slate-500">{doubt.answer ? `Answer: ${doubt.answer}` : "Waiting for instructor"}</small></div>
                        )} />
                    </Panel>
                </>
            )}
        </div>
    );
}

async function collectPayment(payment, course, user) {
    if (!payment.razorpay_key_id) return { provider_payment_id: "demo-payment" };
    await loadRazorpay();
    return new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
            key: payment.razorpay_key_id,
            amount: Math.round(Number(payment.amount) * 100),
            currency: payment.currency || "INR",
            name: "ProLearn",
            description: course.title,
            order_id: payment.order_id,
            prefill: { name: user?.username, email: user?.email },
            handler: (response) => resolve({
                provider_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
            }),
            modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
        });
        checkout.open();
    });
}

function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
        document.body.appendChild(script);
    });
}
