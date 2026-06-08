export function AnswerBox({ doubt, onSubmit }) {
    const [answer, setAnswer] = React.useState(doubt.answer || "");
    return (
        <div>
            <strong>{doubt.title}</strong>
            <p className="mt-1 text-slate-600">{doubt.username}: {doubt.question}</p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
                <input className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer this doubt" />
                <button className="btn md:w-36" onClick={() => onSubmit(doubt.id, answer)}>Answer</button>
            </div>
        </div>
    );
}

import React from "react";
