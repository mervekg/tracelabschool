import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import StudentWorkspace from "./pages/StudentWorkspace";
import StudentAnalysis from "./pages/StudentAnalysis";
import StudentFeedback from "./pages/StudentFeedback";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherReview from "./pages/TeacherReview";
import TeacherAccommodations from "./pages/TeacherAccommodations";
import RubricBuilder from "./pages/RubricBuilder";
import ParentDashboard from "./pages/ParentDashboard";
import ParentPortfolio from "./pages/ParentPortfolio";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAccommodationApprovals from "./pages/AdminAccommodationApprovals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/workspace" element={<StudentWorkspace />} />
          <Route path="/student/analysis" element={<StudentAnalysis />} />
          <Route path="/student/feedback" element={<StudentFeedback />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/review" element={<TeacherReview />} />
          <Route path="/teacher/accommodations" element={<TeacherAccommodations />} />
          <Route path="/teacher/rubric-builder" element={<RubricBuilder />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/portfolio" element={<ParentPortfolio />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/accommodation-approvals" element={<AdminAccommodationApprovals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
