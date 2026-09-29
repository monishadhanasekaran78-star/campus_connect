import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = (val: string) => {
    switch (val) {
      // Success
      case 'Approved':
      case 'Mentor Approved':
      case 'Verified':
      case 'Completed':
      case 'Selected':
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      // Pending
      case 'Pending':
      case 'Pending Admin':
      case 'Pending Mentor':
      case 'Requested':
      case 'In Progress':
      case 'Applied':
      case 'Shortlisted':
      case 'Upcoming':
      case 'Ongoing':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // In-between / Tech Rounds
      case 'Aptitude Round':
      case 'Technical Round':
      case 'HR Round':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Rejection / Inactive
      case 'Rejected':
      case 'Admin Rejected':
      case 'Mentor Rejected':
      case 'Cancelled':
      case 'Not Selected':
      case 'Inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
