export function SectionHeader({ title, text }) {
    return <div><h2 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h2><p className="mt-2 max-w-3xl text-slate-600">{text}</p></div>;
}
