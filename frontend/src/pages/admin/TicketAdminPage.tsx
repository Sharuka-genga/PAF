import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { adminAPI } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { User } from '../../types';
import AdminLayout from '../../components/layouts/AdminLayout';
import PremiumTopbar from '../../components/ui/PremiumTopbar';

const AdminTicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [assignMap, setAssignMap] = useState<Record<string, string>>({});
    const [statusMap, setStatusMap] = useState<Record<number, string>>({});
    const [notesMap, setNotesMap] = useState<Record<number, string>>({});

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        loadTickets();
        loadTechnicians();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await ticketService.getAllTickets();
            setTickets(data);
        } catch (err) {
            console.error('Failed to load tickets', err);
        }
    };

    //     //console
    //     const loadTechnicians = async () => {
    //         try {
    //             const res = await userAPI.getAllUsers();

    //             // ADD THIS HERE (IMPORTANT)
    //             console.log("RAW USERS RESPONSE:", res.data);

    //             const techs = res.data.data.filter((u: any) =>
    //                 u.roles?.includes('TECHNICIAN')
    //             );

    //             // OPTIONAL DEBUG
    //             console.log("FILTERED TECHNICIANS:", techs);

    //             setTechnicians(techs);
    //         } catch (err) {
    //             console.error('Failed to load technicians', err);
    //         }
    //     };
    //     try {
    //         const res = await userAPI.getAllUsers();

    //         const techs = res.data.data.filter((u: any) =>
    //             u.roles?.includes('TECHNICIAN')
    //         );

    //         setTechnicians(techs);
    //     } catch (err) {
    //         console.error('Failed to load technicians', err);
    //         setTechnicians([]); // prevent crash
    //     }
    // };
    const loadTechnicians = async () => {
        try {
            const res = await adminAPI.getAllUsers();

            console.log("RAW USERS RESPONSE:", res.data);

            const users = res?.data?.data || [];

            const techs = users.filter((u: any) => {
                const roles = u.roles;

                if (!roles) return false;

                // handle all possible formats
                if (Array.isArray(roles)) {
                    return roles.includes('TECHNICIAN') ||
                        roles.some((r: any) => r.name === 'TECHNICIAN');
                }

                return roles === 'TECHNICIAN';
            });

            console.log("FILTERED TECHNICIANS:", techs);

            setTechnicians(techs);
        } catch (err) {
            console.error('Failed to load technicians', err);
            setTechnicians([]); // prevent crash
        }
    };

    // const assignTech = async (ticketId: number) => {
    //     const technicianId = assignMap[ticketId];

    //     if (!technicianId) {
    //         alert('Select technician first');
    //         return;
    //     }

    //     try {
    //         await ticketService.assignTechnician(ticketId, technicianId);
    //         await loadTickets();
    //     } catch (err) {
    //         console.error('Assignment failed', err);
    //     }
    // };

    const assignTech = async (ticketId: number) => {
        const ticket = tickets.find((t) => t.id === ticketId);
        const key = String(ticketId);

        const technicianId =
            assignMap[key] ??
            ticket?.assignedToUserId;

        if (!technicianId) {
            alert('Select technician first');
            return;
        }

        try {
            await ticketService.assignTechnician(ticketId, technicianId);
            await loadTickets();
        } catch (err) {
            console.error('Assignment failed', err);
        }
    };

    // const updateStatus = async (ticketId: number) => {
    //     const status = statusMap[ticketId];
    //     const notes = notesMap[ticketId];

    //     if (!status) {
    //         alert('Select status');
    //         return;
    //     }

    //     try {
    //         await ticketService.updateTicketStatus(ticketId, status, notes);
    //         await loadTickets();
    //     } catch (err) {
    //         console.error('Status update failed', err);
    //     }
    // };

    const updateStatus = async (ticketId: number) => {
        const ticket = tickets.find(t => t.id === ticketId);

        const status =
            statusMap[ticketId] ??
            ticket?.status;

        const notes = notesMap[ticketId] ?? '';

        if (!status) {
            alert('Select status');
            return;
        }

        try {
            await ticketService.updateTicketStatus(ticketId, status, notes);
            await loadTickets();
        } catch (err) {
            console.error('Status update failed', err);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'IN_PROGRESS': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200';
            case 'CLOSED': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <AdminLayout>
            <PremiumTopbar
                title="Ticket Management"
                subtitle="Assign technicians and manage workflow"
            />

            <main className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Header Card */}
                {/* <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800">
                        Admin Ticket Workflow Control
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage tickets from OPEN → IN_PROGRESS → RESOLVED → CLOSED or REJECTED
                    </p>
                </div> */}

                {/* stats display */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

                    {/* Title */}
                    <h1 className="text-xl font-bold text-gray-800">
                        Incident Ticket Dashboard
                    </h1>

                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Monitor and manage incident lifecycle across the system
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-5 gap-3">

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-400">TOTAL</p>
                            <p className="text-xl font-bold text-gray-800">{tickets.length}</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs text-blue-500">OPEN</p>
                            <p className="text-xl font-bold text-blue-700">
                                {tickets.filter(t => t.status === 'OPEN').length}
                            </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <p className="text-xs text-purple-500">IN PROGRESS</p>
                            <p className="text-xl font-bold text-purple-700">
                                {tickets.filter(t => t.status === 'IN_PROGRESS').length}
                            </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-500">RESOLVED</p>
                            <p className="text-xl font-bold text-green-700">
                                {tickets.filter(t => t.status === 'RESOLVED').length}
                            </p>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-500">CLOSED</p>
                            <p className="text-xl font-bold text-gray-700">
                                {tickets.filter(t => t.status === 'CLOSED').length}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Tickets Grid */}
                <div className="grid grid-cols-1 gap-5">
                    {tickets.map((t) => {
                        const id = t.id as number;
                        const ticketKey = String(t.id);

                        return (
                            <div
                                key={id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                            >

                                {/* Top Row */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {t.title}
                                        </h2>
                                        <p className="text-sm text-gray-500">{t.description}</p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${statusColor(t.status)}`}>
                                        {t.status}
                                    </span>
                                </div>

                                {/* Ticket Images Preview */}
                                {(t.image1 || t.image2 || t.image3) && (
                                    <div className="flex gap-3 mt-4 flex-wrap">
                                        {[t.image1, t.image2, t.image3]
                                            .filter(Boolean)
                                            .map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt={`ticket-${i}`}
                                                    onClick={() => setPreviewImage(img!)}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://dummyimage.com/200x200/e5e7eb/6b7280&text=No+Image';
                                                    }}
                                                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:scale-105 transition"
                                                />
                                            ))}
                                    </div>
                                )}

                                {/* Info Row */}
                                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                                    <div>
                                        <p className="text-gray-400 text-xs">Category</p>
                                        <p>{t.category}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-xs">Priority</p>
                                        <p>{t.priority}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-xs">Assigned</p>
                                        <p>{t.assignedToUserId || 'Unassigned'}</p>
                                    </div>
                                </div>

                                {/* Assign Technician */}
                                <div className="flex gap-2 mb-3">
                                    <select
                                        value={assignMap[ticketKey] ?? t.assignedToUserId ?? ''}
                                        onChange={(e) =>
                                            setAssignMap({
                                                ...assignMap,
                                                [ticketKey]: e.target.value,
                                            })
                                        }
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                    >
                                        <option value="">Select Technician</option>
                                        {technicians.map((tech) => (
                                            <option key={tech.id} value={tech.id}>
                                                {tech.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => assignTech(id)}
                                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                                    >
                                        Assign
                                    </button>
                                </div>




                                {/* Status Update */}
                                <div className="flex gap-2">
                                    <select
                                        value={statusMap[id] || t.status}
                                        onChange={(e) =>
                                            setStatusMap({
                                                ...statusMap,
                                                [id]: e.target.value,
                                            })
                                        }
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Resolution notes"
                                        value={notesMap[id] || ''}
                                        onChange={(e) =>
                                            setNotesMap({
                                                ...notesMap,
                                                [id]: e.target.value,
                                            })
                                        }
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                    />

                                    <button
                                        onClick={() => updateStatus(id)}
                                        className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700"
                                    >
                                        Update
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                    {previewImage && (
                        <div
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                            onClick={() => setPreviewImage(null)}
                        >
                            <img
                                src={previewImage}
                                className="max-w-4xl max-h-[90vh] rounded-lg shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </div>

            </main>
        </AdminLayout>
    );
};

export default AdminTicketsPage;

