# Cloud Computing Interactive Introduction

## Overview
This project is an interactive educational web application built with React, TypeScript, and Vite. Its primary purpose is to teach fundamental cloud computing concepts through engaging, interactive activities. The application is structured into five core sections: Foundations, Service Models, Deployment Models, Perspective Matters (a Netflix case study), and a Cloud Solution Designer. The overall ambition is to provide a comprehensive and interactive learning experience that applies theoretical knowledge to practical scenarios, aiming to be a leading educational tool in cloud computing.

## User Preferences
I prefer clear, concise explanations and a direct communication style. For coding tasks, I appreciate iterative development with regular updates. Please ask for my approval before implementing major architectural changes or introducing new external dependencies. I also prefer detailed explanations of complex solutions. Do not make changes to the `locales` folder. Do not make changes to the `i18n` folder.

## System Architecture
The application is built using React 19.2.0, TypeScript 5.8.2, and Vite 6.2.0. Styling is managed with Tailwind CSS.

**UI/UX Decisions:**
- The design employs a dark, glassy aesthetic, incorporating MIT brand colors (garnet and steel) for a sophisticated visual experience.
- Interactive elements feature smooth transitions (150ms), animated service badges, and responsive scaling.
- The layout is mobile-first, with fluid typography, stacking grids, and touch-friendly targets (minimum 44px).
- Desktop layouts utilize a two-column responsive design for Part 5 (Cloud Solution Designer), featuring a sticky sidebar for controls and expanded comparison tables.
- Accessibility is a core focus, with WCAG 2.2 AA compliance, proper ARIA roles (e.g., tablist, tabpanel), focus rings, and semantic HTML.
- A 7-stage progress bar provides free navigation between sections, featuring distinct visual states for current, completed, and upcoming stages.

**Technical Implementations:**
- **Internationalization (i18n):** The application uses `react-intl` (FormatJS) with ICU MessageFormat for full translation readiness. This includes a robust locale provider (`i18n/IntlProvider.tsx`), flattened locale file structures (`locales/en.json`), locale persistence via localStorage, and automatic RTL support. All user-visible strings are externalized, and `FormattedList` is used for locale-aware list conjunctions.
- **Interactive Components:**
    - **Part 1 (Foundations):** Myth vs. fact quiz.
    - **Part 2 (Service Models):** Drag-and-drop categorization game with dual-mode interaction (drag-and-drop + tap-to-select) for mobile accessibility.
    - **Part 3 (Deployment Models):** Real-world scenario application.
    - **Part 4 (Perspective Matters):** An interactive perspective switcher demonstrating IaaS/PaaS/SaaS roles using a Netflix case study, with WCAG 2.2-compliant ARIA tab patterns.
    - **Part 5 (Cloud Solution Designer):** Users select service and deployment models, adjust user counts, and receive real-time cost/performance feedback for business scenarios. Includes a collapsible mental model primer and context-sensitive feedback.
- **Scoring System:** Rebalanced to 5/10/10/5/20 for a total of 50 points to ensure sustained engagement across all interactive sections.
- **Vite Configuration:** The development server runs on port 5000, binds to `0.0.0.0`, and allows all hosts for Replit's proxy and iframe compatibility, with Hot Module Replacement (HMR) enabled.

## External Dependencies
- **Frontend Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (via CDN for development)
- **Internationalization:** `react-intl` (FormatJS)

## Recent Changes
- **2025-11-14**: Part 5 (Cloud Designer) comprehensive UX transformation based on user feedback
  - **InfoTooltip event handling fix**: Added `stopPropagation()` to click/keyboard events
    - Prevents tooltips from triggering card selection when clicked
    - Maintains accessibility (Enter/Space to open, Escape to close)
    - Applied to all interactive tooltips across service/deployment cards
  - **Default trade-off visibility**: Changed `showTradeoffDetails` initial state to `true`
    - Users see detailed score breakdown immediately without clicking "Why this score?"
    - Removes barrier to understanding their choice's trade-offs
    - All four metrics (Cost, Speed & Scale, Compliance, Operational Effort) visible by default
  - **Strengthened selection states**: Enhanced visual feedback for selected cards
    - Cyan borders (border-2 border-cyan-400) on selected service/deployment cards
    - Ring glow effect (ring-2 ring-cyan-500/20) for subtle emphasis
    - Green checkmark badges (✓) on selected cards
    - Applied consistently across both service and deployment selectors
  - **Comparison table Summary/All toggle**: Added view mode switcher
    - Summary mode: Shows top recommendation + user's selection + 1 alternative (3 rows)
    - All mode: Shows all 9 service/deployment combinations
    - Uses Set-based logic to guarantee top recommendation always appears in Summary view
    - Current selection marked with cyan star (★) and highlighted row
    - Original rank numbers preserved for all combinations
  - **Comparison table visibility gating**: Table hidden until user reveals top recommendation
    - Conditional rendering: `{topRevealed && selected && (`
    - Prevents users from seeing rankings before making their own choice
    - Maintains learning integrity of the activity
  - **Clear comparison table heading**: Added "Compare All Service & Deployment Options" h3
    - Appears above table for better context
    - Uses consistent styling (text-lg font-semibold text-white)
  - **Rationale**: These changes address comprehensive user feedback about Part 5's UX, making selections more visible, removing barriers to information, and providing flexible comparison views while preserving the learning flow
  - **Verification**: Architect confirmed all improvements working correctly with proper edge case handling (top/middle/worst selections all render correctly in Summary view)

