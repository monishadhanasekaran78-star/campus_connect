import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Mail,
  AlertCircle,
  CheckCircle2,
  Building2,
  Clock,
  KeyRound
} from 'lucide-react';
import { authService } from '../../services/api';

export const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as 'student' | 'faculty' | 'admin') || 'student';

  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your registered KIOT email address.');
      return;
    }

    if (!cleanEmail.endsWith('@kiot.ac.in')) {
      setError('Please use your official KIOT email address ending with @kiot.ac.in.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({
        email: cleanEmail,
        role
      });

      if (res.data.success) {
        setSubmittedEmail(cleanEmail);
        setSuccessMessage(res.data.message || 'Password reset link sent successfully.');
      } else {
        setError(res.data.message || 'Failed to request password reset. Please try again.');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Unable to process password reset request. Please check your email address.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* KIOT Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
          <KeyRound className="w-9 h-9" />
        </div>

        <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Knowledge Institute of Technology</span>
        </div>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 font-sans">
          CAMPUS<span className="text-blue-600">CONNECT</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Account Password Recovery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {successMessage ? (
            /* Success State */
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Reset Link Dispatched</h3>
                <p className="mt-1 text-xs text-slate-600">
                  A cryptographically secure password reset link has been sent to:
                </p>
                <div className="mt-2 inline-block px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-200">
                  {submittedEmail}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left space-y-2 text-xs text-blue-900">
                <div className="flex items-center space-x-2 font-bold text-blue-800">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Important Instructions</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Open your <strong>KIOT Institutional Gmail</strong> inbox.</li>
                  <li>Click the secure link inside the email to set your new password.</li>
                  <li>The reset link is single-use and will expire in <strong>15 minutes</strong>.</li>
                  <li>If you do not see the email, please check your Spam/Junk folder.</li>
                </ul>
              </div>

              <div className="pt-4 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage('');
                    setEmail('');
                  }}
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Request Another Link
                </button>
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to KIOT Login</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Request Form */
            <>
              {/* Role Selection Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Account Type:
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setError('');
                    }}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'student'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('faculty');
                      setError('');
                    }}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'faculty'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                    Faculty
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('admin');
                      setError('');
                    }}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'admin'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Admin
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered KIOT Institutional Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'student'
                          ? 'e.g. 2k24cse114@kiot.ac.in'
                          : role === 'faculty'
                          ? 'e.g. facultyname@kiot.ac.in'
                          : 'e.g. admin@kiot.ac.in'
                      }
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>A single-use reset link will be dispatched to your KIOT inbox.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying & Dispatching Email...' : 'SEND RESET LINK'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
