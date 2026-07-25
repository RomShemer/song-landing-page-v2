import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { resolveRoute } from './routes';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

const route = resolveRoute();

ReactDOM.createRoot(document.getElementById('root')).render(
  route === 'admin' ? (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  ) : (
    <App />
  )
);
