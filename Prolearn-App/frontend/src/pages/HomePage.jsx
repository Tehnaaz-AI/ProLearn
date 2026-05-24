import { CourseGrid } from "../components/course/CourseGrid";
import { SectionHeader } from "../components/ui/SectionHeader";
import { MetricStrip } from "../components/ui/MetricStrip";
import { Trophy } from "lucide-react";

export function HomePage(props) {
    return (
        <div className="space-y-8">
            <section className="hero">
                <div className="max-w-3xl">
                    <div className="pill">Modern Learning Platform</div>
                    <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">Learn from instructors, enroll securely, and track every skill in one place.</h2>
                    <p className="mt-5 max-w-2xl text-lg text-slate-200">Your all-in-one platform for online learning, course creation, and community engagement.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button className="btn-light" onClick={() => props.setRoute("courses")}>Explore courses</button>
                        {!props.user && <button className="btn-ghost" onClick={() => props.setRoute("register")}>Create account</button>}
                    </div>
                </div>
            </section>
            <MetricStrip courses={props.courses} />
            
            {props.user && (
                <div onClick={() => props.setRoute("leaderboard")} className="cursor-pointer bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="bg-white/25 p-5 rounded-2xl">
                            <Trophy size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-black">Leaderboard</h3>
                            <p className="text-teal-100 mt-2 text-lg">See where you stand among top learners</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 px-6 py-3 rounded-2xl font-bold text-xl">View Leaderboard →</div>
                        </div>
                    </div>
                </div>
            )}
            
            <SectionHeader title="Featured courses" />
            <CourseGrid courses={props.courses.slice(0, 6)} openCourse={props.openCourse} user={props.user} />
        </div>
    );
}
