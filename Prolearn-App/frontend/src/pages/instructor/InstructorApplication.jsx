import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
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

    if (appStatus && appStatus.status === "pending") {
        return (
            <Panel title="Application Status">
                <div className="rounded-2xl bg-amber-50 p-6 text-amber-900 border border-amber-200">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-amber-600" size={24} />
                        <h3 className="text-xl font-black">Under Review</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6">Your application to become an instructor is currently being reviewed by our admin team. You will be notified once a decision is made.</p>
                </div>
            </Panel>
        );
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

    return (
        <div className="space-y-6">
            {appStatus && appStatus.status === "rejected" && (
                <Panel title="Application Status">
                    <div className="rounded-2xl bg-red-50 p-6 text-red-900 border border-red-200">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-red-600" size={24} />
                            <h3 className="text-xl font-black">Application Rejected</h3>
                        </div>
                        <p className="mt-3 text-sm font-semibold">Reason: {appStatus.adminReason}</p>
                        <p className="mt-3 text-sm leading-6 text-red-700">You can review the feedback and submit a new application below with updated information.</p>
                    </div>
                </Panel>
            )}
            <SmartForm title="Instructor approval application" button="Submit application" fields={[
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
    );
}
