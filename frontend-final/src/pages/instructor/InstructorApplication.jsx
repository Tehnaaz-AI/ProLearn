import { useEffect, useState } from "react";
import { ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import { SmartForm } from "../../components/forms/SmartForm"; 
import { Panel } from "../../components/common/Panel"; 
import { dateInput } from "../../utils/helpers";

export function InstructorApplication({ api, flash, user }) {
    const [appStatus, setAppStatus] = useState(null);

    useEffect(() => {
        api("/instructor/status").then((data) => setAppStatus(data.application)).catch((err) => flash(err.message, "error"));
    }, []);

    async function submit(payload) {
        await api("/instructor/apply", { method: "POST", body: JSON.stringify(payload) });
        flash("Application submitted for admin approval.");
        api("/instructor/status").then((data) => setAppStatus(data.application));
    }

    const autoDefaults = {
        name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        email: user?.email || "",
        dob: dateInput(user?.dob),
        education: user?.education || "",
        qualifications: user?.qualifications || "",
        experience: user?.experience || "",
        bio: user?.bio || "",
        payment_details: user?.paymentDetails || "",
    };

    if (appStatus && appStatus.status === "pending") {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 mt-10">
                <div className="relative overflow-hidden rounded-[3rem] bg-amber-50 p-8 sm:p-12 border border-amber-200 shadow-xl shadow-amber-900/5 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-amber-900 mb-4">Application Under Review</h2>
                    <p className="text-amber-800/80 font-medium leading-relaxed max-w-md mx-auto">
                        Your application to become an instructor is currently being reviewed by our admin team. You will be notified once a decision is made. Hang tight!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-4xl mx-auto">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-emerald-900/40 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <GraduationCap className="w-3.5 h-3.5" /> Empower Learners
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm mb-3">
                        Become an Instructor
                    </h1>
                    <p className="text-slate-300 font-medium text-base max-w-2xl leading-relaxed mx-auto">
                        Share your knowledge, reach students globally, and earn by teaching what you love. Apply today!
                    </p>
                </div>
            </div>

            {appStatus && appStatus.status === "rejected" && (
                <div className="rounded-3xl bg-red-50 p-6 text-red-900 border border-red-200 shadow-sm flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-2xl shrink-0">
                        <ShieldCheck className="text-red-600 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-1">Application Rejected</h3>
                        <p className="text-sm font-bold mb-2">Reason: {appStatus.adminReason}</p>
                        <p className="text-sm leading-relaxed text-red-800/80">You can review the feedback and submit a new application below with updated information.</p>
                    </div>
                </div>
            )}
            
            <div className="panel bg-white/60 backdrop-blur-md border border-white shadow-xl shadow-slate-200/40 p-6 sm:p-10 rounded-[2rem]">
                <h3 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100">Application Details</h3>
                <SmartForm button="Submit Application" fields={[
                    ["name", "Full name"],
                    ["email", "Email ID", "email"],
                    ["dob", "Date of birth", "date"],
                    ["education", "Education"],
                    ["qualifications", "Qualifications details", "textarea"],
                    ["experience", "Teaching or industry experience", "textarea"],
                    ["bio", "Instructor bio", "textarea"],
                    ["sample_courses", "Sample courses", "textarea"],
                    ["sample_videos", "Sample video links or upload references", "textarea"],
                    ["payment_details", "UPI ID or bank account details", "textarea"],
                ]} defaults={autoDefaults} onSubmit={submit} />
            </div>
        </div>
    );
}
