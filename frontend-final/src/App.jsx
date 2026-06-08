import React, { useEffect, useState } from "react";
import { useApi } from "./hooks/useApi";
import { getInitialRoute } from "./utils/routing";
import { Notice } from "./components/common/Notice";
import { Sidebar } from "./components/common/Sidebar";
import { Topbar } from "./components/common/Topbar";
import { Footer } from "./components/common/Footer";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Dashboard } from "./pages/Dashboard";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { MyCourses } from "./pages/MyCourses";
import { Profile } from "./pages/ProfilePage";
import { InstructorApplication } from "./pages/instructor/InstructorApplication";
import { CreateCourse } from "./pages/instructor/CreateCourse";
import { InstructorCourses } from "./pages/instructor/InstructorCourses";
import { DoubtsDesk } from "./pages/instructor/DoubtsDesk";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminApplications } from "./pages/admin/AdminApplications";
import { AdminPayments } from "./pages/admin/AdminPayments";
import { AdminCourses } from "./pages/admin/AdminCourses";
import { TermsAndConditionsPage } from "./pages/TermsAndConditionsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { QuizPage } from "./pages/QuizPage";
import { CertificatePage } from "./pages/CertificatePage";
import { AboutUsPage } from "./pages/AboutUsPage";
import { ContactPage } from "./pages/ContactPage";
import { ConnectPage } from "./pages/ConnectPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ForumsPage } from "./pages/ForumsPage";
import { StudyGroupsPage } from "./pages/StudyGroupsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

