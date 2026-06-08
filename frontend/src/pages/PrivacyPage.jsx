import { Panel } from "../components/common/Panel";

export function PrivacyPage() {
    return (
        <section className="mx-auto max-w-4xl">
            <Panel title="Privacy Policy">
                <div className="space-y-4 text-slate-700">
                    <h3 className="text-xl font-bold">1. Introduction</h3>
                    <p>ProLearn collects and uses your information to provide its services, improve the platform, and communicate with you. We respect your privacy and only process data in accordance with this policy.</p>

                    <h3 className="text-xl font-bold">2. Data Collection</h3>
                    <p>We collect account details, course progress, and support information. Payment and billing data are processed securely by trusted third-party providers and are not stored in plain text on our platform.</p>

                    <h3 className="text-xl font-bold">3. Use of Information</h3>
                    <p>Your information is used to deliver personalized learning experiences, display course progress, and send notifications for account activity. We do not sell your personal data to third parties.</p>

                    <h3 className="text-xl font-bold">4. Cookies</h3>
                    <p>We use cookies to maintain your login session, remember preferences, and collect basic usage analytics. You can manage cookie settings through your browser.</p>

                    <h3 className="text-xl font-bold">5. Security</h3>
                    <p>We protect your account with industry-standard security practices. However, no system is completely secure, so please keep your password confidential and report suspicious activity immediately.</p>

                    <h3 className="text-xl font-bold">6. Changes to Policy</h3>
                    <p>We may update this privacy policy over time. Continued use of the platform after changes are posted means you agree to the revised policy.</p>
                </div>
            </Panel>
        </section>
    );
}
