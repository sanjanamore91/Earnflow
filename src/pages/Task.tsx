import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { saveFormData, FormEntry } from "@/lib/firebaseDb";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LogOut, User } from "lucide-react";

export default function Task() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.uid || "");
      } else {
        setUserEmail("");
        setUserId("");
      }
    });

    return () => unsubscribe();
  }, []);

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
      
      setFormData({ name: "", email: "" });
      setIsDialogOpen(false);
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
                <h3 className="text-lg font-semibold mb-4">Task1</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="field1"
                      name="field1"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="field2"
                      name="field2"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <Button>Submit</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Task2</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="field3"
                      name="field3"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="field4"
                      name="field4"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <Button>Submit</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Task3</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="field5"
                      name="field5"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="field6"
                      name="field6"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <Button>Submit</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Task4</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="field7"
                      name="field7"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="field8"
                      name="field8"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <Button>Submit</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Task5</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="field9"
                      name="field9"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="field10"
                      name="field10"
                      placeholder="Enter text"
                      type="text"
                    />
                  </div>
                  <Button>Submit</Button>
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
