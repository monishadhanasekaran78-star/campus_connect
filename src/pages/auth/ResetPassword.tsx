import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { authService } from '../../services/api';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>(emailParam);

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsTokenValid(false);
        setTokenError('No password reset token was provided. Please use the link sent to your KIOT email.');
        return;
      }

      try {
        const res = await authService.verifyResetToken(token, emailParam);
        if (res.data.success) {
          setIsTokenValid(true);
          if (res.data.email) setUserEmail(res.data.email);
        } else {
          setIsTokenValid(false);
          setTokenError(res.data.message || 'Invalid or expired password reset link.');
        }
      } catch (err: any) {
        setIsTokenValid(false);
        setTokenError(
          err.response?.data?.message ||
          'This password reset link is invalid or has expired. Please request a new one.'
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        setIsSuccess(true);
      } else {
        setError(res.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Unable to complete password reset. The link may have expired or was already used.';
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
          Create New Institutional Password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {isVerifying ? (
            /* Verifying State */
            <div className="text-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">Verifying Security Token...</div>
              <p className="text-xs text-slate-500">
                Checking token cryptographic validity with KIOT security service.
              </p>
            </div>
          ) : !isTokenValid ? (
            /* Invalid/Expired Token State */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Invalid or Expired Link</h3>
                <p className="mt-2 text-xs text-slate-600 max-w-sm mx-auto">
                  {tokenError || 'This password reset link is invalid, expired, or has already been used.'}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left">
                <strong>Why did this happen?</strong>
                <ul className="mt-1 list-disc list-inside space-y-1 text-slate-600">
                  <li>Security tokens expire automatically after 15 minutes.</li>
                  <li>Each link can only be used once to protect your KIOT account.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/forgot-password"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <span>Request New Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Return to KIOT Login
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Password Reset Success State */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Password Reset Successful</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Your KIOT CampusConnect password has been securely updated in MongoDB.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center space-x-2 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your reset token has been invalidated. You can now log in using your new password.</span>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20"
                >
                  <span>Proceed to KIOT Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Set New Password Form */
            <>
              {userEmail && (
                <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account:</span>
                  <span className="font-mono font-bold text-slate-900">{userEmail}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <div className="mt-1 text-[11px]">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald-600 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passwords match</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Updating KIOT Password...' : 'UPDATE PASSWORD'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Cancel and Return to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
