import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { Detail } from "../../components/ui/Detail";
import { formatDate } from "../../utils/helpers";

export function AdminApplications({ api, flash }) {
    const [apps, setApps] = useState([]);
    const load = () => api("/instructor/applications").then((data) => setApps(data.applications || []));
    useEffect(() => { load().catch((err) => flash(err.message, "error")); }, []);
    async function action(id, type) {
        const reason = window.prompt(`${type} reason`) || type;
        await api(`/instructor/applications/${id}/${type}`, { method: "POST", body: JSON.stringify({ reason }) });
        flash(`Application ${type}d.`);
        load();
    }
    return (
        <Panel title="Instructor applications">
            <List items={apps} empty="No applications." render={(app) => (
                <div>
                    <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div><strong>{app.name} ({app.status})</strong><p className="text-sm text-slate-600">{app.instructor_email} | DOB {formatDate(app.dob)}</p></div>
                        <div className="flex gap-2"><button className="btn" onClick={() => action(app.id, "approve")}>Approve</button><button className="btn-danger" onClick={() => action(app.id, "reject")}>Reject</button></div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                        <Detail label="Education" value={app.education} />
                        <Detail label="Qualifications" value={app.qualifications} />
                        <Detail label="Experience" value={app.experience} />
                        <Detail label="Payment" value={app.payment_details} />
                        <Detail label="Samples" value={app.sample_courses} />
                        <Detail label="Videos" value={app.sample_videos} />
                    </div>
                </div>
            )} />
        </Panel>
    );
}
