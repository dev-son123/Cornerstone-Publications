import { useNavigate, useLocation } from 'react-router-dom';
import { AuthComponent } from '@/components/ui/sign-up';
import { useAuth, friendlyAuthError } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
  const { login, loginWithGoogle } = useAuth();

  const handleEmailSubmit = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(friendlyAuthError(err) || err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error(friendlyAuthError(err));
    }
  };

  const onSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <AuthComponent
      brandName="Cornerstone Research and Publication Services"
      isLogin={true}
      onEmailSubmit={handleEmailSubmit}
      onGoogle={handleGoogle}
      onSuccess={onSuccess}
      onToggleMode={() => navigate('/register')}
    />
  );
}
