import { useState } from "react";
import { SmartForm } from "../components/forms/SmartForm";
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

    const personalFields = [
        { name: "firstName", placeholder: "First name", required: true },
        { name: "lastName", placeholder: "Last name", required: true },
        { name: "username", placeholder: "Username", required: true },
        { name: "email", placeholder: "Email", type: "email", required: true },
        { name: "password", placeholder: "Password", type: "password", required: true },
        { name: "confirmPassword", placeholder: "Confirm password", type: "password", required: true }
    ];

    const educationFields = [
        { name: "dob", placeholder: "Date of birth", type: "date", required: false },
        { name: "education", placeholder: "Education", required: false },
        { name: "qualifications", placeholder: "Qualifications", type: "textarea", required: false },
        { name: "experience", placeholder: "Experience", type: "textarea", required: false },
        { name: "bio", placeholder: "Bio", type: "textarea", required: false },
        { name: "termsAndConditions", placeholder: "I agree to the terms and conditions", type: "checkbox", required: true }
    ];

    const countries = Object.keys(countryCities);
    const cities = formData.country ? countryCities[formData.country] : [];

    async function handleStep1Submit(data) {
        if (data.password !== data.confirmPassword) {
            flash("Passwords do not match.", "error");
            return;
        }
        setFormData({ ...formData, ...data });
        setStep(2);
    }

    async function handleStep2Submit() {
        if (!formData.phone || !formData.country || !formData.city) {
            flash("Phone number, country, and city are required.", "error");
            return;
        }
        setStep(3);
    }

    async function handleStep3Submit(data) {
        try {
            const finalData = { ...formData, ...data };
            if (!finalData.termsAndConditions) {
                flash("You must agree to the terms and conditions.", "error");
                return;
            }
            const { termsAndConditions, confirmPassword, ...rest } = finalData;
            
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
        }
    }

    return (
        <section className="mx-auto max-w-xl">
            <div className="panel mb-5 bg-slate-950 text-white">
                <div className="pill">Join ProLearn</div>
                <h2 className="mt-5 text-4xl font-black">Create an account.</h2>
                <div className="mt-4 flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className={`h-2 flex-1 rounded-full ${i < step ? "bg-teal-500" : i === step ? "bg-teal-700" : "bg-slate-700"}`}
                        />
                    ))}
                </div>
            </div>
            
            {step === 1 && (
                <>
                    <SmartForm title="Personal Details" button="Next" fields={personalFields} onSubmit={handleStep1Submit} defaults={formData} />
                </>
            )}
            
            {step === 2 && (
                <>
                    <div className="flex gap-2 mb-5">
                        <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                    </div>
                    <Panel title="Contact Details">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                    Phone number <span className="text-red-600 font-bold">*</span>
                                </label>
                                <input 
                                    className="input" 
                                    placeholder="Phone number" 
                                    value={formData.phone || ""} 
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                    Country <span className="text-red-600 font-bold">*</span>
                                </label>
                                <select 
                                    className="input" 
                                    value={formData.country || ""} 
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value, city: "" })} 
                                    required
                                >
                                    <option value="">Select country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            {cities.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block flex items-center gap-1">
                                        City <span className="text-red-600 font-bold">*</span>
                                    </label>
                                    <select 
                                        className="input" 
                                        value={formData.city || ""} 
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                                        required
                                    >
                                        <option value="">Select city</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Profile picture (optional)</label>
                                <input 
                                    className="input mt-1" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} 
                                />
                            </div>
                        </div>
                        <button className="btn w-full mt-3" onClick={handleStep2Submit}>Next</button>
                    </Panel>
                </>
            )}
            
            {step === 3 && (
                <>
                    <div className="flex gap-2 mb-5">
                        <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                    </div>
                    <SmartForm title="Education Details" button="Create account" fields={educationFields} onSubmit={handleStep3Submit} defaults={formData} />
                </>
            )}
            
            <p className="mt-5 text-center text-slate-600">
                Read our <button className="font-bold text-teal-700 underline" onClick={() => setRoute("terms")}>Terms and Conditions</button> before registering.
            </p>
            <p className="mt-5 text-center text-slate-600">
                Already have an account? <button className="font-bold text-teal-700 underline" onClick={() => setRoute("login")}>Login</button>
            </p>
        </section>
    );
}

