import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'form-data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// API endpoint to save form data
app.post('/api/save-form-data', (req, res) => {
  try {
    const { name, email, userId } = req.body;

    // Validation
    if (!name || !email || !userId) {
      return res.status(400).json({ error: 'Name, email, and userId are required' });
    }

    // Read existing data
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    // Add new entry with timestamp and userId
    const newEntry = {
      id: Date.now(),
      userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    data.push(newEntry);

    // Write updated data back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

// API endpoint to get form data for a specific user
app.get('/api/form-data', (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Filter data for the specific user
    const userdata = data.filter(entry => entry.userId === userId);
    
    console.log(`Fetching data for user ${userId}, found ${userdata.length} entries`);
    res.json(userdata);
  } catch (error) {
    console.error('Error reading form data:', error);
    res.status(500).json({ error: 'Failed to read form data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
