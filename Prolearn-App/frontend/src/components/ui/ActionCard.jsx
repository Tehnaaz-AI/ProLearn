import { CheckCircle2 } from "lucide-react";

export function ActionCard({ title, text, action, onClick }) {
    return <button className="panel text-left transition hover:-translate-y-1 hover:shadow-xl" onClick={onClick}><CheckCircle2 className="text-teal-700" /><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><div className="mt-4 font-bold text-teal-700">{action}</div></button>;
}
