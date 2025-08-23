# RUACH E-STORE - React + Vite

This project has been refactored from Next.js to React + Vite for better performance and simpler deployment.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Radix UI** components
- **Firebase** integration
- **Stripe** payment integration
- **Cloudinary** image management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (used with React Router)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

## Key Changes from Next.js

1. **Routing**: Replaced Next.js App Router with React Router
2. **Images**: Replaced `next/image` with standard `<img>` tags
3. **Links**: Replaced `next/link` with React Router `Link`
4. **Navigation**: Replaced `useRouter` with `useNavigate`
5. **Build System**: Switched from Next.js to Vite

## Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Deployment

The project builds to a `dist/` folder that can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## License

[Your License]