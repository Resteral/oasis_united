'use client';

import { useState } from 'react';

// Mock type for development
type Appointment = {
    id: string;
    customerName: string;
    service: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
};

export default function AppointmentsPage() {
    const [appointments] = useState<Appointment[]>([
        {
            id: '1',
            customerName: 'Alice Johnson',
            service: 'Consultation',
            time: '2023-10-27 10:00 AM',
            status: 'confirmed',
        },
        {
            id: '2',
            customerName: 'Bob Smith',
            service: 'Follow-up',
            time: '2023-10-27 11:30 AM',
            status: 'pending',
        },
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Appointments</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    New Appointment
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((apt) => (
                            <tr key={apt.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{apt.customerName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {apt.service}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {apt.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
