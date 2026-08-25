# ClubOfSports — Design Direction

## Three possible directions

### The Floodlit Clubhouse
**Very Brief Intro:** A premium, nocturnal sports commons with graphite surfaces, disciplined field-line geometry and one energising court-lime accent. It makes matching athletes feel as tangible as walking onto a well-lit court.
**Probability:** 0.07

### The Athlete’s Field Journal
**Very Brief Intro:** An editorial, textured sports notebook with off-white stock, ink strokes and warmly documentary photography. It would make achievements and sessions feel personal and collected over time.
**Probability:** 0.04

### Signal Lane
**Very Brief Intro:** A crisp, utilitarian transit-map treatment where player availability and compatibility are represented as routes, signals and stops. It is engineered, efficient and city-scale.
**Probability:** 0.09

## Chosen approach: The Floodlit Clubhouse

### Design Movement
Contemporary **sports hospitality** meets **technical performance apparel**: elevated, controlled, and immediately legible under low-light conditions. The look avoids both loud stadium graphics and generic SaaS minimalism.

### Core Principles
1. **The sport is the interface:** meaningful field lines, score rings and team-card geometry carry information rather than decorate it.
2. **Quiet confidence:** large, decisive type and carefully rationed luminous lime concentrate attention on the next action.
3. **Tactile depth:** charcoal layers, hairline borders, occasional translucent panels and structured shadows create a considered clubhouse atmosphere.
4. **Human proximity:** athlete portraits and specific availability cues keep the product about people, not abstract social metrics.

### Color Philosophy
The base is blue-black graphite to suggest the hour just after the floodlights turn on. Warm bone text gives a less synthetic, more human contrast than pure white. **Court Lime `#C7F25C`** is the sole ownable action colour: it resembles a fresh tennis ball under lights, so it signals a match, connection or decision without requiring glow effects. Clay red is reserved only for warnings; blue is used sparingly for information.

### Layout Paradigm
The landing page uses an **off-axis network field**: hero copy anchors on the left while athlete nodes progress diagonally through the right half toward the ClubOfSports mark. Application pages use a stable **Clubhouse rail**—a slim sidebar over a broad content floor—then switch to a compact bottom dock on mobile. Content is grouped like zones of a sports venue, not a collection of dashboard widgets.

### Signature Elements
- **Court-lane strokes:** muted, rounded field-line segments and dot markers that separate sections, articulate match relationships and frame selected states.
- **The connected ring:** an incomplete circular score/identity ring that becomes the visual language for skill, trust and match compatibility.
- **Floodlight bloom:** restrained radial light behind featured calls-to-action and hero nodes, never applied as a generic background gradient.

### Interaction Philosophy
Interactions should have the snap of a good pass: immediate, precise and purpose-driven. Cards lift only a few pixels, match scores invite an explanation, and premium prompts appear after a genuinely useful free-path interaction. All animation remains optional under reduced-motion preferences.

### Animation
Use 160–240ms cubic-bezier transitions for hover and control feedback. On first reveal, athlete nodes and summary cards rise from 8–12px with a 45ms stagger; score rings draw once when visible. The hero network has an extremely slow, 18–24 second positional drift. QR reveal and match confirmation use a 220–320ms opacity/scale transition from 0.96, not a dramatic bounce. Disable all decorative motion under `prefers-reduced-motion`.

### Typography System
**Space Grotesk** is the display face for headings, figures and navigation because its athletic geometry supports concise, performance-oriented language. **Manrope** is the body face for dense availability, location and product copy because it is calm and unusually readable at small sizes. Headlines use tight tracking and strong contrast; labels are uppercase with expanded tracking; numerical scores are tabular where possible.

### Brand Essence
**ClubOfSports is the trusted local sports network that turns a player’s identity into real people, real sessions and repeat play.**

**Personality:** assured, energising, grounded.

### Brand Voice
Headlines are concise and active; CTAs are concrete verbs; microcopy feels like a reliable teammate, never like a growth funnel. Avoid empty invitation language and exaggerated claims.

> “Find a player who can actually make Saturday.”

> “Your next game starts with one good connection.”

### Wordmark & Logo
The mark is a bold, open **C** constructed from two offset court-line arcs, with a small solid match-point dot at the inner edge. It works alone in the app header and favicons; the CLUBOFSPORTS wordmark uses all-cap Space Grotesk with a deliberate break between CLUB and OFSPORTS.

### Signature Brand Color
**Court Lime — `#C7F25C`**

## Style Decisions

- Light landing sections retain the Floodlit Clubhouse material language with graphite court-lane strokes, incomplete rings, venue-zone framing and Court Lime only as a decisive signal.
- The ClubOfSports mark is expressed as two offset open-C court arcs with a match-point dot; the wordmark remains athletic, all-caps and legible at persistent navigation scale.
- Athlete and connection surfaces organise information with visual lanes, score rings, availability tracks and match markers rather than relying on generic card treatments.
