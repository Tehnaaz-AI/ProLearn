export function Panel({ title, children }) {
    return <section className="panel"><h2 className="section-title">{title}</h2>{children}</section>;
}
