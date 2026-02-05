import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { getEarningsByUser, EarningEntry, backfillHistoryEarnings, requestWithdrawal, getPlanDataByUser } from "@/lib/firebaseDb";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Wallet, ArrowLeft, History } from "lucide-react";

export default function Payment() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [currentPlanAmount, setCurrentPlanAmount] = useState<number>(0);
    const [transactions, setTransactions] = useState<EarningEntry[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userId = user.uid;
                setUserId(userId);
                const email = user.email || "";
                setUserEmail(email);

                try {
                    setLoading(true);
                    // 0. Check for active plan first
                    const plans = await getPlanDataByUser(userId);
                    if (!plans || plans.length === 0) {
                        navigate("/info");
                        return; // Stop further execution
                    }

                    const latestPlan = plans[plans.length - 1];
                    // Clean both "Rs." and "$" prefixes
                    const cleanAmount = latestPlan.planAmount.replace(/^(Rs\.|\$)/i, '').replace(/[^0-9.]/g, '');
                    setCurrentPlanAmount(parseFloat(cleanAmount));

                    // 1. Robust backfill of all historical earnings based on task completions
                    await backfillHistoryEarnings(userId);

                    // 2. Fetch all earnings for display
                    const earnings = await getEarningsByUser(userId);

                    // Sort earnings by date (newest first)
                    const sortedEarnings = earnings.sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    setTransactions(sortedEarnings);

                    // Calculate total balance from all verified earnings
                    const total = sortedEarnings.reduce((sum, item) => sum + item.amount, 0);
                    setBalance(total);
                } catch (error) {
                    console.error("Error fetching earnings:", error);
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, [navigate]);

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
            <div className="min-h-[calc(100vh-64px)] py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl">Payment & Withdrawal</CardTitle>
                                <CardDescription>Manage your earnings and withdrawals</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleLogout}
                                    disabled={loading}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                                <User className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Logged in as</p>
                                    <p className="font-semibold">{userEmail}</p>
                                </div>
                            </div>

                            <Card className="border-primary/20">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-xl">Available Balance</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-4xl font-bold text-primary">${balance.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Total earnings from completed tasks
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Withdrawal Information</CardTitle>
                                    <CardDescription>
                                        Important details about withdrawing your earnings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Requirements:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>Minimum withdrawal threshold must be reached</li>
                                            <li>Balance must be at least ${(currentPlanAmount * 0.02).toFixed(2)} (2% of plan)</li>
                                            <li>Twenty days interval between withdrawals</li>
                                            <li>Valid payment method must be configured</li>
                                            <li>Account must be verified</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm">
                                            You can withdraw your earnings alternatively after reaching the minimum
                                            threshold and twenty days interval.
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                // Call withdrawal function
                                                const result = await requestWithdrawal(userId, balance);

                                                if (result.success) {
                                                    alert(result.message);
                                                    // Update local state to reflect changes immediately
                                                    setBalance(0);
                                                    setTransactions([]);
                                                }
                                            } catch (error) {
                                                console.error("Withdrawal failed:", error);
                                                alert("Failed to process withdrawal request");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading || balance <= 0 || balance < (currentPlanAmount * 0.02)}
                                    >
                                        {loading ? "Processing..." : "Request Withdrawal"}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        <CardTitle>Transaction History</CardTitle>
                                    </div>
                                    <CardDescription>Your daily earnings history</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {transactions.length > 0 ? (
                                        <div className="space-y-4">
                                            {transactions.map((transaction, index) => (
                                                <div
                                                    key={transaction.id || index}
                                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <div>
                                                        <p className="font-medium">Task Completion Reward</p>
                                                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                                    </div>
                                                    <p className="font-bold text-green-600">+${transaction.amount.toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No transactions yet. Complete tasks to earn!
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
