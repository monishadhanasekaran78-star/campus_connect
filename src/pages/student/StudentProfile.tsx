import React, { useState, useEffect } from 'react';
import { UserCheck, Save, CheckCircle2, AlertCircle, Building2, Phone, Mail, MapPin, Bus, Home } from 'lucide-react';
import { studentService } from '../../services/api';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form editable fields
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [residenceType, setResidenceType] = useState<'Hosteller' | 'Day Scholar'>('Day Scholar');
  const [transportDetails, setTransportDetails] = useState<string>('');
  const [dob, setDob] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentService.getProfile();
      if (res.data.success) {
        const p = res.data.profile;
        setProfile(p);
        setMentor(res.data.mentor);
        setAdvisor(res.data.advisor);

        setPhone(p.phone || '');
        setAddress(p.address || '');
        setResidenceType(p.residenceType || 'Day Scholar');
        setTransportDetails(p.transportDetails || '');
        setDob(p.dob || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await studentService.updateProfile({
        phone,
        address,
        residenceType,
        transportDetails,
        dob,
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
          My Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View official academic registry details and update your personal contact info.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-start space-x-2 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic Badges & Mentorship */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-600/20">
              {profile?.name?.charAt(0) || 'S'}
            </div>
            <h2 className="mt-3 font-bold text-base text-slate-900">{profile?.name}</h2>
            <p className="text-xs font-mono font-semibold text-blue-600 mt-0.5">
              {profile?.registerNumber}
            </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              Year {profile?.year} • Section {profile?.section}
            </div>
          </div>

          {/* Assigned Faculty details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Mentor
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {mentor?.name || profile?.mentorName || 'Unassigned'}
              </p>
              <p className="text-[11px] text-slate-500">{mentor?.department || 'Faculty Mentor'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Class Advisor
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {advisor?.name || profile?.advisorName || 'Unassigned'}
              </p>
              <p className="text-[11px] text-slate-500">{advisor?.department || 'Class Advisor'}</p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Editable & Permanent Fields */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Official Academic Records (Read-Only)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Register Number
                </label>
                <input
                  type="text"
                  value={profile?.registerNumber || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Institutional Email
                </label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={profile?.department || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-4">
              Personal & Contact Information (Editable)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Residence Status
                </label>
                <select
                  value={residenceType}
                  onChange={(e: any) => setResidenceType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hosteller">Hosteller</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transport Details
                </label>
                <input
                  type="text"
                  value={transportDetails}
                  onChange={(e) => setTransportDetails(e.target.value)}
                  placeholder="e.g. Bus Route 12 or Self Transport"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Permanent Residential Address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Door No, Street Name, City, State, PIN"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
