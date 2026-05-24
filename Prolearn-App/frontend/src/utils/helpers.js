import { Home, BookOpen, User, UserPlus, LayoutDashboard, GraduationCap, Sparkles, Video, MessageSquareText, Users, ShieldCheck, CreditCard, FolderOpen, Trophy, MessageSquare, UsersRound, Bookmark, StickyNote, BarChart3, Bell } from "lucide-react";

export function isPaid(course) {
    return Boolean(course.is_paid ?? course.isPaid);
}

export function formatDate(value) {
    return value ? new Date(value).toLocaleDateString() : "Not provided";
}

export function dateInput(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function navItems(user) {
    const base = [
        ["home", "Home", Home],
        ["courses", "Courses", BookOpen],
    ];
    if (!user) return [...base, ["leaderboard", "Leaderboard", Trophy], ["login", "Login", User], ["register", "Register", UserPlus]];
    const student = [
        ["dashboard", "Dashboard", LayoutDashboard],
        ...base,
        ["leaderboard", "Leaderboard", Trophy],
        ["analytics", "Analytics", BarChart3],
        ["notifications", "Notifications", Bell],
        ["forums", "Forums", MessageSquare],
        ["study-groups", "Study Groups", UsersRound],
        ["my-courses", "My Courses", GraduationCap],
        ["profile", "Profile", User],
    ];
    if (user.role === "student") return [...student, ["become-instructor", "Become Instructor", Sparkles]];
    if (user.role === "instructor") {
        return [...student, ["create-course", "Create Course", Video], ["instructor-courses", "Published Courses", BookOpen], ["doubts", "Doubts", MessageSquareText]];
    }
    return [
        ["dashboard", "Dashboard", LayoutDashboard],
        ["leaderboard", "Leaderboard", Trophy],
        ["analytics", "Analytics", BarChart3],
        ["notifications", "Notifications", Bell],
        ["forums", "Forums", MessageSquare],
        ["study-groups", "Study Groups", UsersRound],
        ["admin-users", "Users", Users],
        ["admin-applications", "Applications", ShieldCheck],
        ["admin-courses", "Courses", FolderOpen],
        ["admin-payments", "Payments", CreditCard],
        ["profile", "Profile", User],
    ];
}
