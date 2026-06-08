import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Camera, Calendar, Briefcase, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Panel } from "../components/common/Panel";

const countryCities = {
    "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Firozabad"],
    "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington"],
    "United Kingdom": ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Leeds", "Sheffield", "Edinburgh", "Leicester", "Coventry", "Nottingham", "Bradford", "Cardiff", "Belfast"],
    "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Oshawa", "Windsor"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Wollongong", "Geelong", "Hobart", "Townsville", "Cairns", "Darwin", "Launceston"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg"],
    "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon"],
    "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste"],
    "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen", "Enschede", "Haarlem", "Arnhem", "Zaanstad", "Amersfoort"]
};

export function RegisterPage({ api, flash, setRoute }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const countries = Object.keys(countryCities);
    const cities = formData.country ? countryCities[formData.country] : [];

    // Local handlers for inputs
    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            flash("Passwords do not match.", "error");
            return;
        }
        setStep(2);
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        if (!formData.phone || !formData.country || !formData.city) {
            flash("Phone number, country, and city are required.", "error");
            return;
        }
        setStep(3);
    };

    const handleStep3Submit = async (e) => {
        e.preventDefault();
        if (!formData.termsAndConditions) {
            flash("You must agree to the terms and conditions.", "error");
            return;
        }
        
        setIsLoading(true);
        try {
            const { termsAndConditions, confirmPassword, ...rest } = formData;
            const body = new FormData();
            Object.entries(rest).forEach(([key, value]) => {
                if (value) body.append(key, value);
            });
            if (profilePicture) {
                body.append("profilePicture", profilePicture);
            }
            
            await api("/register", { method: "POST", body });
            flash("Account created. Please login.");
            setRoute("login");
        } catch (err) {
            flash(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-10 text-white shadow-2xl shadow-teal-900/20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-800/40 via-emerald-900/30 to-slate-900/80"></div>
                
                <div className="relative z-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Join ProLearn
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm mb-6">Create an account.</h2>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto sm:mx-0">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1">
                                <div className={`h-2.5 rounded-full transition-all duration-500 ${i < step ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" : i === step ? "bg-teal-500" : "bg-slate-800"}`} />
                                <div className={`text-[10px] font-bold uppercase tracking-widest mt-2 text-center transition-colors ${i <= step ? "text-teal-100" : "text-slate-500"}`}>
                                    {i === 1 ? 'Personal' : i === 2 ? 'Contact' : 'Education'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="panel bg-white/80 backdrop-blur-xl border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-5 animate-in fade-in duration-500">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <User className="w-5 h-5 text-teal-600" /> Personal Details
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">First Name <span className="text-red-500">*</span></label>
                                <input className="input h-12" placeholder="John" value={formData.firstName || ""} onChange={(e) => handleChange("firstName", e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Last Name <span className="text-red-500">*</span></label>
                                <input className="input h-12" placeholder="Doe" value={formData.lastName || ""} onChange={(e) => handleChange("lastName", e.target.value)} required />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Username <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input className="input pl-11 h-12" placeholder="johndoe123" value={formData.username || ""} onChange={(e) => handleChange("username", e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" className="input pl-11 h-12" placeholder="name@example.com" value={formData.email || ""} onChange={(e) => handleChange("email", e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" className="input pl-11 h-12 font-mono" placeholder="••••••••" value={formData.password || ""} onChange={(e) => handleChange("password", e.target.value)} required minLength={6} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Confirm Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" className="input pl-11 h-12 font-mono" placeholder="••••••••" value={formData.confirmPassword || ""} onChange={(e) => handleChange("confirmPassword", e.target.value)} required minLength={6} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="btn h-12 px-8 flex items-center gap-2">Next Step <ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-teal-600" /> Contact Details
                            </h3>
                            <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Phone Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input className="input pl-11 h-12" placeholder="+1 (555) 000-0000" value={formData.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Country <span className="text-red-500">*</span></label>
                                    <select className="input h-12 bg-white" value={formData.country || ""} onChange={(e) => { handleChange("country", e.target.value); handleChange("city", ""); }} required>
                                        <option value="" disabled>Select country</option>
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {cities.length > 0 && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">City <span className="text-red-500">*</span></label>
                                        <select className="input h-12 bg-white" value={formData.city || ""} onChange={(e) => handleChange("city", e.target.value)} required>
                                            <option value="" disabled>Select city</option>
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Profile Picture (Optional)</label>
                                <div className="relative group cursor-pointer mt-1">
                                    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-teal-400 group-hover:bg-teal-50 transition-all">
                                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                                            <Camera className="w-6 h-6 text-slate-500 group-hover:text-teal-700" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">{profilePicture ? profilePicture.name : "Click to upload an image"}</p>
                                            <p className="text-xs text-slate-500 mt-1">JPG, PNG, or GIF up to 5MB</p>
                                        </div>
                                    </div>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="btn h-12 px-8 flex items-center gap-2">Next Step <ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleStep3Submit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-teal-600" /> Education Details
                            </h3>
                            <button type="button" onClick={() => setStep(2)} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="date" className="input pl-11 h-12" value={formData.dob || ""} onChange={(e) => handleChange("dob", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Education Background</label>
                                <input className="input h-12" placeholder="e.g. B.S. Computer Science" value={formData.education || ""} onChange={(e) => handleChange("education", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Qualifications</label>
                                <textarea className="input min-h-[80px]" placeholder="Certifications, awards, etc." value={formData.qualifications || ""} onChange={(e) => handleChange("qualifications", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Experience</label>
                                <textarea className="input min-h-[80px]" placeholder="Your work history and past roles..." value={formData.experience || ""} onChange={(e) => handleChange("experience", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Bio</label>
                                <textarea className="input min-h-[100px]" placeholder="Tell us about yourself..." value={formData.bio || ""} onChange={(e) => handleChange("bio", e.target.value)} />
                            </div>
                            
                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                                        checked={formData.termsAndConditions || false} 
                                        onChange={(e) => handleChange("termsAndConditions", e.target.checked)} 
                                        required 
                                    />
                                    <span className="text-sm text-slate-700 leading-relaxed font-medium">
                                        I agree to the <button type="button" className="text-teal-700 font-bold underline" onClick={() => setRoute("terms")}>Terms and Conditions</button> and acknowledge that I have read the Privacy Policy. <span className="text-red-500 font-bold">*</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="pt-6">
                            <button type="submit" disabled={isLoading} className="btn w-full h-14 text-base disabled:opacity-70 flex items-center justify-center">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Complete Registration"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                    Already have an account?{' '}
                    <button className="font-black text-teal-700 hover:text-teal-800 underline decoration-2 underline-offset-4 transition-colors" onClick={() => setRoute("login")}>
                        Log in here
                    </button>
                </p>
            </div>
        </section>
    );
}
