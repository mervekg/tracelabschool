import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Clock, Lock, AlertTriangle, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const TeacherAssignmentSettings = () => {
  const navigate = useNavigate();
  const [lockdownEnabled, setLockdownEnabled] = useState(false);
  const [timedAssessment, setTimedAssessment] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [preventCopying, setPreventCopying] = useState(true);
  const [trackViolations, setTrackViolations] = useState(true);

  const handleSave = () => {
    toast.success("Assignment settings saved!");
    setTimeout(() => navigate('/teacher/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Assignment Settings</h1>
            <p className="text-muted-foreground">Configure lockdown mode and assessment security</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>
            Cancel
          </Button>
        </div>

        {/* Assignment Info */}
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h2 className="text-xl font-semibold mb-2">Paragraph Writing: My Weekend</h2>
          <p className="text-sm text-muted-foreground">ELA • Grade 5 • Due Tomorrow</p>
        </Card>

        {/* Lockdown Mode Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-destructive mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Lockdown Mode</h3>
              <p className="text-sm text-muted-foreground">
                Prevent students from accessing other websites or switching tabs during this assignment
              </p>
            </div>
            <Switch
              checked={lockdownEnabled}
              onCheckedChange={setLockdownEnabled}
              className="data-[state=checked]:bg-destructive"
            />
          </div>

          {lockdownEnabled && (
            <div className="ml-9 space-y-4 animate-fade-in">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Lockdown Mode Features:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                      <li>Forces fullscreen mode on student device</li>
                      <li>Detects and logs tab switching attempts</li>
                      <li>Blocks keyboard shortcuts (Ctrl+T, Ctrl+W, etc.)</li>
                      <li>Prevents right-click and developer tools</li>
                      <li>Disables browser navigation buttons</li>
                      <li>Records all violation attempts with timestamps</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="track-violations" className="text-base font-medium">
                      Track Violations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Log all attempts to leave fullscreen or switch tabs
                    </p>
                  </div>
                  <Switch
                    id="track-violations"
                    checked={trackViolations}
                    onCheckedChange={setTrackViolations}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prevent-copying" className="text-base font-medium">
                      Prevent Text Copying
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Disable copy/paste and right-click on assignment content
                    </p>
                  </div>
                  <Switch
                    id="prevent-copying"
                    checked={preventCopying}
                    onCheckedChange={setPreventCopying}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">📊 Violation Report</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive a detailed report showing all lockdown violations including:
                  timestamps, violation types, and frequency. This helps identify students who
                  may need additional support or academic integrity review.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Time Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Time Limit</h3>
              <p className="text-sm text-muted-foreground">
                Set a time limit for completing this assignment
              </p>
            </div>
            <Switch
              checked={timedAssessment}
              onCheckedChange={setTimedAssessment}
            />
          </div>

          {timedAssessment && (
            <div className="ml-9 space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <Label htmlFor="time-limit">Duration (minutes):</Label>
                <input
                  id="time-limit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border rounded-md"
                  min="5"
                  max="180"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Students will have {timeLimit} minutes to complete the assignment.
                Work will auto-submit when time expires.
              </p>
            </div>
          )}
        </Card>

        {/* Best Practices */}
        <Card className="p-6 bg-accent/5 border-accent/20">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-accent-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-accent-foreground mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Inform students in advance:</strong> Let students know before the assignment
                  that lockdown mode will be enabled so they can prepare.
                </li>
                <li>
                  <strong>Test on school devices:</strong> Lockdown mode works best on school-managed
                  devices. Some personal devices may have restrictions.
                </li>
                <li>
                  <strong>Have a backup plan:</strong> Technical issues can happen. Have alternative
                  arrangements for students who can't access lockdown mode.
                </li>
                <li>
                  <strong>Review violations contextually:</strong> High violation counts may indicate
                  technical issues rather than dishonesty. Review each case individually.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentSettings;
