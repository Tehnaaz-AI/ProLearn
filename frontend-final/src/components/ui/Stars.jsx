import { Star } from "lucide-react";

export function Stars({ count }) {
    return <div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill={i < count ? "currentColor" : "none"} />)}</div>;
}
