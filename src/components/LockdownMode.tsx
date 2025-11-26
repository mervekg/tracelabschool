import { useEffect, useState, useCallback } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Maximize } from "lucide-react";
import { toast } from "sonner";

interface LockdownModeProps {
  isEnabled: boolean;
  assignmentName: string;
  onViolation?: (violationType: string) => void;
}

export const LockdownMode = ({ isEnabled, assignmentName, onViolation }: LockdownModeProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violationType, setViolationType] = useState("");

  // Request fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      toast.success("Lockdown mode activated - Stay focused!");
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      toast.error("Please allow fullscreen for lockdown mode");
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error("Exit fullscreen failed:", error);
    }
  }, []);

  // Handle visibility change (tab switching)
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled || !isFullscreen) return;
    
    if (document.hidden) {
      const newViolations = violations + 1;
      setViolations(newViolations);
      setViolationType("Tab Switch Detected");
      setShowWarning(true);
      
      if (onViolation) {
        onViolation("tab_switch");
      }

      // Log violation
      console.warn(`Lockdown violation #${newViolations}: Tab switched`);
    }
  }, [isEnabled, isFullscreen, violations, onViolation]);

  // Handle fullscreen change
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && isEnabled) {
      const newViolations = violations + 1;
      setViolations(newViolations);
      setViolationType("Exited Fullscreen");
      setShowWarning(true);
      
      if (onViolation) {
        onViolation("exit_fullscreen");
      }

      console.warn(`Lockdown violation #${newViolations}: Exited fullscreen`);
      
      // Auto re-enter fullscreen after warning
      setTimeout(() => {
        enterFullscreen();
      }, 3000);
    }
  }, [isEnabled, violations, onViolation, enterFullscreen]);

  // Prevent right-click
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (isEnabled && isFullscreen) {
      e.preventDefault();
      toast.error("Right-click is disabled in lockdown mode");
    }
  }, [isEnabled, isFullscreen]);

  // Prevent keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled || !isFullscreen) return;

    // Block common shortcuts
    const blockedKeys = [
      'F11', // Fullscreen toggle
      'F5',  // Refresh
      'F12', // Dev tools
    ];

    const blockedCombos = [
      e.ctrlKey && e.key === 'w', // Close tab
      e.ctrlKey && e.key === 't', // New tab
      e.ctrlKey && e.key === 'n', // New window
      e.ctrlKey && e.shiftKey && e.key === 'n', // New incognito
      e.ctrlKey && e.key === 'r', // Refresh
      e.ctrlKey && e.shiftKey && e.key === 'i', // Dev tools
      e.altKey && e.key === 'Tab', // Alt+Tab
      e.metaKey && e.key === 'Tab', // Cmd+Tab (Mac)
    ];

    if (blockedKeys.includes(e.key) || blockedCombos.some(combo => combo)) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("This action is blocked in lockdown mode");
      
      const newViolations = violations + 1;
      setViolations(newViolations);
      
      if (onViolation) {
        onViolation("keyboard_shortcut_attempt");
      }
    }
  }, [isEnabled, isFullscreen, violations, onViolation]);

  // Warn before leaving page
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isEnabled && isFullscreen) {
      e.preventDefault();
      e.returnValue = "You are in lockdown mode. Leaving will be recorded as a violation.";
      return e.returnValue;
    }
  }, [isEnabled, isFullscreen]);

  // Setup event listeners
  useEffect(() => {
    if (!isEnabled) {
      exitFullscreen();
      return;
    }

    // Enter fullscreen when lockdown is enabled
    if (isEnabled && !isFullscreen) {
      enterFullscreen();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Disable browser back button
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      toast.error("Navigation is disabled in lockdown mode");
      
      if (onViolation) {
        onViolation("navigation_attempt");
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEnabled, isFullscreen, handleVisibilityChange, handleFullscreenChange, handleContextMenu, handleKeyDown, handleBeforeUnload, enterFullscreen, exitFullscreen, onViolation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      exitFullscreen();
    };
  }, [exitFullscreen]);

  const handleWarningClose = () => {
    setShowWarning(false);
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Lockdown Indicator */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-pulse">
        <Shield className="w-5 h-5" />
        <div>
          <p className="text-sm font-semibold">Lockdown Mode Active</p>
          <p className="text-xs opacity-90">Violations: {violations}</p>
        </div>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-6 h-6" />
              <AlertDialogTitle className="text-xl">
                Lockdown Violation Detected
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base">
                <strong>Violation #{violations}:</strong> {violationType}
              </p>
              <p className="text-sm text-muted-foreground">
                You must remain in fullscreen mode during "{assignmentName}". 
                All violations are being recorded and will be reported to your teacher.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-medium">
                  ⚠️ Additional violations may result in:
                </p>
                <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                  <li>Automatic submission of your work</li>
                  <li>Academic integrity review</li>
                  <li>Reduced assignment credit</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleWarningClose} 
              className="flex-1"
              variant="default"
            >
              <Maximize className="w-4 h-4 mr-2" />
              I Understand - Continue Working
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Initial Fullscreen Prompt */}
      {isEnabled && !isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-2xl max-w-md border-2 border-destructive">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Lockdown Mode Required</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Your teacher has enabled lockdown mode for this assignment. 
              You must enter fullscreen mode to continue.
            </p>
            <div className="bg-muted p-4 rounded-md mb-6">
              <p className="text-sm font-medium mb-2">🔒 Lockdown Features:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Fullscreen mode required</li>
                <li>Tab switching detected</li>
                <li>Navigation blocked</li>
                <li>All violations recorded</li>
              </ul>
            </div>
            <Button 
              onClick={enterFullscreen} 
              className="w-full"
              size="lg"
            >
              <Maximize className="w-5 h-5 mr-2" />
              Enter Lockdown Mode
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
