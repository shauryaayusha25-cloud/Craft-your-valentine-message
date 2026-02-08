# 💝 Valentine Builder

A cute, interactive Valentine's Day page builder. Create personalized quiz pages with photos and share them with your special someone!

## Features

- **Creator Flow** → Set names, 3 MCQ quiz questions, upload photos, add a message
- **Recipient Flow** → Animated intro → Quiz with scoring → Photo slideshow → "Will you be my Valentine?" with runaway No button → Confetti celebration
- **Zero backend** → Everything encoded in the URL hash, no database needed
- **Mobile-first** → Responsive, touch-friendly, smooth animations

## Deploy to Vercel

### Option A: CLI
```bash
npm install -g vercel
cd valentine-app
vercel
```

### Option B: GitHub
1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo → Vercel auto-detects Vite → Deploy

### Option C: Drag & Drop
1. Run `npm run build`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Drag the `dist` folder

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## How It Works

- Creator fills in names, questions, photos, and a message
- Photos are compressed to ~360px JPEG (quality 0.45) to keep URLs small
- All data is base64-encoded into the URL hash: `yoursite.com/#v=<encoded_data>`
- Recipient opens the link and plays through the interactive experience
- No server, no database, no auth — pure client-side magic

## Custom Domain

After deploying to Vercel, add a custom domain in Project Settings → Domains.
Example: `valentine.yourdomain.com`

## Tech Stack

- React 18 + Vite 6
- Pure CSS animations (no external animation libraries)
- Playfair Display + DM Sans typography
- Zero runtime dependencies beyond React
