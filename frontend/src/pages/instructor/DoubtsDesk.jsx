import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { AnswerBox } from "../../components/forms/AnswerBox";

export function DoubtsDesk({ api, flash }) {
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const load = () => {
        setLoading(true);
        return api("/instructor/doubts")
            .then((data) => setDoubts(data.doubts || []))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);
    async function answer(id, answerText) {
        await api(`/doubts/${id}/answer`, { method: "POST", body: JSON.stringify({ answer: answerText }) });
        flash("Answer posted.");
        load();
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading student doubts...</p>
                </div>
            </div>
        );
    }
    
    return (
        <Panel title="Student doubts">
            <List items={doubts} empty="No doubts assigned yet." render={(doubt) => <AnswerBox doubt={doubt} onSubmit={answer} />} />
        </Panel>
    );
}
