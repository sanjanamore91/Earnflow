import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { saveFormData, getFormDataByUser, FormEntry } from "@/lib/firebaseDb";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LogOut, User } from "lucide-react";

export default function Sector1499() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<string[]>(Array(9).fill(""));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [button1Email, setButton1Email] = useState<string>("");
  const [button2Email, setButton2Email] = useState<string>("");
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.uid || "");
        // Fetch emails from JSON file when user changes
        fetchButtonEmails(user.uid);
      } else {
        setUserEmail("");
        setUserId("");
        setButton1Email("");
        setButton2Email("");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchButtonEmails = async (uid: string) => {
    try {
      console.log("Fetching button emails for user:", uid);
      const data = await getFormDataByUser(uid);
      console.log("Fetched data for user:", data);
      if (data.length > 0) {
        setButton1Email(data[0]?.email || "");
        console.log("Button 1 email set to:", data[0]?.email);
      } else {
        setButton1Email("");
      }
      if (data.length > 1) {
        setButton2Email(data[1]?.email || "");
        console.log("Button 2 email set to:", data[1]?.email);
      } else {
        setButton2Email("");
      }
    } catch (err) {
      console.error("Error fetching button emails:", err);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await saveFormData(formData.name, formData.email, userId);
      alert("Form data saved successfully!");
      
      // Fetch updated emails from Firebase for this user
      await fetchButtonEmails(userId);
      
      setFormData({ name: "", email: "" });
      setIsDialogOpen(false);
      setActiveButtonIndex(null);
    } catch (err) {
      console.error("Error saving form data:", err);
      alert("Error saving form data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Welcome to Dashboard</CardTitle>
                <CardDescription>You are successfully logged in</CardDescription>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="font-semibold">{userEmail}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Sector Inputs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {fields.map((value, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label htmlFor={`field-${idx}`}>Field {idx + 1}</Label>
                      <Input
                        id={`field-${idx}`}
                        value={value}
                        onChange={(e) => handleFieldChange(idx, e.target.value)}
                        placeholder={`Enter value ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={() => {
                    setActiveButtonIndex(0);
                    setIsDialogOpen(true);
                  }}>
                    {button1Email || ""}
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setActiveButtonIndex(1);
                    setIsDialogOpen(true);
                  }}>
                    {button2Email || ""}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Your Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
