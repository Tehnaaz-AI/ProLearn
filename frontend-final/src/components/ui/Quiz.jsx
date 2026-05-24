import React from "react";
import { Panel } from "../common/Panel";
import { Loader2 } from "lucide-react";

export function Quiz({ course, api, flash, refresh, setRoute }) {
    const [answers, setAnswers] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    async function submit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const data = await api(`/courses/${course.id}/quiz/submit`, { method: "POST", body: JSON.stringify({ answers: course.quiz.map((_, index) => Number(answers[index])) }) });
            const percentage = (data.score / data.total) * 100;
            flash(`Quiz score: ${data.score}/${data.total} (${percentage.toFixed(0)}%)`);
            if (refresh) refresh();
            
            if (percentage > 80) {
                setTimeout(() => {
                    setRoute(`certificate/${course.id}`);
                }, 1500);
            } else {
                flash("You need a score > 80% to earn a certificate. Please try again!", "warning");
            }
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <Panel title="Quiz">
            <form className="space-y-3" onSubmit={submit}>
                {course.quiz.map((q, index) => (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={index}>
                        <strong>{q.question}</strong>
                        <div className="mt-3 grid gap-2">
                            {q.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center gap-2"><input required type="radio" name={`q${index}`} onChange={() => setAnswers({ ...answers, [index]: optionIndex })} />{option}</label>
                            ))}
                        </div>
                    </div>
                ))}
                <button className="btn flex items-center justify-center gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Submitting...
                        </>
                    ) : (
                        "Submit quiz"
                    )}
                </button>
            </form>
        </Panel>
    );
}
