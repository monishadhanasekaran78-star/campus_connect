import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { mentorService } from '../../../services/api';

export const MentorSlots: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await mentorService.getSlots();
      if (res.data.success) {
        setSlots(res.data.availableSlots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setSlots([
      ...slots,
      { day: 'Monday', startTime: '10:00 AM', endTime: '11:30 AM', isAvailable: true }
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await mentorService.updateSlots(slots);
      if (res.data.success) {
        setSuccessMsg('Available meeting slots updated and published to students!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating slots');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-emerald-600" />
            Mentor Office Hours & Consultation Slots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure weekly recurring time slots when mentees can book consultations.
          </p>
        </div>

        <button
          onClick={handleAddSlot}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weekly Slot</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Slots List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        {slots.length > 0 ? (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Day</label>
                    <select
                      value={slot.day}
                      onChange={(e) => handleChange(index, 'day', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time</label>
                    <input
                      type="text"
                      value={slot.startTime}
                      onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Time</label>
                    <input
                      type="text"
                      value={slot.endTime}
                      onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end sm:pt-4">
                  <button
                    onClick={() => handleRemoveSlot(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No consultation slots added. Click "Add Weekly Slot" to schedule available office hours.
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Slots'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
