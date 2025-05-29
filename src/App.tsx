
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

import Layout from '@/components/Layout';
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
        <Route path="/" element={<Layout />}>
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
