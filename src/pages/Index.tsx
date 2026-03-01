import { useState, useEffect } from "react";
import { ClipboardList, PenLine, Users, Shield, LogOut, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import SolviaLogo from "@/components/SolviaLogo";
import ParentJoinDialog from "@/components/ParentJoinDialog";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showParentDialog, setShowParentDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserName(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserName(session.user.id);
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserName = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    
    if (data?.full_name) {
      // Get first name only for a friendlier greeting
      const firstName = data.full_name.split(" ")[0];
      setUserName(firstName);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const roles = [
    {
      title: "Teacher",
      subtitle: "Create classes and view learning traces.",
      icon: ClipboardList,
      path: "/teacher",
      gradient: "bg-gradient-to-br from-primary/15 to-secondary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Student",
      subtitle: "Practice and track your progress.",
      icon: PenLine,
      path: "/student",
      gradient: "bg-gradient-to-br from-accent to-primary/10",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      title: "Parent / Guardian",
      subtitle: "Use your child's QR code to join.",
      icon: Users,
      path: null, // Opens modal instead
      gradient: "bg-gradient-to-br from-success/15 to-accent",
      iconBg: "bg-success/20",
      iconColor: "text-success",
    },
    {
      title: "School Admin",
      subtitle: "Manage schools and data access.",
      icon: Shield,
      path: "/admin",
      gradient: "bg-gradient-to-br from-secondary/15 to-muted/20",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
    },
  ];

  const handleRoleClick = (role: typeof roles[0]) => {
    if (role.title === "Parent / Guardian") {
      setShowParentDialog(true);
    } else if (role.path) {
      navigate(role.path);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky App Bar */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <SolviaLogo size="lg" linkTo="/" />
        <div className="flex items-center gap-2">
          <LanguageSelector variant="icon" />
          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/auth")} 
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - positioned in upper third */}
      <main className="flex-1 flex flex-col items-center px-6 py-8 pt-12">
        <div className="w-full max-w-2xl space-y-10">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              {userName ? `Welcome back, ${userName}!` : "Welcome to Solvia"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose how you'll use Solvia today.
            </p>
          </div>

          {/* Role Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card
                key={role.title}
                className={`relative p-6 ${role.gradient} border border-border/60 hover:border-primary/50 hover:shadow-lg hover:bg-opacity-90 transition-all duration-200 cursor-pointer group`}
                onClick={() => handleRoleClick(role)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon Container - Larger */}
                  <div className={`w-20 h-20 rounded-xl ${role.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-md`}>
                    <role.icon className={`w-10 h-10 ${role.iconColor}`} strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{role.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Parent Join Dialog */}
      <ParentJoinDialog 
        open={showParentDialog} 
        onOpenChange={setShowParentDialog} 
      />
    </div>
  );
};

export default Index;
