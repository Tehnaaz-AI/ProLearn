import { Panel } from "../components/common/Panel";

export function TermsAndConditionsPage({ setRoute }) {
    return (
        <section className="mx-auto max-w-4xl">
            <Panel title="Terms and Conditions">
                <div className="space-y-4 text-slate-700">
                    <h3 className="text-xl font-bold">1. Introduction</h3>
                    <p>Welcome to ProLearn! By using our platform, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use our service.</p>
                    
                    <h3 className="text-xl font-bold">2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.</p>
                    
                    <h3 className="text-xl font-bold">3. Course Content</h3>
                    <p>Instructors are responsible for the content they upload. We do not guarantee the accuracy, completeness, or usefulness of any course content. We reserve the right to remove any content that violates our policies.</p>
                    
                    <h3 className="text-xl font-bold">4. Payments</h3>
                    <p>All payments are processed securely. Refund policies vary by course. Please check the course details before enrolling.</p>
                    
                    <h3 className="text-xl font-bold">5. Termination</h3>
                    <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.</p>
                    
                    <h3 className="text-xl font-bold">6. Changes to Terms</h3>
                    <p>We may revise these terms from time to time. By continuing to use the service after those revisions become effective, you agree to be bound by the revised terms.</p>
                    
                </div>
            </Panel>
        </section>
    );
}
