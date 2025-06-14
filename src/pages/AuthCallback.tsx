import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { magic } from '../config/magicConfig';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Magic sẽ tự động xử lý callback
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          navigate('/'); // Redirect về trang chủ sau khi login thành công
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/'); // Redirect về trang chủ nếu có lỗi
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Đang xử lý đăng nhập...</div>
    </div>
  );
};

export default AuthCallback;