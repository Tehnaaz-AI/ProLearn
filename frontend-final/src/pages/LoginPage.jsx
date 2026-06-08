import { useState } from "react";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export function LoginPage({ login, setRoute }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await login(formData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-teal-900/20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-800/40 via-emerald-900/30 to-slate-900/80"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-200 backdrop-blur-md mb-4">
                        <ShieldCheck className="w-3.5 h-3.5" /> Secure Access
                    </div>
                    <h2 className="text-4xl font-black tracking-tight drop-shadow-sm mb-2">Welcome back.</h2>
                    <p className="text-slate-300 font-medium">Use your registered account credentials to securely log in to your dashboard.</p>
                </div>
            </div>

            {/* Login Form Panel */}
            <div className="panel bg-white/80 backdrop-blur-xl border border-white p-8 shadow-xl shadow-slate-200/50">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="email"
                                className="input pl-12 h-14" 
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                            <span className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer transition-colors">Forgot?</span>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="input pl-12 pr-12 h-14 font-mono" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button 
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn w-full h-14 mt-4 flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Log in to Dashboard <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                    Don't have an account yet?{' '}
                    <button 
                        className="font-black text-teal-700 hover:text-teal-800 underline decoration-2 underline-offset-4 transition-colors" 
                        onClick={() => setRoute("register")}
                    >
                        Register for free
                    </button>
                </p>
            </div>
        </section>
    );
}
