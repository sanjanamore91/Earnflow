# Deployment Guide: Frontend + Backend

## Frontend (Netlify)

1. **Push to GitHub** (already done)
2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: `https://your-render-backend-url.onrender.com` (get this from step 3)
   - Click Deploy

## Backend (Render)

1. **Push to GitHub** (already done)
2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New+" → "Web Service"
   - Connect your GitHub repository
   - Select "earn-bright-space" repo
   - Name: `earn-bright-space-backend`
   - Environment: `Node`
   - Region: Oregon (or your preference)
   - Build Command: `npm install` (in server directory)
   - Start Command: `npm start` (in server directory)
   - Plan: Free (to start)
   - Click "Create Web Service"
3. **Get the URL**
   - Once deployed, Render will give you a URL like `https://earn-bright-space-backend.onrender.com`
   - Copy this URL

## Connect Frontend to Backend

1. In Netlify dashboard, go to Settings → Environment
2. Update the `VITE_API_URL` variable with your Render backend URL
3. Trigger a redeploy

## Verify it's Working

1. Visit your Netlify frontend URL
2. Test the form submission - it should save data to the backend
3. Check your Render logs if there are any issues

## Notes

- The backend uses file storage (`form-data.json`). This works on Render but not on Netlify
- For production scaling, consider migrating to MongoDB, Firebase, or Supabase
- Free tier Render services may sleep after 15 minutes of inactivity
