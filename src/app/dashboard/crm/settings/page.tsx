'use client';

import { useState } from 'react';

export default function CRMSettingsPage() {
    const [enabled, setEnabled] = useState(true);
    const [duration, setDuration] = useState(30);
    const [customFields, setCustomFields] = useState<{ id: string; label: string; type: string }[]>([
        { id: '1', label: 'Allergies', type: 'text' }
    ]);

    const addField = () => {
        setCustomFields([...customFields, { id: Date.now().toString(), label: '', type: 'text' }]);
    };

    const removeField = (id: string) => {
        setCustomFields(customFields.filter(f => f.id !== id));
    };

    const updateField = (id: string, key: 'label' | 'type', value: string) => {
        setCustomFields(customFields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">CRM Settings</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Appointments Configuration</h2>

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="enable-appointments"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-appointments" className="ml-2 block text-sm text-gray-900">
                        Enable Appointment Booking
                    </label>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Slot Duration (minutes)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Custom Customer Information</h2>
                    <button
                        onClick={addField}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                    >
                        + Add Field
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Define questions to ask customers when they book an appointment.
                </p>

                <div className="space-y-4">
                    {customFields.map((field) => (
                        <div key={field.id} className="flex gap-4 items-start border p-4 rounded bg-gray-50">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Question Label</label>
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                    placeholder="e.g., Do you have any allergies?"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Input Type</label>
                                <select
                                    value={field.type}
                                    onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="text">Text (One line)</option>
                                    <option value="textarea">Long Text</option>
                                    <option value="select">Selection</option>
                                </select>
                            </div>
                            <button
                                onClick={() => removeField(field.id)}
                                className="mt-6 text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow">
                    Save Settings
                </button>
            </div>
        </div>
    );
}
