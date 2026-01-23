import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

export default function Plans() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || "");
    }
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1499, 3999, 8999, 14999, 21999, 41999, 61999, 81999].map((price) => {
                  const formatted = new Intl.NumberFormat().format(price);
                  if (price === 1499) {
                    return (
                      <div
                        key={price}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate("/hierarchy1499")}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/hierarchy1499")}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">{formatted}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">Plan amount: {formatted}</p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }

                  return (
                    <Card key={price}>
                      <CardHeader>
                        <CardTitle className="text-lg">{formatted}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Plan amount: {formatted}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
