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
                <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    await api("/instructor/apply", { method: "POST", body: formData });
                    flash("Application submitted for admin approval.");
                    api("/instructor/status").then((data) => setAppStatus(data.application));
                }}>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Full Name <span className="text-red-500">*</span></label>
                            <input name="name" className="input h-12 pl-4" defaultValue={autoDefaults.name} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Email ID <span className="text-red-500">*</span></label>
                            <input type="email" name="email" className="input h-12 pl-4" defaultValue={autoDefaults.email} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Date of Birth <span className="text-red-500">*</span></label>
                            <input type="date" name="dob" className="input h-12 pl-4" defaultValue={autoDefaults.dob} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Education <span className="text-red-500">*</span></label>
                            <input name="education" className="input h-12 pl-4" defaultValue={autoDefaults.education} required />
                        </div>
                        <div className="space-y-2 group sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Qualifications Details <span className="text-red-500">*</span></label>
                            <textarea name="qualifications" className="input min-h-[120px] p-4" defaultValue={autoDefaults.qualifications} required />
                        </div>
                        <div className="space-y-2 group sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Teaching or Industry Experience <span className="text-red-500">*</span></label>
                            <textarea name="experience" className="input min-h-[120px] p-4" defaultValue={autoDefaults.experience} required />
                        </div>
                        <div className="space-y-2 group sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Instructor Bio <span className="text-red-500">*</span></label>
                            <textarea name="bio" className="input min-h-[120px] p-4" defaultValue={autoDefaults.bio} required />
                        </div>
                        <div className="space-y-2 group sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Sample Courses <span className="text-red-500">*</span></label>
                            <textarea name="sample_courses" className="input min-h-[120px] p-4" defaultValue={autoDefaults.sample_courses} required />
                        </div>
                        <div className="space-y-2 group sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Sample Video Upload <span className="text-red-500">*</span></label>
                            <input type="file" name="sample_video" accept="video/*" className="input h-14 p-3 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" required />
                        </div>
                        
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Payout Method <span className="text-red-500">*</span></label>
                            <select name="payout_method" className="input h-12 pl-4 bg-white" required defaultValue={user?.payoutMethod || "upi"} onChange={(e) => {
                                const detailsInput = document.getElementById('payout_details_input');
                                if (e.target.value === 'bank') detailsInput.placeholder = "Account No, IFSC, Branch...";
                                else if (e.target.value === 'upi') detailsInput.placeholder = "username@upi";
                                else detailsInput.placeholder = "+91 9876543210";
                            }}>
                                <option value="upi">UPI ID</option>
                                <option value="bank">Bank Details</option>
                                <option value="mobile">Registered Mobile No</option>
                            </select>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">Payout Details <span className="text-red-500">*</span></label>
                            <input id="payout_details_input" name="payout_details" className="input h-12 pl-4" placeholder="username@upi" defaultValue={user?.payoutDetails || ""} required />
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-4 border-t border-slate-100 mt-6 pt-6">
                        <button type="submit" className="btn h-14 px-8 sm:w-auto flex items-center justify-center gap-2 text-base">
                            Submit Application <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
