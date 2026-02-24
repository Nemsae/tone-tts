Architecture: Feature-Sliced Design (FSD)

# Feature-Sliced Design (FSD) Architectural Standards

This document serves as the source of truth for the project structure. All automated agents and contributors must adhere to these rules to maintain high cohesion and low coupling.

![FSD Visual Schema](fsd_visual_schema.jpg)

---

## 1. The Layer Hierarchy
Code is organized into layers, ordered from **highest to lowest**. A module may only import from layers **strictly below** it.

| Layer | Responsibility | Allowed Imports |
| :--- | :--- | :--- |
| **App** | Global initialization: providers, styles, routing. | All layers below |
| **Pages** | Full-page compositions for specific routes. | Widgets, Features, Entities, Shared |
| **Widgets** | Complex, self-contained UI units (e.g., `Header`, `Feed`). | Features, Entities, Shared |
| **Features** | User interactions that provide business value (e.g., `LikeArticle`). | Entities, Shared |
| **Entities** | Business domain logic and data models (e.g., `User`, `Article`). | Shared |
| **Shared** | Generic helpers, UI Kit, and configuration. | None (Self-contained) |

---

## 2. Structure: Slices & Segments
Except for the **Shared** layer, every layer contains **Slices** (functional domains). Each slice is then broken down into **Segments**.

### Slice Rules
- **Isolation:** Slices in the same layer **cannot** import from each other.
- **Naming:** Slices must be named after their domain (e.g., `entities/session`, `features/auth-by-email`).

### Standard Segments
Standardize folder names within slices to describe **purpose**, not technical type:
* `ui/`: Components and styling.
* `model/`: Business logic, state stores (Redux/Zustand), and types.
* `api/`: Data fetching, request instances, and DTOs.
* `lib/`: Internal infrastructure or helper functions.

---

## 3. Public API (Entry Points)
Every Slice and Segment must have an `index.ts` file acting as its Public API.

- **The Rule:** Only what is explicitly exported from the `index.ts` is accessible to external modules.
- **The Ban:** Deep imports are strictly forbidden. 
  - ❌ `import { Button } from 'shared/ui/Button/Button'`
  - ✅ `import { Button } from 'shared/ui'`

---

## 4. Guidelines for Agents

### When Creating New Code:
1.  **Identify Layer:** Is this a global setup (**App**), a full screen (**Page**), a complex block (**Widget**), a user action (**Feature**), or a data object (**Entity**)?
2.  **Check Dependencies:** Ensure the new code does not require imports from layers above it.
3.  **Encapsulate:** If logic is used across two slices in the same layer, move that logic to a lower layer.

Strict Rules for Agent

Slices: Do not cross-import. features can import entities and shared, but entities cannot import features.

Public API: Each slice must have an index.ts file exposing only what is necessary.

CSS: Use SCSS classes directly in JSX. Avoid CSS modules unless animating complex keyframes.