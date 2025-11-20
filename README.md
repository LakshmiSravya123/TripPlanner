# ✨ AI Trip Planner - The Most Enchanting Travel Experience Ever Created

> **"When someone opens this app, they forget to breathe for 10 seconds, then immediately forward the link to 20 friends saying 'you HAVE to see this'"**

A production-ready, Next.js 14 + TypeScript web app that combines Disney-level storytelling, Apple-level polish, and Three.js wizardry to create the most beautiful AI trip planner on the internet.

![Deploy with Vercel](https://vercel.com/button)

## 🎨 Features

### Visual & Animation Magic
- ✨ **Cinematic 3D Liquid Globe** - Particle auroras, real-time destination fly-in
- 🎭 **Ink-Reveal Typography** - Golden text that writes itself with sparkle trails
- 🌸 **Cherry Blossom Reveal** - Results bloom from a magical tree
- 🦋 **Butterfly Confetti** - Golden butterflies on save
- 💫 **Phoenix Loading** - Light phoenix draws routes on 3D globe
- 🎪 **Glassmorphism Cards** - Floating glass orbs with pulsing glows
- 🌊 **Liquid Metal Buttons** - Ripples and chimes on interaction
- 🌸 **Blooming Interest Chips** - Flower-bloom animations with floating petals

### Core Planning Features
- 🗺️ **Interactive 3D Map** - React-Three-Fiber globe with glowing pins
- ✈️ **Real Flight Comparisons** - Google Flights with pre-filled booking links
- 🏨 **Hotel Recommendations** - Booking.com with photos, ratings, direct links
- ☀️ **Live Weather Forecasts** - Open-Meteo with animated weather icons
- 📅 **Day-by-Day Itineraries** - Economic, Balanced, and Splurge plans
- 💰 **Cost Breakdowns** - Per person and total estimates
- 🎯 **Interest-Based Planning** - AI adapts to your preferences

### Magic Features
- 💾 **Save Trips** - Confetti + butterflies + aurora burst
- 📱 **PWA Ready** - Install as native app
- 🎵 **Spatial Audio** - Chimes and ambient sounds
- 📤 **Shareable Links** - Beautiful animated previews
- 🌙 **Dark Mode** - Cosmic nebula theme with star fields

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-trip-planner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the magic ✨

## 🔑 Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-your-key-here

# Optional - for saving trips
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
POSTGRES_URL=
```

## 📦 Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + Shadcn/UI + Framer Motion
- **Three.js** + React-Three-Fiber + @react-three/drei
- **GSAP** + Lenis (smooth scroll)
- **Vercel AI SDK** + OpenAI (gpt-4o-mini)
- **Open-Meteo API** (free weather)
- **Sonner** (toasts) + Confetti Cannon
- **PWA** support

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add your `OPENAI_API_KEY` in Vercel dashboard → Settings → Environment Variables

## 📱 PWA Installation

1. Open the app in your browser
2. Click the install prompt or use browser menu
3. Add to home screen
4. Use like a native app!

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts`
- **Animations**: Modify components in `/components/magic`
- **3D Globe**: Customize `/components/magic/Globe3D.tsx`
- **Sounds**: Add audio files to `/public/sounds`

## 📝 Project Structure

```
ai-trip-planner/
├── app/                    # Next.js app router
│   ├── api/trip/          # Trip generation API
│   ├── page.tsx           # Landing page
│   └── layout.tsx         # Root layout
├── components/
│   ├── magic/             # Magical components
│   │   ├── Globe3D.tsx    # 3D globe
│   │   ├── InkRevealText.tsx
│   │   ├── MagicalForm.tsx
│   │   ├── CherryBlossomReveal.tsx
│   │   └── ButterflyConfetti.tsx
│   ├── TripResults.tsx    # Results page
│   └── ui/                # Shadcn components
├── lib/
│   ├── ai.ts              # OpenAI integration
│   ├── weather.ts         # Weather API
│   └── utils.ts           # Utilities
└── public/                # Static assets
```

## 🎯 Roadmap

- [ ] AI Travel Buddy (animated character)
- [ ] Real-time collaborative planning
- [ ] "Surprise Me" mode
- [ ] Carbon footprint calculator
- [ ] AI-generated trip videos
- [ ] AR preview
- [ ] Voice-first mode
- [ ] Memory Time Machine
- [ ] Offline-first mode
- [ ] Gamification system

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- Inspired by layla.ai
- Built with love using Next.js, Three.js, and Framer Motion
- Weather data from Open-Meteo
- Icons from Lucide React

---

**Made with ✨ magic and 💜**
