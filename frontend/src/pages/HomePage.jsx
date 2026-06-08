import { CourseGrid } from "../components/course/CourseGrid";
import { SectionHeader } from "../components/ui/SectionHeader";
import { MetricStrip } from "../components/ui/MetricStrip";
import { Trophy, ArrowRight, Compass, Sparkles, BookOpen } from "lucide-react";

export function HomePage(props) {
    return (
        <div className="space-y-10 pb-12">
            {/* Redesigned Hero Section */}
            <section className="relative rounded-[2.5rem] bg-slate-950 overflow-hidden shadow-2xl shadow-teal-900/20">
                {/* Background Gradients & Patterns */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 via-emerald-900/40 to-slate-950/90"></div>
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                ></div>
                
                {/* Floating Abstract Shapes */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>

                <div className="relative px-8 py-20 sm:px-14 lg:py-28 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-4 py-2 text-xs font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-6">
                        <Sparkles className="w-4 h-4" /> Next-Gen Learning
                    </div>
                    <h1 className="text-5xl font-black leading-[1.1] text-white md:text-7xl tracking-tight drop-shadow-sm">
                        Master new skills. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Advance your career.</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed font-medium">
                        Your all-in-one platform for interactive courses, expert instructors, and a thriving community of learners.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <button 
                            className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-4 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/30" 
                            onClick={() => props.setRoute("courses")}
                        >
                            <Compass className="w-5 h-5" /> Explore Courses
                        </button>
                        {!props.user && (
                            <button 
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20" 
                                onClick={() => props.setRoute("register")}
                            >
                                <ArrowRight className="w-5 h-5" /> Create Account
                            </button>
                        )}
                    </div>
                </div>
            </section>
            
            <MetricStrip courses={props.courses} />
            
            {props.user && (
                <div 
                    onClick={() => props.setRoute("leaderboard")} 
                    className="group cursor-pointer relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 p-8 sm:p-10 text-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:shadow-teal-900/30"
                >
                    {/* Decorative pattern for banner */}
                    <div className="absolute right-0 top-0 w-64 h-full bg-white opacity-5 transform skew-x-12 translate-x-20 group-hover:translate-x-0 transition-transform duration-700"></div>
                    
                    <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                        <div className="shrink-0 bg-white/20 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Trophy size={48} className="text-yellow-300" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-3xl font-black tracking-tight drop-shadow-sm">Global Leaderboard</h3>
                            <p className="text-teal-100 mt-2 text-lg font-medium">Compete with top learners and track your ranking.</p>
                        </div>
                        <div className="shrink-0 mt-4 sm:mt-0">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-bold text-lg backdrop-blur-md transition-colors group-hover:bg-white/20">
                                View Rankings <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    {/* Replaced SectionHeader with raw HTML to avoid prop clashes, but I should use the component. Wait, the original code had `<SectionHeader title="Featured courses" />`. I'll keep it simple: */}
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">Featured Courses</h2>
                </div>
                <CourseGrid courses={props.courses.slice(0, 6)} openCourse={props.openCourse} user={props.user} />
            </div>
        </div>
    );
}
