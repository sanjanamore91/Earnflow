# Setup Instructions for Form Data Feature

## Frontend Setup
The form popup is integrated into the Sector1499 page. The two buttons will open a dialog with Name and Email fields.

## Backend Setup

### 1. Install Server Dependencies
```bash
cd server
npm install
# or if using bun
bun install
```

### 2. Run the Server
Open a terminal and run:
```bash
cd server
npm run dev
# or
bun run dev
```

The server will start on `http://localhost:3001`

### 3. Run the Frontend
In another terminal:
```bash
npm run dev
# or
bun run dev
```

The frontend will run on `http://localhost:8080`

## How It Works

1. **Click either button** on the Sector1499 page to open the form dialog
2. **Enter your name and email** in the popup form
3. **Click Submit** to save the data
4. Data is stored in `server/form-data.json`

## API Endpoints

### Save Form Data
- **POST** `/api/save-form-data`
- Body: `{ "name": "string", "email": "string" }`
- Returns: `{ "success": true, "message": "Form data saved successfully" }`

### Get All Form Data
- **GET** `/api/form-data`
- Returns: Array of saved form entries with id and timestamp

## Data Storage
Form data is stored in `server/form-data.json` in JSON format with the following structure:
```json
[
  {
    "id": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-25T10:30:00.000Z"
  }
]
```
