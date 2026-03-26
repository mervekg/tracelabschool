import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SolviaLogo from "@/components/SolviaLogo";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setStudentName(profile.full_name);
      } else {
        setStudentName(user.email?.split("@")[0] || "Student");
      }
    };

    fetchStudentInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { label: "Dashboard", path: "/student" },
    { label: "Workspace", path: "/student/workspace" },
    { label: "Feedback", path: "/student/feedback" },
    { label: "Progress", path: "/student/analysis" },
  ];

  return (
    <div className="min-h-screen paper-texture">
      {/* Top Navigation Bar */}
      <header className="bg-background border-b border-border px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <SolviaLogo size="md" linkTo="/student" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="font-medium"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageSelector variant="icon" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(studentName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-medium">
                  {studentName}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-3 pt-3 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start font-medium"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}
            {/* Language Selector - Mobile */}
            <div className="pt-2 border-t border-border">
              <LanguageSelector variant="full" className="w-full justify-start" />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default StudentLayout;
