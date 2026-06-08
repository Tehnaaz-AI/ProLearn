import { Stat } from "./Stat";
import { isPaid } from "../../utils/helpers";

export function MetricStrip({ courses }) {
    return <div className="grid gap-4 md:grid-cols-2"><Stat label="Courses" value={courses.length} /><Stat label="Paid programs" value={courses.filter(isPaid).length} /></div>;
}
