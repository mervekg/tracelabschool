import { useState, useEffect } from "react";
import { ClipboardList, PenLine, Users, Shield, LogOut, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import TraceLabLogo from "@/components/TraceLabLogo";
import ParentJoinDialog from "@/components/ParentJoinDialog";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showParentDialog, setShowParentDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const roles = [
    {
      title: "Teacher",
      subtitle: "Create classes and view learning traces.",
      icon: ClipboardList,
      path: "/teacher",
      gradient: "bg-gradient-to-br from-primary/10 to-secondary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Student",
      subtitle: "Practice and track your progress.",
      icon: PenLine,
      path: "/student",
      gradient: "bg-gradient-to-br from-accent to-primary/5",
      iconBg: "bg-accent",
      iconColor: "text-accent-foreground",
    },
    {
      title: "Parent / Guardian",
      subtitle: "Use your child's QR code to join.",
      icon: Users,
      path: null, // Opens modal instead
      gradient: "bg-gradient-to-br from-success/10 to-accent",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "School Admin",
      subtitle: "Manage schools and data access.",
      icon: Shield,
      path: "/admin",
      gradient: "bg-gradient-to-br from-secondary/10 to-muted/30",
      iconBg: "bg-secondary/10",
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
      {/* App Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center border-b border-border/50">
        <TraceLabLogo size="md" linkTo="/" />
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-10">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              Welcome to TraceLab
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose how you'll use TraceLab today.
            </p>
          </div>

          {/* Role Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card
                key={role.title}
                className={`relative p-6 ${role.gradient} border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group`}
                onClick={() => handleRoleClick(role)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-xl ${role.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <role.icon className={`w-8 h-8 ${role.iconColor}`} strokeWidth={1.5} />
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
