import { useState } from "react";
import { Camera, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ParentJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ParentJoinDialog = ({ open, onOpenChange }: ParentJoinDialogProps) => {
  const [inviteCode, setInviteCode] = useState("");

  const handleContinue = () => {
    // TODO: Implement invite code validation and navigation
    console.log("Invite code submitted:", inviteCode);
  };

  const handleScanQR = () => {
    // TODO: Implement QR scanning
    console.log("QR scan requested");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Join your child's TraceLab space</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Use the QR code or invite code your child's teacher shared with you. 
            You'll only see your own child's learning traces.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Scan QR Code Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scan QR code
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center bg-muted/30">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <Button 
                variant="outline" 
                onClick={handleScanQR}
                disabled
                className="mt-2"
              >
                Open camera to scan QR
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </div>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
              or
            </span>
          </div>

          {/* Enter Invite Code Section */}
          <div className="space-y-3">
            <Label htmlFor="invite-code" className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Enter invite code
            </Label>
            <Input
              id="invite-code"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider text-center text-lg"
              maxLength={8}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!inviteCode.trim()}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentJoinDialog;
