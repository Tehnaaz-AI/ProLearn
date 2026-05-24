export function Footer({ user }) {
    return (
        <footer className="mt-12 border-t border-slate-200 bg-white pt-12 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-sm font-black text-white">PL</div>
                            <span className="text-xl font-black tracking-tight text-slate-900">ProLearn</span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                            Your all-in-one platform for online learning, course creation, and community engagement.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Platform</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-500">
                            <li><a href="#/courses" className="transition-colors hover:text-teal-700">Browse Courses</a></li>
                            {!user ? (
                                <>
                                    <li><a href="#/register" className="transition-colors hover:text-teal-700">Become an Instructor</a></li>
                                    <li><a href="#/login" className="transition-colors hover:text-teal-700">Student Dashboard</a></li>
                                </>
                            ) : user.role === "admin" ? (
                                <>
                                    <li><a href="#/admin-users" className="transition-colors hover:text-teal-700">Manage Users</a></li>
                                    <li><a href="#/admin-payments" className="transition-colors hover:text-teal-700">Payments & Commission</a></li>
                                </>
                            ) : user.role === "instructor" ? (
                                <>
                                    <li><a href="#/instructor-courses" className="transition-colors hover:text-teal-700">My Published Courses</a></li>
                                    <li><a href="#/doubts" className="transition-colors hover:text-teal-700">Student Doubts</a></li>
                                </>
                            ) : (
                                <>
                                    <li><a href="#/my-courses" className="transition-colors hover:text-teal-700">My Enrolled Courses</a></li>
                                    <li><a href="#/become-instructor" className="transition-colors hover:text-teal-700">Apply to Teach</a></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Company</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-500">
                            <li><a href="#/about" className="transition-colors hover:text-teal-700">About Us</a></li>
                            <li><a href="#/contact" className="transition-colors hover:text-teal-700">Contact</a></li>
                            <li><a href="#/connect" className="transition-colors hover:text-teal-700">Connect</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Contact Numbers</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-500">
                            <li><a href="tel:9640182567" className="transition-colors hover:text-teal-700">9640182567</a></li>
                            <li><a href="tel:9281478453" className="transition-colors hover:text-teal-700">9281478453</a></li>
                            <li><a href="tel:9391472578" className="transition-colors hover:text-teal-700">9391472578</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} ProLearn. All rights reserved.</p>
                    <div className="flex gap-4 font-medium">
                        <a href="#/terms" className="transition-colors hover:text-slate-900">Terms</a>
                        <a href="#/privacy" className="transition-colors hover:text-slate-900">Privacy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
