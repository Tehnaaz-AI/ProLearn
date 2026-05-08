import DashboardLayout from "../../layouts/DashboardLayout";

function InstructorRequests() {
  return (
    <DashboardLayout>
      <h2 className="text-xl font-semibold text-blue-900">Instructor Applications</h2>
      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2">Name</th>
            <th className="p-2">Expertise</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">John Doe</td>
            <td className="p-2">AI/ML</td>
            <td className="p-2">Pending</td>
            <td className="p-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded mr-2">Approve</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default InstructorRequests;
