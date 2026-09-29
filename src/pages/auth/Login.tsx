import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Shield, User as UserIcon, Lock, ArrowRight, AlertCircle, Building2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: 'student' | 'faculty' | 'admin') => {
    setRole(newRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your KIOT email address and password');
      return;
    }

    // Client-side domain check for instant feedback
    if (!cleanEmail.endsWith('@kiot.ac.in')) {
      setError('Please use your official KIOT email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login(cleanEmail, password, role);
      if (result.success && result.redirectUrl) {
        navigate(result.redirectUrl);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* KIOT Institutional Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
          <GraduationCap className="w-9 h-9" />
        </div>

        <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Knowledge Institute of Technology</span>
        </div>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 font-sans">
          CAMPUS<span className="text-blue-600">CONNECT</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Official KIOT College Community & Academic Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {/* Main 3 Login Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Login As:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
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
                onClick={() => handleRoleChange('faculty')}
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
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
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Admin
              </button>
            </div>
            {role === 'faculty' && (
              <p className="mt-2 text-[11px] text-center text-slate-500 italic">
                * Faculty sub-role (Mentor or Class Advisor) is automatically authenticated.
              </p>
            )}
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'student'
                  ? 'Official KIOT Student Email'
                  : role === 'faculty'
                  ? 'Official KIOT Faculty Email'
                  : 'Authorized Administrator Email'}
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
              <p className="mt-1 text-[11px] text-slate-500">
                Official KIOT domain: <span className="font-semibold text-slate-700">@kiot.ac.in</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  to={`/forgot-password?role=${role}`}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying KIOT Credentials...' : 'LOGIN TO KIOT PORTAL'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Security & Access Restriction Notice */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Restricted institutional access for authorized KIOT members only.</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Accounts are provisioned by KIOT Administration. Public registration is not permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
