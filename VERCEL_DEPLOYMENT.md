# 🚀 Deploying ShareTaxi to Vercel

## Prerequisites

Before deploying, make sure you have:
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ GitHub account (to push your code)
- ✅ Supabase project created
- ✅ PostgreSQL database ready

---

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository

```bash
# Initialize git (if not already done)
cd C:\Users\Student\Downloads\ShareTaxi-8
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ShareTaxi complete implementation"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sharetaxi.git
git branch -M main
git push -u origin main
```

### 1.2 Update Next.js Config for Vercel

The `next.config.js` is already configured, but verify it looks like this:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

---

## Step 2: Setup Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: ShareTaxi
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to be created

### 2.2 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`

### 2.3 Setup Database

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy and paste your `supabase/schema.sql` file
4. Click **Run**

OR use Prisma:

```bash
# In the web folder
cd web

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"

2. **Import Git Repository**
   - Connect your GitHub account
   - Select your ShareTaxi repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

   Optional (for later):
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
   FCM_SERVER_KEY=your-fcm-key
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web folder
cd web

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? sharetaxi
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## Step 4: Post-Deployment Setup

### 4.1 Configure Supabase Auth

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: `https://your-project.vercel.app/**`

### 4.2 Enable Phone Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Phone** provider
3. Configure SMS provider (Twilio recommended):
   - Add Twilio credentials
   - Or use Supabase's built-in SMS (limited free tier)

### 4.3 Setup Database Connection Pooling (Important!)

Vercel has connection limits, so use Supabase's connection pooler:

1. Go to **Database** → **Connection Pooling**
2. Copy the **Connection Pooling** URL
3. Update your `DATABASE_URL` in Vercel to use this URL instead

---

## Step 5: Verify Deployment

### 5.1 Test Your App

1. Visit your Vercel URL
2. Test these flows:
   - ✅ Landing page loads
   - ✅ Login with phone number
   - ✅ OTP verification works
   - ✅ Profile creation
   - ✅ Dashboard loads
   - ✅ Create a ride
   - ✅ View ride details

### 5.2 Check Logs

If something doesn't work:
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click on latest deployment
4. Check "Functions" logs for errors

---

## Step 6: Custom Domain (Optional)

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `sharetaxi.com`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with new domain

---

## Common Issues & Solutions

### Issue 1: Build Fails

**Error**: `Cannot find module 'prisma'`

**Solution**:
```bash
# Make sure prisma is in devDependencies
cd web
npm install -D prisma
git add package.json package-lock.json
git commit -m "Add prisma to devDependencies"
git push
```

### Issue 2: Database Connection Fails

**Error**: `Can't reach database server`

**Solution**:
- Use Supabase's connection pooling URL
- Make sure DATABASE_URL is set in Vercel environment variables
- Check if database is publicly accessible

### Issue 3: OTP Not Sending

**Error**: `Failed to send OTP`

**Solution**:
- Configure Twilio in Supabase
- Or use Supabase's built-in SMS (has limits)
- Check Supabase logs for SMS errors

### Issue 4: Images Not Loading

**Error**: `Invalid src prop`

**Solution**:
Add Supabase domain to `next.config.js`:
```javascript
images: {
  domains: ['xxxxx.supabase.co'],
}
```

---

## Environment Variables Checklist

Make sure these are set in Vercel:

### Required
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Optional (for full features)
- ⏳ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps
- ⏳ `FCM_SERVER_KEY` - Push notifications
- ⏳ `TWILIO_ACCOUNT_SID` - SMS via Twilio
- ⏳ `TWILIO_AUTH_TOKEN` - SMS via Twilio

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Phone auth configured in Supabase
- [ ] Site URL updated in Supabase
- [ ] Test login flow
- [ ] Test ride creation
- [ ] Check error logs

---

## Performance Optimization

### After Deployment

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Configure ISR for dynamic pages if needed

2. **Monitor Performance**
   - Use Vercel Analytics
   - Check Core Web Vitals

3. **Database Optimization**
   - Use connection pooling
   - Add indexes (already done in schema)
   - Monitor query performance

---

## Continuous Deployment

Once setup, every push to `main` branch will auto-deploy:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push

# Vercel automatically deploys!
```

---

## Support & Monitoring

### Vercel Dashboard
- **Deployments**: View all deployments
- **Analytics**: Traffic and performance
- **Logs**: Function logs and errors
- **Settings**: Environment variables, domains

### Supabase Dashboard
- **Database**: Query editor, table viewer
- **Auth**: User management
- **Storage**: File uploads
- **Logs**: API logs, database logs

---

## Next Steps After Deployment

1. **Test thoroughly** with real users
2. **Monitor errors** in Vercel logs
3. **Setup analytics** (Google Analytics, Mixpanel)
4. **Configure monitoring** (Sentry for errors)
5. **Add Google Maps** integration
6. **Setup push notifications** (FCM)
7. **Configure SMS** provider (Twilio)

---

## 🎉 You're Live!

Your ShareTaxi app is now deployed and accessible to users worldwide!

**Your app URL**: `https://your-project.vercel.app`

Share it with beta testers and start getting feedback!

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
