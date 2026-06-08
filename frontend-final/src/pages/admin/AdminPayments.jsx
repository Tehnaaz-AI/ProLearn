import { useEffect, useState } from "react";
import { Panel } from "../../components/common/Panel";
import { List } from "../../components/ui/List";
import { Detail } from "../../components/ui/Detail";
import { Info } from "../../components/ui/Info";
import { SectionHeader } from "../../components/ui/SectionHeader";

export function AdminPayments({ api, flash }) {
    const [payments, setPayments] = useState([]);
    const [revenueStats, setRevenueStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api("/admin/payments").then((data) => setPayments(data.payments || [])),
            api("/admin/revenue-stats").then((data) => setRevenueStats(data))
        ]).catch((err) => flash(err.message, "error"))
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading payment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {revenueStats && (
                <Panel title="Revenue Overview">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold text-slate-600">Total Revenue</div>
                            <div className="mt-2 text-3xl font-black text-teal-700">INR {revenueStats.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold text-slate-600">Admin Commission</div>
                            <div className="mt-2 text-3xl font-black text-blue-700">INR {revenueStats.totalAdminRevenue.toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold text-slate-600">Instructor Payouts</div>
                            <div className="mt-2 text-3xl font-black text-purple-700">INR {revenueStats.totalInstructorRevenue.toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold text-slate-600">Total Payments</div>
                            <div className="mt-2 text-3xl font-black text-amber-700">{revenueStats.totalPayments}</div>
                        </div>
                    </div>
                    {revenueStats.monthlyStats.length > 0 && (
                        <div className="mt-6">
                            <SectionHeader title="Monthly Revenue" text="Revenue breakdown per month" />
                            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {revenueStats.monthlyStats.map((stat) => (
                                    <div key={stat.month} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="font-bold text-lg">{stat.month}</div>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-600">Total Revenue:</span><span className="font-semibold">INR {stat.totalRevenue.toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-600">Admin:</span><span className="font-semibold">INR {stat.adminRevenue.toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-600">Instructor:</span><span className="font-semibold">INR {stat.instructorRevenue.toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-600">Payments:</span><span className="font-semibold">{stat.paymentCount}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>
            )}
            <Panel title="Payments and commission">
                <List items={payments} empty="No payments yet." render={(p) => (
                    <div className="grid gap-3 md:grid-cols-4">
                        <Detail label="Course" value={p.title} />
                        <Detail label="Student" value={p.student} />
                        <Detail label="Instructor payout 95%" value={`INR ${p.instructor_amount}`} />
                        <Detail label="Admin commission 5%" value={`INR ${p.admin_amount}`} />
                    </div>
                )} />
            </Panel>
        </div>
    );
}
