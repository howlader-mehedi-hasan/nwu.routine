import React, { useState, useEffect } from 'react';
import {
    createFaculty, updateFaculty, deleteFaculty, getFaculty,
    createCourse, updateCourse, deleteCourse, getCourses,
    createRoom, updateRoom, deleteRoom, getRooms,
    createBatch, updateBatch, deleteBatch, getBatches
} from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import toast from 'react-hot-toast';
import { Users, BookOpen, MapPin, Layers, Save, Edit, Trash2, Copy, X, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('faculty');
    const [dataList, setDataList] = useState([]);
    const [rooms, setRooms] = useState([]); // For dropdowns
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Room Filter State
    const [showClassrooms, setShowClassrooms] = useState(true);

    const [showLabs, setShowLabs] = useState(true);

    // Faculty Filter State
    const [showPermanent, setShowPermanent] = useState(true);
    const [showGuest, setShowGuest] = useState(true);
    const [showAdjunct, setShowAdjunct] = useState(true);

    // Course Filter State
    const [showTheory, setShowTheory] = useState(true);
    const [showLabCourses, setShowLabCourses] = useState(true);

    // Initial Form States
    const initialFacultyForm = { name: '', initials: '', type: 'Permanent', email: '', phone: '', designation: 'Lecturer' };
    const initialCourseForm = { code: '', name: '', credit: 3.0, type: 'Theory', assigned_faculty_id: '' };
    const initialRoomForm = { room_number: '', capacity: 40, floor: 1, type: 'Theory' };
    const initialBatchForm = { name: '', section: 'A', default_room_id: '' };

    const [facultyForm, setFacultyForm] = useState(initialFacultyForm);
    const [courseForm, setCourseForm] = useState(initialCourseForm);
    const [roomForm, setRoomForm] = useState(initialRoomForm);
    const [batchForm, setBatchForm] = useState(initialBatchForm);

    // Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            let response;
            if (activeTab === 'faculty') response = await getFaculty();
            if (activeTab === 'courses') response = await getCourses();
            if (activeTab === 'rooms') response = await getRooms();
            if (activeTab === 'batches') {
                response = await getBatches();
                const roomsResponse = await getRooms();
                setRooms(roomsResponse.data || []);
            }

            setDataList(response.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        cancelEdit(); // Reset form on tab change
        setSearchQuery(''); // Reset search
    }, [activeTab]);

    // Handle Form Submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating...' : 'Saving...');
        try {
            if (activeTab === 'faculty') {
                editingId
                    ? await updateFaculty(editingId, facultyForm)
                    : await createFaculty(facultyForm);
            }
            if (activeTab === 'courses') {
                editingId
                    ? await updateCourse(editingId, courseForm)
                    : await createCourse(courseForm);
            }
            if (activeTab === 'rooms') {
                editingId
                    ? await updateRoom(editingId, roomForm)
                    : await createRoom(roomForm);
            }
            if (activeTab === 'batches') {
                editingId
                    ? await updateBatch(editingId, batchForm)
                    : await createBatch(batchForm);
            }

            toast.success(editingId ? 'Updated Successfully!' : 'Saved Successfully!', { id: loadingToast });
            fetchData();
            cancelEdit();
        } catch (err) {
            console.error(err);
            toast.error('Operation failed.', { id: loadingToast });
        }
    };

    // Actions
    const handleEdit = (item) => {
        setEditingId(item.id);
        if (activeTab === 'faculty') setFacultyForm(item);
        if (activeTab === 'courses') setCourseForm(item);
        if (activeTab === 'rooms') setRoomForm(item);
        if (activeTab === 'batches') setBatchForm(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDuplicate = (item) => {
        setEditingId(null);
        // Exclude ID to treat as new
        const { id, ...rest } = item;
        if (activeTab === 'faculty') setFacultyForm(rest);
        if (activeTab === 'courses') setCourseForm(rest);
        if (activeTab === 'rooms') setRoomForm(rest);
        if (activeTab === 'batches') setBatchForm(rest);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast('Data copied to form. Modify and Save.', { icon: '📋' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        const loadingToast = toast.loading('Deleting...');
        try {
            if (activeTab === 'faculty') await deleteFaculty(id);
            if (activeTab === 'courses') await deleteCourse(id);
            if (activeTab === 'rooms') await deleteRoom(id);
            if (activeTab === 'batches') await deleteBatch(id);

            toast.success('Deleted Successfully', { id: loadingToast });
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Delete failed.", { id: loadingToast });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFacultyForm(initialFacultyForm);
        setCourseForm(initialCourseForm);
        setRoomForm(initialRoomForm);
        setBatchForm(initialBatchForm);
    };

    const tabs = [
        { id: 'faculty', label: 'Faculty', icon: <Users size={18} /> },
        { id: 'courses', label: 'Courses', icon: <BookOpen size={18} /> },
        { id: 'rooms', label: 'Rooms', icon: <MapPin size={18} /> },
        { id: 'batches', label: 'Batches', icon: <Layers size={18} /> },
    ];

    return (
        <div className="w-full px-6 mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
                <p className="text-muted-foreground mt-1">Manage system data, schedule, and configurations.</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Horizontal Tab Selection */}
                <div className="w-full">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-2 flex flex-row gap-2 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full space-y-6">

                    {/* Input Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border border-border shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                {editingId ? <Edit size={18} className="text-indigo-500" /> : <Plus size={18} className="text-indigo-500" />}
                                {editingId ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                            </h3>
                            {editingId && (
                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                                    <X size={14} className="mr-1" /> Cancel
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'faculty' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField label="Full Name">
                                        <Input value={facultyForm.name} onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })} placeholder="Dr. Name" required />
                                    </FormField>
                                    <FormField label="Initials (Short Form)">
                                        <Input value={facultyForm.initials} onChange={e => setFacultyForm({ ...facultyForm, initials: e.target.value })} placeholder="DN" required />
                                    </FormField>
                                    <FormField label="Type">
                                        <Select value={facultyForm.type} onChange={e => setFacultyForm({ ...facultyForm, type: e.target.value })}>
                                            <option value="Permanent">Permanent</option>
                                            <option value="Guest">Guest</option>
                                            <option value="Adjunct">Adjunct</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Designation">
                                        <Select value={facultyForm.designation} onChange={e => setFacultyForm({ ...facultyForm, designation: e.target.value })}>
                                            <option value="Head of the Department">Head of the Department</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Associate Professor">Associate Professor</option>
                                            <option value="Assistant Professor">Assistant Professor</option>
                                            <option value="Senior Lecturer">Senior Lecturer</option>
                                            <option value="Lecturer">Lecturer</option>
                                            <option value="Junior Lecturer">Junior Lecturer</option>
                                            <option value="Adjunct Faculty">Adjunct Faculty</option>
                                        </Select>
                                    </FormField>
                                    <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                                        <FormField label="Email">
                                            <Input type="email" value={facultyForm.email} onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })} placeholder="email@example.com" required />
                                        </FormField>
                                        <FormField label="WhatsApp Number">
                                            <Input type="tel" value={facultyForm.phone} onChange={e => setFacultyForm({ ...facultyForm, phone: e.target.value })} placeholder="+88017..." />
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField label="Code">
                                        <Input
                                            value={courseForm.code}
                                            onChange={e => {
                                                const newCode = e.target.value;
                                                // Auto-detect type based on last digit
                                                // Extract numbers: CSE-1101 -> 1101
                                                const numbers = newCode.replace(/\D/g, '');
                                                let newType = courseForm.type;
                                                if (numbers.length > 0) {
                                                    const lastDigit = parseInt(numbers.slice(-1));
                                                    newType = (lastDigit % 2 === 0) ? 'Lab' : 'Theory';
                                                }
                                                setCourseForm({ ...courseForm, code: newCode, type: newType });
                                            }}
                                            placeholder="CSE-1101"
                                            required
                                        />
                                    </FormField>
                                    <FormField label="Type">
                                        <Select
                                            value={courseForm.type}
                                            onChange={e => setCourseForm({ ...courseForm, type: e.target.value })}
                                        >
                                            <option value="Theory">Theory</option>
                                            <option value="Lab">Lab</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Credits">
                                        <Input type="number" step="0.5" value={courseForm.credit} onChange={e => setCourseForm({ ...courseForm, credit: Number(e.target.value) })} required />
                                    </FormField>
                                    <FormField label="Assigned Faculty ID">
                                        <Input type="number" value={courseForm.assigned_faculty_id} onChange={e => setCourseForm({ ...courseForm, assigned_faculty_id: Number(e.target.value) })} required />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label="Course Name">
                                            <Input value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Course Name" required />
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rooms' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField label="Room No">
                                        <Input value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} placeholder="101" required />
                                    </FormField>
                                    <FormField label="Capacity">
                                        <Input type="number" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} required />
                                    </FormField>
                                    <FormField label="Floor">
                                        <Input type="number" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: Number(e.target.value) })} required />
                                    </FormField>
                                    <FormField label="Type">
                                        <Select
                                            value={roomForm.type}
                                            onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                                        >
                                            <option value="Theory">Classroom</option>
                                            <option value="Lab">Laboratory</option>
                                        </Select>
                                    </FormField>
                                </div>
                            )}

                            {activeTab === 'batches' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                                        <FormField label="Batch Name">
                                            <Input value={batchForm.name} onChange={e => setBatchForm({ ...batchForm, name: e.target.value })} placeholder="Batch-25" required />
                                        </FormField>
                                        <FormField label="Section">
                                            <Input value={batchForm.section} onChange={e => setBatchForm({ ...batchForm, section: e.target.value })} placeholder="A" required />
                                        </FormField>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormField label="Default Room">
                                            <Select
                                                value={batchForm.default_room_id}
                                                onChange={e => setBatchForm({ ...batchForm, default_room_id: e.target.value })}
                                            >
                                                <option value="">Select Room</option>
                                                {rooms.map(r => (
                                                    <option key={r.id} value={r.id}>Room {r.room_number}</option>
                                                ))}
                                            </Select>
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    {editingId ? "Update Record" : "Save Record"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Data List */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-foreground">
                                Existing Records ({
                                    activeTab === 'rooms'
                                        ? dataList.filter(item => (item.type === 'Theory' && showClassrooms) || (item.type === 'Lab' && showLabs)).length
                                        : activeTab === 'courses'
                                            ? dataList.filter(item => (item.type === 'Theory' && showTheory) || (item.type === 'Lab' && showLabCourses)).length
                                            : dataList.length
                                })
                            </h3>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                />
                            </div>

                            {/* Filters */}
                            {activeTab === 'faculty' && (
                                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border overflow-x-auto">
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={showPermanent}
                                            onChange={(e) => setShowPermanent(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            Permanent
                                        </span>
                                    </label>
                                    <div className="h-4 w-px bg-border"></div>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={showGuest}
                                            onChange={(e) => setShowGuest(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            Guest
                                        </span>
                                    </label>
                                    <div className="h-4 w-px bg-border"></div>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={showAdjunct}
                                            onChange={(e) => setShowAdjunct(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            Adjunct
                                        </span>
                                    </label>
                                </div>
                            )}

                            {activeTab === 'rooms' && (
                                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border">
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={showClassrooms}
                                            onChange={(e) => setShowClassrooms(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            Classrooms
                                        </span>
                                    </label>
                                    <div className="h-4 w-px bg-border"></div>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={showLabs}
                                            onChange={(e) => setShowLabs(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Laboratories
                                        </span>
                                    </label>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border">
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={showTheory}
                                            onChange={(e) => setShowTheory(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            Theory
                                        </span>
                                    </label>
                                    <div className="h-4 w-px bg-border"></div>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={showLabCourses}
                                            onChange={(e) => setShowLabCourses(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Lab
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading...</div>
                        ) : dataList.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border text-muted-foreground">
                                No records found. Add one above.
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                <AnimatePresence>
                                    {dataList.filter(item => {
                                        // 1. Filter by Search Query
                                        const query = searchQuery.toLowerCase();
                                        let matchesSearch = false;
                                        if (activeTab === 'faculty') {
                                            matchesSearch = item.name.toLowerCase().includes(query) ||
                                                item.initials.toLowerCase().includes(query) ||
                                                item.email.toLowerCase().includes(query);
                                        } else if (activeTab === 'courses') {
                                            matchesSearch = item.name.toLowerCase().includes(query) ||
                                                item.code.toLowerCase().includes(query);
                                        } else if (activeTab === 'rooms') {
                                            matchesSearch = item.room_number.toLowerCase().includes(query);
                                        } else if (activeTab === 'batches') {
                                            matchesSearch = item.name.toLowerCase().includes(query) ||
                                                item.section.toLowerCase().includes(query);
                                        }
                                        if (!matchesSearch) return false;

                                        // 2. Filter by Tab-specific toggles
                                        if (activeTab === 'faculty') {
                                            if (item.type === 'Permanent' && !showPermanent) return false;
                                            if (item.type === 'Guest' && !showGuest) return false;
                                            if (item.type === 'Adjunct' && !showAdjunct) return false;
                                        }
                                        if (activeTab === 'rooms') {
                                            if (item.type === 'Theory' && !showClassrooms) return false;
                                            if (item.type === 'Lab' && !showLabs) return false;
                                        }
                                        if (activeTab === 'courses') {
                                            if (item.type === 'Theory' && !showTheory) return false;
                                            if (item.type === 'Lab' && !showLabCourses) return false;
                                        }
                                        return true;
                                    }).map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between group transition-all hover:border-indigo-500/30 ${editingId === item.id ? 'ring-2 ring-indigo-500' : ''}`}
                                        >
                                            <div className="space-y-1 mb-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">ID: {item.id}</span>
                                                </div>

                                                {/* Dynamic Content Rendering */}
                                                {activeTab === 'faculty' && (
                                                    <>
                                                        <h4 className="font-semibold text-foreground">{item.name} ({item.initials})</h4>
                                                        <p className="text-sm text-muted-foreground font-medium text-indigo-600/80 dark:text-indigo-400/80 mb-0.5">{item.designation}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.type} • {item.email}
                                                            {item.phone && <span> • {item.phone}</span>}
                                                        </p>
                                                    </>
                                                )}
                                                {activeTab === 'courses' && (
                                                    <>
                                                        <h4 className="font-semibold text-foreground">{item.code}</h4>
                                                        <p className="text-sm text-foreground">{item.name}</p>
                                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                                            <span className="bg-muted px-1.5 py-0.5 rounded">{item.type}</span>
                                                            <span>Credits: {item.credit}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {activeTab === 'rooms' && (
                                                    <>
                                                        <h4 className="font-semibold text-foreground">Room {item.room_number}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.type === 'Theory' ? 'Classroom' : 'Laboratory'} • Capacity: {item.capacity} • Floor: {item.floor}
                                                        </p>
                                                    </>
                                                )}
                                                {activeTab === 'batches' && (
                                                    <>
                                                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Section: {item.section} • Room: {rooms.find(r => String(r.id) === String(item.default_room_id))?.room_number || 'N/A'}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="h-8 px-2 flex-1 text-xs">
                                                    <Edit size={14} className="mr-1.5" /> Edit
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDuplicate(item)} className="h-8 px-2 flex-1 text-xs">
                                                    <Copy size={14} className="mr-1.5" /> Copy
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormField = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {children}
    </div>
);

export default AdminPanel;
