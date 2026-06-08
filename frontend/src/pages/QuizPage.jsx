import { useState, useEffect } from "react";
import { Panel } from "../components/common/Panel";
import { Quiz } from "../components/ui/Quiz";

export function QuizPage({ course, user, api, flash, refresh, setRoute }) {
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [certificate, setCertificate] = useState(null);
    const [progress, setProgress] = useState(null);
    const isInstructor = user && (
        String(course.instructor_id) === String(user.id) ||
        String(course.instructorId) === String(user.id) ||
        String(course.instructor) === String(user.id)
    );
    const isAdmin = user && user.role === "admin";

    async function loadQuizAttempts() {
        try {
            const data = await api(`/courses/${course.id}/quiz/attempts`);
            setQuizAttempts(data.attempts || []);
        } catch (err) {
            // No attempts yet is okay
        }
    }

    async function loadCertificate() {
        try {
            const data = await api(`/courses/${course.id}/certificate`);
            setCertificate(data.certificate);
        } catch (err) {
            setCertificate(null);
        }
    }

    async function loadProgress() {
        try {
            const data = await api(`/courses/${course.id}/progress`);
            setProgress(data.progress);
        } catch (err) {
            // No progress yet is okay
        }
    }

    useEffect(() => {
        loadQuizAttempts();
        loadCertificate();
        loadProgress();
    }, [course.id]);

    async function refreshAttempts() {
        await loadQuizAttempts();
        await loadCertificate();
        refresh();
    }

    const allLessonsWatched = progress?.allLessonsWatched;
    
    if (!isInstructor && !isAdmin && !allLessonsWatched && !certificate) {
        return (
            <div className="space-y-6">
                <section className="panel overflow-hidden">
                    <div>
                        <span className="tag-teal">Quiz for {course.title}</span>
                        <h2 className="mt-4 text-4xl font-black">Course Quiz</h2>
                        <p className="mt-3 text-slate-600">Test your knowledge of this course's material!</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button className="btn-secondary" onClick={() => setRoute(`course/${course.id}`)}>Back to Course</button>
                        </div>
                    </div>
                </section>
                <Panel title="Complete All Lessons First">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                        <h3 className="text-xl font-bold text-amber-800">Quiz Unavailable</h3>
                        <p className="mt-2 text-amber-700">You must watch all lessons before attempting the quiz.</p>
                    </div>
                </Panel>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <section className="panel overflow-hidden">
                <div>
                    <span className="tag-teal">Quiz for {course.title}</span>
                    <h2 className="mt-4 text-4xl font-black">Course Quiz</h2>
                    <p className="mt-3 text-slate-600">Test your knowledge of this course's material!</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button className="btn-secondary" onClick={() => setRoute(`course/${course.id}`)}>Back to Course</button>
                        {certificate && <button className="btn" onClick={() => setRoute(`certificate/${course.id}`)}>View Certificate</button>}
                    </div>
                </div>
            </section>

            {isInstructor ? (
                <Panel title="Quiz Unavailable">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                        <h3 className="text-xl font-bold text-amber-800">Instructors Cannot Take Quiz</h3>
                        <p className="mt-2 text-amber-700">As the instructor of this course, you cannot take the quiz for your own published courses.</p>
                    </div>
                </Panel>
            ) : (
                <>
                    {quizAttempts.length > 0 && (
                        <Panel title="Your Quiz Progress">
                            <div className="space-y-3">
                                {[...quizAttempts].reverse().map((attempt, idx) => (
                                    <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex justify-between items-center">
                                            <strong>Attempt {idx + 1}</strong>
                                            <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-700">
                                                Score: {attempt.score}/{attempt.total}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-2">
                                            Taken on: {new Date(attempt.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}

                    <Quiz course={course} api={api} flash={flash} refresh={refreshAttempts} setRoute={setRoute} />
                </>
            )}
        </div>
    );
}
