
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBlJGO4YqRL2CtMq9hpYOWMuesnpDRbyR4",
    authDomain: "signup-6c531.firebaseapp.com",
    databaseURL: "https://signup-6c531-default-rtdb.firebaseio.com",
    projectId: "signup-6c531",
    storageBucket: "signup-6c531.appspot.com",
    messagingSenderId: "367156943806",
    appId: "1:367156943806:web:86de3e925c4ef63973952f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const targetEmail = "radhekrisnapiyush@gmail.com";
const currentDate = "2026-02-02";

async function debugUser() {
    console.log(`--- Debugging User: ${targetEmail} ---`);
    console.log(`Target Date: ${currentDate}`);

    // 1. Find User ID by searching in planData (common place where email might be linked or just info persists)
    // Actually, we usually have userId from auth, but here we scan planData or other nodes.
    const planDataRef = ref(database, "planData");
    const planSnapshot = await get(planDataRef);

    let userId = null;
    let userPlan = null;

    if (planSnapshot.exists()) {
        const plans = planSnapshot.val();
        for (const key in plans) {
            // Assuming planData might have email or we just have to find the one that matches
            // Let's look for matching names or if we have a userId to email mapping
            // Since I don't have a direct email -> uid mapping node, I'll search planData entries
            // Note: My previous scripts used userId directly. I need to find the UID for this email.
        }
    }

    // Check the 'users' node if it exists (for email to uid mapping)
    // Wait, I don't know if a 'users' node exists. Let's try to find them in 'planData' or 'earnings'
    // Actually, let's just scan 'planData' and look for any clues.

    console.log("Searching for user in planData...");
    const allPlansSnapshot = await get(planDataRef);
    if (allPlansSnapshot.exists()) {
        const allPlans = allPlansSnapshot.val();
        for (const id in allPlans) {
            const p = allPlans[id];
            // In Info.tsx we don't save email to planData, we save name and planAmount.
            // However, the user is 'radhekrisnapiyush@gmail.com'.
            // Usually users are identified by uid.
        }
    }

    // Let's try to look at 'dailySentences' which is indexed by userId
    const dailySentencesRef = ref(database, "dailySentences");
    const dsSnapshot = await get(dailySentencesRef);

    if (dsSnapshot.exists()) {
        const dsData = dsSnapshot.val();
        console.log("Checking dailySentences for completions...");
        for (const uid in dsData) {
            const userDates = dsData[uid];
            if (userDates[currentDate] && userDates[currentDate].completed === true) {
                console.log(`Found COMPLETED task for UID: ${uid} on ${currentDate}`);
                userId = uid;
                break;
            }
        }
    }

    if (!userId) {
        console.log("Could not find a user who completed the task today.");
        return;
    }

    console.log(`Identified User ID: ${userId}`);

    // 2. Check Plan Data for this UID
    const userPlanQuery = query(planDataRef, limitToLast(100));
    const upSnapshot = await get(userPlanQuery);
    if (upSnapshot.exists()) {
        const plans = upSnapshot.val();
        for (const id in plans) {
            if (plans[id].userId === userId) {
                console.log("Plan Found:", plans[id]);
                userPlan = plans[id];
            }
        }
    }

    // 3. Check Earnings for this UID and date
    const earningsRef = ref(database, "earnings");
    const earningsSnapshot = await get(earningsRef);
    let earningFound = false;
    if (earningsSnapshot.exists()) {
        const earnings = earningsSnapshot.val();
        for (const id in earnings) {
            const e = earnings[id];
            if (e.userId === userId && e.date === currentDate) {
                console.log(`Earning Found for ${currentDate}:`, e);
                earningFound = true;
            }
        }
    }

    if (!earningFound) {
        console.log(`MISSING: No earning record for ${currentDate}`);
    }

    process.exit(0);
}

debugUser().catch(err => {
    console.error(err);
    process.exit(1);
});
