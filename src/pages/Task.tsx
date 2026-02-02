import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { saveFormData, FormEntry, getRandomSentences, saveTaskResponse, getDailySentences, saveTaskCompletion, checkTaskCompletionToday } from "@/lib/firebaseDb";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [sentences, setSentences] = useState<string[]>([]);
  const [taskCompletedToday, setTaskCompletedToday] = useState(false);

  // State for task input fields
  const [taskInputs, setTaskInputs] = useState({
    field2: "",
    field4: "",
    field6: "",
    field8: "",
    field10: "",
  });

  // Loading states for each submit button
  const [taskLoading, setTaskLoading] = useState({
    task1: false,
    task2: false,
    task3: false,
    task4: false,
    task5: false,
  });

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

  useEffect(() => {
    const fetchSentences = async () => {
      // Only fetch sentences if userId is available
      if (!userId) return;

      try {
        const dailySentences = await getDailySentences(userId, 5);
        setSentences(dailySentences);
      } catch (error) {
        console.error("Error fetching daily sentences:", error);
      }
    };

    fetchSentences();
  }, [userId]); // Re-fetch when userId changes

  useEffect(() => {
    const checkCompletion = async () => {
      if (!userId) return;

      try {
        const isCompleted = await checkTaskCompletionToday(userId);
        setTaskCompletedToday(isCompleted);
      } catch (error) {
        console.error("Error checking task completion:", error);
      }
    };

    checkCompletion();
  }, [userId]);

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

  // Handle task input changes
  const handleTaskInputChange = (fieldName: string, value: string) => {
    setTaskInputs((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Submit handlers for each task
  const handleTaskSubmit = async (taskNumber: number, fieldName: keyof typeof taskInputs, taskKey: keyof typeof taskLoading) => {
    const userResponse = taskInputs[fieldName];
    const sentence = sentences[taskNumber - 1];

    if (!userResponse.trim()) {
      alert("Please enter your response before submitting");
      return;
    }

    if (!sentence) {
      alert("Sentence not loaded yet. Please wait.");
      return;
    }

    try {
      setTaskLoading((prev) => ({ ...prev, [taskKey]: true }));
      await saveTaskResponse(taskNumber, sentence, userResponse, userId);
      alert(`Task ${taskNumber} submitted successfully!`);

      // Clear the input field after successful submission
      setTaskInputs((prev) => ({ ...prev, [fieldName]: "" }));
    } catch (err) {
      console.error(`Error submitting Task ${taskNumber}:`, err);
      alert(`Error submitting Task ${taskNumber}`);
    } finally {
      setTaskLoading((prev) => ({ ...prev, [taskKey]: false }));
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
              {taskCompletedToday ? (
                // Show completion message if task is already completed today
                <div className="text-center py-12">
                  <div className="mb-6">
                    <svg
                      className="mx-auto h-24 w-24 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Task Completed for Today!</h2>
                  <p className="text-muted-foreground mb-6">
                    You've already completed your task for today. Come back tomorrow for new tasks.
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              ) : (
                // Show task form if not completed
                <>
                  <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Logged in as</p>
                      <p className="font-semibold">{userEmail}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Task1</h3>
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          id="field1"
                          name="field1"
                          placeholder="Loading sentence..."
                          value={sentences[0] || ""}
                          readOnly
                          rows={3}
                          className="bg-muted resize-none"
                        />
                      </div>
                      <div>
                        <Input
                          id="field2"
                          name="field2"
                          placeholder="Enter text"
                          type="text"
                          value={taskInputs.field2}
                          onChange={(e) => handleTaskInputChange("field2", e.target.value)}
                        />
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Task2</h3>
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          id="field3"
                          name="field3"
                          placeholder="Loading sentence..."
                          value={sentences[1] || ""}
                          readOnly
                          rows={3}
                          className="bg-muted resize-none"
                        />
                      </div>
                      <div>
                        <Input
                          id="field4"
                          name="field4"
                          placeholder="Enter text"
                          type="text"
                          value={taskInputs.field4}
                          onChange={(e) => handleTaskInputChange("field4", e.target.value)}
                        />
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Task3</h3>
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          id="field5"
                          name="field5"
                          placeholder="Loading sentence..."
                          value={sentences[2] || ""}
                          readOnly
                          rows={3}
                          className="bg-muted resize-none"
                        />
                      </div>
                      <div>
                        <Input
                          id="field6"
                          name="field6"
                          placeholder="Enter text"
                          type="text"
                          value={taskInputs.field6}
                          onChange={(e) => handleTaskInputChange("field6", e.target.value)}
                        />
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Task4</h3>
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          id="field7"
                          name="field7"
                          placeholder="Loading sentence..."
                          value={sentences[3] || ""}
                          readOnly
                          rows={3}
                          className="bg-muted resize-none"
                        />
                      </div>
                      <div>
                        <Input
                          id="field8"
                          name="field8"
                          placeholder="Enter text"
                          type="text"
                          value={taskInputs.field8}
                          onChange={(e) => handleTaskInputChange("field8", e.target.value)}
                        />
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Task5</h3>
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          id="field9"
                          name="field9"
                          placeholder="Loading sentence..."
                          value={sentences[4] || ""}
                          readOnly
                          rows={3}
                          className="bg-muted resize-none"
                        />
                      </div>
                      <div>
                        <Input
                          id="field10"
                          name="field10"
                          placeholder="Enter text"
                          type="text"
                          value={taskInputs.field10}
                          onChange={(e) => handleTaskInputChange("field10", e.target.value)}
                        />
                      </div>

                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={async () => {
                        try {
                          setLoading(true);

                          // Save task completion data to Firebase
                          await saveTaskCompletion(userId, taskInputs, sentences);

                          // Update state to show completion message
                          setTaskCompletedToday(true);

                          alert("All tasks completed successfully! Great work!");
                          navigate("/dashboard");
                        } catch (error) {
                          console.error("Error saving task completion:", error);
                          alert("Error saving task completion. Please try again.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Complete Task"}
                    </Button>
                  </div>
                </>
              )}

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
