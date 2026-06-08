import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Calendar, Briefcase, FileText, CheckCircle2, Lock, ChevronRight, Settings } from "lucide-react";

export function SmartForm({ title, button, fields, defaults = {}, onSubmit }) {
    const [values, setValues] = useState(defaults);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    async function submit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            setError("");
            await onSubmit(values);
            setValues(defaults);
        } catch (err) {
            setError(err.message.includes("JSON") ? "Lessons and quiz fields must be valid JSON." : err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const getIconForField = (name, type) => {
        if (type === 'password') return Lock;
        if (type === 'email' || name.toLowerCase().includes('email')) return Mail;
        if (type === 'date' || name.toLowerCase().includes('dob')) return Calendar;
        if (name.toLowerCase().includes('name') || name.toLowerCase().includes('user')) return User;
        if (name.toLowerCase().includes('experience') || name.toLowerCase().includes('job')) return Briefcase;
        return Settings;
    };
    
    return (
        <form className="space-y-6" onSubmit={submit}>
            {title && (
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                </div>
            )}
            
            <div className="grid gap-6 sm:grid-cols-2">
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
                            <span className="text-red-500 font-bold">*</span>
                        </span>
                    ) : placeholder;
                    
                    const isPassword = type === "password";
                    const isTextarea = type === "textarea";
                    const isCheckbox = type === "checkbox";
                    const FieldIcon = getIconForField(name, type);
                    
                    if (isTextarea) {
                        return (
                            <div key={name} className="sm:col-span-2 space-y-2 group">
                                {required && <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">{labelWithStar}</label>}
                                <textarea 
                                    className="input min-h-[120px] resize-y" 
                                    placeholder={`Enter ${placeholder.toLowerCase()}...`} 
                                    value={values[name] || ""} 
                                    onChange={(e) => setValues({ ...values, [name]: e.target.value })} 
                                    required={required}
                                />
                            </div>
                        );
                    } else if (isCheckbox) {
                        return (
                            <div key={name} className="sm:col-span-2 mt-2 p-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
                                        checked={values[name] || false} 
                                        onChange={(e) => setValues({ ...values, [name]: e.target.checked })} 
                                        required={required}
                                    />
                                    <span className="text-sm font-semibold text-slate-700 leading-relaxed group-hover:text-slate-900">{labelWithStar}</span>
                                </label>
                            </div>
                        );
                    } else {
                        return (
                            <div key={name} className={`space-y-2 group ${name.toLowerCase().includes('email') || name.toLowerCase().includes('password') || name.toLowerCase().includes('username') ? 'sm:col-span-2' : ''}`}>
                                {required && <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 transition-colors">{labelWithStar}</label>}
                                <div className="relative">
                                    <FieldIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input 
                                        className={`input pl-11 h-12 ${isPassword ? 'pr-12 font-mono' : ''}`} 
                                        type={isPassword ? (showPassword[name] ? "text" : "password") : type} 
                                        placeholder={isPassword ? "••••••••" : placeholder} 
                                        value={values[name] || ""} 
                                        onChange={(e) => setValues({ ...values, [name]: e.target.value })} 
                                        required={required}
                                    />
                                    {isPassword && (
                                        <button 
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            onClick={() => setShowPassword({ ...showPassword, [name]: !showPassword[name] })}
                                        >
                                            {showPassword[name] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in zoom-in-95">
                    <span className="font-bold text-sm">{error}</span>
                </div>
            )}
            
            <div className="pt-4 flex justify-end">
                <button 
                    type="submit" 
                    className="btn h-14 px-8 w-full sm:w-auto flex items-center justify-center gap-2 text-base disabled:opacity-70"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <CheckCircle2 size={20} />
                            {button}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
