
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Modules from '@/pages/Modules';
import Models from '@/pages/Models';
import Tables from '@/pages/Tables';
import Monitor from '@/pages/Monitor';
import Config from '@/pages/Config';
import Discovery from '@/pages/Discovery';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster />
      <Routes>
        {/* 登录页面 - 不需要认证保护 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保护的路由 - 需要登录才能访问 */}
        <Route path="/" element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }>
          <Route index element={<Index />} />
          <Route path="modules" element={<Modules />} />
          <Route path="models" element={<Models />} />
          <Route path="tables" element={<Tables />} />
          <Route path="monitor" element={<Monitor />} />
          <Route path="config" element={<Config />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
