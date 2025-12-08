import { useState, useEffect } from "react";
import { GraduationCap, Users, Heart, Settings, LogOut, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import SolviaLogo from "@/components/SolviaLogo";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
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
      title: "Student",
      description: "Complete assignments and see your progress",
      icon: GraduationCap,
      gradient: "from-primary to-accent",
      path: "/student",
    },
    {
      title: "Teacher",
      description: "Review work and provide feedback",
      icon: Users,
      gradient: "from-blue-400 to-cyan-400",
      path: "/teacher",
    },
    {
      title: "Parent",
      description: "Monitor your child's learning journey",
      icon: Heart,
      gradient: "from-green-400 to-emerald-400",
      path: "/parent",
    },
    {
      title: "Admin",
      description: "Manage school-wide analytics",
      icon: Settings,
      gradient: "from-purple-400 to-violet-400",
      path: "/admin",
    },
  ];

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center p-6">
      <div className="max-w-6xl w-full space-y-12">
        {/* Auth Button */}
        <div className="flex justify-end">
          {user ? (
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          {user && (
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.email}
            </p>
          )}
          <div className="flex justify-center">
            <SolviaLogo size="xl" />
          </div>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Educational Assessment Platform for Human-Centered Learning
          </p>
          <p className="text-foreground/70 max-w-xl mx-auto">
            Empowering students through handwritten work, AI-assisted feedback, and growth tracking
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card
              key={role.title}
              className="p-6 paper-texture shadow-paper hover:shadow-card transition-all cursor-pointer group"
              onClick={() => navigate(role.path)}
            >
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full hover:bg-muted"
                >
                  Enter as {role.title}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Highlight */}
        <Card className="p-8 shadow-card bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold text-center mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                ✍️
              </div>
              <h3 className="font-semibold mb-2">Handwriting Focus</h3>
              <p className="text-sm text-muted-foreground">
                Paper-like writing experience with stylus support
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                🤖
              </div>
              <h3 className="font-semibold mb-2">AI Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Instant, personalized feedback on writing and problem-solving
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                📈
              </div>
              <h3 className="font-semibold mb-2">Growth Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor progress and celebrate improvements over time
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
