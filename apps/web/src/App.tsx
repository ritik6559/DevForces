import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
// import ChallengeIDE from "./pages/ChallengeIDE";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
           <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:contestId" element={<ContestDetail />} />
          {/*<Route path="/contests/:contestId/:challengeId" element={<ChallengeIDE />} /> */}
          <Route path="/profile" element={<Profile />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
