import { SearchBar } from "../components/forms/SearchBar";
import { CourseGrid } from "../components/course/CourseGrid";
import { Compass } from "lucide-react";

export function CoursesPage(props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-7xl mx-auto">
            {/* Beautiful Page Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <Compass className="w-3.5 h-3.5" /> Explore
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Course Catalog
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed">
                        Discover courses taught by industry experts. Search by title, category, or description. Paid courses use a secure payment flow.
                    </p>
                </div>
            </div>

            <div className="panel bg-white/60 backdrop-blur-md border border-white shadow-xl shadow-slate-200/40 p-2 sm:p-4 rounded-3xl">
                <SearchBar query={props.query} setQuery={props.setQuery} loadCourses={props.loadCourses} />
            </div>

            <div className="pt-2">
                <CourseGrid courses={props.courses} openCourse={props.openCourse} user={props.user} />
            </div>
        </div>
    );
}
