import { Info } from "../ui/Info";
import { isPaid } from "../../utils/helpers";

export function CourseGrid({ courses, openCourse, user }) {
    const isInstructorOfCourse = (course) => {
        if (!user) return false;
        const courseInstructorId = course.instructor_id || course.instructorId || course.instructor;
        return courseInstructorId && String(courseInstructorId) === String(user._id);
    };

    const isAdmin = user && user.role === "admin";

    return (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
                const isOwnCourse = isInstructorOfCourse(course);
                return (
                    <article key={course.id} className="course-card group">
                        <div className="flex items-start justify-between gap-3">
                            <span className={isPaid(course) ? "tag-amber" : "tag-teal"}>{isPaid(course) ? `Paid INR ${course.price}` : "Free"}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{course.level}</span>
                        </div>
                        <h3 className="mt-5 text-2xl font-black tracking-tight">{course.title}</h3>
                        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{typeof course.description === 'string' && course.description.trim() ? course.description : 'Course details not available.'}</p>
                        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                            <Info label="Instructor" value={course.instructor_name || course.instructorName || "Instructor"} />
                            <Info label="Rating" value={Number(course.average_rating || course.averageRating || 0).toFixed(1)} />
                            <Info label="Students" value={course.enrollment_count || course.enrollmentCount || 0} />
                        </div>
                        <button className="btn mt-5 w-full shadow-lg shadow-teal-700/10" onClick={() => openCourse(course.id)}>
                            {isOwnCourse || isAdmin || course.is_enrolled || course.isEnrolled ? "View" : "View and enroll"}
                        </button>
                    </article>
                );
            })}
        </section>
    );
}
