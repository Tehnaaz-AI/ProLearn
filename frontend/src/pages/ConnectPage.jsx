import { Mail, Globe2 } from "lucide-react";

export function ConnectPage({ setRoute }) {
    const emails = [
        "24eg106c63@anurag.edu.in",
        "24eg106c58@anurag.edu.in",
        "24eg107b27@anurag.edu.in",
        "24eg107b53@anurag.edu.in",
        "24eg107b36@anurag.edu.in"
    ];

    return (
        <section className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <Globe2 className="w-3.5 h-3.5" /> Contact
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Connect With Us
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed mx-auto">
                        Have a question, feedback, or need help? Reach out to our support team and we'll get back to you.
                    </p>
                </div>
            </div>

            <div className="panel bg-white/60 backdrop-blur-md border border-white shadow-xl shadow-slate-200/40 p-6 sm:p-8 rounded-[2rem]">
                <h3 className="text-xl font-black text-slate-900 mb-6">Email Directory</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    {emails.map((email, idx) => (
                        <a 
                            key={idx}
                            href={`mailto:${email}`}
                            className="group flex items-center gap-4 rounded-2xl bg-white p-5 border border-slate-200 hover:border-teal-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-slate-900 truncate">{email}</span>
                        </a>
                    ))}
                </div>
                <div className="mt-8 text-center border-t border-slate-100 pt-8">
                    <button className="btn px-8" onClick={() => setRoute("courses")}>Back to Courses</button>
                </div>
            </div>
        </section>
    );
}