export function App() {
    const [token, setToken] = useState(localStorage.getItem("ProLearn_token") || "");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("ProLearn_user") || "null"));
    const [route, setRouteState] = useState(getInitialRoute(JSON.parse(localStorage.getItem("ProLearn_user") || "null")));
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState({ text: "", type: "success" });
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [unreadCount, setUnreadCount] = useState(0);

    const api = useApi(token);

    const flash = (text, type = "success") => setNotice({ text, type });
    const setRoute = (next) => {
        window.location.hash = `/${next}`;
        setRouteState(next);
        setSidebarOpen(false);
    };

    async function loadCourses(q = query) {
        try {
            const data = await api(`/courses?q=${encodeURIComponent(q)}`);
            setCourses(data.courses || []);
        } catch (err) {
            flash(err.message, "error");
        }
    }
    
    async function loadEnrollments() {
        if (!user) {
            setEnrollments([]);
            return;
        }
        try {
            const data = await api("/enrollments");
            setEnrollments(data.enrollments || []);
        } catch (err) {
            setEnrollments([]);
        }
    }

    async function loadUnreadCount() {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        try {
            const data = await api("/notifications");
            const unread = (data.notifications || []).filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            setUnreadCount(0);
        }
    }

    async function openCourse(courseId) {
        if (!user) {
            flash("Login to preview, enroll, and access course content.", "error");
            setRoute("login");
            return;
        }
        try {
            const data = await api(`/courses/${courseId}`);
            setCurrentCourse(data.course);
            setRoute(`course/${courseId}`);
        } catch (err) {
            flash(err.message, "error");
        }
    }

    async function login(payload) {
        const data = await api("/login", { method: "POST", body: JSON.stringify(payload) });
        localStorage.setItem("ProLearn_token", data.token);
        localStorage.setItem("ProLearn_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        flash("Welcome back.");
        setRoute("dashboard");
    }
    
    useEffect(() => {
        loadEnrollments();
        loadUnreadCount();
    }, [user, api]);

    function logout() {
        localStorage.removeItem("ProLearn_token");
        localStorage.removeItem("ProLearn_user");
        setToken("");
        setUser(null);
        setCurrentCourse(null);
        flash("Logged out.");
        setRoute("home");
    }

    useEffect(() => {
        loadCourses("");
    }, [api]);

    useEffect(() => {
        const onHash = () => setRouteState(getInitialRoute(user));
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [user]);

    useEffect(() => {
        if (route.startsWith("course/")) {
            const courseId = route.split("/")[1];
            if (courseId && currentCourse?.id !== courseId) {
                openCourse(courseId);
            }
        } else if (route.startsWith("quiz/")) {
            const courseId = route.split("/")[1];
            if (courseId && currentCourse?.id !== courseId) {
                openCourse(courseId);
            }
        } else if (route.startsWith("certificate/")) {
            const courseId = route.split("/")[1];
            if (courseId && currentCourse?.id !== courseId) {
                openCourse(courseId);
            }
        }
    }, [route, token]);

    const pageProps = { user, api, courses, enrollments, query, setQuery, loadCourses, openCourse, flash, setRoute, loadUnreadCount };

    return (
        <div className="min-h-screen bg-[#f6f8fb] text-slate-950 flex flex-col">
            {notice.text && <Notice notice={notice} clear={() => setNotice({ text: "", type: "success" })} />}
            <Sidebar user={user} route={route} setRoute={setRoute} logout={logout} open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className={`transition-all duration-300 flex flex-1 flex-col ${sidebarOpen ? "pl-72" : "pl-20"}`}>
                <Topbar user={user} route={route} setRoute={setRoute} unreadCount={unreadCount} />
                <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {route === "home" && <HomePage {...pageProps} />}
                    {route === "login" && <LoginPage login={login} api={api} flash={flash} setRoute={setRoute} />}
                    {route === "register" && <RegisterPage api={api} flash={flash} setRoute={setRoute} />}
                    {route === "dashboard" && user && <Dashboard {...pageProps} />}
                    {route === "courses" && <CoursesPage {...pageProps} />}
                    {route.startsWith("course/") && currentCourse && <CourseDetailPage course={currentCourse} refresh={() => openCourse(currentCourse.id)} {...pageProps} />}
                    {route.startsWith("quiz/") && currentCourse && <QuizPage course={currentCourse} refresh={() => openCourse(currentCourse.id)} {...pageProps} />}
                    {route.startsWith("certificate/") && currentCourse && <CertificatePage course={currentCourse} refresh={() => openCourse(currentCourse.id)} {...pageProps} />}
                    {route === "my-courses" && user && <MyCourses {...pageProps} />}
                    {route === "profile" && user && <Profile {...pageProps} />}
                    {route === "become-instructor" && user?.role === "student" && <InstructorApplication api={api} flash={flash} user={user} />}
                    {route === "create-course" && user?.role === "instructor" && <CreateCourse {...pageProps} setRoute={setRoute} />}
                    {route === "instructor-courses" && user?.role === "instructor" && <InstructorCourses {...pageProps} setRoute={setRoute} />}
                    {route === "doubts" && user?.role === "instructor" && <DoubtsDesk {...pageProps} />}
                    {route === "admin-users" && user?.role === "admin" && <AdminUsers {...pageProps} />}
                    {route === "admin-applications" && user?.role === "admin" && <AdminApplications {...pageProps} />}
                    {route === "admin-payments" && user?.role === "admin" && <AdminPayments {...pageProps} />}
                    {route === "admin-courses" && user?.role === "admin" && <AdminCourses {...pageProps} openCourse={openCourse} />}
                    {route === "terms" && <TermsAndConditionsPage {...pageProps} />}
                    {route === "privacy" && <PrivacyPage {...pageProps} />}
                    {route === "about" && <AboutUsPage {...pageProps} />}
                    {route === "contact" && <ContactPage {...pageProps} />}
                    {route === "connect" && <ConnectPage {...pageProps} />}
                    {route === "leaderboard" && <LeaderboardPage {...pageProps} />}
                    {route === "forums" && user && <ForumsPage {...pageProps} />}
                    {route === "study-groups" && user && <StudyGroupsPage {...pageProps} />}
                    {route === "analytics" && user && <AnalyticsPage {...pageProps} />}
                    {route === "notifications" && user && <NotificationsPage {...pageProps} />}
                    {!user && !["home", "login", "register", "courses", "about", "contact", "connect", "leaderboard"].includes(route) && !route.startsWith("course/") && !route.startsWith("certificate/") && <LoginPage login={login} api={api} flash={flash} setRoute={setRoute} />}
                </main>
                <Footer user={user} />
            </div>
        </div>
    );
}
