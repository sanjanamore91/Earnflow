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
      { id: 1, email: "", position: { top: "0", left: "50%" }, size: "w-16 h-16", color: "bg-blue-600 hover:bg-blue-700" },
      { id: 2, email: "", position: { top: "115px", left: "150px" }, size: "w-12 h-12", color: "bg-green-600 hover:bg-green-700" },
      { id: 3, email: "", position: { top: "115px", left: "450px" }, size: "w-12 h-12", color: "bg-green-600 hover:bg-green-700" },
      { id: 4, email: "", position: { top: "250px", left: "75px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 5, email: "", position: { top: "250px", left: "150px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 6, email: "", position: { top: "250px", left: "225px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 7, email: "", position: { top: "250px", left: "375px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 8, email: "", position: { top: "250px", left: "450px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
      { id: 9, email: "", position: { top: "250px", left: "525px" }, size: "w-10 h-10", color: "bg-purple-600 hover:bg-purple-700" },
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

  return (
    <>
      <div className="my-12 px-4 overflow-x-auto flex justify-center">
        <div className="relative" style={{ width: "600px", height: "500px" }}>
          {/* SVG Lines connecting nodes */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ width: "600px", height: "500px" }}
          >
            {/* Level 1 to Level 2 Lines */}
            <line x1="300" y1="50" x2="300" y2="90" stroke="#94a3b8" strokeWidth="2" />
            <line x1="150" y1="90" x2="300" y2="90" stroke="#94a3b8" strokeWidth="2" />
            <line x1="150" y1="90" x2="150" y2="115" stroke="#94a3b8" strokeWidth="2" />
            <line x1="450" y1="90" x2="300" y2="90" stroke="#94a3b8" strokeWidth="2" />
            <line x1="450" y1="90" x2="450" y2="115" stroke="#94a3b8" strokeWidth="2" />

            {/* Level 2 to Level 3 Lines */}
            <line x1="150" y1="155" x2="150" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <line x1="75" y1="200" x2="225" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <line x1="75" y1="200" x2="75" y2="250" stroke="#94a3b8" strokeWidth="2" />
            <line x1="150" y1="200" x2="150" y2="250" stroke="#94a3b8" strokeWidth="2" />
            <line x1="225" y1="200" x2="225" y2="250" stroke="#94a3b8" strokeWidth="2" />

            <line x1="450" y1="155" x2="450" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <line x1="375" y1="200" x2="525" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <line x1="375" y1="200" x2="375" y2="250" stroke="#94a3b8" strokeWidth="2" />
            <line x1="450" y1="200" x2="450" y2="250" stroke="#94a3b8" strokeWidth="2" />
            <line x1="525" y1="200" x2="525" y2="250" stroke="#94a3b8" strokeWidth="2" />
          </svg>

          {/* Render all member buttons */}
          {members.map((member) => (
            <div
              key={member.id}
              className="absolute"
              style={{
                top: member.position.top,
                left: member.position.left,
                transform: "translateX(-50%)",
              }}
            >
              <Button
                onClick={() => handleMemberClick(member)}
                className={`${member.size} rounded-full shadow flex items-center justify-center text-xs font-semibold text-white ${member.color} cursor-pointer transition-all hover:scale-110`}
                title={member.id === 1 ? dashboardName : (member.email || "Click to add email")}
              >
                {member.id === 1 ? (dashboardName ? dashboardName.substring(0, 3) : "") : (member.email ? member.email.substring(0, 3) : "")}
              </Button>
            </div>
          ))}
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
