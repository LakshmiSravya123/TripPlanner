# ✨ AI Trip Planner - The Most Magical Travel Experience Ever Created

> **"The first travel app where users can literally book flights and hotels without ever leaving the page"**

A production-ready, Next.js 14 + TypeScript PWA that combines Disney-level storytelling, Apple-level polish, and Three.js wizardry to create the most beautiful AI trip planner on the internet.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LakshmiSravya123/TripPlanner)

## 🌟 Features

### ✨ Magical UI & Animations
- **Cinematic 3D Liquid Globe** - Flies to destination when typed with glowing markers
- **Glassmorphism Cards** - Floating glass orbs with pulsing glows
- **Cherry Blossom Reveal** - Results bloom from a magical tree
- **Butterfly Confetti** - Golden butterflies on save
- **Phoenix Loading** - Sparkles and soft chimes during trip generation
- **Liquid Metal Buttons** - Ripples and animations on interaction
- **Blooming Interest Chips** - Flower-bloom animations with floating petals

### 🎯 Core Features
- **Live Embedded Google Flights** - Full interactive iframe, pre-filled with dates, travelers, and airport codes
- **Live Embedded Booking.com** - Three tiers (Economic, Balanced, Luxury) with price filters
- **AI-Powered Itineraries** - Weather-aware day-by-day plans (Economic, Balanced, Luxury)
- **Interactive 3D Map** - Glowing pins with place markers
- **Real Weather Forecasts** - Open-Meteo API integration
- **My Trips Gallery** - Beautiful 3D orb gallery to view saved trips
- **AI Chat Buddy** - Floating chat assistant for trip questions
- **PWA Ready** - Install as native app

### 🎨 Form Features
- Default destination: **Croatia**
- Date range picker with smart defaults
- Travelers selector (1-10)
- Budget slider ($50-$600/night)
- Animated interest chips
- Optional OpenAI API key field (saved locally)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (optional - can be entered in form)

### Installation

```bash
# Clone the repository
git clone https://github.com/LakshmiSravya123/TripPlanner.git
cd ai-trip-planner

# Install dependencies
npm install

# Create .env.local (optional - API key can be entered in form)
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LakshmiSravya123/TripPlanner)

1. Click the button above
2. Connect your GitHub account
3. Import the `TripPlanner` repository
4. Add `OPENAI_API_KEY` in Environment Variables (optional - users can enter in form)
5. Deploy! ✨

### Manual Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable (optional)
vercel env add OPENAI_API_KEY
```

**Note**: The OpenAI API key is optional. Users can enter their own key in the form, which is stored locally in their browser.

## 🎯 How It Works

1. **Enter Trip Details** - Destination (default: Croatia), dates, travelers, budget, interests
2. **Watch the Globe Fly** - 3D globe animates to your destination
3. **AI Generates Plan** - Weather-aware itinerary with 3 budget tiers
4. **Book Directly** - Use embedded Google Flights and Booking.com iframes
5. **Save & Share** - Save trips to My Trips gallery

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animations**: Framer Motion + GSAP
- **3D Graphics**: React-Three-Fiber + Three.js + @react-three/drei
- **AI**: Vercel AI SDK (gpt-4o-mini)
- **Maps**: Leaflet + React-Leaflet
- **Weather**: Open-Meteo API (free, no key)
- **Storage**: localStorage (can be upgraded to Vercel Postgres)
- **PWA**: Next.js PWA support

## 📱 PWA Features

- Install prompt on mobile/desktop
- Offline support
- App-like experience
- Splash screens

## 🎨 Customization

### Change Default Destination

Edit `components/magic/MagicalForm.tsx`:
```typescript
const [destination, setDestination] = useState("Your Destination");
```

### Add More Airport Codes

Edit `lib/airports.ts`:
```typescript
export const airportCodes: Record<string, string> = {
  // Add your destinations
  "your city": "AIRPORT_CODE",
};
```

## 🔒 Privacy & Security

- OpenAI API keys entered in form are stored **locally** in browser
- No API keys are sent to our servers
- All trip data stored in localStorage
- Can be upgraded to Vercel Postgres for cloud storage

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Credits

Built with love using:
- Next.js
- React-Three-Fiber
- Framer Motion
- OpenAI
- And many other amazing open-source libraries

---

**Made with ✨ magic and lots of coffee**
