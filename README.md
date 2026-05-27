# linQ — Share the way

A verified ride-sharing carpool application built with React, TanStack Router, and Tailwind CSS.

## Features

- **Verified Ride Partners**: Safe and trusted ride-sharing community
- **Google Authentication**: Easy sign-in with Google accounts
- **User Profiles**: Create detailed profiles with emergency contacts
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS, Radix UI components
- **Build Tool**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd go-with-me-pal
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

**Vercel only** — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for build settings and how to disconnect legacy Cloudflare Workers/Pages integration.

- Build: `npm run build`
- Output: `dist`
- SPA routes: `vercel.json`

### Manual Vercel deploy

```bash
npm i -g vercel
vercel --prod
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── lib/          # Utilities and stores
├── routes/       # Page components and routing
└── styles.css    # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

# gotogetherrides
