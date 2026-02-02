import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogOut, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { savePlanData, getPlanDataByUser, PlanEntry } from "@/lib/firebaseDb";

export default function Info() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [planAmount, setPlanAmount] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [existingPlan, setExistingPlan] = useState<PlanEntry | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserEmail(user.email || "");
                try {
                    const plans = await getPlanDataByUser(user.uid);
                    if (plans.length > 0) {
                        setExistingPlan(plans[plans.length - 1]);
                    }
                } catch (error: any) {
                    console.error("Error checking plan:", error);
                    setError(error.message || String(error));
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }

            const result = await savePlanData(name, planAmount, userId);
            setSuccess(result.message);

            // Fetched newly saved plan to update UI
            setExistingPlan({
                userId,
                name,
                planAmount,
                createdAt: new Date().toISOString()
            });

            // Force reload to ensure clean state and data verification
            window.location.reload();

            // Reset form after successful submission
            setName("");
            setPlanAmount("");
        } catch (err: any) {
            setError(err.message || "Failed to save plan data");
        } finally {
            setLoading(false);
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

    return (
        <Layout>
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-4xl space-y-6">
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
                        <CardContent>
                            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                                <User className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Logged in as</p>
                                    <p className="font-semibold">{userEmail}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full max-w-md mx-auto">
                        <CardHeader className="space-y-2">
                            <CardTitle>Add Plan Details</CardTitle>
                            <CardDescription>Enter the name and plan amount below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="mb-4 border-green-200 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                                </Alert>
                            )}

                            {existingPlan ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="flex justify-center">
                                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-green-700">Plan Active!</h3>
                                        <p className="text-muted-foreground mt-2">You have the following plan:</p>
                                        <p className="text-2xl font-bold mt-1 text-primary">{existingPlan.planAmount}</p>
                                        <p className="text-sm text-gray-500 mt-2">Registered Name: {existingPlan.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Activated on: {new Date(existingPlan.createdAt).toLocaleDateString()} {new Date(existingPlan.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Contact support if you need to change this.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Enter your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="planAmount">Plan Amount</Label>
                                        <Select value={planAmount} onValueChange={setPlanAmount} required disabled={loading}>
                                            <SelectTrigger id="planAmount">
                                                <SelectValue placeholder="Select plan amount" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Rs.1499">Rs.1499</SelectItem>
                                                <SelectItem value="Rs.3999">Rs.3999</SelectItem>
                                                <SelectItem value="Rs.8999">Rs.8999</SelectItem>
                                                <SelectItem value="Rs.14999">Rs.14999</SelectItem>
                                                <SelectItem value="Rs.21999">Rs.21999</SelectItem>
                                                <SelectItem value="Rs.41999">Rs.41999</SelectItem>
                                                <SelectItem value="Rs.61999">Rs.61999</SelectItem>
                                                <SelectItem value="Rs.81999">Rs.81999</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
