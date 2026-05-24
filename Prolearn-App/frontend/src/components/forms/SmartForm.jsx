import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function SmartForm({ title, button, fields, defaults = {}, onSubmit }) {
    const [values, setValues] = useState(defaults);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState({});
    
    async function submit(event) {
        event.preventDefault();
        try {
            setError("");
            await onSubmit(values);
            setValues(defaults);
        } catch (err) {
            setError(err.message.includes("JSON") ? "Lessons and quiz fields must be valid JSON." : err.message);
        }
    }
    
    return (
        <form className="panel space-y-3" onSubmit={submit}>
            <h2 className="section-title">{title}</h2>
            {fields.map((field) => {
                let name, placeholder, type = "text", required = true;
                if (Array.isArray(field)) {
                    [name, placeholder, type = "text"] = field;
                } else {
                    ({ name, placeholder, type = "text", required = true } = field);
                }
                
                const labelWithStar = required ? (
                    <span className="flex items-center gap-1">
                        <span>{placeholder}</span>
                        <span className="text-red-600 font-bold">*</span>
                    </span>
                ) : placeholder;
                
                const isPassword = type === "password";
                
                if (type === "textarea") {
                    return (
                        <div key={name}>
                            {required && <label className="text-sm font-semibold text-slate-700 mb-1 block">{labelWithStar}</label>}
                            <textarea 
                                className="input min-h-28" 
                                placeholder={placeholder} 
                                value={values[name] || ""} 
                                onChange={(e) => setValues({ ...values, [name]: e.target.value })} 
                                required={required}
                            />
                        </div>
                    );
                } else if (type === "checkbox") {
                    return (
                        <label key={name} className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={values[name] || false} 
                                onChange={(e) => setValues({ ...values, [name]: e.target.checked })} 
                                required={required}
                            />
                            <span className="text-slate-700">{labelWithStar}</span>
                        </label>
                    );
                } else if (isPassword) {
                    return (
                        <div key={name} className="relative">
                            {required && <label className="text-sm font-semibold text-slate-700 mb-1 block">{labelWithStar}</label>}
                            <input 
                                className="input pr-12" 
                                type={showPassword[name] ? "text" : "password"} 
                                placeholder={placeholder} 
                                value={values[name] || ""} 
                                onChange={(e) => setValues({ ...values, [name]: e.target.value })} 
                                required={required}
                            />
                            <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                onClick={() => setShowPassword({ ...showPassword, [name]: !showPassword[name] })}
                            >
                                {showPassword[name] ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    );
                } else {
                    return (
                        <div key={name}>
                            {required && <label className="text-sm font-semibold text-slate-700 mb-1 block">{labelWithStar}</label>}
                            <input 
                                className="input" 
                                type={type} 
                                placeholder={placeholder} 
                                value={values[name] || ""} 
                                onChange={(e) => setValues({ ...values, [name]: e.target.value })} 
                                required={required}
                            />
                        </div>
                    );
                }
            })}
            {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
            <button className="btn w-full">{button}</button>
        </form>
    );
}
