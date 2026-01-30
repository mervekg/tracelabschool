import { useState, useEffect } from "react";
import { Mail, Send, Inbox, PenSquare, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  recipient_email: string | null;
  subject: string;
  body: string;
  is_email_sent: boolean;
  is_read: boolean;
  created_at: string;
}

const TeacherMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Compose form
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendAsEmail, setSendAsEmail] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch received messages
    const { data: received } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    setMessages(received || []);

    // Fetch sent messages
    const { data: sent } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    setSentMessages(sent || []);
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
    );
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setSentMessages((prev) => prev.filter((m) => m.id !== messageId));
      setSelectedMessage(null);
      toast({ title: "Message deleted" });
    }
  };

  const sendMessage = async () => {
    if (!recipientEmail || !subject || !body) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save to database
    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_email: recipientEmail,
        subject,
        body,
        is_email_sent: sendAsEmail,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSending(false);
      return;
    }

    // If sendAsEmail is true, we would call an edge function here
    // For now, we just mark it as sent
    if (sendAsEmail) {
      toast({ 
        title: "Message Saved", 
        description: "Email sending will be available once configured" 
      });
    } else {
      toast({ title: "Message Sent", description: "Message saved successfully" });
    }

    setRecipientEmail("");
    setSubject("");
    setBody("");
    setSendAsEmail(false);
    setComposeOpen(false);
    setSending(false);
    fetchMessages();
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.recipient_id) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <TeacherLayout showSearch={false}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Send and receive messages</p>
          </div>
          <Button onClick={() => setComposeOpen(true)}>
            <PenSquare className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <Card>
              {loading ? (
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </CardContent>
              ) : messages.length === 0 ? (
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No messages in your inbox</p>
                </CardContent>
              ) : (
                <div className="divide-y">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !message.is_read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!message.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <p className={`font-medium truncate ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                              {message.subject}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {message.body.substring(0, 100)}...
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              {sentMessages.length === 0 ? (
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No sent messages</p>
                </CardContent>
              ) : (
                <div className="divide-y">
                  {sentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              To: {message.recipient_email}
                            </p>
                            {message.is_email_sent && (
                              <Badge variant="secondary" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">{message.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {message.body.substring(0, 100)}...
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Compose Dialog */}
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>To (Email)</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@email.com"
                />
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
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessage} disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Message Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  {selectedMessage?.recipient_email
                    ? `To: ${selectedMessage.recipient_email}`
                    : "From: System"}
                </p>
                <p>
                  {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{selectedMessage?.body}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherLayout>
  );
};

export default TeacherMessages;
