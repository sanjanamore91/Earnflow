import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import app, { auth } from "@/lib/firebase";
import { getFirestore, collection, addDoc, setDoc, doc, updateDoc, arrayUnion, serverTimestamp, getDoc, getDocs, query as firestoreQuery, where, enableNetwork } from "firebase/firestore";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// MLMTree component removed per request

export default function Hierarchy1499() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [newParentName, setNewParentName] = useState<string>("");
  const [newParentEmail, setNewParentEmail] = useState<string>("");
  const [creatingParent, setCreatingParent] = useState(false);
  const PENDING_PARENT_KEY = "pending_mlm_parents";

  useEffect(() => {
    const trySync = async () => {
      const raw = localStorage.getItem(PENDING_PARENT_KEY);
      if (!raw) return;
      let list: Array<any> = [];
      try {
        list = JSON.parse(raw || "[]");
      } catch {
        list = [];
      }
      if (!list.length) return;
      for (const p of list.slice()) {
        try {
          const ref = doc(db, "mlmUsers", p.id);
          await setDoc(ref, {
            name: p.name,
            email: p.email || null,
            parentId: null,
            children: [],
            createdAt: p.createdAt || serverTimestamp(),
          });
          // remove from local cache
          list = list.filter((x) => x.id !== p.id);
          localStorage.setItem(PENDING_PARENT_KEY, JSON.stringify(list));
          setMessage(`Synced parent ${p.name} (id: ${p.id})`);
        } catch (err) {
          console.error("Background sync failed for parent", p.id, err);
        }
      }
    };

    const onOnline = () => {
      trySync().catch(console.error);
    };

    window.addEventListener("online", onOnline);
    // also attempt an initial sync
    if (navigator.onLine) trySync().catch(console.error);
    return () => window.removeEventListener("online", onOnline);
  }, [db]);

  const db = getFirestore(app);

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

  const handleCreateUnderParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!parentId) {
      setMessage("Please provide a parent ID");
      return;
    }
    if (!name || !email) {
      setMessage("Please provide name and email for the new user");
      return;
    }

    try {
      setCreating(true);

      // resolve parentRef: allow passing either a document id or an email
      let parentRef = undefined as any;
      let parentSnap = undefined as any;

      if (parentId.includes("@")) {
        // treat parentId as an email, query by email field
        const q = firestoreQuery(collection(db, "mlmUsers"), where("email", "==", parentId));
        try {
          const qs = await getDocs(q);
          if (qs.empty) {
            setMessage("Parent node not found by email");
            return;
          }
          parentRef = qs.docs[0].ref;
        } catch (err) {
          const msg = (err as Error).message || "";
          if (/client is offline/i.test(msg)) {
            // try to re-enable network and retry once
            await enableNetwork(db);
            const qs = await getDocs(q);
            if (qs.empty) {
              setMessage("Parent node not found by email");
              return;
            }
            parentRef = qs.docs[0].ref;
          } else {
            throw err;
          }
        }
      } else {
        parentRef = doc(db, "mlmUsers", parentId);
        try {
          parentSnap = await getDoc(parentRef);
        } catch (err) {
          const msg = (err as Error).message || "";
          if (/client is offline/i.test(msg)) {
            await enableNetwork(db);
            parentSnap = await getDoc(parentRef);
          } else {
            throw err;
          }
        }

        if (!parentSnap || !parentSnap.exists()) {
          setMessage("Parent node not found");
          return;
        }
      }

      // create child node
      const childRef = await addDoc(collection(db, "mlmUsers"), {
        name,
        email,
        parentId: parentRef.id,
        children: [],
        createdAt: serverTimestamp(),
      });

      // attach child id to parent
      await updateDoc(parentRef, {
        children: arrayUnion(childRef.id),
      });

      setMessage(`Created user ${name} (id: ${childRef.id}) under parent ${parentRef.id}`);
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create user: " + (err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!newParentName) {
      setMessage("Please provide a name for the parent node");
      return;
    }

    try {
      // optimistic: generate id and update UI immediately
      const parentRef = doc(collection(db, "mlmUsers"));
      const id = parentRef.id;
      setParentId(id);
      setMessage(`Created parent ${newParentName} (local id: ${id})`);
      const nameToSend = newParentName;
      const emailToSend = newParentEmail || null;
      setNewParentName("");
      setNewParentEmail("");

      // save to pending queue if offline or always attempt background write
      const pending = { id, name: nameToSend, email: emailToSend, createdAt: Date.now() };
      const raw = localStorage.getItem(PENDING_PARENT_KEY);
      let list: Array<any> = [];
      try {
        list = raw ? JSON.parse(raw) : [];
      } catch {
        list = [];
      }
      list.push(pending);
      localStorage.setItem(PENDING_PARENT_KEY, JSON.stringify(list));

      // attempt immediate background write; if it fails, the 'online' sync will retry
          setDoc(parentRef, {
        name: nameToSend,
        email: emailToSend,
        parentId: null,
        children: [],
        createdAt: serverTimestamp(),
      })
        .then(() => {
          // remove from pending
          const raw2 = localStorage.getItem(PENDING_PARENT_KEY);
          let list2: Array<any> = [];
          try {
            list2 = raw2 ? JSON.parse(raw2) : [];
          } catch {
            list2 = [];
          }
          list2 = list2.filter((x) => x.id !== id);
          localStorage.setItem(PENDING_PARENT_KEY, JSON.stringify(list2));
              setMessage(`Created parent ${nameToSend} (id: ${id})`);
              toast({ title: "Parent created", description: `Parent ${nameToSend} (id: ${id}) created successfully.` });
        })
        .catch((err) => {
          console.error("Parent background write failed, will retry on network:", err);
          setMessage(`Parent saved locally (id: ${id}), will sync when online.`);
        });
    } catch (err) {
      console.error(err);
      setMessage("Failed to create parent: " + (err as Error).message);
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

              <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-medium mb-3">Create parent node</h3>
                <form onSubmit={handleCreateParent} className="space-y-3 mb-6">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Parent name</label>
                    <input
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Parent username"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Parent email (optional)</label>
                    <input
                      value={newParentEmail}
                      onChange={(e) => setNewParentEmail(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Parent email (optional)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={creatingParent}>{creatingParent ? 'Creating...' : 'Create Parent'}</Button>
                    <Button variant="outline" onClick={() => { setNewParentName(''); setNewParentEmail(''); setMessage(''); }}>Reset</Button>
                  </div>
                </form>

                <h3 className="text-lg font-medium mb-3">Create new user under a parent</h3>
                <form onSubmit={handleCreateUnderParent} className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Parent ID</label>
                    <input
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter parent document ID"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="New user name"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="New user email"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create User'}</Button>
                    <Button variant="outline" onClick={() => { setParentId(''); setName(''); setEmail(''); setMessage(''); }}>Reset</Button>
                  </div>
                </form>

                {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
