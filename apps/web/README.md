# Lovendo Web App - Award-Winning Landing Experience

> This application was completely redesigned in January 2026 with "Site of the Year" vision. Legacy
> travel/passport architecture has been removed under "Zero-Legacy" cleanup policy.

## 🏆 What's Here Now

This is a premium Next.js app showcasing the **Gifting Protocol** - where travel becomes ceremony.

### Key Features

- **Editorial Scrollytelling** - SectionWrapper with silky blur + scale transitions
- **Live Activity Pulse** - Real-time social feed simulation (GenZ aesthetic)
- **Theme Switching** - CelestialToggle for dark/light mode experiences
- **3D Atmosphere** - SacredAtmosphere particle system (desktop-only, mobile-optimized)
- **Sacred Moments** - Bento grid showcase with kinetic animations
- **Neural Match Simulator** - ML-powered matching demo
- **Identity Pulse** - Futuristic verification card

### Architecture

```
src/
├── app/
│   ├── page.tsx          # Main landing (section-based reveal)
│   ├── layout.tsx        # Root layout with font optimization
│   └── globals.css       # Soft-Future color palette + light mode
├── components/
│   ├── landing/          # Active landing components (no orphans)
│   ├── 3d/              # Three.js particle systems
│   ├── ui/              # SectionWrapper, CelestialToggle, etc.
│   ├── layout/          # Navbar, Footer
│   └── shared/          # Shared utilities
└── hooks/
    └── useSoundEffect   # Interactive sound effects
```

### Design System

**Dark Mode (Default)**

- Primary: #facc15 (Warm Golden)
- Secondary: #ff6b6b (Sunset Red)
- Background: #08080a (Soft Dark)

**Light Mode**

- Primary: #8b5cf6 (Noble Purple)
- Secondary: #f59e0b (Warm Amber)
- Background: #f5f5f7 (Editorial Soft)

## 🚀 Getting Started

First, run the development server:

```bash
pnpm dev --filter @lovendo/web
```

Open [http://localhost:3000](http://localhost:3000) to see the landing.

## 🧹 Zero-Legacy Cleanup

Removed in January 2026:

- ❌ Legacy landing components (CTA, Features, HowItWorks, etc.)
- ❌ Boilerplate SVG icons (file, globe, next, window, vercel)
- ❌ Unused export clutter in components/landing/index.ts

Active components only (Champions League roster):

- ✅ Hero, TrustRing, MatchSimulator
- ✅ IdentityPulse, SacredMoments, RitualSection
- ✅ CinematicReveal, LiveHeartbeat, ActivityPulse
- ✅ Manifesto

## 📱 Optimization Details

- **Font Loading**: Next.js local fonts (Inter, Space Grotesk) - no external requests
- **Mobile 3D**: SacredAtmosphere disabled on mobile (<768px) for performance
- **Image Optimization**: WebP/Avif conversion configured in next.config
- **CSS Variables**: Light/dark mode via `data-theme` attribute
- **Smooth Transitions**: Framer Motion scroll-driven animations

## 🎯 Performance Notes

- Lighthouse targets: SEO 100, Accessibility 100
- Mobile Check: No jank on SacredMoments card swipes
- "Satisfying" Test: Click sounds + fluid cursor animations active

## 📚 Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **Animations**: Framer Motion + React Three Fiber
- **Styling**: Tailwind CSS v4
- **3D**: Three.js with particle systems
- **Icons**: Lucide React
- **Real-time**: Supabase integration

## 🚢 Deployment

Production build:

```bash
pnpm --filter @lovendo/web build
```

Ready for Vercel, Netlify, or any Node.js hosting.

---

**Redesigned by**: AI + Human Vision (January 2026)  
**Philosophy**: "No Passports, Just Rituals"
