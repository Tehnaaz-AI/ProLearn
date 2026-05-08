import DashboardLayout from "../../layouts/DashboardLayout";

function ManageUsers() {
  return (
    <DashboardLayout>
      <h2 className="text-xl font-semibold text-blue-900">Manage Users</h2>
      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2">User</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Alice</td>
            <td className="p-2">Student</td>
            <td className="p-2">Active</td>
            <td className="p-2">
              <button className="bg-red-600 text-white px-3 py-1 rounded">Block</button>
            </td>
          </tr>
          <tr>
            <td className="p-2">Bob</td>
            <td className="p-2">Instructor</td>
            <td className="p-2">Blocked</td>
            <td className="p-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded">Unblock</button>
            </td>
          </tr>
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default ManageUsers;
