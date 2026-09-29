import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Search, CheckCircle2, XCircle, KeyRound, Edit, Power, Shield } from 'lucide-react';
import { adminService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [facultyType, setFacultyType] = useState<'mentor' | 'advisor'>('mentor');
  const [registerNumber, setRegisterNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('Computer Science and Engineering');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({ role: roleFilter || undefined });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    try {
      const res = await adminService.createUser({
        name,
        email,
        password,
        role,
        facultyType: role === 'faculty' ? facultyType : undefined,
        registerNumber: role === 'student' ? registerNumber : undefined,
        department,
        phone,
      });

      if (res.data.success) {
        setSuccessMsg(`User ${name} created successfully.`);
        setIsCreateOpen(false);
        setName('');
        setEmail('');
        setRegisterNumber('');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await adminService.toggleStatus(id);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPass = window.prompt('Enter new password for this KIOT user:', 'Kiot@2026');
    if (!newPass) return;
    try {
      const res = await adminService.resetPassword(id, newPass);
      if (res.data.success) {
        alert('Password has been updated successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.registerNumber?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <UserCog className="w-6 h-6 mr-2 text-rose-600" />
            Institutional User Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Provision, modify, and audit Student, Faculty (Mentor/Advisor), and Administrator credentials.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex space-x-2">
          {[
            { label: 'All Roles', value: '' },
            { label: 'Students', value: 'student' },
            { label: 'Faculty', value: 'faculty' },
            { label: 'Admins', value: 'admin' },
          ].map((rf) => (
            <button
              key={rf.value}
              onClick={() => setRoleFilter(rf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                roleFilter === rf.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Role / Sub-Role</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Administrative Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                    {u.registerNumber && (
                      <p className="font-mono text-[10px] text-blue-700 font-semibold">{u.registerNumber}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'faculty'
                          ? u.facultyType === 'advisor'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {u.role === 'faculty'
                        ? u.facultyType === 'advisor'
                          ? 'Faculty: Advisor'
                          : 'Faculty: Mentor'
                        : u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.department || 'General'}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleResetPassword(u._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                        title="Reset User Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-emerald-600 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision New CampusConnect User"
        subtitle="Create student, faculty mentor/advisor, or administrator accounts"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar or John Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email (@kiot.ac.in) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@kiot.ac.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {role === 'faculty' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Sub-Role *</label>
                <select
                  value={facultyType}
                  onChange={(e: any) => setFacultyType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                >
                  <option value="mentor">Mentor</option>
                  <option value="advisor">Class Advisor</option>
                </select>
              </div>
            )}

            {role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Register Number *</label>
                <input
                  type="text"
                  required
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. 717822P105"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication</option>
                <option value="Administration">College Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98401 00000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
