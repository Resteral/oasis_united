import Link from 'next/link';

export default function CRMDashboard() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">CRM Dashboard</h1>
                <div className="space-x-4">
                    <Link
                        href="/dashboard/crm/appointments"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        View Appointments
                    </Link>
                    <Link
                        href="/dashboard/crm/integrations"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Integrations
                    </Link>
                    <Link
                        href="/dashboard/crm/settings"
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                        Settings
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Upcoming Appointments</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                    <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">New Leads</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                    <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Messages</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                    <p className="text-sm text-gray-500 mt-1">Unread</p>
                </div>
            </div>

            {/* Quick Actions / Recent Activity placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="text-center text-gray-500 py-8">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
}
