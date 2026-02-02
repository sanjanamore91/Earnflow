import { database } from "./firebase";
import { ref, push, query, orderByChild, equalTo, get, remove, set, update, limitToLast } from "firebase/database";




// Get the current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Save task completion data
export const saveTaskCompletion = async (
  userId: string,
  taskInputs: {
    field2: string;
    field4: string;
    field6: string;
    field8: string;
    field10: string;
  },
  sentences: string[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const currentDate = getCurrentDate();
    const taskCompletionRef = ref(database, "taskCompletions");

    // 1. Save detailed completion data
    const completionData: TaskCompletionData = {
      userId,
      date: currentDate,
      taskInputs,
      sentences,
      completedAt: new Date().toISOString(),
    };

    await push(taskCompletionRef, completionData);

    // 2. Mark as completed in dailySentences (for fast lookup)
    const dailyStatusRef = ref(database, `dailySentences/${userId}/${currentDate}`);
    await update(dailyStatusRef, { completed: true });

    // 3. Calculate and save earning (1% of plan amount)
    await calculateAndSaveDailyEarning(userId, currentDate);

    console.log("Task completion data saved successfully to Firebase");
    return { success: true, message: "Task completion data saved successfully" };
  } catch (error) {
    console.error("Error saving task completion data:", error);
    throw error;
  }
};

// ... existing code ...

// Earning data management
export interface EarningEntry {
  id?: string;
  userId: string;
  amount: number;
  date: string;
  createdAt: string;
}

// Save earning data (Using direct path for reliability)
// Save earning data (User-Scoped)
export const saveEarning = async (
  userId: string,
  amount: number,
  date: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Save to users/${userId}/earnings/${date}
    const earningRef = ref(database, `users/${userId}/earnings/${date}`);
    const newEntry = {
      amount,
      date,
      createdAt: new Date().toISOString(),
    };

    await set(earningRef, newEntry);
    return { success: true, message: "Earning saved successfully" };
  } catch (error) {
    console.error("Error saving earning:", error);
    throw error;
  }
};

// Get earnings for a specific user (User-Scoped Only)
export const getEarningsByUser = async (userId: string): Promise<EarningEntry[]> => {
  try {
    const data: EarningEntry[] = [];

    // Fetch from standard path: users/${userId}/earnings
    const userEarningsRef = ref(database, `users/${userId}/earnings`);
    const snapshot = await get(userEarningsRef);

    if (snapshot.exists()) {
      const earningsData = snapshot.val();
      for (const date in earningsData) {
        data.push({
          id: date,
          userId,
          ...earningsData[date]
        });
      }
    }

    return data;
  } catch (error) {
    console.error("Error fetching earnings:", error);
    throw error;
  }
};

// Get plan data for a specific user (User-Scoped Only)
export const getPlanDataByUser = async (userId: string): Promise<PlanEntry[]> => {
  try {
    // Fetch from standard path: users/${userId}/plans
    const userPlanRef = ref(database, `users/${userId}/plans`);
    const snapshot = await get(userPlanRef);

    if (snapshot.exists()) {
      const plans: PlanEntry[] = [];
      snapshot.forEach((child) => {
        plans.push({ id: child.key || "unknown", ...child.val() });
      });
      return plans;
    }

    return [];
  } catch (error) {
    console.error("Error fetching plan data:", error);
    throw error;
  }
};

// Check if user has completed task today
export const checkTaskCompletionToday = async (userId: string): Promise<boolean> => {
  try {
    const currentDate = getCurrentDate();
    // Check directly in dailySentences node
    const dailyStatusRef = ref(database, `dailySentences/${userId}/${currentDate}/completed`);
    const snapshot = await get(dailyStatusRef);

    if (snapshot.exists() && snapshot.val() === true) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking task completion:", error);
    return false;
  }
};

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

// Task response management
export interface TaskResponse {
  id?: string;
  taskNumber: number;
  sentence: string;
  userResponse: string;
  userId: string;
  createdAt: string;
}

// Save task response to Firebase
export const saveTaskResponse = async (
  taskNumber: number,
  sentence: string,
  userResponse: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const taskResponsesRef = ref(database, "taskResponses");
    const newResponse: TaskResponse = {
      taskNumber,
      sentence,
      userResponse,
      userId,
      createdAt: new Date().toISOString(),
    };

    await push(taskResponsesRef, newResponse);
    console.log(`Task ${taskNumber} response saved successfully to Firebase`);
    return { success: true, message: "Task response saved successfully" };
  } catch (error) {
    console.error("Error saving task response:", error);
    throw error;
  }
};

