# ShareTaxi

A hyper-local carpool and meetup app that connects people from the same building going to the same destination.

## 🏗️ Project Structure

```
ShareTaxi-8/
├── mobile/          # React Native + Expo mobile app
├── web/             # Next.js web application
├── shared/          # Shared utilities and types
└── docs/            # Documentation
```

## 🚀 Tech Stack

- **Mobile**: React Native + Expo
- **Web**: Next.js 14 + TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Maps**: Google Maps Platform
- **Styling**: NativeWind (Mobile) + Tailwind CSS (Web)
- **State**: Zustand

## 📱 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile development)
- Supabase account

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

### Web App Setup

```bash
cd web
npm install
npm run dev
```

## 🎯 MVP Features

- ✅ User authentication with phone verification
- ✅ Building/locality verification
- ✅ Real-time location sharing (building-level)
- ✅ Destination search and selection
- ✅ Smart matching algorithm
- ✅ In-app chat
- ✅ Map visualization

## 📖 Documentation

See the [implementation plan](../docs/implementation_plan.md) for detailed architecture and development phases.

## 🔒 Privacy & Security

- Location visible only to verified building residents
- Opt-in for each trip
- End-to-end encrypted messaging
- User verification and ratings

## 📄 License

MIT
