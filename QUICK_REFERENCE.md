# ShareTaxi - Quick Reference

## 🚀 Quick Start Commands

### First Time Setup
```bash
# 1. Install dependencies (after Node.js is installed)
npm install
cd web && npm install && cd ..
cd mobile && npm install && cd ..

# 2. Setup environment variables
# Copy web/.env.example to web/.env.local and fill in values

# 3. Run web app
cd web
npm run dev

# 4. Run mobile app (in new terminal)
cd mobile
npm start
```

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `web/src/app/page.tsx` | Web landing page |
| `mobile/app/index.tsx` | Mobile landing screen |
| `web/src/lib/supabase.ts` | Supabase client & types |
| `web/src/lib/store.ts` | State management |
| `supabase/schema.sql` | Database schema |
| `SETUP.md` | Detailed setup guide |
| `ROADMAP.md` | Development roadmap |

---

## 🔑 Environment Variables

### Web (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...
```

### Mobile (app.json)
- Update `android.config.googleMaps.apiKey`

---

## 🗄️ Database Tables

- **buildings** - Building information with geolocation
- **users** - User profiles and authentication
- **trips** - Active and historical trips
- **matches** - Trip matching records
- **messages** - In-app chat
- **reviews** - User ratings

---

## 🎨 Design Tokens

### Colors
- Primary: `#0ea5e9` (blue)
- Secondary: `#d946ef` (purple)

### Tailwind Classes
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `card` - Card container
- `input-field` - Form input

---

## 📱 App Routes

### Web (Next.js)
- `/` - Landing page
- `/signup` - User signup (to be built)
- `/login` - User login (to be built)
- `/dashboard` - Main app (to be built)

### Mobile (Expo Router)
- `app/index.tsx` - Landing screen
- `app/(auth)/signup.tsx` - Signup (to be built)
- `app/(auth)/login.tsx` - Login (to be built)
- `app/(tabs)/` - Main app tabs (to be built)

---

## 🔧 Common Tasks

### Add a new page (Web)
1. Create file in `web/src/app/[name]/page.tsx`
2. Export default React component

### Add a new screen (Mobile)
1. Create file in `mobile/app/[name].tsx`
2. Export default React component

### Add a database table
1. Update `supabase/schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types in `web/src/lib/supabase.ts`

### Add a new component
- Web: `web/src/components/[Name].tsx`
- Mobile: `mobile/components/[Name].tsx`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Node not found | Install Node.js from nodejs.org |
| Port 3000 in use | Use `npm run dev -- -p 3001` |
| Supabase error | Check .env.local values |
| Maps not loading | Verify Google Maps API key |

---

## 📊 Project Stats

- **Lines of Code**: ~1,500
- **Files Created**: 25+
- **Tech Stack**: 8 technologies
- **Estimated MVP**: 8-10 weeks
- **Target Users**: 500+ in 3 months

---

## 🎯 MVP Features Checklist

- [ ] Phone authentication
- [ ] Building verification
- [ ] Location sharing
- [ ] Destination search
- [ ] Real-time matching
- [ ] In-app chat
- [ ] Map visualization
- [ ] Trip coordination
- [ ] User ratings

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Expo Docs**: https://docs.expo.dev/
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 🎉 Current Status

✅ **Foundation Complete**
- Project structure created
- Web and mobile apps initialized
- Database schema designed
- Documentation written

🔜 **Next: Authentication**
- Phone number login
- OTP verification
- User profiles
- Building verification

---

**Last Updated**: December 2024
**Version**: 1.0.0 (MVP Foundation)
