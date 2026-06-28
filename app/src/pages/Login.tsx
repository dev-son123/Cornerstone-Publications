import { useNavigate, useLocation } from 'react-router-dom';
import { AuthComponent } from '@/components/ui/sign-up';
import { useAuth, friendlyAuthError } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
  const { login } = useAuth();

  const handleEmailSubmit = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(friendlyAuthError(err) || err.message);
    }
  };

  const onSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="relative">
      <AuthComponent
        brandName="Cornerstone Research and Publication Services"
        isLogin={true}
        onEmailSubmit={handleEmailSubmit}
        onSuccess={onSuccess}
        onToggleMode={() => navigate('/register')}
      />
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 italic px-4 pointer-events-none select-none">
        "The stone the builders rejected has become the cornerstone. This is from the Lord, and it is marvelous in our eyes."
      </p>
    </div>
  );
}
