# Cloud Computing Interactive Introduction

An engaging, interactive educational web application that teaches fundamental cloud computing concepts through hands-on activities. Built with React, TypeScript, and Vite, fully internationalized and accessible.

## Overview

This application provides a comprehensive learning experience covering:
- **Part 1: Foundations** - Myth vs. fact quiz about cloud computing basics
- **Part 2: Service Models** - Interactive drag-and-drop game for IaaS, PaaS, and SaaS
- **Part 3: Deployment Models** - Real-world scenarios for Public, Private, and Hybrid clouds
- **Part 4: Perspective Matters** - Netflix case study showing different stakeholder views
- **Part 5: Cloud Solution Designer** - Applied design challenge with cost/performance feedback

Total completion time: Under 10 minutes

## Prerequisites

- **Node.js** (v18 or higher)
- Modern web browser with JavaScript enabled

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5000`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
├── components/          # React components for each section
│   ├── Introduction.tsx
│   ├── Part1Foundations.tsx
│   ├── Part2ServiceModels.tsx
│   ├── Part3DeploymentModels.tsx
│   ├── Part4Netflix.tsx
│   ├── Part5CloudDesigner.tsx
│   ├── Summary.tsx
│   ├── ProgressBar.tsx
│   └── InfoTooltip.tsx
├── i18n/               # Internationalization setup
│   ├── IntlProvider.tsx
│   └── index.tsx
├── locales/            # Translation files
│   └── en.json
├── App.tsx             # Main application component
├── constants.ts        # Shared constants
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration
```

## Key Features

- **Fully Internationalized**: Uses react-intl (FormatJS) with ICU MessageFormat
- **Accessible**: WCAG 2.2 AA compliant with proper ARIA roles and keyboard navigation
- **Mobile-First**: Responsive design with touch-friendly targets (≥44px)
- **Dark Theme**: Glassy aesthetic using MIT brand colors (garnet and steel)
- **Progress Tracking**: Free navigation between sections with visual progress indicators
- **Interactive Learning**: Multiple activity types to reinforce concepts

## Technology Stack

- **React** 19.2.0 - UI framework
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool and dev server
- **react-intl** 7.1.14 - Internationalization
- **Tailwind CSS** (via CDN) - Styling

## Development Notes

- Development server runs on port **5000** and binds to `0.0.0.0` for Replit compatibility
- Hot Module Replacement (HMR) enabled for fast development
- Locale persistence via localStorage
- Automatic RTL support for right-to-left languages

## Contributing

Please maintain the following standards:
- All user-visible text must use `FormattedMessage` for i18n
- Minimum 44px touch targets for interactive elements
- Proper ARIA attributes for accessibility
- Follow existing code conventions and component patterns

## License

This project is for educational purposes.
