import { Panel } from "../components/common/Panel";

export function AboutUsPage({ setRoute }) {
    return (
        <section className="mx-auto max-w-4xl">
            <div className="panel mb-5 bg-slate-950 text-white">
                <div className="pill">About ProLearn</div>
                <h2 className="mt-5 text-4xl font-black">Our Story</h2>
            </div>
            <Panel title="Created by B.Tech Second Year Students">
                <div className="space-y-6 text-slate-700">
                    <p className="text-lg">
                        ProLearn is a modern learning platform developed by passionate second‑year B.Tech students.
                        Our goal is to make quality education accessible to everyone through an intuitive, user‑friendly platform.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-teal-50 p-6 border border-teal-200">
                            <h3 className="text-xl font-bold text-teal-800">What We Offer</h3>
                            <ul className="mt-3 space-y-2 text-teal-700">
                                <li>✓ Interactive video courses</li>
                                <li>✓ Quiz assessments for learning</li>
                                <li>✓ Certificates of completion</li>
                                <li>✓ Instructor dashboard</li>
                                <li>✓ Admin management tools</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Our Vision</h3>
                            <p className="mt-3 text-slate-700">
                                We believe in democratizing education by providing a platform where anyone can learn
                                and teach. Our platform supports both students and instructors, creating a vibrant
                                learning community.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button className="btn" onClick={() => setRoute("courses")}>Explore Courses</button>
                    </div>
                </div>
            </Panel>
        </section>
    );
}
