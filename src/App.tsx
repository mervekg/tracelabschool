import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import StudentWorkspace from "./pages/StudentWorkspace";
import StudentProblemWorkspace from "./pages/StudentProblemWorkspace";
import StudentAnalysis from "./pages/StudentAnalysis";
import StudentFeedback from "./pages/StudentFeedback";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherClassDetail from "./pages/TeacherClassDetail";
import TeacherMessages from "./pages/TeacherMessages";
import TeacherContactParents from "./pages/TeacherContactParents";
import TeacherReview from "./pages/TeacherReview";
import TeacherAccommodations from "./pages/TeacherAccommodations";
import TeacherAssignmentSettings from "./pages/TeacherAssignmentSettings";
import TeacherViolationReports from "./pages/TeacherViolationReports";
import RubricBuilder from "./pages/RubricBuilder";
import ParentDashboard from "./pages/ParentDashboard";
import ParentPortfolio from "./pages/ParentPortfolio";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAccommodationApprovals from "./pages/AdminAccommodationApprovals";
import NotFound from "./pages/NotFound";
import JoinClass from "./pages/JoinClass";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/join" element={<JoinClass />} />
          <Route path="/join/:code" element={<JoinClass />} />
          
          {/* Student routes - require 'student' role */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/workspace" element={
            <ProtectedRoute requiredRole="student">
              <StudentWorkspace />
            </ProtectedRoute>
          } />
          <Route path="/student/problem" element={
            <ProtectedRoute requiredRole="student">
              <StudentProblemWorkspace />
            </ProtectedRoute>
          } />
          <Route path="/student/analysis" element={
            <ProtectedRoute requiredRole="student">
              <StudentAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/student/feedback" element={
            <ProtectedRoute requiredRole="student">
              <StudentFeedback />
            </ProtectedRoute>
          } />
          
          {/* Teacher routes - require 'teacher' role */}
          <Route path="/teacher" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/class/:classId" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherClassDetail />
            </ProtectedRoute>
          } />
          <Route path="/teacher/messages" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherMessages />
            </ProtectedRoute>
          } />
          <Route path="/teacher/contact-parents" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherContactParents />
            </ProtectedRoute>
          } />
          <Route path="/teacher/review" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherReview />
            </ProtectedRoute>
          } />
          <Route path="/teacher/accommodations" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAccommodations />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assignment-settings" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAssignmentSettings />
            </ProtectedRoute>
          } />
          <Route path="/teacher/violation-reports" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherViolationReports />
            </ProtectedRoute>
          } />
          <Route path="/teacher/rubric-builder" element={
            <ProtectedRoute requiredRole="teacher">
              <RubricBuilder />
            </ProtectedRoute>
          } />
          
          {/* Parent routes - require 'parent' role */}
          <Route path="/parent" element={
            <ProtectedRoute requiredRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/parent/portfolio" element={
            <ProtectedRoute requiredRole="parent">
              <ParentPortfolio />
            </ProtectedRoute>
          } />
          
          {/* Admin routes - require 'admin' role */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/accommodation-approvals" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAccommodationApprovals />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
