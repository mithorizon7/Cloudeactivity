# Cloud Computing Interactive Introduction

An interactive educational web application that teaches cloud computing concepts through engaging activities.

## Overview
This is a React + TypeScript + Vite application that guides users through cloud computing fundamentals with five interactive educational sections:
- **Part 1: Foundations** - Interactive myth vs. fact quiz about cloud basics
- **Part 2: Service Models** - Drag-and-drop game to categorize IaaS, PaaS, and SaaS
- **Part 3: Deployment Models** - Real-world scenarios for Public, Private, and Hybrid clouds
- **Part 4: Perspective Matters** - Netflix case study showing how service models depend on your role
- **Part 5: Cloud Solution Designer** - Apply knowledge to real business scenarios with interactive cost/performance simulation

## Project Structure
- `components/` - React components for each section
  - `Introduction.tsx` - Landing page
  - `Part1Foundations.tsx` - Quiz component
  - `Part2ServiceModels.tsx` - Service model sorting game
  - `Part3DeploymentModels.tsx` - Deployment scenarios
  - `Part4Netflix.tsx` - Netflix perspective challenge (PaaS vs SaaS)
  - `Part5CloudDesigner.tsx` - Interactive cloud solution builder
  - `Summary.tsx` - Final score display with comprehensive recap
  - `ProgressBar.tsx` - Progress indicator
  - `icons/` - Icon components
- `i18n/` - Internationalization setup (react-intl)
  - `IntlProvider.tsx` - Locale context provider with RTL support
  - `index.tsx` - Available locales and direction mapping
- `locales/` - Translation files with ICU MessageFormat
  - `en.json` - English translations (600+ keys with translator context)
- `App.tsx` - Main app component with routing logic
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0)

## Technology Stack
- **Frontend**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN in development)
- **i18n**: react-intl (FormatJS)

## Internationalization (i18n)
The app is fully translation-ready with comprehensive i18n implementation:

### Architecture
- **Framework**: react-intl with ICU MessageFormat support
- **Locale Provider**: `i18n/IntlProvider.tsx` wraps the app with locale context
- **Translations**: Flattened key structure in `locales/en.json` (350+ strings)
- **Persistence**: Locale selection saved to localStorage
- **RTL Support**: Automatic text direction (`dir` attribute) based on locale

### Features
- **Zero hard-coded text**: All user-visible strings externalized (including punctuation and bullets)
- **ICU MessageFormat**: Variables and plurals (e.g., `{totalScore, number}`)
- **Logical CSS**: Direction-agnostic properties (`marginInlineStart`, `text-start`)
- **Translator Context**: @-notation comments in locale files for every key
- **ARIA Labels**: Localized accessibility attributes throughout
- **Bidi Support**: `<bdi>` wrappers for dynamic user content

### For Translators
- Locale files use stable, descriptive keys (not English as keys)
- Context comments explain usage and technical terms (e.g., "IaaS = Infrastructure as a Service")
- All formatting, punctuation, and bullets can be localized
- ICU syntax supports variables: `{score, number}`, `{count, plural, ...}`

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
- **2025-11-12**: Added advanced interactive learning components (Parts 4-5)
  - **Part 4: Netflix Perspective Challenge** - Interactive toggle showing how Netflix uses PaaS while subscribers use SaaS for the same infrastructure
  - **Part 5: Cloud Solution Designer** - Three business scenarios (gaming startup, healthcare, e-commerce) where students:
    - Choose service model (IaaS/PaaS/SaaS) and deployment model (Public/Private/Hybrid)
    - Adjust user count with interactive slider (1K-100K users)
    - See real-time cost calculations and performance gauges
    - Receive contextual educational feedback on their choices
    - Earn points only for ideal service+deployment combinations (30 points max)
  - Updated Summary component with new recap sections for perspective and application skills
  - Added 250+ new locale keys maintaining full i18n compliance
  - Architect verified: educational effectiveness, scoring logic, and learning-by-doing approach
  
- **2025-11-12**: Comprehensive i18n implementation
  - Replaced Polyglot with react-intl (FormatJS) for ICU MessageFormat support
  - Created IntlProvider with locale persistence, RTL detection, and direction handling
  - Flattened locale file structure with translator context comments (@key notation)
  - Updated all components to use FormattedMessage and useIntl hooks
  - Replaced directional CSS with logical properties (text-start, marginInlineStart, gap)
  - Externalized all user-visible text including punctuation and bullet markers
  - Added ARIA labels and <bdi> wrappers for accessibility
  - Architect verified: fully translation-ready per developer brief
  
- **2025-11-12**: Initial Replit setup
  - Changed Vite port from 3000 to 5000
  - Added `allowedHosts: true` for Replit proxy compatibility
  - Configured dev workflow for webview on port 5000
