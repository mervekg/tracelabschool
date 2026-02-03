import { useState } from "react";
import { FlaskConical, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateTestStudentDialogProps {
  classId: string;
  className: string;
  onCreated?: () => void;
}

const CreateTestStudentDialog = ({ classId, className, onCreated }: CreateTestStudentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();

  const generateTestCredentials = () => {
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const email = `test.student.${timestamp}${randomSuffix}@tracelab.test`;
    const password = `Test${Math.random().toString(36).substring(2, 10)}!1`;
    setTestEmail(email);
    setTestPassword(password);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !testEmail) {
      generateTestCredentials();
    }
    if (!isOpen) {
      setCreatedCredentials(null);
    }
  };

  const handleCreate = async () => {
    if (!testEmail || !testPassword) {
      toast({
        title: "Error",
        description: "Please generate credentials first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user via edge function (to avoid signing out current user)
      const { data: createResult, error: createError } = await supabase.functions.invoke(
        "create-test-student",
        {
          body: {
            email: testEmail,
            password: testPassword,
            classId,
            fullName: "Test Student",
          },
        }
      );

      if (createError || !createResult?.success) {
        throw new Error(createResult?.error || createError?.message || "Failed to create test student");
      }

      // Store credentials for display
      setCreatedCredentials({ email: testEmail, password: testPassword });

      toast({
        title: "Test student created!",
        description: "Use the credentials below to log in and verify the student experience.",
      });

      onCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (createdCredentials) {
      navigator.clipboard.writeText(
        `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
      );
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FlaskConical className="w-4 h-4 mr-2" />
          Create Test Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Create Test Student Account
          </DialogTitle>
          <DialogDescription>
            Create a test student account to verify the full student experience in {className}.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg space-y-3">
              <p className="text-sm font-medium text-success">✓ Test student created successfully!</p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-mono text-sm select-all">{createdCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <p className="font-mono text-sm select-all">{createdCredentials.password}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Open a new incognito/private window to sign in with these credentials without logging out of your teacher account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email</Label>
              <Input
                id="test-email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test.student@tracelab.test"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">Test Password</Label>
              <Input
                id="test-password"
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Generated password"
                disabled={loading}
              />
            </div>
            <Button variant="outline" size="sm" onClick={generateTestCredentials} disabled={loading}>
              Regenerate Credentials
            </Button>
          </div>
        )}

        <DialogFooter>
          {createdCredentials ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={copyCredentials} className="flex-1">
                Copy Credentials
              </Button>
              <Button onClick={() => setOpen(false)} className="flex-1">
                Done
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreate} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Test Student
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestStudentDialog;
