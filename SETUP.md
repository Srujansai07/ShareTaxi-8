# ShareTaxi - Setup Guide

This guide will help you set up the ShareTaxi development environment from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **Expo CLI** (for mobile development)
   ```bash
   npm install -g expo-cli
   ```

4. **Expo Go App** (for testing on mobile)
   - iOS: Download from App Store
   - Android: Download from Play Store

### Required Accounts

1. **Supabase Account**
   - Sign up at: https://supabase.com/
   - Create a new project
   - Note down your project URL and anon key

2. **Google Cloud Account** (for Maps API)
   - Sign up at: https://console.cloud.google.com/
   - Enable Maps JavaScript API and Places API
   - Create an API key

---

## 🚀 Installation Steps

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/
2. Run the installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Project Dependencies

Navigate to the project directory and install dependencies:

```bash
# Install root dependencies
npm install

# Install web app dependencies
cd web
npm install
cd ..

# Install mobile app dependencies
cd mobile
npm install
cd ..
```

### Step 3: Setup Supabase

1. Go to https://supabase.com/ and create a new project
2. Wait for the project to be provisioned
3. Go to Project Settings > API
4. Copy your project URL and anon key
5. Go to SQL Editor
6. Copy the contents of `supabase/schema.sql`
7. Paste and run in the SQL Editor

### Step 4: Configure Environment Variables

#### Web App (.env.local)

Create `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Mobile App

Update `mobile/app.json`:
- Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key

Create `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Setup Google Maps API

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create credentials (API Key)
5. Restrict the API key (optional but recommended):
   - For web: Add your domain
   - For mobile: Add your app's package name

---

## 🏃 Running the Applications

### Web App

```bash
cd web
npm run dev
```

Open http://localhost:3000 in your browser

### Mobile App

```bash
cd mobile
npm start
```

This will open Expo Dev Tools. You can:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your phone

---

## 📁 Project Structure

```
ShareTaxi-8/
├── web/                    # Next.js web application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and configs
│   ├── public/            # Static assets
│   └── package.json
│
├── mobile/                # React Native mobile app
│   ├── app/              # Expo Router screens
│   ├── components/       # React Native components
│   ├── assets/           # Images, fonts, etc.
│   └── package.json
│
├── supabase/             # Database schema and migrations
│   └── schema.sql
│
└── README.md
```

---

## 🔧 Development Workflow

### 1. Start with Database

- Ensure Supabase schema is set up correctly
- Test database functions in Supabase SQL Editor

### 2. Develop Web App

- Run `cd web && npm run dev`
- Make changes to files in `web/src/`
- Hot reload will update automatically

### 3. Develop Mobile App

- Run `cd mobile && npm start`
- Make changes to files in `mobile/app/`
- Shake device or press `r` to reload

### 4. Test Features

- Test authentication flow
- Test location permissions
- Test real-time matching
- Test chat functionality

---

## 🐛 Troubleshooting

### Node.js not found

**Problem:** `node` or `npm` commands not recognized

**Solution:**
1. Restart your terminal/command prompt
2. Verify Node.js is in your PATH
3. Reinstall Node.js if necessary

### Expo CLI issues

**Problem:** `expo` command not found

**Solution:**
```bash
npm install -g expo-cli
```

### Supabase connection errors

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify your `.env.local` file has correct values
2. Check Supabase project is running
3. Verify API keys are correct

### Google Maps not loading

**Problem:** Map shows blank or error

**Solution:**
1. Verify API key is correct
2. Ensure Maps JavaScript API is enabled
3. Check API key restrictions
4. Verify billing is enabled on Google Cloud

### Port already in use

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

Once everything is set up:

1. ✅ Review the [Implementation Plan](../docs/implementation_plan.md)
2. ✅ Familiarize yourself with the codebase
3. ✅ Test the authentication flow
4. ✅ Start building MVP features
5. ✅ Test with real users in your building

---

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review Supabase documentation: https://supabase.com/docs
3. Review Expo documentation: https://docs.expo.dev/
4. Review Next.js documentation: https://nextjs.org/docs

---

## 🎯 Quick Start Checklist

- [ ] Node.js installed
- [ ] Git installed
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Google Maps API key obtained
- [ ] Environment variables configured
- [ ] Web app dependencies installed
- [ ] Mobile app dependencies installed
- [ ] Web app running successfully
- [ ] Mobile app running successfully

**Once all items are checked, you're ready to start development!** 🚀
