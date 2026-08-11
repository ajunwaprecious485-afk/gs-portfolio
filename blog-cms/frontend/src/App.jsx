import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostsList from './pages/PostsList';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Media from './pages/Media';
import Settings from './pages/Settings';
import BlogHome from './pages/BlogHome';
import BlogPost from './pages/BlogPost';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-dark-50">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/admin/login" />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/admin/dashboard" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-dark-800 dark:text-white',
            style: { borderRadius: '12px', padding: '12px 16px' },
          }}
        />
        <Routes>
          <Route path="/" element={<BlogHome />} />
          <Route path="/post/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="posts" element={<PostsList />} />
            <Route path="posts/new" element={<CreatePost />} />
            <Route path="posts/edit/:id" element={<EditPost />} />
            <Route path="media" element={<Media />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;