- **2025-11-14**: Part 5 (Cloud Designer) P0 clarity improvements for novice users
  - **"What matters most" priority chips (P0#3)**: Replaced cryptic weight percentages with High/Med/Low priority badges
    - Each dimension (Cost, Speed & Scale, Compliance, Operational Effort) shows color-coded priority
    - InfoTooltip on each chip reveals exact percentage + definition
    - Thresholds: High ≥30%, Med 15-29%, Low <15%
    - Resets to scenario defaults when user changes scenarios
  - **Comprehensive InfoTooltip integration (P0#5)**: Added accessible tooltips to all metrics
    - Service metrics: Ops overhead, Lock-in
    - Deployment metrics: Fixed cost, $/1k variable, Elasticity
    - Priority dimensions: Cost, Speed & Scale, Compliance, Operational Effort
    - All tooltips support keyboard navigation (Enter/Space to open, Escape to close), touch interaction, and ARIA
  - **Top recommendation blur/reveal (P0#8)**: Prevents users from shortcutting the learning activity
    - Top recommendation card starts blurred with "Reveal top pick" button overlay
    - Backdrop-blur effect with accessible focus states
    - Resets to blurred state when scenario changes
    - Content hidden from screen readers when blurred (aria-hidden)
  - **Code cleanup**: Removed unused MetricBadge component (replaced with inline markup + tooltips)
  - **Mobile accessibility fix**: Increased InfoTooltip touch targets from 16px to 44px minimum
    - Added min-w-[44px] min-h-[44px] with padding for comfortable tapping
    - Used negative margins (-my-2) to maintain vertical alignment
    - Added touch-manipulation CSS and max-width constraints to prevent overflow
    - Visual icon kept small (20px) while touch area meets accessibility guidelines
  - **Rationale**: These changes address feedback that Part 5 was overwhelming for true novices by replacing technical jargon with plain language, adding definitions where needed, and preventing activity shortcuts
  - **Verification**: Architect confirmed all P0 items complete, mobile-friendly, and ready for user testing

- **2025-11-13**: Improved title readability by removing gradient text
  - **Issue**: Gradient text on main titles (h1/h2) was hard to read due to low-luminance segments
  - **Fix**: Replaced all gradient titles with solid white text (`text-white`)
    - Introduction title (h1)
    - Part 1-3 titles (h2)
    - Summary title (h1)
    - ProgressBar current step labels
  - **Accessibility**: Solid white text provides consistent 4.5:1+ contrast ratio (WCAG 2.1 AA compliant)
  - **Rationale**: Gradient text created readability issues especially for low-vision users; reserved gradients for larger non-text elements (buttons, backgrounds)
  - **Verification**: Architect confirmed change improves accessibility without compromising visual aesthetic

- **2025-11-13**: Desktop-optimized layout for Part 5 (Cloud Solution Designer)
  - **Two-Column Responsive Layout**: Implemented sticky sidebar with selector controls on desktop
    - Changed from `lg:grid-cols-12` to `lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]` for better desktop space utilization
    - Left column (service/deployment/scale selectors) sticky on desktop: `lg:sticky lg:top-6`
    - Selector controls stay visible while scrolling results on wide viewports
    - Container widened to `max-w-7xl` for better horizontal space usage
  - **Primer Repositioning**: Moved mental model primer from standalone section to right column
    - Appears above trade-offs section on desktop for better contextual placement
    - Maintains same styling and collapsible functionality
  - **Auto-Expand Comparison Table**: Desktop viewports (≥1024px) show full comparison table by default
    - Added resize listener to detect viewport width changes
    - Toggle button hidden on desktop (`lg:hidden`), visible only on mobile
    - Resets properly on scenario changes based on current viewport size
  - **Component-Level Responsive Enhancements**:
    - MetricBadge scaling: `h-16 w-16` → `sm:h-20 w-20` → `xl:h-24 w-24` for better desktop readability
    - Service selector padding: `p-3` → `lg:p-4` → `xl:p-5` for improved touch/click targets
    - Deployment selector padding: `p-4` → `lg:p-5` → `xl:p-6` with breathing room on wide screens
    - Results grid: `lg:grid-cols-2 xl:gap-8` for side-by-side comparison on desktop
    - Feedback layout: `lg:flex lg:gap-6` for horizontal flow instead of grid stacking
    - Action buttons: `lg:justify-end` for right-aligned inline placement on desktop
  - **Mobile Preservation**: All changes maintain excellent mobile responsiveness
    - Touch targets remain ≥44px minimum
    - Proper vertical stacking on small screens
    - Sticky footer with action buttons on mobile
    - No horizontal overflow across any breakpoint
  - **Verification**: Architect confirmed desktop optimization meets all objectives with no regressions