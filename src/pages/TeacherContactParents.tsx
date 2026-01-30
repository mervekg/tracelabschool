import { useState, useEffect } from "react";
import { Users, Mail, Send, CheckSquare, Square, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  class_id: string;
  class_name?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
}

const TeacherContactParents = () => {
  const { toast } = useToast();
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Message dialog
  const [messageOpen, setMessageOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendAsEmail, setSendAsEmail] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch classes
    const { data: classesData } = await supabase
      .from("classes")
      .select("id, name, subject")
      .eq("teacher_id", user.id);

    setClasses(classesData || []);

    // Fetch all parents
    const { data: parentsData } = await supabase
      .from("parents")
      .select("*, classes!inner(name, teacher_id)")
      .eq("classes.teacher_id", user.id);

    if (parentsData) {
      setParents(parentsData.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        class_id: p.class_id,
        class_name: p.classes?.name,
      })));
    }

    setLoading(false);
  };

  const filteredParents = parents.filter((parent) => {
    const matchesClass = filterClass === "all" || parent.class_id === filterClass;
    const matchesSearch =
      parent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedParents.size === filteredParents.length) {
      setSelectedParents(new Set());
    } else {
      setSelectedParents(new Set(filteredParents.map((p) => p.id)));
    }
  };

  const toggleParent = (id: string) => {
    const newSelected = new Set(selectedParents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParents(newSelected);
  };

  const sendMessages = async () => {
    if (!subject || !body) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (selectedParents.size === 0) {
      toast({ title: "Error", description: "Please select at least one parent", variant: "destructive" });
      return;
    }

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const selectedParentsList = parents.filter((p) => selectedParents.has(p.id));
    
    const messagesToInsert = selectedParentsList.map((parent) => ({
      sender_id: user.id,
      recipient_email: parent.email,
      subject,
      body,
      is_email_sent: sendAsEmail,
    }));

    const { error } = await supabase
      .from("messages")
      .insert(messagesToInsert);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Success",
        description: `Message sent to ${selectedParentsList.length} parent(s)`,
      });
      setMessageOpen(false);
      setSubject("");
      setBody("");
      setSendAsEmail(false);
      setSelectedParents(new Set());
    }

    setSending(false);
  };

  return (
    <TeacherLayout 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
      showSearch={true}
    >
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contact Parents</h1>
            <p className="text-muted-foreground">
              Send messages to parents across all your classes
            </p>
          </div>
          <Button
            onClick={() => setMessageOpen(true)}
            disabled={selectedParents.size === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            Message Selected ({selectedParents.size})
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredParents.length} parent(s) found
          </div>
        </div>

        {/* Parents Table */}
        <Card>
          {loading ? (
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          ) : filteredParents.length === 0 ? (
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No parent contacts found</p>
              <p className="text-sm">Add parents from individual class pages</p>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={toggleSelectAll}
                    >
                      {selectedParents.size === filteredParents.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedParents.has(parent.id)}
                        onCheckedChange={() => toggleParent(parent.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{parent.full_name}</TableCell>
                    <TableCell>{parent.email}</TableCell>
                    <TableCell>{parent.phone || "-"}</TableCell>
                    <TableCell>{parent.class_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={toggleSelectAll}
            disabled={filteredParents.length === 0}
          >
            {selectedParents.size === filteredParents.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>

        {/* Message Dialog */}
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Send Message to {selectedParents.size} Parent(s)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Recipients:{" "}
                {parents
                  .filter((p) => selectedParents.has(p.id))
                  .map((p) => p.email)
                  .join(", ")}
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message..."
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={sendAsEmail}
                  onCheckedChange={(checked) => setSendAsEmail(checked === true)}
                />
                <Label htmlFor="sendEmail" className="text-sm cursor-pointer">
                  Also send as email
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessages} disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherLayout>
  );
};

export default TeacherContactParents;
