# Ruach E-Store React

A comprehensive e-commerce platform built with modern web technologies. This project provides a full-featured online store with vendor dashboards, service provider portals, admin panels, and delivery management systems.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Available Scripts](#available-scripts)
- [Components](#components)
- [Routing](#routing)
- [Firebase Integration](#firebase-integration)
- [Styling](#styling)
- [Performance Optimizations](#performance-optimizations)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Technology Stack

This project is built with a modern frontend stack:

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for better development experience
- [React](https://reactjs.org/) (v18) - UI library for building component-based interfaces
- [shadcn/ui](https://ui.shadcn.com/) - Reusable component library built with Radix UI and Tailwind CSS
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service for authentication, database, and more

## Key Features

- 🛍️ Complete e-commerce functionality (products, cart, checkout)
- 🏪 Vendor dashboard for product management
- 👨‍🔧 Service provider portal for service management
- 🚚 Delivery dashboard for order fulfillment
- 👤 User authentication and profile management
- 🛠️ Admin panel for overall system management
- 💳 Payment integration (Stripe, Paystack)
- 🖼️ Cloudinary image management
- 📱 Responsive design with mobile support
- 🌙 Dark mode support
- 🌍 Multi-currency support
- 🔍 Advanced search and filtering
- 📊 Analytics and reporting
- 🎯 Personalized recommendations
- 🛡️ KYC verification system
- 💰 Wallet and payout management

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and shared logic
├── pages/               # Page-level components
├── scripts/             # Node.js scripts for initialization and testing
├── service-provider/    # Service provider dashboard module
├── types/               # TypeScript type definitions
├── App.tsx              # Root component
├── main.tsx             # Application entry point
├── routes.tsx           # Route definitions
└── index.css            # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (package manager)
- Firebase account for backend services

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ruach-estore-react
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Development

Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `pnpm run dev` - Starts the development server
- `pnpm run build` - Builds the application for production
- `pnpm run preview` - Previews the built application
- `pnpm run lint` - Runs ESLint to check for code issues
- `pnpm run grant-admin` - Grants admin privileges to a user
- `pnpm run init-slider` - Initializes the slider management system
- `pnpm run test-indexeddb` - Runs IndexedDB tests

## Components

All shadcn/ui components are pre-downloaded and available at `@/components/ui`. You can import them directly:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
```

Custom components are organized in the `@/components` directory:
- UI components (buttons, cards, etc.)
- Layout components (header, footer, etc.)
- Feature-specific components (cart, checkout, etc.)

## Routing

The application uses React Router for navigation. Routes are defined in `src/routes.tsx` and include:

- Public pages (home, products, services)
- Authentication routes (login, register)
- User dashboard (profile, orders, wishlist)
- Vendor dashboard (products, orders, analytics)
- Service provider dashboard (services, bookings)
- Admin dashboard (users, products, orders)
- Delivery dashboard (order fulfillment)

Routes are lazy-loaded for better performance using React.lazy and Suspense.

## Firebase Integration

The project uses Firebase for:
- Authentication (Email/Password, Social logins)
- Firestore database for product/service data
- Cloud Storage for image uploads
- Cloud Functions for backend logic

## Styling

The project uses Tailwind CSS for styling with a utility-first approach:

- Global styles are defined in `src/index.css`
- Component-specific styles use Tailwind classes
- Dark mode support with CSS variables
- Custom color palette defined in Tailwind config

To customize the styling:
1. Modify `src/index.css` for global styles
2. Adjust `tailwind.config.ts` for theme customizations
3. Use Tailwind classes directly in components

## Performance Optimizations

### Lazy Loading Implementation

This project implements comprehensive lazy loading for improved performance:

1. **Route-based Code Splitting**: All pages are loaded lazily using React.lazy()
2. **Image Lazy Loading**: Custom LazyImage component for efficient image loading
3. **Suspense Boundaries**: Loading states for all lazy-loaded components

For implementation details, see [LAZY_LOADING_IMPLEMENTATION.md](LAZY_LOADING_IMPLEMENTATION.md).

### Benefits

- Reduced initial bundle size
- Faster initial page load
- Improved Time to Interactive
- Better user experience with loading indicators

## Folder Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...             # Custom components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── scripts/            # Node.js scripts
│   ├── service-provider/   # Service provider dashboard
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   ├── routes.tsx          # Route definitions
│   └── index.css           # Global styles
├── components.json         # shadcn/ui configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.