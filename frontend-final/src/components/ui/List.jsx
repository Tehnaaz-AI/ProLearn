export function List({ items = [], empty = "Nothing to show.", render, maxHeight = "500px" }) {
    if (!items.length) return <p className="text-slate-500">{empty}</p>;
    return <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight }}>{items.map((item, index) => <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4" key={item.id || index}>{render(item, index)}</div>)}</div>;
}
