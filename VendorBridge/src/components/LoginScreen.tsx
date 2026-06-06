import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data';
import { Shield, Key, Building2, UserCheck, Briefcase } from 'lucide-react';
import { isValidEmail } from '../utils';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpVendorCategory, setSignUpVendorCategory] = useState('Heavy Machinery & Parts');
  const [error, setError] = useState('');

  const handleDemoSignIn = (user: User) => {
    onLogin(user);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!signUpName.trim()) {
        setError('Please enter your Organization / Supplier Name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter a corporate email address.');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please specify a valid corporate email schema (e.g. name@company.com).');
        return;
      }
      if (!password || password.length < 6) {
        setError('Security password is required and must be at least 6 characters long.');
        return;
      }
      const newUser: User = {
        id: 'u_' + Date.now(),
        name: signUpName.trim(),
        email: email.trim(),
        role: role,
        ...(role === 'vendor' ? { vendorId: 'v1' } : {})
      };
      onLogin(newUser);
    } else {
      if (!email.trim() || !password) {
        setError('Both email and password are required.');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address schema (e.g. user@domain.com).');
        return;
      }
      const foundUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (foundUser) {
        onLogin(foundUser);
      } else {
        const mockUser: User = {
          id: 'u_' + Date.now(),
          name: email.trim().split('@')[0].toUpperCase(),
          email: email.trim(),
          role: role
        };
        onLogin(mockUser);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 relative" id="login-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-sm">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            VendorBridge
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 font-mono tracking-wide">
          B2B Procurement & Vendor Management ERP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              type="button"
              className={`flex-1 pb-2 text-center font-semibold text-sm border-b-2 transition cursor-pointer ${!isSignUp ? 'border-indigo-650 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              id="login-tab-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              type="button"
              className={`flex-1 pb-2 text-center font-semibold text-sm border-b-2 transition cursor-pointer ${isSignUp ? 'border-indigo-650 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              id="login-tab-signup"
            >
              Register Organization
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs font-mono">
                {error}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Organization / Supplier Name</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Apex Metallurgy Pro"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-xs"
                  id="signup-name-input"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Corporate Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-xs"
                id="login-email-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Security Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-xs"
                id="login-password-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Workspace Persona Role</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['officer', 'vendor', 'manager', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(''); }}
                    className={`py-2 px-1 border rounded-lg text-xs font-medium transition text-center cursor-pointer ${role === r ? 'bg-slate-100 border-slate-950 text-slate-950 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                    id={`role-btn-${r}`}
                  >
                    {r === 'officer' && 'Sourcing Officer'}
                    {r === 'vendor' && 'Supplier Vendor'}
                    {r === 'manager' && 'Procurement Manager'}
                    {r === 'admin' && 'ERP Administrator'}
                  </button>
                ))}
              </div>
            </div>

            {isSignUp && role === 'vendor' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Supplier Domain Category</label>
                <select
                  value={signUpVendorCategory}
                  onChange={(e) => setSignUpVendorCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-905 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                  id="signup-vendor-category-input"
                >
                  <option>Heavy Machinery & Parts</option>
                  <option>IT Infrastructure & Hardware</option>
                  <option>Logistics & Packaging Supplies</option>
                  <option>Raw Material Components</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-1.5 block text-xs text-slate-500 cursor-pointer hover:text-slate-700 select-none">
                  Remember device
                </label>
              </div>

              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => alert(`Password recovery is simulated. Select a pre-seeded corporate profile below to skip manual credentials.`)}
                  className="font-medium text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  id="forgot-password-link"
                >
                  Forgot credentials?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition mt-2 cursor-pointer font-mono uppercase tracking-wider shadow-sm"
              id="login-submit-button"
            >
              <Key className="w-3.5 h-3.5 mr-2" />
              {isSignUp ? 'Generate Organization' : 'Verify Credentials'}
            </button>
          </form>

          {/* Quick-start Demo Accounts divider */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Sandbox Identity Profiles
              </span>
              <span className="bg-slate-100 text-slate-600 text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold">
                No Password Required
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bypass form entries by selecting an accredited profile below to simulate real-time workflow handshakes.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleDemoSignIn(user)}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg p-3 flex items-center justify-between transition group cursor-pointer"
                  id={`demo-user-btn-${user.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                      {user.role === 'officer' && <Briefcase className="w-4 h-4 text-slate-600" />}
                      {user.role === 'vendor' && <Building2 className="w-4 h-4 text-slate-600" />}
                      {user.role === 'manager' && <UserCheck className="w-4 h-4 text-slate-600" />}
                      {user.role === 'admin' && <Shield className="w-4 h-4 text-slate-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 group-hover:text-indigo-700 transition">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 bg-white border border-slate-250 text-slate-600 rounded">
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
