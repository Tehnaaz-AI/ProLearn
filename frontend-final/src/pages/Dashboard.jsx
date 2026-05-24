import { ActionCard } from "../components/ui/ActionCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Stat } from "../components/ui/Stat";

export function Dashboard({ user, courses, setRoute }) {
    const paid = courses.filter(c => Boolean(c.is_paid ?? c.isPaid)).length;
    return (
        <div className="space-y-6">
            <SectionHeader title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`} />
            <div className="grid gap-4 md:grid-cols-3">
                <Stat label="Published courses" value={courses.length} />
                <Stat label="Paid courses" value={paid} />
                <Stat label="Free courses" value={courses.length - paid} />
            </div>
            <section className="grid gap-5 lg:grid-cols-3">
                <ActionCard title="Browse courses" text="Search, preview, enroll, and continue learning." action="Open courses" onClick={() => setRoute("courses")} />
                <ActionCard title="My courses" text="View enrolled courses and unlocked course content." action="Go to my courses" onClick={() => setRoute("my-courses")} />
                {user.role === "student" && <ActionCard title="Become instructor" text="Submit profile, qualifications, samples, videos, and payout details." action="Apply now" onClick={() => setRoute("become-instructor")} />}
                {user.role === "instructor" && <ActionCard title="Instructor desk" text="Create courses, upload lesson content, and clear student doubts." action="Create course" onClick={() => setRoute("create-course")} />}
                {user.role === "instructor" && <ActionCard title="Published courses" text="View enrollments, reviews, doubts, videos, and course info for your own courses." action="Open published courses" onClick={() => setRoute("instructor-courses")} />}
                {user.role === "admin" && <ActionCard title="Admin controls" text="Review users, instructors, applications, payments, and blocks." action="Open users" onClick={() => setRoute("admin-users")} />}
            </section>
        </div>
    );
}
