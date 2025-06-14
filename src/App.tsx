// App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId } from './config/web3Config';
import { ModernWeb3Provider } from "./contexts/ModernWeb3Context";
import Index from "./pages/Index";
import ScoreReport from "./pages/ScoreReport";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";

// ❗ GỌI NGAY Ở ĐÂY — KHÔNG DÙNG useEffect
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light',
  chainImages: {
    1: '/ethereum-logo.png'
  }
});

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ModernWeb3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/score/:address" element={<ScoreReport />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ModernWeb3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
