import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, friendlyAuthError } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTiltPrivacy } from '@/hooks/useTiltPrivacy';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isObscured, requestPermission, needsPermission, permissionGranted } = useTiltPrivacy();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { needsConfirmation } = await register(formData.name, formData.email, formData.password);
      if (needsConfirmation) {
        toast.success("Check your email to verify your account!");
      } else {
        toast.success("Account created successfully!");
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(friendlyAuthError(err) || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl relative z-10 border border-gray-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Cornerstone Research and Publication Services today
          </p>

          <div className="mt-4 flex justify-center">
            {needsPermission && !permissionGranted && (
              <button type="button" onClick={requestPermission} className="text-xs text-[#d63384] hover:text-[#b5165a] transition-colors font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Enable Privacy Shield (Tilt detection)
              </button>
            )}
            {permissionGranted && (
              <span className="text-xs text-pink-600 font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Privacy Shield Active
              </span>
            )}
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input name="name" type="text" required value={formData.name} onChange={handleInputChange} className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-colors sm:text-sm" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className={`appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all duration-300 sm:text-sm ${isObscured ? "blur-md opacity-30 select-none pointer-events-none" : ""}`} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University / Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input name="organization" type="text" value={formData.organization} onChange={handleInputChange} className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-colors sm:text-sm" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleInputChange} className={`appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all duration-300 sm:text-sm ${isObscured ? "blur-md opacity-30 select-none pointer-events-none" : ""}`} placeholder="Create a strong password" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input name="confirmPassword" type={showPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleInputChange} className={`appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all duration-300 sm:text-sm ${isObscured ? "blur-md opacity-30 select-none pointer-events-none" : ""}`} placeholder="Confirm your password" />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#d63384] hover:bg-[#b5165a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d63384] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#d63384] hover:text-[#b5165a] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
