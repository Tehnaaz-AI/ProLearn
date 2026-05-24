export function Detail({ label, value }) {
    return <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs font-bold uppercase text-slate-500">{label}</div><div className="mt-1 break-words font-semibold text-slate-800">{String(value)}</div></div>;
}
