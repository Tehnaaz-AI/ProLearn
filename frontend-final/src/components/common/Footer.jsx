import { Twitter, Linkedin, Instagram, Mail, Phone } from "lucide-react";

export function Footer({ user }) {
    return (
        <footer className="mt-12 bg-slate-950 text-slate-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-slate-900 to-slate-950 z-0"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 text-xl font-black text-white shadow-lg shadow-teal-900/50">
                                PL
                            </div>
                            <span className="text-3xl font-black tracking-tight text-white">ProLearn</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Your all-in-one platform for online learning, course creation, and community engagement. Empowering minds globally.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all duration-300"><Twitter size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all duration-300"><Linkedin size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all duration-300"><Instagram size={18} /></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-8 h-1 bg-teal-500 rounded-full"></div> Platform
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#/courses" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Browse Courses</a></li>
                            {!user ? (
                                <>
                                    <li><a href="#/register" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Become an Instructor</a></li>
                                    <li><a href="#/login" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Student Dashboard</a></li>
                                </>
                            ) : user.role === "admin" ? (
                                <>
                                    <li><a href="#/admin-users" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Manage Users</a></li>
                                    <li><a href="#/admin-payments" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Payments & Commission</a></li>
                                </>
                            ) : user.role === "instructor" ? (
                                <>
                                    <li><a href="#/instructor-courses" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>My Published Courses</a></li>
                                    <li><a href="#/doubts" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Student Doubts</a></li>
                                </>
                            ) : (
                                <>
                                    <li><a href="#/my-courses" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>My Enrolled Courses</a></li>
                                    <li><a href="#/become-instructor" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Apply to Teach</a></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-8 h-1 bg-teal-500 rounded-full"></div> Company
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#/about" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>About Us</a></li>
                            <li><a href="#/contact" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Contact</a></li>
                            <li><a href="#/connect" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Connect</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-8 h-1 bg-teal-500 rounded-full"></div> Get in Touch
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3 group">
                                <Phone className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <div className="text-slate-200 text-sm font-medium">Support Lines</div>
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <a href="tel:9640182567" className="text-slate-400 hover:text-teal-400 text-xs sm:text-sm font-bold transition-colors">9640182567</a>
                                        <a href="tel:9281478453" className="text-slate-400 hover:text-teal-400 text-xs sm:text-sm font-bold transition-colors">9281478453</a>
                                        <a href="tel:9391472578" className="text-slate-400 hover:text-teal-400 text-xs sm:text-sm font-bold transition-colors">9391472578</a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 group">
                                <Mail className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <div className="text-slate-200 text-sm font-medium">Email Us</div>
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <a href="mailto:24eg106c63@anurag.edu.in" className="text-slate-400 hover:text-teal-400 text-[11px] sm:text-xs font-bold transition-colors break-all">24eg106c63@anurag.edu.in</a>
                                        <a href="mailto:24eg106c58@anurag.edu.in" className="text-slate-400 hover:text-teal-400 text-[11px] sm:text-xs font-bold transition-colors break-all">24eg106c58@anurag.edu.in</a>
                                        <a href="mailto:24eg107b27@anurag.edu.in" className="text-slate-400 hover:text-teal-400 text-[11px] sm:text-xs font-bold transition-colors break-all">24eg107b27@anurag.edu.in</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm font-medium">&copy; {new Date().getFullYear()} ProLearn. All rights reserved.</p>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#/terms" className="text-slate-500 hover:text-teal-400 transition-colors">Terms of Service</a>
                        <a href="#/privacy" className="text-slate-500 hover:text-teal-400 transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
