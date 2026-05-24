import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { AnswerBox } from "../../components/forms/AnswerBox";

export function DoubtsDesk({ api, flash }) {
    const [doubts, setDoubts] = useState([]);
    const load = () => api("/instructor/doubts").then((data) => setDoubts(data.doubts || []));
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);
    async function answer(id, answerText) {
        await api(`/doubts/${id}/answer`, { method: "POST", body: JSON.stringify({ answer: answerText }) });
        flash("Answer posted.");
        load();
    }
    return (
        <Panel title="Student doubts">
            <List items={doubts} empty="No doubts assigned yet." render={(doubt) => <AnswerBox doubt={doubt} onSubmit={answer} />} />
        </Panel>
    );
}
