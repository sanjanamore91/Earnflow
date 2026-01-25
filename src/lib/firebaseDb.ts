import { database } from "./firebase";
import { ref, push, query, orderByChild, equalTo, get, remove } from "firebase/database";

export interface FormEntry {
  id?: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

// Save form data to Firebase
export const saveFormData = async (
  name: string,
  email: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const formDataRef = ref(database, "formData");
    const newEntry: FormEntry = {
      userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    await push(formDataRef, newEntry);
    console.log("Form data saved successfully to Firebase");
    return { success: true, message: "Form data saved successfully" };
  } catch (error) {
    console.error("Error saving form data:", error);
    throw error;
  }
};

// Get form data for a specific user
export const getFormDataByUser = async (userId: string): Promise<FormEntry[]> => {
  try {
    const formDataRef = ref(database, "formData");
    const userQuery = query(formDataRef, orderByChild("userId"), equalTo(userId));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      console.log(`No data found for user ${userId}`);
      return [];
    }

    const data: FormEntry[] = [];
    snapshot.forEach((childSnapshot) => {
      data.push({
        id: childSnapshot.key || undefined,
        ...childSnapshot.val(),
      });
    });

    console.log(`Found ${data.length} entries for user ${userId}`);
    return data;
  } catch (error) {
    console.error("Error fetching form data:", error);
    throw error;
  }
};

// Delete a specific entry
export const deleteFormEntry = async (entryId: string): Promise<void> => {
  try {
    const entryRef = ref(database, `formData/${entryId}`);
    await remove(entryRef);
    console.log("Entry deleted successfully");
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
};
