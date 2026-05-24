import { useState } from "react";
import { SmartForm } from "../components/forms/SmartForm";
import { Panel } from "../components/common/Panel";
import { Detail } from "../components/ui/Detail";
import { dateInput, formatDate } from "../utils/helpers";

export function Profile({ user, api, flash }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone || "",
        city: user.city || "",
        dob: dateInput(user.dob),
        education: user.education || "",
        qualifications: user.qualifications || "",
        experience: user.experience || "",
        bio: user.bio || "",
        payment_details: user.payment_details || user.paymentDetails || "",
        new_password: ""
    });

    async function handleUpdate() {
        const body = new FormData();
        // Always send required fields with their values (even if empty, but backend will use existing if needed)
        body.append("firstName", formData.firstName || user.firstName);
        body.append("lastName", formData.lastName || user.lastName);
        body.append("username", formData.username || user.username);
        
        // Optional fields
        if (formData.phone) body.append("phone", formData.phone);
        if (formData.city) body.append("city", formData.city);
        if (formData.dob) body.append("dob", formData.dob);
        if (formData.education !== undefined) body.append("education", formData.education);
        if (formData.qualifications !== undefined) body.append("qualifications", formData.qualifications);
        if (formData.experience !== undefined) body.append("experience", formData.experience);
        if (formData.bio !== undefined) body.append("bio", formData.bio);
        if (formData.payment_details) body.append("payment_details", formData.payment_details);
        
        if (profilePictureFile) {
            body.append("profilePicture", profilePictureFile);
        }
        if (formData.new_password) {
            body.append("current_password", currentPassword);
            body.append("new_password", formData.new_password);
        }
        
        await api("/me", { method: "PUT", body });
        flash("Profile updated. Login again to refresh session details.");
    }

    return (
        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Profile settings">
                <form className="space-y-3">
                    <input 
                        className="input" 
                        placeholder="First name" 
                        value={formData.firstName} 
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        placeholder="Last name" 
                        value={formData.lastName} 
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        placeholder="Username" 
                        value={formData.username} 
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        placeholder="Phone number" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        placeholder="City" 
                        value={formData.city} 
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        type="date" 
                        value={formData.dob} 
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })} 
                    />
                    <input 
                        className="input" 
                        placeholder="Education" 
                        value={formData.education} 
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })} 
                    />
                    <textarea 
                        className="input" 
                        placeholder="Qualifications" 
                        value={formData.qualifications} 
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} 
                    />
                    <textarea 
                        className="input" 
                        placeholder="Experience" 
                        value={formData.experience} 
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })} 
                    />
                    <textarea 
                        className="input" 
                        placeholder="Bio" 
                        value={formData.bio} 
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                    />
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Profile picture</label>
                        <input 
                            className="input mt-1" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)} 
                        />
                    </div>
                    {user.role === "instructor" && (
                        <textarea 
                            className="input" 
                            placeholder="UPI ID or bank account details" 
                            value={formData.payment_details} 
                            onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })} 
                        />
                    )}
                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-bold text-slate-800 mb-2">Change password</h3>
                        <input 
                            className="input mb-2" 
                            placeholder="Current password" 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                        />
                        <input 
                            className="input" 
                            placeholder="New password" 
                            type="password" 
                            value={formData.new_password} 
                            disabled={!currentPassword} 
                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })} 
                        />
                    </div>
                    <button type="button" className="btn w-full" onClick={handleUpdate}>Update profile</button>
                </form>
            </Panel>
            <Panel title="Account details">
                <Detail label="Email" value={user.email} />
                <Detail label="Role" value={user.role} />
                <Detail label="Status" value={user.status} />
                <Detail label="First Name" value={user.firstName} />
                <Detail label="Last Name" value={user.lastName} />
                <Detail label="Phone" value={user.phone} />
                <Detail label="City" value={user.city} />
                <Detail label="Education" value={user.education || "Not provided"} />
                <Detail label="Qualifications" value={user.qualifications || "Not provided"} />
                <Detail label="DOB" value={formatDate(user.dob)} />
                <Detail label="Experience" value={user.experience || "Not provided"} />
                {user.profilePictureUrl && (
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Profile picture</p>
                        <img src={user.profilePictureUrl} alt="Profile" className="mt-2 w-32 h-32 rounded-full object-cover border-2 border-slate-200" />
                    </div>
                )}
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Email cannot be edited from profile settings.</p>
            </Panel>
        </section>
    );
}