// Plan data management
export interface PlanEntry {
  id?: string;
  userId: string;
  name: string;
  planAmount: string;
  createdAt: string;
}

// Save plan data to Firebase (User-Scoped Only)
export const savePlanData = async (
  name: string,
  planAmount: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const newEntry: PlanEntry = {
      userId,
      name,
      planAmount,
      createdAt: new Date().toISOString(),
    };

    // Save to users/${userId}/plans (Standard path)
    const userPlanRef = ref(database, `users/${userId}/plans`);
    await push(userPlanRef, newEntry);

    return { success: true, message: "Plan data saved successfully" };
  } catch (error) {
    console.error("Error saving plan data:", error);
    throw error;
  }
};



// Daily sentences management
export interface DailySentences {
  id?: string;
  date: string; // Format: YYYY-MM-DD
  sentences: string[];
  createdAt: string;
}



// Get or create daily sentences (locked for the same day)
export const getDailySentences = async (userId: string, count: number): Promise<string[]> => {
  try {
    const currentDate = getCurrentDate();
    const dailySentencesRef = ref(database, `dailySentences/${userId}/${currentDate}`);
    const snapshot = await get(dailySentencesRef);

    // If sentences already exist for today, return them
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`Found existing sentences for ${currentDate}`);
      return data.sentences || [];
    }

    // Otherwise, generate new random sentences for today
    console.log(`Generating new sentences for ${currentDate}`);
    const newSentences = await getRandomSentences(count);

    const dailyEntry: DailySentences = {
      date: currentDate,
      sentences: newSentences,
      createdAt: new Date().toISOString(),
    };

    // Save to Firebase using set() to store directly under the date node
    await set(dailySentencesRef, dailyEntry);

    return newSentences;
  } catch (error) {
    console.error("Error getting daily sentences:", error);
    throw error;
  }
};

// Task completion data management
export interface TaskCompletionData {
  id?: string;
  userId: string;
  date: string;
  taskInputs: {
    field2: string;
    field4: string;
    field6: string;
    field8: string;
    field10: string;
  };
  sentences: string[];
  completedAt: string;
}

// Save task completion data



// Calculate and save daily earning (Reusable for backfill)
export const calculateAndSaveDailyEarning = async (userId: string, date: string): Promise<boolean> => {
  try {
    // Check if earning already exists for this date.
    const earnings = await getEarningsByUser(userId);
    const existingEarning = earnings.find(e => e.date === date);

    // Get plan and calculate expected amount
    const plans = await getPlanDataByUser(userId);
    if (plans.length === 0) {
      console.warn("No plan found for user, skipping earning calculation");
      return false;
    }

    const latestPlan = plans[plans.length - 1];
    // Strip "Rs." prefix explicitly first, then keep only digits and dots
    const cleanAmount = latestPlan.planAmount.replace(/^Rs\./i, '').replace(/[^0-9.]/g, '');
    const planValue = parseFloat(cleanAmount);

    const expectedEarning = planValue * 0.01; // 1%

    // If earning exists and is correct (or more), we skip.
    // We allow update if amount is 0 or significantly less than expected.
    if (existingEarning && existingEarning.amount >= expectedEarning) {
      console.log(`Earning already exists for ${date} with correct amount ${existingEarning.amount}, skipping.`);
      return true;
    }

    if (existingEarning) {
      console.log(`Updating earning for ${date}: existing ${existingEarning.amount}, expected ${expectedEarning}`);
    } else {
      console.log(`Calculating new earning for ${date}: ${expectedEarning}`);
    }

    // Proceed to save/update
    await saveEarning(userId, expectedEarning, date);
    return true;
  } catch (error) {
    console.error("Error calculating/saving earning:", error);
    return false;
  }
};

// Backfill missing earnings for all completed tasks in history
export const backfillHistoryEarnings = async (userId: string): Promise<{ processed: number }> => {
  try {
    const userDailyRef = ref(database, `dailySentences/${userId}`);
    const snapshot = await get(userDailyRef);

    let processed = 0;

    if (snapshot.exists()) {
      const dailyData = snapshot.val();
      for (const date in dailyData) {
        // Check if date node exists and has completed: true
        if (dailyData[date] && dailyData[date].completed === true) {
          // Attempt to save earning for this date (handles duplicate check internally)
          await calculateAndSaveDailyEarning(userId, date);
          processed++;
        }
      }
    }

    return { processed };
  } catch (error) {
    console.error("Error backfilling history earnings:", error);
    throw error;
  }
};
