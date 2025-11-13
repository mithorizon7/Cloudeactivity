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