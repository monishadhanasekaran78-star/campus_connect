import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { clubService } from '../../services/api';

export const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        clubService.getClubs(),
        clubService.getMyClubs().catch(() => ({ data: { memberships: [] } })),
      ]);

      if (allRes.data.success) setClubs(allRes.data.clubs || []);
      if (myRes.data?.success) setMyMemberships(myRes.data.memberships || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (clubId: string) => {
    setJoiningId(clubId);
    setSuccessMsg('');
    try {
      const res = await clubService.joinClub(clubId);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Joined club successfully!');
        fetchClubs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error joining club');
    } finally {
      setJoiningId(null);
    }
  };

  const isMember = (clubId: string) => {
    return myMemberships.some((m) => m.clubId === clubId);
  };

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
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          Student Clubs & Professional Societies
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Participate in technical societies, cultural guilds, robotics labs, and student-led campus initiatives.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => {
          const joined = isMember(club._id);

          return (
            <div
              key={club._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    {club.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{club.membersCount} Members</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{club.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{club.description}</p>

                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <p>
                    <span className="font-semibold text-slate-700">Faculty Lead:</span>{' '}
                    {club.facultyCoordinator}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Student Lead:</span>{' '}
                    {club.studentCoordinator}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center pt-1">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {club.meetingSchedule}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {joined ? (
                  <span className="w-full block text-center py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                    ✓ Active Member
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoin(club._id)}
                    disabled={joiningId === club._id}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {joiningId === club._id ? 'Joining...' : 'Join Club'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
