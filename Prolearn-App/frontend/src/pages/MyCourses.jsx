import { useEffect, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { CourseGrid } from "../components/course/CourseGrid";

export function MyCourses({ api, openCourse, flash, user }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        api("/my/enrollments")
            .then((data) => setItems(data.courses || []))
            .catch((err) => flash(err.message, "error"))
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <SectionHeader title="My courses" text="All courses you enrolled in as a learner. Instructors also keep full student features here." />
            <CourseGrid courses={items} openCourse={openCourse} user={user} />
        </div>
    );
}
