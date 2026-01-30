import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Shield, Mail, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SolviaLogo from "@/components/SolviaLogo";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeacherLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

const TeacherLayout = ({ 
  children, 
  searchQuery = "", 
  onSearchChange,
  showSearch = true 
}: TeacherLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherName, setTeacherName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setTeacherName(profile.full_name);
      } else {
        setTeacherName(user.email?.split("@")[0] || "Teacher");
      }

      // Fetch unread message count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchTeacherInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { label: "Courses", path: "/teacher", exact: true },
    { label: "Messages", path: "/teacher/messages", badge: unreadCount },
    { label: "Contact Parents", path: "/teacher/contact-parents" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen paper-texture">
      {/* Top Navigation Bar */}
      <header className="bg-background border-b border-border px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <SolviaLogo size="md" showText={true} />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path, item.exact) ? "secondary" : "ghost"}
                  className="font-medium relative"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Search - Desktop */}
            {showSearch && onSearchChange && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 w-48 lg:w-64"
                />
              </div>
            )}

            {/* Quick Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/teacher/accommodations")}
              >
                Accommodations
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/teacher/violation-reports")}
                className="border-destructive/50 hover:bg-destructive/10"
              >
                <Shield className="w-4 h-4 mr-1" />
                Violations
              </Button>
            </div>

            {/* Messages Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative"
              onClick={() => navigate("/teacher/messages")}
            >
              <Mail className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(teacherName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-medium">
                  {teacherName}
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
            {showSearch && onSearchChange && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            )}
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path, item.exact) ? "secondary" : "ghost"}
                className="w-full justify-start font-medium"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  navigate("/teacher/accommodations");
                  setMobileMenuOpen(false);
                }}
              >
                Accommodations
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive/50"
                onClick={() => {
                  navigate("/teacher/violation-reports");
                  setMobileMenuOpen(false);
                }}
              >
                <Shield className="w-4 h-4 mr-1" />
                Violations
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default TeacherLayout;
