import { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudentInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
}

const StudentInviteDialog = ({ 
  open, 
  onOpenChange, 
  studentName,
  studentId 
}: StudentInviteDialogProps) => {
  // Generate a placeholder invite code based on student ID
  const inviteCode = `P${studentId.slice(0, 6).toUpperCase()}`;
  const inviteLink = `${window.location.origin}/parent/join/${inviteCode}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Parent for {studentName}</DialogTitle>
          <DialogDescription>
            Share this QR code or invite link with the parent/guardian.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">QR Code</p>
                <p className="text-xs text-muted-foreground">(Coming soon)</p>
              </div>
            </div>
          </div>

          {/* Invite Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
            <p className="font-mono text-2xl font-bold tracking-wider">{inviteCode}</p>
          </div>

          {/* Invite Link */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Invite Link</p>
            <p className="text-sm font-mono break-all">{inviteLink}</p>
          </div>

          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentInviteDialog;
