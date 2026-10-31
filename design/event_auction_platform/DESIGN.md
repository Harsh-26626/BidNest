---
name: Event Auction Platform
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c8c5cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#929097'
  outline-variant: '#47464c'
  surface-tint: '#c6c4da'
  primary: '#c6c4da'
  on-primary: '#2f2f40'
  primary-container: '#1e1e2e'
  on-primary-container: '#868599'
  inverse-primary: '#5d5d6f'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#301b00'
  on-tertiary-container: '#bd7800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3e0f7'
  primary-fixed-dim: '#c6c4da'
  on-primary-fixed: '#1a1a2a'
  on-primary-fixed-variant: '#464557'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  tabular-price:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is built upon a reliable, institutional dark mode aesthetic tailored for high-value financial transactions and live auctions. The brand personality is trustworthy, transparent, and quietly exciting. It balances absolute precision with a sophisticated atmosphere, utilizing deep slate and charcoal surfaces to recede into the background, allowing live bids, timers, and critical asset imagery to take center stage. 

The visual style leans toward a refined, modern Corporate/SaaS aesthetic infused with high-trust financial signaling. Visual weight is communicated through meticulous typography and deliberate color accents rather than heavy skeuomorphism or disruptive animations.

## Colors

The color architecture is built specifically for low-fatigue, high-stakes environments. 
- **Primary / Surface:** Deep slate and charcoal (`#1E1E2E` and `#0F172A`) form the immersive dark mode canvas, creating distinct tonal separation between background planes, cards, and interactive containers.
- **Secondary Actions:** Confident indigo (`#6366F1`) drives primary interactive elements, confirmations, and active states.
- **Accents:** A warm amber/gold (`#F59E0B`) is strictly reserved for live bids, active auction timers, pricing highlights, and critical financial notifications.

## Typography

Typography relies entirely on **Inter** for absolute clarity, institutional credibility, and clean geometric balance. 
- **Scale:** Modular and restrained, optimizing for density in live bidding feeds without sacrificing readability.
- **Tabular Numerals:** All financial figures, auction timers, and bid increments *must* utilize tabular lining figures (`tnum`) to prevent layout jitter as numbers update in real time.

## Layout & Spacing

The layout model uses a responsive 12-column fluid grid system optimized for desktop monitoring views and touch-friendly mobile auction participation. 
- **Rhythm:** An 8px base spacing scale dictates all internal component padding and element gaps, ensuring consistent vertical rhythm across complex auction dashboards.
- **Breakpoints:** Adapt fluidly from single-column mobile layouts to multi-column desktop command centers where live feeds, bid histories, and asset details sit side-by-side.

## Elevation & Depth

Depth is communicated through tonal surface stacking and ultra-subtle low-contrast outlines rather than heavy drop shadows. 
- **Surfaces:** Base canvases sit at the darkest tier (`#0F172A`), while cards, modals, and sticky bidding docks elevate using lighter slate layers (`#1E1E2E`) paired with 1-pixel ghost borders (`rgba(255, 255, 255, 0.08)`).
- **Focus States:** Active bidding modules receive a faint amber or indigo ambient glow to draw the eye instantly to interactive areas during high-tempo moments.

## Shapes

The design system enforces a strictly controlled soft-corner geometry (`roundedness: 1`). 
- **Radii:** Base UI elements feature a tight `0.25rem` radius, while cards and containers scale up to `0.5rem` (`rounded-lg`) and `0.75rem` (`rounded-xl`). 
- **Intent:** This restrained rounding prevents the UI from feeling overly playful, preserving the formal, institutional trust required for high-value financial exchanges.

## Components

- **Buttons:** Primary actions utilize solid indigo fills with crisp hover states. Destructive or high-urgency actions leverage amber/gold highlights. All buttons incorporate tabular text properties when displaying dynamic numerical values.
- **Chips & Badges:** Used extensively for auction status indicators (e.g., "Live", "Closed", "Reserved"). Status tags feature semi-transparent background tints matching their semantic color.
- **Lists & Bid Feeds:** High-density tabular lists featuring alternating row contrasts and strictly aligned tabular numerals for prices and timestamps.
- **Input Fields:** Deep charcoal backgrounds with subtle borders. Focus states transition smoothly to indigo or amber rings. Include clear inline validation and helper text positions.
- **Cards:** Encapsulate auction lots. Feature structured image containers at the top, clear typography hierarchy for titles, and pinned bottom bars housing the current bid and quick-action trigger.
- **Checkboxes & Radios:** Minimalist square and circular selectors with high-contrast active states for auction filter drawers and terms acceptance.