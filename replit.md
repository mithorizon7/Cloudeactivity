# Cloud Computing Interactive Introduction

## Overview
This project is an interactive educational web application built with React, TypeScript, and Vite. Its primary purpose is to teach fundamental cloud computing concepts through engaging, interactive activities. The application is structured into five core sections: Foundations, Service Models, Deployment Models, Perspective Matters (a Netflix case study), and a Cloud Solution Designer. The overall ambition is to provide a comprehensive and interactive learning experience that applies theoretical knowledge to practical scenarios, aiming to be a leading educational tool in cloud computing.

## User Preferences
I prefer clear, concise explanations and a direct communication style. For coding tasks, I appreciate iterative development with regular updates. Please ask for my approval before implementing major architectural changes or introducing new external dependencies. I also prefer detailed explanations of complex solutions. Do not make changes to the `locales` folder. Do not make changes to the `i18n` folder.

## System Architecture
The application is built using React, TypeScript, and Vite, with styling managed by Tailwind CSS.

**UI/UX Decisions:**
- Employs a dark, glassy aesthetic with MIT brand colors (garnet and steel).
- Features smooth transitions, animated service badges, responsive scaling, and a mobile-first design.
- Desktop layouts for the Cloud Solution Designer utilize a two-column responsive design with a sticky sidebar.
- Adheres to WCAG 2.2 AA compliance for accessibility, including ARIA roles, focus rings, and semantic HTML.
- **Mobile Accessibility (EU Law Compliant):**
    - All touch targets meet WCAG 2.5.5 minimum 44×44px with `min-h-[44px]` or larger.
    - Touch-manipulation CSS for improved mobile responsiveness.
    - Active states (`active:scale-95`, `active:bg-*`) for visual feedback.
    - Safe-area-inset support for iOS notches (viewport-fit=cover).
    - Lazy loading for lesson components improves mobile performance.
    - Responsive padding pattern: `p-4 sm:p-6 lg:p-8`.
    - Modal max-height with scroll for small screens.
    - Dual interaction mode in Part 2: tap-to-select on mobile, drag-and-drop on desktop.
- A 7-stage progress bar provides free navigation with distinct visual states.

**Technical Implementations:**
- **Internationalization (i18n):** Uses `react-intl` (FormatJS) with ICU MessageFormat for full translation readiness, including locale persistence and RTL support. Supports English, Russian (Русский), and Latvian (Latviešu) with a language switcher in the top-right corner.
- **Interactive Components:**
    - Part 1 (Foundations): Myth vs. fact quiz.
    - Part 2 (Service Models): Drag-and-drop categorization game with dual-mode interaction.
    - Part 3 (Deployment Models): Real-world scenario application with animated Venn diagrams using Dual Coding Theory.
    - Part 4 (Perspective Matters): Three-layer perspective switcher (IaaS→PaaS→SaaS) with WCAG 2.2-compliant ARIA tab patterns. Includes an AWS/Provider View for enhanced pedagogical clarity.
    - Part 5 (Cloud Solution Designer): Allows users to select service/deployment models, adjust user counts, and receive real-time cost/performance feedback. Includes priority badges (High/Med/Low) instead of percentages and a blur/reveal mechanism for the top recommendation. The layout is optimized for desktop with a sticky sidebar and an auto-expanding comparison table.
- **Scoring System:** Rebalanced to 5/10/10/5/20 for a total of 50 points.
- **Vite Configuration:** Development server runs on port 5000, binds to `0.0.0.0`, allows all hosts for Replit compatibility, and has HMR enabled.
- **Readability:** Gradient text on titles has been replaced with solid white text for improved contrast and accessibility.

## External Dependencies
- **Frontend Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Internationalization:** `react-intl` (FormatJS)