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

// Sentence management functions
export interface Sentence {
  id?: string;
  text: string;
}

// Initialize sentences in Firebase (one-time setup)
export const initializeSentences = async (): Promise<void> => {
  try {
    const sentencesRef = ref(database, "sentences");
    const snapshot = await get(sentencesRef);

    // Only initialize if sentences don't already exist
    if (snapshot.exists()) {
      console.log("Sentences already exist in database");
      return;
    }

    const sentences = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "Don't watch the clock; do what it does. Keep going.",
      "The future depends on what you do today.",
      "Quality is not an act, it is a habit.",
      "The secret of getting ahead is getting started.",
      "It always seems impossible until it's done.",
      "Dream big and dare to fail.",
      "You miss 100% of the shots you don't take.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Your limitation—it's only your imagination.",
      "Great things never come from comfort zones.",
      "Success doesn't just find you. You have to go out and get it.",
      "The harder you work for something, the greater you'll feel when you achieve it.",
      "Don't stop when you're tired. Stop when you're done.",
      "Wake up with determination. Go to bed with satisfaction.",
      "Do something today that your future self will thank you for.",
      "Little things make big days.",
      "It's going to be hard, but hard does not mean impossible."
    ];

    // Store each sentence with a unique ID
    for (let i = 0; i < sentences.length; i++) {
      await push(sentencesRef, { text: sentences[i] });
    }

    console.log("Successfully initialized 20 sentences in Firebase");
  } catch (error) {
    console.error("Error initializing sentences:", error);
    throw error;
  }
};

// Get all sentences from Firebase
export const getAllSentences = async (): Promise<Sentence[]> => {
  try {
    const sentencesRef = ref(database, "sentences");
    const snapshot = await get(sentencesRef);

    if (!snapshot.exists()) {
      console.log("No sentences found in database");
      return [];
    }

    const sentences: Sentence[] = [];
    snapshot.forEach((childSnapshot) => {
      sentences.push({
        id: childSnapshot.key || undefined,
        text: childSnapshot.val().text,
      });
    });

    return sentences;
  } catch (error) {
    console.error("Error fetching sentences:", error);
    throw error;
  }
};

// Get random unique sentences
export const getRandomSentences = async (count: number): Promise<string[]> => {
  try {
    const allSentences = await getAllSentences();

    if (allSentences.length === 0) {
      console.warn("No sentences available, initializing...");
      await initializeSentences();
      return getRandomSentences(count);
    }

    // Ensure we don't request more sentences than available
    const requestCount = Math.min(count, allSentences.length);

    // Shuffle and select random sentences
    const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, requestCount);

    return selected.map(s => s.text);
  } catch (error) {
    console.error("Error getting random sentences:", error);
    throw error;
  }
};
