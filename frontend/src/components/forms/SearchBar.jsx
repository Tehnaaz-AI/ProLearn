import { Search } from "lucide-react";

export function SearchBar({ query, setQuery, loadCourses }) {
    return (
        <div className="panel flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-10" value={query} placeholder="Search by course, category, instructor, or skill" onChange={(e) => { setQuery(e.target.value); loadCourses(e.target.value); }} />
            </div>
            <button className="btn md:w-36" onClick={() => loadCourses(query)}>Search</button>
        </div>
    );
}
