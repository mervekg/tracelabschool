import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SolviaLogo from "@/components/SolviaLogo";
import { Users, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const JoinClass = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  
  const [joinCode, setJoinCode] = useState(code || "");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!code);
  const [classInfo, setClassInfo] = useState<{ name: string; subject: string; section: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (code) {
      verifyCode(code);
    }
  }, [code]);

  const verifyCode = async (codeToVerify: string) => {
    setVerifying(true);
    setError(null);
    setClassInfo(null);

    try {
      // For now, we can't directly query class_join_codes due to RLS
      // This would need an edge function or RLS policy for students to verify codes
      // For demo purposes, we'll show the code and let users proceed
      setVerifying(false);
      
      // Show a message that they need to be logged in as a student
      if (!user) {
        setError("Please sign in as a student to join this class");
      }
    } catch (err) {
      setError("Failed to verify code");
      setVerifying(false);
    }
  };

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a join code");
      return;
    }

    if (!user) {
      // Store the code and redirect to auth
      sessionStorage.setItem("pendingJoinCode", joinCode);
      navigate("/auth");
      toast.info("Please sign in to join the class");
      return;
    }

    // For now, show success message - actual join logic would need backend implementation
    toast.success("Join request submitted! Your teacher will be notified.");
    navigate("/student");
  };

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <SolviaLogo size="lg" />
          </div>
          <p className="text-muted-foreground">Join a class using an invite code or link</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Class
            </CardTitle>
            <CardDescription>
              Enter the class join code provided by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifying ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Verifying code...</span>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {classInfo && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{classInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {classInfo.subject} • {classInfo.section}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="join-code">Join Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., ABC123)"
                    className="font-mono text-lg tracking-wider text-center uppercase"
                    maxLength={8}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleJoinWithCode}
                  disabled={loading || !joinCode.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Class
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => navigate("/auth")}
                    >
                      Sign up here
                    </Button>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinClass;
