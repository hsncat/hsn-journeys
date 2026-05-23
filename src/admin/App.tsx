import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { logout } from './api';
import Dashboard from './routes/Dashboard';
import JourneysList from './routes/JourneysList';
import JourneyEdit from './routes/JourneyEdit';
import SubCardEdit from './routes/SubCardEdit';
import WishlistList from './routes/WishlistList';
import WishlistEdit from './routes/WishlistEdit';
import CoordsEdit from './routes/CoordsEdit';
import PackingEdit from './routes/PackingEdit';
import ChangePasswordModal from './components/ChangePasswordModal';
import ToastStack from './components/Toast';
import './admin.css';

interface Props {
  username: string;
}

export default function App({ username }: Props) {
  return (
    <BrowserRouter basename="/admin">
      <AppShell username={username} />
    </BrowserRouter>
  );
}

function AppShell({ username }: Props) {
  const navigate = useNavigate();
  const [pwOpen, setPwOpen] = useState(false);

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="brand-name">HSN</span>
          <span className="brand-sub">Admin</span>
        </Link>
        <nav className="admin-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span>📊</span> 总览
          </NavLink>
          <NavLink to="/journeys" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span>🌍</span> 旅程
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span>💭</span> 心愿单
          </NavLink>
          <NavLink to="/coords" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span>📍</span> 城市坐标
          </NavLink>
          <NavLink to="/packing" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span>🧳</span> 行李清单
          </NavLink>
        </nav>
        <div className="admin-user">
          <div className="user-info">
            <span className="user-avatar">{username[0].toUpperCase()}</span>
            <div>
              <div className="user-name">{username}</div>
              <button type="button" className="link-btn" onClick={() => setPwOpen(true)}>
                修改密码
              </button>
            </div>
          </div>
          <a href="/" className="view-site">查看站点</a>
          <button type="button" className="logout-btn" onClick={handleLogout}>退出登录</button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journeys" element={<JourneysList />} />
          <Route path="/journeys/new" element={<JourneyEdit mode="new" />} />
          <Route path="/journeys/:id" element={<JourneyEdit mode="edit" />} />
          <Route path="/journeys/:id/sub/new" element={<SubCardEdit mode="new" />} />
          <Route path="/journeys/:id/sub/:subId" element={<SubCardEdit mode="edit" />} />
          <Route path="/wishlist" element={<WishlistList />} />
          <Route path="/wishlist/new" element={<WishlistEdit mode="new" />} />
          <Route path="/wishlist/:id" element={<WishlistEdit mode="edit" />} />
          <Route path="/coords" element={<CoordsEdit />} />
          <Route path="/packing" element={<PackingEdit />} />
        </Routes>
      </main>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
      <ToastStack />
    </div>
  );
}
