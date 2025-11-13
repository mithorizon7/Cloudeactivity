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
- **2025-11-13**: Layout fixes for progress bar and Part 5 overflow
  - **Issue 1**: Progress bar showed "5" instead of "4" on Part 4
    - **Root cause**: Used `index + 1` which didn't account for 'intro' at index 0
    - **Fix**: Conditional logic extracts number from stage name ('part1' → '1'), intro shows arrow (→), summary shows checkmark (✓)
  - **Issue 2**: Part 5 content (SaaS, Hybrid options) cut off at bottom
    - **Root cause**: `items-center` vertically centered content causing overflow without scroll
    - **Fix**: Changed to `items-start`, added `overflow-y-auto`, increased bottom padding to `pb-32` for progress bar clearance
  - **Verification**: Architect confirmed both fixes work correctly across viewport sizes

- **2025-11-13**: Complete MIT "garnet + steel" brand color migration
  - **Objective**: Migrated from cyan/purple palette to MIT brand colors while maintaining dark glassy aesthetic
  - **Background gradients**: Changed from `via-indigo-900` to `via-[#19020b]` (wine-tinted depth)
  - **Heading gradients**: Changed from `from-cyan-400 to-purple-400` to `from-[#ba7f89] via-[#d5b2b8] to-[#d0d4d8]` (rose→silver)
  - **Primary buttons**: Changed from `from-purple-600 via-violet-600 to-cyan-600` to `from-[#750014] via-[#973f4e] to-[#ba7f89]` (MIT garnet gradient)
  - **Completed states**: Changed from cyan to emerald green (`from-[#22c55e] to-[#15803d]`)
  - **Part 4 tabs**: Netflix tab uses MIT garnet, Subscriber tab uses midnight steel gradient
  - **Service badges**: Replaced purple/cyan color-coding with steel grey hierarchy (`#53595e`, `#8b959e`, `#adb4bb`, `#d0d4d8`)
  - **Focus rings**: Updated to `ring-[#ba7f89]/60` or `ring-[#8b959e]/70` depending on context
  - **Files updated**: Introduction, Part1-5, Summary, ProgressBar, App.tsx (10 components total)
  - **Verification**: Architect confirmed all cyan/purple/violet references replaced, no functional regressions
  
- **2025-11-13**: Comprehensive i18n fixes for Part 5 (CloudDesigner)
  - **Issue 1**: String splitting - `.split(" ")[0]` broke non-English word order
    - **Fix**: Added 6 shortLabel locale keys (part5.service.*.shortLabel, part5.deployment.*.shortLabel)
  - **Issue 2**: Hardcoded risk values - "low"/"med"/"high" not translatable
    - **Fix**: Added part5.risk.low/med/high locale keys with proper translation
  - **Issue 3**: Currency formatting - hardcoded "$" and "/mo" with English digit grouping
    - **Fix**: Created formatMonthlyCost() using ICU message: `{amount, number}/mo`
  - **Issue 4**: List joining - `Array.join(", ")` hardcoded English comma separator
    - **Fix**: Replaced with FormattedList component for locale-aware conjunctions
  - **Issue 5**: Signed number formatting - manual "+8" prefix logic
    - **Fix**: Used ICU skeleton syntax: `{controlBonus, number, :: sign-always}`
  - **Issue 6**: String concatenation - effort + hybrid text concatenated
    - **Fix**: Separate full messages for hybrid vs non-hybrid with conditional selection
  - **Impact**: Part 5 now 100% translation-ready with zero English assumptions
  - **Verification**: Architect confirmed PASS - meets all i18n acceptance criteria

- **2025-11-12**: Interactive progress navigation bar with free roaming
  - **Stepper Design**: 7-stage progress bar (Intro → Part 1-5 → Summary) with circular nodes and connecting lines
  - **Visual States**: Current (gradient), Completed (checkmark), Upcoming (gray outline)
  - **Two-Line Labels**: Stage number + descriptive subtitle (e.g., "Part 1" / "Foundations")
  - **Free Navigation**: Click any stage to jump directly - always unrestricted access
  - **Smart State Management**: Derives completion from position (stages before current show as completed)
  - **Mobile-First**: Responsive sizing, horizontal scroll, touch-friendly 44px targets, scale-105 on current
  - **Accessibility**: Full ARIA navigation landmarks, aria-current tracking, keyboard navigable
  - **i18n**: 22 new locale keys (titles, labels, and subtitles) with translator context
  - Fixed bottom positioning with glassmorphism backdrop blur and sufficient internal padding

- **2025-11-12**: Award-caliber visual refresh of Part 4: Perspective Matters
  - **Design System Approach**: Implemented consistent design tokens for spacing, typography, and colors
  - **Visual Hierarchy**: Segmented control (iOS-style), card-based layout, icon system (8 custom SVG icons)
  - **Micro-interactions**: Smooth 150ms transitions, animated service badges, progress tracker with green dots
  - **Accessibility**: Full WCAG 2.2 AA compliance with proper ARIA roles (tablist, tabpanel), focus rings, semantic HTML
  - **Responsiveness**: Mobile-first fluid typography, stacking grids, touch-friendly targets
  - **Polish**: Glassmorphism refinement, disabled states, check badges on viewed perspectives
  - **i18n**: Added 3 new locale keys (part4.insight.label, part4.progress.label, part4.progress.viewed) with translator context
  - All emoji replaced with icon components for proper i18n support

- **2025-11-12**: Mobile accessibility and balanced scoring improvements
  - Rebalanced scoring system: 5/10/10/5/20 (total 50 points) for sustained engagement
  - Fixed Part 2 mobile accessibility: added dual-mode interaction (drag-and-drop + tap-to-select)
  - Touch-friendly visual feedback: cyan highlights, "Tap here to place" instructions
  - Part 4 now awards 5 engagement points for viewing both perspectives
  - Fixed duplicate scoring exploit in Part 2 drag-and-drop

- **2025-11-12**: Added advanced interactive learning components (Parts 4-5)
  - **Part 4: Netflix Perspective Challenge** - Interactive perspective switcher showing how Netflix uses PaaS while subscribers use SaaS for the same infrastructure
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
