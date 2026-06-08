import { useState } from "react";
import { Panel } from "../components/common/Panel";
import { dateInput } from "../utils/helpers";
import { User, Shield, Briefcase, Camera, Save, MapPin, Mail, Calendar, Phone } from "lucide-react";

export function Profile({ user, api, flash }) {
    const [activeTab, setActiveTab] = useState("general");
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
        // Always send required fields with their values
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
        <div className="max-w-5xl mx-auto pb-12">
            {/* Hero Banner Area */}
            <div className="relative rounded-[2rem] bg-slate-950 overflow-hidden mb-8 shadow-2xl shadow-slate-300/50">
                {/* Beautiful Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-800/40 via-emerald-900/30 to-slate-900/80"></div>
                
                {/* Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-10" 
                    style={{ 
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
                        backgroundSize: '24px 24px' 
                    }}
                ></div>
                
                <div className="relative px-8 pt-24 pb-8 sm:px-12 flex flex-col sm:flex-row items-end gap-6 sm:gap-8">
                    {/* Profile Picture */}
                    <div className="relative group shrink-0 translate-y-2">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-800">
                            {profilePictureFile ? (
                                <img src={URL.createObjectURL(profilePictureFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : user.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-800 text-5xl font-black">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                            )}
                        </div>
                        {/* Custom File Upload Overlay */}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer rounded-full backdrop-blur-sm">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-wider">Change</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)} 
                            />
                        </label>
                    </div>

                    <div className="flex-1 mb-3 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight mb-2">
                            {user.firstName} {user.lastName}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-semibold text-slate-200">
                            <div className="flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                <Mail className="w-4 h-4 text-teal-300" /> {user.email}
                            </div>
                            {user.city && (
                                <div className="flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                    <MapPin className="w-4 h-4 text-teal-300" /> {user.city}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-teal-500/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-teal-500/30 text-teal-100">
                                <span className="uppercase tracking-widest text-[10px] font-black">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                {/* Sidebar Tabs */}
                <nav className="flex flex-col gap-2">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${activeTab === 'general' ? 'bg-teal-700 text-white shadow-xl shadow-teal-700/20 translate-x-2' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 bg-white shadow-sm'}`}
                    >
                        <User className="w-5 h-5" />
                        General Information
                    </button>
                    <button 
                        onClick={() => setActiveTab('professional')}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${activeTab === 'professional' ? 'bg-teal-700 text-white shadow-xl shadow-teal-700/20 translate-x-2' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 bg-white shadow-sm'}`}
                    >
                        <Briefcase className="w-5 h-5" />
                        Professional Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${activeTab === 'security' ? 'bg-teal-700 text-white shadow-xl shadow-teal-700/20 translate-x-2' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 bg-white shadow-sm'}`}
                    >
                        <Shield className="w-5 h-5" />
                        Security & Login
                    </button>
                </nav>

                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            <Panel title="Personal Information">
                                <div className="grid gap-6 sm:grid-cols-2 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">First Name</label>
                                        <input className="input" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name</label>
                                        <input className="input" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input className="input pl-11" placeholder="johndoe123" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input className="input pl-11" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input className="input pl-11" placeholder="E.g. San Francisco" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="date" className="input pl-11" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Biography</label>
                                        <textarea className="input min-h-[120px] resize-y leading-relaxed" placeholder="Tell everyone a little about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                                    <button onClick={handleUpdate} className="btn flex items-center gap-2 px-8">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </Panel>
                        </div>
                    )}

                    {/* Professional Tab */}
                    {activeTab === 'professional' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            <Panel title="Professional Details">
                                <div className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Education Background</label>
                                        <input className="input" placeholder="e.g. B.S. Computer Science, University of Technology" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Qualifications & Certifications</label>
                                        <textarea className="input min-h-[100px]" placeholder="List your professional certifications, degrees, and awards..." value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Work Experience</label>
                                        <textarea className="input min-h-[140px]" placeholder="Detail your past roles, responsibilities, and achievements..." value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                                    </div>
                                    
                                    {user.role === "instructor" && (
                                        <div className="mt-8 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900">Payment Information</h4>
                                                    <p className="text-xs font-semibold text-teal-700">Required for instructor payouts</p>
                                                </div>
                                            </div>
                                            <textarea className="input bg-white/80 border-teal-200 focus:border-teal-500 focus:ring-teal-200" placeholder="Enter your UPI ID or bank account details..." value={formData.payment_details} onChange={(e) => setFormData({...formData, payment_details: e.target.value})} />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                                    <button onClick={handleUpdate} className="btn flex items-center gap-2 px-8">
                                        <Save className="w-4 h-4" /> Save Professional Info
                                    </button>
                                </div>
                            </Panel>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            <Panel title="Security & Password">
                                <div className="max-w-md space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Password</label>
                                        <input type="password" className="input font-mono" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">New Password</label>
                                        <input type="password" className="input font-mono" placeholder="••••••••" disabled={!currentPassword} value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} />
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={handleUpdate} className="btn w-full flex items-center justify-center gap-2" disabled={!currentPassword || !formData.new_password}>
                                            <Shield className="w-4 h-4" /> Update Password
                                        </button>
                                    </div>
                                </div>
                            </Panel>
                            
                            <div className="mt-6 p-6 bg-amber-50 rounded-[1.5rem] border border-amber-200/60 flex items-start gap-4">
                                <div className="p-3 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-amber-950 mb-1">Account Protection Tips</h4>
                                    <p className="text-sm font-medium text-amber-800 leading-relaxed">Ensure your password is at least 8 characters long and contains a mix of letters, numbers, and symbols. We recommend using a password manager to keep your credentials secure.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
