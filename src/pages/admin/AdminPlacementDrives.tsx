import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, Edit, Trash2, CheckCircle2, Award, Clock } from 'lucide-react';
import { placementService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const AdminPlacementDrives: React.FC = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Create Drive Modal
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [jobRole, setJobRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [packageLPA, setPackageLPA] = useState<number>(10);
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [driveDate, setDriveDate] = useState<string>('');
  const [location, setLocation] = useState<string>('Campus Placement Hall');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Update Stage Modal
  const [isStageModalOpen, setIsStageModalOpen] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [newStage, setNewStage] = useState<string>('Shortlisted');
  const [stageRemarks, setStageRemarks] = useState<string>('');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await placementService.getDrives();
      if (res.data.success) {
        setDrives(res.data.drives || []);
        if (res.data.drives?.length > 0 && !selectedDriveId) {
          fetchApplicants(res.data.drives[0]._id);
          setSelectedDriveId(res.data.drives[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (driveId: string) => {
    setSelectedDriveId(driveId);
    try {
      const res = await placementService.getAllApplications(driveId);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobRole || !driveDate) return;

    setSubmitting(true);
    try {
      const res = await placementService.createDrive({
        companyName,
        jobRole,
        jobDescription,
        packageLPA,
        minCgpa,
        driveDate,
        location,
      });

      if (res.data.success) {
        setSuccessMsg(`Placement drive for ${companyName} announced!`);
        setIsDriveModalOpen(false);
        setCompanyName('');
        setJobRole('');
        fetchDrives();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating drive');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStageUpdate = (app: any) => {
    setSelectedApp(app);
    setNewStage(app.currentStage);
    setStageRemarks('');
    setIsStageModalOpen(true);
  };

  const handleUpdateStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      const res = await placementService.updateStage(selectedApp._id, {
        stage: newStage,
        remarks: stageRemarks || `Candidate advanced to ${newStage}`,
      });

      if (res.data.success) {
        setSuccessMsg(`Updated ${selectedApp.studentName} to stage: ${newStage}`);
        setIsStageModalOpen(false);
        fetchApplicants(selectedDriveId);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating stage');
    } finally {
      setSubmitting(false);
    }
  };

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
            <Briefcase className="w-6 h-6 mr-2 text-rose-600" />
            Campus Placement Drives & Applicant Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Announce recruitment drives, audit applicant eligibility, and advance candidates through recruitment stages.
          </p>
        </div>

        <button
          onClick={() => setIsDriveModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Announce Placement Drive</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Drives Selection Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
        {drives.map((d) => (
          <button
            key={d._id}
            onClick={() => fetchApplicants(d._id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedDriveId === d._id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {d.companyName} ({d.packageLPA} LPA)
          </button>
        ))}
      </div>

      {/* Applicants Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-rose-600" />
            Registered Candidates for Selected Drive ({applications.length})
          </h2>
          <span className="text-xs font-semibold text-slate-400">Status Stage Transition Panel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-center">CGPA</th>
                <th className="px-4 py-3.5 text-center">Current Round</th>
                <th className="px-6 py-3.5">Application Date</th>
                <th className="px-6 py-3.5 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="font-mono text-[11px] font-bold text-blue-700">{app.registerNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{app.department}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">{app.cgpa}</td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={app.currentStage} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenStageUpdate(app)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Advance / Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No student applications submitted for this placement drive yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Placement Drive */}
      <Modal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        title="Announce Campus Placement Drive"
        subtitle="Specify hiring company, eligibility thresholds, and CTC compensation"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google India / Zoho Corporation"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation *</label>
              <input
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Software Development Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Package (CTC in LPA) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={packageLPA}
                onChange={(e) => setPackageLPA(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min CGPA Required</label>
              <input
                type="number"
                step="0.1"
                value={minCgpa}
                onChange={(e) => setMinCgpa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Drive Date *</label>
              <input
                type="date"
                required
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location / Venue</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Campus Placement Cell / Virtual"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Scope</label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Overview of duties, technical competencies required, and interview rounds..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Stage */}
      <Modal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        title="Update Candidate Placement Stage"
        subtitle={`Candidate: ${selectedApp?.studentName} • Drive: ${selectedApp?.companyName}`}
      >
        <form onSubmit={handleUpdateStageSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Stage *</label>
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Aptitude Round">Aptitude Round</option>
              <option value="Technical Round">Technical Round</option>
              <option value="HR Round">HR Round</option>
              <option value="Selected">Selected (Offer Conferred! 🎉)</option>
              <option value="Not Selected">Not Selected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stage Progression Notes</label>
            <textarea
              rows={3}
              value={stageRemarks}
              onChange={(e) => setStageRemarks(e.target.value)}
              placeholder="e.g. Cleared online coding assessment with 94% score. Scheduled for technical interview on Oct 12."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsStageModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Stage Transition'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
