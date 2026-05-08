import DashboardLayout from "../../layouts/DashboardLayout";

function PaymentsOverview() {
  return (
    <DashboardLayout>
      <h2 className="text-xl font-semibold text-blue-900">Payments Overview</h2>
      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2">User</th>
            <th className="p-2">Course</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Alice</td>
            <td className="p-2">Machine Learning Basics</td>
            <td className="p-2">₹999</td>
            <td className="p-2 text-green-700">Success</td>
            <td className="p-2">2026-05-01</td>
          </tr>
          <tr>
            <td className="p-2">Bob</td>
            <td className="p-2">Advanced DBMS</td>
            <td className="p-2">₹499</td>
            <td className="p-2 text-red-700">Failed</td>
            <td className="p-2">2026-05-02</td>
          </tr>
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default PaymentsOverview;
