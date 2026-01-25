import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, query, orderByChild, equalTo, get, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBlJGO4YqRL2CtMq9hpYOWMuesnpDRbyR4",
  authDomain: "signup-6c531.firebaseapp.com",
  projectId: "signup-6c531",
  storageBucket: "signup-6c531.firebasestorage.app",
  messagingSenderId: "1075553175213",
  appId: "1:1075553175213:web:257c58be44959c48b7e824",
  measurementId: "G-L47L95383V",
  databaseURL: "https://signup-6c531-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const appExpress = express();
const PORT = 3001;

// Middleware
appExpress.use(cors());
appExpress.use(express.json());

// API endpoint to save form data
appExpress.post('/api/save-form-data', async (req, res) => {
  try {
    const { name, email, userId } = req.body;

    // Validation
    if (!name || !email || !userId) {
      return res.status(400).json({ error: 'Name, email, and userId are required' });
    }

    // Save to Firebase
    const formDataRef = ref(database, 'formData');
    const newEntry = {
      userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    await push(formDataRef, newEntry);
    res.json({ success: true, message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

// API endpoint to get form data for a specific user
appExpress.get('/api/form-data', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Query Firebase for user data
    const formDataRef = ref(database, 'formData');
    const userQuery = query(formDataRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      console.log(`No data found for user ${userId}`);
      return res.json([]);
    }

    const userdata = [];
    snapshot.forEach((childSnapshot) => {
      userdata.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    console.log(`Fetching data for user ${userId}, found ${userdata.length} entries`);
    res.json(userdata);
  } catch (error) {
    console.error('Error reading form data:', error);
    res.status(500).json({ error: 'Failed to read form data' });
  }
});

// API endpoint to delete form entry
appExpress.delete('/api/form-data/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;

    if (!entryId) {
      return res.status(400).json({ error: 'entryId is required' });
    }

    const entryRef = ref(database, `formData/${entryId}`);
    await remove(entryRef);
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

appExpress.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
