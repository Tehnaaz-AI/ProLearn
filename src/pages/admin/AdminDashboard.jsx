import DashboardLayout from "../../layouts/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
      <p className="mt-4 text-blue-700">
        Welcome Admin! Manage users, instructors, courses, and payments here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-blue-800">Instructor Requests</h3>
          <p className="text-sm text-blue-600">Approve or reject instructor applications.</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-blue-800">Users</h3>
          <p className="text-sm text-blue-600">View and manage all users.</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-blue-800">Payments</h3>
          <p className="text-sm text-blue-600">Monitor payment history and transactions.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
