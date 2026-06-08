import { Panel } from "../components/common/Panel";
import { Phone } from "lucide-react";

export function ContactPage({ setRoute }) {
    const phoneNumbers = [
        "9640182567",
        "9281478453",
        "9391472578",
        "8125797312",
        "9106550868"
    ];

    return (
        <section className="mx-auto max-w-4xl">
            <div className="panel mb-5 bg-slate-950 text-white">
                <div className="pill">Contact Us</div>
                <h2 className="mt-5 text-4xl font-black">Get In Touch</h2>
            </div>
            <Panel title="Contact Numbers">
                <div className="space-y-4">
                    <p className="text-slate-700">Have questions? Reach out to us using any of the phone numbers below:</p>
                    <div className="grid gap-3 md:grid-cols-2">
                        {phoneNumbers.map((phone, idx) => (
                            <a 
                                key={idx}
                                href={`tel:${phone}`}
                                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all"
                            >
                                <Phone className="text-teal-700" size={20} />
                                <span className="font-bold text-slate-900">{phone}</span>
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
