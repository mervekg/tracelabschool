import { useState, useEffect } from "react";
import { BookOpen, ClipboardList, Users, Shield, LogOut, LogIn, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import SolviaLogo from "@/components/SolviaLogo";
import AddParentsDialog from "@/components/AddParentsDialog";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showAddParentsDialog, setShowAddParentsDialog] = useState(false);
  const [isAddingParents, setIsAddingParents] = useState(false);

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

  const handleParentCardClick = () => {
    setShowAddParentsDialog(true);
  };

  const handleAddParents = async (parents: Array<{ fullName: string; email: string; phone?: string; studentName?: string }>) => {
    setIsAddingParents(true);
    try {
      toast.success(`${parents.length} parent(s) ready to be added. Select a class to complete.`);
      setShowAddParentsDialog(false);
      navigate("/teacher");
    } catch (error) {
      toast.error("Failed to add parents");
    } finally {
      setIsAddingParents(false);
    }
  };

  const roles = [
    {
      title: "A Learner",
      subtitle: "(Student)",
      icon: BookOpen,
      path: "/student",
      color: "bg-primary/10 text-primary border-primary/20",
      iconBg: "bg-gradient-to-br from-primary/20 to-accent",
    },
    {
      title: "An Educator",
      subtitle: "(Teacher)",
      icon: ClipboardList,
      path: "/teacher",
      color: "bg-secondary/10 text-secondary border-secondary/20",
      iconBg: "bg-gradient-to-br from-secondary/20 to-muted",
    },
    {
      title: "A Guardian",
      subtitle: "(Parent)",
      icon: Users,
      path: "/parent",
      customAction: handleParentCardClick,
      color: "bg-success/10 text-success border-success/20",
      iconBg: "bg-gradient-to-br from-success/20 to-accent",
    },
    {
      title: "Administrator",
      subtitle: "(School Admin)",
      icon: Shield,
      path: "/admin",
      color: "bg-warning/10 text-warning border-warning/20",
      iconBg: "bg-gradient-to-br from-warning/20 to-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex justify-end items-center">
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-3xl space-y-10">
          {/* Logo */}
          <div className="flex justify-center">
            <SolviaLogo size="xl" />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            {user && (
              <p className="text-sm text-muted-foreground mb-4">
                Welcome back, {user.email}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              I will be using Solvia as:
            </h1>
          </div>

          {/* Role Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {roles.map((role) => (
              <Card
                key={role.title}
                className={`relative p-6 bg-card border-2 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer group ${role.color.split(' ')[2]}`}
                onClick={() => role.customAction ? role.customAction() : navigate(role.path)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-2xl ${role.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                    <role.icon className="w-10 h-10 text-foreground/80" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Terms Text */}
          <div className="text-center text-sm text-muted-foreground max-w-lg mx-auto">
            By continuing, you confirm that you have read and agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>,{" "}
            <Link to="/data-protection" className="text-primary hover:underline">Data Protection Policy</Link>, and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </div>

          {/* Language Selector */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Change language:</span>
            <LanguageSelector variant="icon" />
          </div>
        </div>
      </main>

      {/* Add Parents Dialog */}
      <AddParentsDialog
        open={showAddParentsDialog}
        onOpenChange={setShowAddParentsDialog}
        onSubmit={handleAddParents}
        isLoading={isAddingParents}
      />
    </div>
  );
};

export default Index;
