import { SmartForm } from "../components/forms/SmartForm";

export function LoginPage({ login, setRoute }) {
    return (
        <section className="mx-auto max-w-md">
            <div className="panel mb-5 bg-slate-950 text-white">
                <div className="pill">Secure access</div>
                <h2 className="mt-5 text-4xl font-black">Welcome back.</h2>
                <p className="mt-3 text-slate-300">Admin: admin@ProLearn.local / Admin@123.<br />Instructor: instructor@ProLearn.local / Instructor@123.</p>
            </div>
            <SmartForm title="Login" button="Login" fields={[["email", "Email", "email"], ["password", "Password", "password"]]} onSubmit={login} />
            <p className="mt-5 text-center text-slate-600">
                Don't have an account? <button className="font-bold text-teal-700 underline" onClick={() => setRoute("register")}>Register</button>
            </p>
        </section>
    );
}

import { Panel } from "../components/common/Panel";
