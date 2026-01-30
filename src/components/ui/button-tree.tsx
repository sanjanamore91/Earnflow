import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

interface Member {
  id: number;
  email: string;
  position: { top: string; left: string };
  size: string;
  color: string;
}

interface ButtonTreeProps {
  dashboardName?: string;
}

export default function ButtonTree({ dashboardName = "" }: ButtonTreeProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");

  // Initialize members with empty emails
  useEffect(() => {
    const initialMembers: Member[] = [
      // positions set as percentages so they scale with the SVG viewBox
      { id: 1, email: "", position: { top: "10%", left: "50%" }, size: "w-20 h-20", color: "bg-blue-600 hover:bg-blue-700" },
      { id: 2, email: "", position: { top: "23%", left: "25%" }, size: "w-12 h-12", color: "bg-green-600 hover:bg-green-700" },
      { id: 3, email: "", position: { top: "23%", left: "75%" }, size: "w-12 h-12", color: "bg-green-600 hover:bg-green-700" },
      { id: 4, email: "", position: { top: "50%", left: "12.5%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 5, email: "", position: { top: "50%", left: "25%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 6, email: "", position: { top: "50%", left: "37.5%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 7, email: "", position: { top: "50%", left: "62.5%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 8, email: "", position: { top: "50%", left: "75%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 9, email: "", position: { top: "50%", left: "87.5%" }, size: "w-12 h-12", color: "bg-purple-600 hover:bg-purple-700" },
    ];
    setMembers(initialMembers);
    
    // Get current user and fetch their data
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchMembersData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMembersData = async (currentUserId: string) => {
    try {
      // Fetch data from user-specific path: formData/{userId}
      const userFormDataRef = ref(database, `formData/${currentUserId}`);
      const snapshot = await get(userFormDataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const memberEmails: { [key: number]: string } = {};

        // Look for entries with memberId field
        Object.values(data).forEach((entry: any) => {
          if (entry.memberId) {
            memberEmails[entry.memberId] = entry.email || "";
          }
        });

        setMembers((prevMembers) =>
          prevMembers.map((member) => ({
            ...member,
            email: memberEmails[member.id] || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching members data:", error);
    }
  };

  const handleMemberClick = (member: Member) => {
    // Skip dialog for root node (member id 1)
    if (member.id === 1) {
      return;
    }
    
    setSelectedMember(member);
    setFormData({ name: "", email: member.email || "" });
    setIsDialogOpen(true);
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
      
      // Save to Firebase with user-specific path: formData/{userId}/member_{id}
      if (selectedMember && userId) {
        const memberDataRef = ref(database, `formData/${userId}/member_${selectedMember.id}`);
        const dataToSave = {
          memberId: selectedMember.id,
          userId: userId,
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
        };
        await set(memberDataRef, dataToSave);
        
        // Update the member's email in state
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMember.id
              ? { ...member, email: formData.email }
              : member
          )
        );
      }

      alert("Form data saved successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", email: "" });
    } catch (err) {
      console.error("Error saving form data:", err);
      alert("Error saving form data");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to compute SVG coordinates (viewBox 600x500) from member percentage positions
  const getCoords = (member: Member) => {
    const leftStr = member.position.left.toString();
    const topStr = member.position.top.toString();

    const leftPercent = leftStr.includes("%")
      ? parseFloat(leftStr)
      : parseFloat(leftStr) / 6; // fallback for px-ish values

    const topPercent = topStr.includes("%")
      ? parseFloat(topStr)
      : (parseFloat(topStr) / 500) * 100; // fallback

    const x = (leftPercent / 100) * 600;
    const y = (topPercent / 100) * 500;

    return { x, y };
  };

  return (
    <>
      <div className="my-12 px-2 sm:px-4 w-full flex justify-center overflow-hidden">
        <div className="w-full" style={{ maxWidth: "100%", aspectRatio: "6/5" }}>
          <svg
            className="w-full h-full"
            viewBox="0 0 600 500"
            preserveAspectRatio="xMidYMid meet"
            role="img"
          >
            {/* Dynamic lines computed from member coordinates so endpoints hit the circle centers */}
            {(() => {
              if (!members || members.length === 0) return null;
              const root = members.find((m) => m.id === 1);
              const l2a = members.find((m) => m.id === 2);
              const l2b = members.find((m) => m.id === 3);

              const lines: React.ReactNode[] = [];

              if (root && l2a) {
                const r = getCoords(root);
                const a = getCoords(l2a);
                lines.push(<line key="r-a" x1={r.x} y1={r.y} x2={a.x} y2={a.y} stroke="#94a3b8" strokeWidth="2" />);
              }
              if (root && l2b) {
                const r = getCoords(root);
                const b = getCoords(l2b);
                lines.push(<line key="r-b" x1={r.x} y1={r.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth="2" />);
              }

              // children of 2 are 4,5,6
              const parent2 = l2a;
              if (parent2) {
                const p = getCoords(parent2);
                [4, 5, 6].forEach((cid) => {
                  const child = members.find((m) => m.id === cid);
                  if (child) {
                    const c = getCoords(child);
                    lines.push(<line key={`2-${cid}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke="#94a3b8" strokeWidth="2" />);
                  }
                });
              }

              // children of 3 are 7,8,9
              const parent3 = l2b;
              if (parent3) {
                const p = getCoords(parent3);
                [7, 8, 9].forEach((cid) => {
                  const child = members.find((m) => m.id === cid);
                  if (child) {
                    const c = getCoords(child);
                    lines.push(<line key={`3-${cid}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke="#94a3b8" strokeWidth="2" />);
                  }
                });
              }

              return lines;
            })()}

            {/* Render member nodes as SVG groups so lines and nodes share coordinates */}
            {members.map((member) => {
              // member.position uses percentages like "10%" or "50%"
              const leftPercent = member.position.left.toString().includes("%")
                ? parseFloat(member.position.left.toString())
                : parseFloat(member.position.left.toString()) / 6; // fallback
              const topPercent = member.position.top.toString().includes("%")
                ? parseFloat(member.position.top.toString())
                : (parseFloat(member.position.top.toString()) / 500) * 100; // fallback

              const cx = (leftPercent / 100) * 600;
              const cy = (topPercent / 100) * 500;

              const isRoot = member.id === 1;
              const radius = isRoot ? 28 : 22; // sizes relative to viewBox

              // Use theme green for all circles
              const themeGreen = "#059669";

              return (
                <g
                  key={member.id}
                  transform={`translate(${cx}, ${cy})`}
                  style={{ cursor: isRoot ? "default" : "pointer" }}
                  onClick={() => handleMemberClick(member)}
                >
                  <circle r={radius} fill={themeGreen} />
                  <text x="0" y="8" fontSize="14" textAnchor="middle" fill="#fff" style={{ pointerEvents: "none", fontWeight: 700 }}>
                    {member.id === 1 ? (dashboardName ? dashboardName.substring(0, 6) : "") : (member.email ? member.email.substring(0, 6) : "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dialog for form submission */}
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
    </>
  );
}
