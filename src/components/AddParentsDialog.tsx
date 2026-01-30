import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, ClipboardPaste, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Parent {
  fullName: string;
  email: string;
  phone?: string;
  studentName?: string;
}

interface AddParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (parents: Parent[]) => void;
  isLoading?: boolean;
}

const AddParentsDialog = ({ open, onOpenChange, onSubmit, isLoading }: AddParentsDialogProps) => {
  const [manualParents, setManualParents] = useState<Parent[]>([
    { fullName: "", email: "", phone: "", studentName: "" }
  ]);
  const [bulkText, setBulkText] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  const addManualRow = () => {
    setManualParents([...manualParents, { fullName: "", email: "", phone: "", studentName: "" }]);
  };

  const removeManualRow = (index: number) => {
    if (manualParents.length > 1) {
      setManualParents(manualParents.filter((_, i) => i !== index));
    }
  };

  const updateManualParent = (index: number, field: keyof Parent, value: string) => {
    const updated = [...manualParents];
    updated[index] = { ...updated[index], [field]: value };
    setManualParents(updated);
  };

  const parseBulkText = (): Parent[] => {
    const lines = bulkText.trim().split("\n").filter(line => line.trim());
    const parents: Parent[] = [];

    for (const line of lines) {
      // Support formats: 
      // name,email,phone,studentName
      // name,email,phone
      // name,email
      // Or tab-separated
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      
      if (parts.length >= 2) {
        parents.push({
          fullName: parts[0].trim(),
          email: parts[1].trim(),
          phone: parts[2]?.trim() || "",
          studentName: parts[3]?.trim() || ""
        });
      }
    }

    return parents;
  };

  const handleSubmit = () => {
    let parentsToSubmit: Parent[] = [];

    if (activeTab === "manual") {
      parentsToSubmit = manualParents.filter(p => p.fullName && p.email);
      if (parentsToSubmit.length === 0) {
        toast.error("Please fill in at least one parent with name and email");
        return;
      }
    } else {
      parentsToSubmit = parseBulkText();
      if (parentsToSubmit.length === 0) {
        toast.error("No valid parent data found. Use format: Name, Email, Phone (optional), Student Name (optional)");
        return;
      }
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = parentsToSubmit.filter(p => !emailRegex.test(p.email));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email(s) found: ${invalidEmails.map(p => p.email).join(", ")}`);
      return;
    }

    onSubmit(parentsToSubmit);
  };

  const handleClose = () => {
    setManualParents([{ fullName: "", email: "", phone: "", studentName: "" }]);
    setBulkText("");
    setActiveTab("manual");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Parents
          </DialogTitle>
          <DialogDescription>
            Add parent contact information manually or paste a list from a spreadsheet.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4" />
              Paste List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-3">
              {manualParents.map((parent, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-muted/50 rounded-lg">
                  <div className="col-span-3">
                    <Label className="text-xs text-muted-foreground">Full Name *</Label>
                    <Input
                      placeholder="Parent name"
                      value={parent.fullName}
                      onChange={(e) => updateManualParent(index, "fullName", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs text-muted-foreground">Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={parent.email}
                      onChange={(e) => updateManualParent(index, "email", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input
                      placeholder="Phone"
                      value={parent.phone}
                      onChange={(e) => updateManualParent(index, "phone", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs text-muted-foreground">Student Name</Label>
                    <Input
                      placeholder="Student name"
                      value={parent.studentName}
                      onChange={(e) => updateManualParent(index, "studentName", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeManualRow(index)}
                      disabled={manualParents.length === 1}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addManualRow} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Parent
            </Button>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Paste parent data from spreadsheet</Label>
              <Textarea
                placeholder={`Paste your list here. Each line should contain:
Name, Email, Phone (optional), Student Name (optional)

Example:
John Smith, john@email.com, 555-1234, Emma Smith
Jane Doe, jane@email.com`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supports comma-separated or tab-separated values. Each line is one parent.
              </p>
            </div>

            {bulkText && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  Preview: {parseBulkText().length} parent(s) detected
                </p>
                {parseBulkText().slice(0, 3).map((p, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {p.fullName} ({p.email})
                  </p>
                ))}
                {parseBulkText().length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {parseBulkText().length - 3} more
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Adding..." : "Add Parents"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddParentsDialog;
