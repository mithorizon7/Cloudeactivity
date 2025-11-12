# Cloud Computing Interactive Introduction

An interactive educational web application that teaches cloud computing concepts through engaging activities.

## Overview
This is a React + TypeScript + Vite application that guides users through cloud computing fundamentals:
- **Part 1: Foundations** - Interactive myth vs. fact quiz about cloud basics
- **Part 2: Service Models** - Drag-and-drop game to categorize IaaS, PaaS, and SaaS
- **Part 3: Deployment Models** - Real-world scenarios for Public, Private, and Hybrid clouds

## Project Structure
- `components/` - React components for each section
  - `Introduction.tsx` - Landing page
  - `Part1Foundations.tsx` - Quiz component
  - `Part2ServiceModels.tsx` - Service model sorting game
  - `Part3DeploymentModels.tsx` - Deployment scenarios
  - `Summary.tsx` - Final score display
  - `ProgressBar.tsx` - Progress indicator
  - `icons/` - Icon components
- `i18n/` - Internationalization setup (Polyglot.js)
- `locales/` - Translation files
- `App.tsx` - Main app component with routing logic
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0)

## Technology Stack
- **Frontend**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN in development)
- **i18n**: Polyglot.js

## Development
The app runs on port 5000 with Vite's dev server configured to:
- Bind to `0.0.0.0` for Replit's proxy
- Allow all hosts for iframe compatibility
- Hot module replacement enabled

## Deployment Notes
- The app uses Tailwind CSS via CDN in development
- For production, consider installing Tailwind CSS as a PostCSS plugin
- The GEMINI_API_KEY environment variable is configured but not currently used

## Recent Changes
- **2025-11-12**: Initial Replit setup
  - Changed Vite port from 3000 to 5000
  - Added `allowedHosts: true` for Replit proxy compatibility
  - Configured dev workflow for webview on port 5000
