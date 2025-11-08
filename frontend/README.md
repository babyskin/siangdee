# Siangdee - Frontend

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [JavaScript (ES6)](https://www.codecademy.com/article/javascript-versions)

## Project Structure
```
frontend/
├── app/
│   ├── page.js              # Main application component
│   ├── layout.js            # Root layout with metadata
│   └── globals.css          # Global styles
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
├── lib/
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── .next/                   # Next.js build output (generated)
├── node_modules/            # Dependencies (generated)
├── .gitignore               # Git ignore rules
├── components.json          # shadcn/ui configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration (TypeScript)
├── next-env.d.ts            # Next.js TypeScript declarations
├── postcss.config.mjs       # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration (not shown but implied)
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
└── README.md                
```

## Installation

### Prerequisites
```
- Node.js 18+ and npm
```

### Steps
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser at http://localhost:3000
```

## Configuration

### Backend API URL

Create a `.env.local` file in the frontend root directory:
```env
NEXT_PUBLIC_API_URL=https://your-backend-ip:8000
```

Update the fetch URL in `app/page.js`:
```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transcribe/`, {
  method: 'POST',
  body: formData,
})
```

Or use a hardcoded URL for development:
```javascript
const response = await fetch('http://IP:8000/api/transcribe/', {
  method: 'POST',
  body: formData,
})
```

## Available Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Export static site
npm run build && npm run export

# Start production server (after build)
npm start

# Lint code
npm run lint
```

## Changing the Translation Direction
### 1. Modify the `getLanguageConfig()` function in `app/page.js`
```javascript
const getLanguageConfig = () => {
  if (direction === 'en-es') {  // ← Change language codes here
    return {
      sourceFlag: '🇬🇧',           // ← Source language flag
      targetFlag: '🇪🇸',           // ← Target language flag
      sourceName: 'English',      // ← Source language name
      targetName: 'Spanish',      // ← Target language name
      recordPrompt: 'Press to speak in English',  // ← Recording prompt
      whisperLang: 'en',          // ← Whisper language code
      systemPrompt: 'You are an expert English-to-Spanish translator...',
      translatePrompt: (text) => `Translate this text to Spanish: ${text}`
    }
  } else {
    // Reverse direction configuration
    return {
      sourceFlag: '🇪🇸',
      targetFlag: '🇬🇧',
      sourceName: 'Spanish',
      targetName: 'English',
      recordPrompt: 'Presiona para hablar en español',
      whisperLang: 'es',
      systemPrompt: 'You are an expert Spanish-to-English translator...',
      translatePrompt: (text) => `Translate this text to English: ${text}`
    }
  }
}
```

### 2. Update the initial direction state
```javascript
const [direction, setDirection] = useState('en-es')  // ← Change default direction
```
### 3. Supported Languages
**Whisper API** supports 98 languages. Check the [official list](https://platform.openai.com/docs/guides/speech-to-text/supported-languages).

## Customizing the UI
### Colors

Modify `app/globals.css` to change the color scheme:
```css
@layer base {
  :root {
    --primary: 222 47% 11%;      /* Primary color */
    --primary-foreground: 210 40% 98%;
    /* ... other colors */
  }
}
```

### Fonts
Update `app/layout.js`:
```javascript
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ weight: '400', subsets: ['latin'] })
```

### Components

All UI components are in `components/ui/` and can be customized using Tailwind classes or by editing the component files directly.

## Troubleshooting
### Microphone Access Denied

- Make sure you're using **HTTPS** or **localhost**
- Check browser permissions

### CORS Errors

Make sure the backend Django server has CORS properly configured:
```python
# In Django settings.py
CORS_ALLOW_ALL_ORIGINS = True  # For development
```

### Audio Not Playing

- Check that `audio_base64` is returned in the API response
- Verify the base64 decoding in `base64ToBlob()` function
- Check browser console for errors
