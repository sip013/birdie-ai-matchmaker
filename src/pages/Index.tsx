
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard or auth based on user status
    if (user) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to BirdieMatch</h1>
        <p className="text-xl text-gray-600">Redirecting you to the appropriate page...</p>
      </div>
    </div>
  );
};

export default Index;
