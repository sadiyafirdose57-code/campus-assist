import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';

function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-note">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Chat /></Protected>} />
      <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
