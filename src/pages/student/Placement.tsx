import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Calendar, CheckCircle2, Clock, ArrowRight, Award } from 'lucide-react';
import { placementService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Placement: React.FC = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        placementService.getDrives(),
        placementService.getMyApplications(),
      ]);

      if (drivesRes.data.success) {
        setDrives(drivesRes.data.drives || []);
      }
      if (appsRes.data.success) {
        setApplications(appsRes.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId: string) => {
    setApplyingId(driveId);
    setSuccessMsg('');
    try {
      const res = await placementService.applyForDrive(driveId);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Application submitted successfully!');
        fetchPlacementData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error applying for placement drive');
    } finally {
      setApplyingId(null);
    }
  };

  const isApplied = (driveId: string) => {
    return applications.some((app) => app.driveId === driveId);
  };

  const stagesList = [
    'Applied',
    'Shortlisted',
    'Aptitude Round',
    'Technical Round',
    'HR Round',
    'Selected',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
          Campus Placement & Career Drives
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Explore campus recruitment drives, submit job applications, and monitor round-by-round selection progression.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: My Active Applications & Timeline Tracker */}
      {applications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            My Application Progress Tracking
          </h2>

          <div className="space-y-4">
            {applications.map((app) => {
              const currentStageIndex = stagesList.indexOf(app.currentStage);
              const isSelected = app.currentStage === 'Selected';
              const isRejected = app.currentStage === 'Not Selected';

              return (
                <div key={app._id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <h3 className="font-bold text-base text-slate-900">{app.companyName}</h3>
                        <StatusBadge status={app.currentStage} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.jobRole} • <span className="font-bold text-blue-700">{app.packageLPA} LPA</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {/* Visual Stage Progress Stepper */}
                  {!isRejected ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {stagesList.map((st, idx) => {
                          const isDone = currentStageIndex >= idx;
                          const isCurrent = currentStageIndex === idx;

                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg text-center border font-semibold ${
                                isCurrent
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                  : isDone
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="text-[10px] uppercase font-bold opacity-80">Round {idx + 1}</div>
                              <div className="text-xs mt-0.5 truncate">{st}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 font-semibold">
                      Application concluded: Not Selected in this cycle.
                    </div>
                  )}

                  {/* Stage Activity Log */}
                  {app.statusHistory?.length > 0 && (
                    <div className="pt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Latest Progress Notes:
                      </p>
                      {app.statusHistory.slice(-2).map((item: any, i: number) => (
                        <p key={i} className="text-xs">
                          • <span className="font-bold text-slate-700">[{item.date}] {item.stage}:</span> {item.remarks}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Available Placement Drives */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Available Campus Placement Drives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drives.map((drive) => {
            const alreadyApplied = isApplied(drive._id);

            return (
              <div
                key={drive._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{drive.companyName}</h3>
                      <p className="text-xs font-semibold text-blue-600">{drive.jobRole}</p>
                    </div>
                    <span className="font-black text-lg text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                      {drive.packageLPA} LPA
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {drive.jobDescription}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <p className="flex items-center">
                      <span className="w-24 font-semibold text-slate-700">Eligibility:</span>
                      Min {drive.eligibilityCriteria?.minCgpa} CGPA •{' '}
                      {drive.eligibilityCriteria?.departments?.join(', ')}
                    </p>
                    <p className="flex items-center">
                      <span className="w-24 font-semibold text-slate-700">Drive Date:</span>
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {drive.driveDate} ({drive.driveType})
                    </p>
                    <p className="flex items-center">
                      <span className="w-24 font-semibold text-slate-700">Deadline:</span>
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {drive.applicationDeadline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {drive.location}
                  </span>

                  {alreadyApplied ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      ✓ Already Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(drive._id)}
                      disabled={applyingId === drive._id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                    >
                      {applyingId === drive._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
