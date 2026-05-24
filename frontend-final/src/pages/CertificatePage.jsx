import { useState, useEffect } from "react";
import { Panel } from "../components/common/Panel";

export function CertificatePage({ course, user, api, flash, refresh, setRoute }) {
    const [certificate, setCertificate] = useState(null);

    useEffect(() => {
        async function loadCertificate() {
            try {
                const data = await api(`/courses/${course.id}/certificate`);
                setCertificate(data.certificate);
            } catch (err) {
                flash(err.message, "error");
                setRoute(`course/${course.id}`);
            }
        }
        loadCertificate();
    }, [course.id]);

    const downloadCertificate = () => {
        if (!certificate?.certificateImageUrl) return;
        const a = document.createElement("a");
        a.href = certificate.certificateImageUrl;
        a.download = `ProLearn-Certificate-${course.title.replace(/\s+/g, "-")}.jpg`;
        a.target = "_blank";
        a.click();
    };

    return (
        <div className="space-y-6">
            <section className="panel overflow-hidden">
                <div>
                    <span className="tag-teal">Certificate</span>
                    <h2 className="mt-4 text-4xl font-black">Course Certificate</h2>
                    <p className="mt-3 text-slate-600">Congratulations on completing {course.title}!</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button className="btn-secondary" onClick={() => setRoute(`course/${course.id}`)}>Back to Course</button>
                        {certificate?.certificateImageUrl && <button className="btn" onClick={downloadCertificate}>Download JPEG Certificate</button>}
                    </div>
                </div>
            </section>

            {certificate && (
                <Panel title="Your Certificate">
                    {certificate.certificateImageUrl ? (
                        <div className="flex justify-center">
                            <img 
                                src={certificate.certificateImageUrl} 
                                alt="Certificate" 
                                className="max-w-full rounded-2xl shadow-2xl"
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border-4 border-teal-700 bg-white p-8 text-center">
                            <h1 className="text-3xl font-black text-teal-700">ProLearn Certificate of Completion</h1>
                            <p className="mt-8 text-lg text-slate-700">This certifies that</p>
                            <h2 className="mt-4 text-5xl font-black text-slate-950">{certificate.userName}</h2>
                            <p className="mt-8 text-lg text-slate-700">has successfully completed the course</p>
                            <h3 className="mt-4 text-3xl font-bold text-slate-800">{certificate.courseTitle}</h3>
                            <p className="mt-8 text-lg text-slate-700">
                                with a score of <span className="font-black text-teal-700">{certificate.score}/{certificate.total}</span>
                            </p>
                            <p className="mt-8 text-sm text-slate-500">
                                Issued on: {new Date(certificate.issuedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </Panel>
            )}
        </div>
    );
}
