This is a React-based web game utilizing Vite, TypeScript, and SCSS. The project strictly follows Feature-Sliced Design (FSD) architecture.

Project Structure (FSD)

src/app/ - App-wide settings, global styles, and Context providers.

src/pages/ - Routable page components (Home, Play, GameOver) composing widgets.

src/widgets/ - Large, self-contained UI blocks (e.g., GameSession, TwisterCard).

src/features/ - User interactions that bring business value (e.g., SpeechScoring, TwisterGen).

src/entities/ - Business data models and their UI representations (e.g., Twister, Session).

src/shared/ - Reusable infrastructure, atomic UI components, and utilities.

Code Standards

TypeScript: Use strict mode. Define clear interfaces for all props, API responses, and state objects.

Styling: Use SCSS utility classes directly in JSX. Do not use CSS modules unless absolutely necessary for complex keyframe animations.

State Management: Use React Context and standard Hooks (useState, useReducer, useEffect). Do NOT use Redux or external state libraries.

Architecture Conventions (FSD Strict Rules)

Import Hierarchy: Modules can only import from layers below them.

app -> pages -> widgets -> features -> entities -> shared.

NEVER import a higher layer into a lower layer (e.g., entities cannot import features).

Cross-Slice Imports: Slices on the same layer cannot import each other directly (e.g., features/speech-scoring cannot import features/twister-generator). If they need to communicate, do it at the widget or page level.

Public APIs: Every slice (e.g., a specific feature or entity) MUST have an index.ts file that exports its public API. External modules must only import from this index.ts.

Always ensure `npm run lint:all` passes with final edits/changes.
