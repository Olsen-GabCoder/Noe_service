import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Primitives';
import { Sidebar, Topbar } from './components/Shell';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { MovementsScreen } from './screens/MovementsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { UsersScreen } from './screens/UsersScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { CadrageScreen } from './screens/CadrageScreen';
import { AdminScreen } from './screens/AdminScreen';
import { OnboardingModal, reopenOnboarding } from './components/OnboardingModal';
import { useAuth } from './context/AuthContext';
import { fetchNotifications } from './api';

const titleMap = {
  '/':              { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de votre activité' },
  '/products':      { title: 'Produits',        subtitle: 'Catalogue et gestion des articles' },
  '/products/new':  { title: 'Nouveau produit', subtitle: 'Créer un article' },
  '/products/':     { title: 'Fiche produit',   subtitle: 'Informations détaillées' },
  '/movements':     { title: 'Mouvements',      subtitle: 'Entrées et sorties de stock' },
  '/history':       { title: 'Historique',       subtitle: 'Journal des opérations' },
  '/users':         { title: 'Utilisateurs',    subtitle: 'Équipe et permissions' },
  '/notifications': { title: 'Notifications',   subtitle: 'Centre des alertes' },
  '/reports':       { title: 'Rapports',        subtitle: 'Analyses et statistiques' },
  '/cadrage':       { title: 'Questionnaire',   subtitle: 'Cadrage de l\'application' },
  '/admin':         { title: 'Administration',    subtitle: 'Gestion de la plateforme' },
};

function getTitle(pathname) {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/products/')) return { title: 'Fiche produit', subtitle: 'Informations détaillées' };
  return { title: 'NOE Services', subtitle: '' };
}

function routeToNavId(pathname) {
  if (pathname === '/') return 'dashboard';
  const segment = pathname.split('/')[1];
  return segment || 'dashboard';
}

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchNotifications({ read: 'false' })
      .then(notifs => setUnread(notifs.length))
      .catch(() => {});
  }, [location.pathname]);

  const currentUser = {
    ...user,
    avatar: user.avatarInitials,
    color: user.avatarColor,
    online: true,
  };

  const [showOnboarding, setShowOnboarding] = useState(0);

  const handleNavigate = (id) => {
    // Navigation directe (depuis la recherche)
    if (id.startsWith('__direct__:')) {
      navigate(id.replace('__direct__:', ''));
      return;
    }
    const paths = {
      dashboard: '/',
      products: '/products',
      movements: '/movements',
      history: '/history',
      reports: '/reports',
      users: '/users',
      notifications: '/notifications',
      cadrage: '/cadrage',
      admin: '/admin',
    };
    navigate(paths[id] || '/');
  };

  const handleReopenOnboarding = () => {
    reopenOnboarding();
    setShowOnboarding(s => s + 1);
  };

  const { title, subtitle } = getTitle(location.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        current={routeToNavId(location.pathname)}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        unreadCount={unread}
        currentUser={currentUser}
        onLogout={logout}
      />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          search={search}
          setSearch={setSearch}
          onLogout={logout}
          currentUser={currentUser}
          unreadCount={unread}
          onNavigate={handleNavigate}
          onReopenOnboarding={handleReopenOnboarding}
        />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardScreen onNavigate={handleNavigate} />} />
            <Route path="/products" element={
              <ProductsScreen
                onOpenProduct={(p) => navigate(`/products/${p.sku}`)}
                onNew={() => navigate('/products/new')}
                onNavigate={handleNavigate}
              />
            } />
            <Route path="/products/new" element={
              <ProductDetailScreen sku={null} onBack={() => navigate('/products')} onNavigate={handleNavigate} />
            } />
            <Route path="/products/:sku" element={<ProductDetailRoute onNavigate={handleNavigate} />} />
            <Route path="/movements" element={<MovementsScreen onNavigate={handleNavigate} />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/users" element={<UsersScreen />} />
            <Route path="/notifications" element={<NotificationsScreen onUnreadChange={setUnread} onNavigate={handleNavigate} />} />
            <Route path="/reports" element={<ReportsScreen />} />
            <Route path="/cadrage" element={<CadrageScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <OnboardingModal key={showOnboarding} onOpenCadrage={() => navigate('/cadrage')} />
    </div>
  );
}

function ProductDetailRoute({ onNavigate }) {
  const { sku } = useParams();
  const navigate = useNavigate();
  return <ProductDetailScreen sku={sku} onBack={() => navigate('/products')} onNavigate={onNavigate} />;
}

function App() {
  const { authed } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={authed ? <Navigate to="/" replace /> : <LoginScreen />} />
      <Route path="/*" element={authed ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}
