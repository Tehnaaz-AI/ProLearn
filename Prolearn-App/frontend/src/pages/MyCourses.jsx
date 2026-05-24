import { useEffect, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { CourseGrid } from "../components/course/CourseGrid";

export function MyCourses({ api, openCourse, flash, user }) {
    const [items, setItems] = useState([]);
    useEffect(() => {
        api("/my/enrollments").then((data) => setItems(data.courses || [])).catch((err) => flash(err.message, "error"));
    }, []);
    return (
        <div className="space-y-5">
            <SectionHeader title="My courses" text="All courses you enrolled in as a learner. Instructors also keep full student features here." />
            <CourseGrid courses={items} openCourse={openCourse} user={user} />
        </div>
    );
}
