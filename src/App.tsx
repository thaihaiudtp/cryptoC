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
import { MagicProvider } from "./contexts/MagicContext";
import AuthCallback from "./pages/AuthCallback";
import React from "react";
import { Web3Provider } from "./contexts/Web3Context";
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
        <MagicProvider>
          {/* MagicProvider sẽ cung cấp thông tin người dùng và các hàm đăng nhập/đăng xuất */}
        <ModernWeb3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Web3Provider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/score/:address" element={<ScoreReport />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Web3Provider>
            </BrowserRouter>
          </TooltipProvider>
        </ModernWeb3Provider>
        </MagicProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
