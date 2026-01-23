import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

function MLMTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState([
    { id: 0, label: "Root" },
    { id: 1, label: "Left" },
    { id: 2, label: "Right" },
    { id: 3, label: "L1" },
    { id: 4, label: "L2" },
    { id: 5, label: "L3" },
    { id: 6, label: "R1" },
    { id: 7, label: "R2" },
    { id: 8, label: "R3" },
  ]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const boxSize = 70;
  const boxHalf = boxSize / 2;
  const margin = 40;

  const handleNodeChange = (nodeId: number, newLabel: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, label: newLabel } : node))
    );
  };

  return (
    <div className="relative w-full" style={{ height: 600 }} ref={containerRef}>
      {width > 0 && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${width} 600`}
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          {(() => {
            const rows = [[0], [1, 2], [3, 4, 5, 6, 7, 8]];
            const yStep = 140;
            const coords: Record<number, { x: number; y: number }> = {};

            rows.forEach((row, rIdx) => {
              const n = row.length;
              row.forEach((nodeIdx, i) => {
                const x = margin + ((i + 1) * (width - margin * 2)) / (n + 1);
                const y = 40 + rIdx * yStep + boxHalf;
                coords[nodeIdx] = { x, y };
              });
            });

            const paths: JSX.Element[] = [];
            [[0, [1, 2]], [1, [3, 4, 5]], [2, [6, 7, 8]]].forEach(([p, children]) => {
              (children as number[]).forEach((c) => {
                const pC = coords[p as number];
                const cC = coords[c];
                if (pC && cC) {
                  const midY = (pC.y + cC.y) / 2;
                  const d = `M ${pC.x} ${pC.y + boxHalf} L ${pC.x} ${midY} L ${cC.x} ${midY} L ${cC.x} ${cC.y - boxHalf}`;
                  paths.push(
                    <path
                      key={`path-${p}-${c}`}
                      d={d}
                      stroke="#cbd5e1"
                      strokeWidth={3}
                      strokeLinecap="round"
                      fill="none"
                    />
                  );
                }
              });
            });
            return paths;
          })()}
        </svg>
      )}

      {/* Render nodes */}
      {(() => {
        const rows = [[0], [1, 2], [3, 4, 5, 6, 7, 8]];
        const yStep = 140;

        return rows.flatMap((row, rIdx) => {
          const n = row.length;
          return row.map((nodeIdx, i) => {
            const x = width ? margin + ((i + 1) * (width - margin * 2)) / (n + 1) : 0;
            const y = 40 + rIdx * yStep + boxHalf;
            const left = Math.max(margin, Math.min(width - boxSize - margin, x - boxHalf));
            const top = y - boxHalf;

            return (
              <div
                key={`node-${nodeIdx}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: boxSize,
                  height: boxSize,
                  zIndex: 10,
                }}
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-full rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center">
                  <input
                    type="text"
                    value={nodes[nodeIdx].label}
                    onChange={(e) => handleNodeChange(nodeIdx, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder={`Node ${nodeIdx}`}
                    className="w-full h-full text-center bg-transparent text-gray-800 font-semibold text-sm outline-none px-2 rounded-md"
                  />
                </div>
              </div>
            );
          });
        });
      })()}
    </div>
  );
}

export default function Hierarchy1499() {
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

              {/* Interactive MLM Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MLM Hierarchy Tree (Interactive)</CardTitle>
                </CardHeader>
                <CardContent>
                  <MLMTree />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
