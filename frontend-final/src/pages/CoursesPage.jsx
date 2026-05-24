import { SearchBar } from "../components/forms/SearchBar";
import { CourseGrid } from "../components/course/CourseGrid";
import { SectionHeader } from "../components/ui/SectionHeader";

export function CoursesPage(props) {
    return (
        <div className="space-y-5">
            <SectionHeader title="Course catalog" text="Search by title, category, or description. Paid courses use the payment flow before enrollment." />
            <SearchBar query={props.query} setQuery={props.setQuery} loadCourses={props.loadCourses} />
            <CourseGrid courses={props.courses} openCourse={props.openCourse} user={props.user} />
        </div>
    );
}
