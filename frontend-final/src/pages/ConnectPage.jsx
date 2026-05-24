import { Panel } from "../components/common/Panel";
import { Mail } from "lucide-react";

export function ConnectPage({ setRoute }) {
    const emails = [
        "24eg106c63@anurag.edu.in",
        "24eg106c58@anurag.edu.in",
        "24eg107b27@anurag.edu.in",
        "24eg107b53@anurag.edu.in",
        "24eg107b36@anurag.edu.in"
    ];

    return (
        <section className="mx-auto max-w-4xl">
            <div className="panel mb-5 bg-slate-950 text-white">
                <div className="pill">Connect With Us</div>
                <h2 className="mt-5 text-4xl font-black">Email Us</h2>
            </div>
            <Panel title="Email Addresses">
                <div className="space-y-4">
                    <p className="text-slate-700">Send us an email using any of the addresses below:</p>
                    <div className="grid gap-3 md:grid-cols-1">
                        {emails.map((email, idx) => (
                            <a 
                                key={idx}
                                href={`mailto:${email}`}
                                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all"
                            >
                                <Mail className="text-teal-700" size={20} />
                                <span className="font-bold text-slate-900">{email}</span>
                            </a>
                        ))}
                    </div>
                    <div className="mt-6">
                        <button className="btn" onClick={() => setRoute("courses")}>Back to Courses</button>
                    </div>
                </div>
            </Panel>
        </section>
    );
}
