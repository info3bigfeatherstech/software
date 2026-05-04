// TABS/SETTINGS/UsersTab.jsx
// User management — create users, assign roles, deactivate (never delete — audit trail).
import React, { useState, useEffect } from "react";

const INITIAL_USERS = [
    { id: "USR-001", name: "Raj Arora", email: "raj@bizpro.in", phone: "9876543210", role: "owner", shop: "all", isActive: true, createdAt: "2024-01-01" },
    { id: "USR-002", name: "Priya Sharma", email: "priya@bizpro.in", phone: "9876543211", role: "accountant", shop: "all", isActive: true, createdAt: "2024-01-15" },
    { id: "USR-003", name: "Rohit Kumar", email: "rohit@bizpro.in", phone: "9876543212", role: "sales_manager", shop: "SHP-001", isActive: true, createdAt: "2024-02-01" },
    { id: "USR-004", name: "Anjali Singh", email: "anjali@bizpro.in", phone: "9876543213", role: "cashier", shop: "SHP-002", isActive: true, createdAt: "2024-02-15" },
    { id: "USR-005", name: "Suresh Verma", email: "suresh@bizpro.in", phone: "9876543214", role: "inventory_manager", shop: "WH-001", isActive: false, createdAt: "2024-03-01" },
    { id: "USR-006", name: "Meena Gupta", email: "meena@bizpro.in", phone: "9876543215", role: "wh_manager", shop: "WH-002", isActive: true, createdAt: "2024-03-15" },
];

const ROLES = [
    { id: "owner", label: "Super Admin / Owner", color: "bg-purple-100 text-purple-700" },
    { id: "accountant", label: "Accountant", color: "bg-blue-100 text-blue-700" },
    { id: "sales_manager", label: "Sales Manager", color: "bg-green-100 text-green-700" },
    { id: "cashier", label: "Cashier / Billing Staff", color: "bg-yellow-100 text-yellow-700" },
    { id: "inventory_manager", label: "Stock Lister", color: "bg-orange-100 text-orange-700" },
    { id: "wh_manager", label: "Warehouse Manager", color: "bg-indigo-100 text-indigo-700" },
];

const SK = "vyapar_users";
const load = () => { const s = localStorage.getItem(SK); if (s) return JSON.parse(s); localStorage.setItem(SK, JSON.stringify(INITIAL_USERS)); return INITIAL_USERS; };
const save = (d) => localStorage.setItem(SK, JSON.stringify(d));

const getRoleBadge = (roleId) => {
    const r = ROLES.find(r => r.id === roleId);
    return r ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span> : <span className="text-xs text-gray-400">{roleId}</span>;
};

export default function UsersTab() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [form, setForm] = useState({ name: "", email: "", phone: "", role: "cashier", shop: "all" });

    useEffect(() => setUsers(load()), []);

    const filteredUsers = users.filter(u => {
        const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const saveUser = () => {
        if (!form.name || !form.email || !form.phone || !form.role) { alert("All fields required."); return; }
        const allUsers = load();
        const newUser = { id: `USR-${Date.now()}`, ...form, isActive: true, createdAt: new Date().toISOString().split("T")[0] };
        save([...allUsers, newUser]);
        setUsers(prev => [...prev, newUser]);
        setForm({ name: "", email: "", phone: "", role: "cashier", shop: "all" });
        setShowForm(false);
        alert("✅ User created!");
    };

    const toggleActive = (id) => {
        const allUsers = load();
        const updated = allUsers.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
        save(updated);
        setUsers(updated);
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        byRole: ROLES.map(r => ({ ...r, count: users.filter(u => u.role === r.id).length })),
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Users & Roles</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Deactivate users instead of deleting — audit trail must be preserved</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ Add User</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Active</p>
                    <p className="text-3xl font-bold mt-1">{stats.active}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">By Role</p>
                    <div className="space-y-1">
                        {stats.byRole.filter(r => r.count > 0).map(r => (
                            <div key={r.id} className="flex items-center justify-between text-xs">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.color}`}>{r.label}</span>
                                <span className="font-semibold text-gray-700">{r.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Create New User</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Amit Sharma" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Email *</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@bizpro.in" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="98XXXXXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Role *</label>
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Assigned Shop / Warehouse</label>
                            <input value={form.shop} onChange={e => setForm(f => ({ ...f, shop: e.target.value }))} placeholder="SHP-001, WH-001, or 'all'" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={saveUser} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Create User</button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="all">All Roles</option>
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["User", "Contact", "Role", "Assigned To", "Created", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? "opacity-60" : ""}`}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{u.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-medium text-gray-800">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    <p className="text-gray-600">{u.email}</p>
                                    <p className="text-gray-400 mt-0.5">{u.phone}</p>
                                </td>
                                <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                                <td className="px-4 py-3 text-xs font-mono text-gray-500">{u.shop}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{u.createdAt}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {u.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleActive(u.id)}
                                        className={`text-xs font-medium cursor-pointer ${u.isActive ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}>
                                        {u.isActive ? "Deactivate" : "Reactivate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
