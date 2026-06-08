import { Info } from "../ui/Info";
import { isPaid } from "../../utils/helpers";
import { User, Star, Users, ArrowRight } from "lucide-react";

// Generate consistent abstract gradients based on string hash
function getGradient(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradients = [
        "from-teal-600 to-emerald-800",
        "from-indigo-600 to-blue-800",
        "from-violet-600 to-fuchsia-800",
        "from-rose-600 to-orange-800",
        "from-slate-700 to-slate-900"
    ];
    return gradients[Math.abs(hash) % gradients.length];
}

export function CourseGrid({ courses, openCourse, user }) {
    const isInstructorOfCourse = (course) => {
        if (!user) return false;
        const courseInstructorId = course.instructor_id || course.instructorId || course.instructor;
        return courseInstructorId && String(courseInstructorId) === String(user._id);
    };

    const isAdmin = user && user.role === "admin";

    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
                const isOwnCourse = isInstructorOfCourse(course);
                const hasAccess = isOwnCourse || isAdmin || course.is_enrolled || course.isEnrolled;
                const gradient = getGradient(course.id || course.title);

                return (
                    <article 
                        key={course.id} 
                        className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/10 cursor-pointer"
                        onClick={() => openCourse(course.id)}
                    >
                        {/* Hero Image/Gradient Area */}
                        <div className={`relative h-48 w-full bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between overflow-hidden`}>
                            {/* Decorative background circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
                            
                            <div className="relative z-10 flex items-start justify-between gap-3">
                                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-sm border border-white/20">
                                    {course.level}
                                </span>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest shadow-sm ${isPaid(course) ? "bg-amber-400 text-amber-950" : "bg-teal-400 text-teal-950"}`}>
                                    {isPaid(course) ? `₹${course.price}` : "Free"}
                                </span>
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <div className="inline-block rounded-xl bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-2 border border-white/10 shadow-sm">
                                    {course.category || "General"}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex flex-1 flex-col p-6">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                {course.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2 flex-1">
                                {typeof course.description === 'string' && course.description.trim() ? course.description : 'Explore this amazing course and level up your skills.'}
                            </p>
                            
                            {/* Stats Grid */}
                            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <User size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">By</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 truncate" title={course.instructor_name || course.instructorName || "Instructor"}>
                                        {course.instructor_name || course.instructorName || "Instructor"}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col gap-1 border-l border-slate-100 pl-3">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Star size={14} className={course.average_rating > 0 ? "text-amber-400 fill-amber-400" : ""} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Rating</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">
                                        {Number(course.average_rating || course.averageRating || 0).toFixed(1)}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col gap-1 border-l border-slate-100 pl-3">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Users size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Students</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">
                                        {course.enrollment_count || course.enrollmentCount || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black transition-all duration-300 ${hasAccess ? "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-700/20 hover:-translate-y-0.5"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openCourse(course.id);
                                }}
                            >
                                {hasAccess ? "Open Course" : "Enroll Now"}
                                <ArrowRight size={18} className={`transition-transform duration-300 ${!hasAccess ? "group-hover:translate-x-1" : ""}`} />
                            </button>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
