# Learn Section Architecture

## Directory Structure

```
web/app/learn/
├── page.tsx                           # Entry point: "The Four Paths"
├── layout.tsx                         # Shared layout with navigation
├── components/
│   ├── core/                          # Reusable learning components
│   │   ├── ConceptCard.tsx            # Level 3 concept with drill-down link
│   │   ├── DrillDownPanel.tsx         # Expandable Level 2/1 content
│   │   ├── InteractiveDemo.tsx        # Wrapper for demos with controls
│   │   ├── ParameterSlider.tsx        # Tweakable parameter control
│   │   ├── AnimatedDiagram.tsx        # Step-by-step animated SVG
│   │   ├── CodeWalkthrough.tsx        # Syntax-highlighted code steps
│   │   └── ProgressTracker.tsx        # Linear progression indicator
│   └── demos/                         # Technology-specific demos
│       ├── gaussian/
│       │   ├── SingleGaussianDemo.tsx # Manipulate one Gaussian
│       │   ├── AlphaBlendingDemo.tsx  # Visualize compositing
│       │   ├── SHPlayground.tsx       # Spherical harmonics explorer
│       │   └── SplattingPipeline.tsx  # Animated render pipeline
│       ├── metahuman/
│       │   └── ...
│       ├── generative/
│       │   └── ...
│       └── streaming/
│           └── ...
├── data/
│   ├── content/                       # Educational content (data only)
│   │   ├── gaussian-splatting.json    # All GS content
│   │   ├── metahuman.json
│   │   ├── generative-video.json
│   │   └── streaming-avatars.json
│   ├── concepts/                      # Drill-down concept definitions
│   │   ├── covariance-matrix.json
│   │   ├── spherical-harmonics.json
│   │   ├── diffusion-models.json
│   │   ├── blendshapes.json
│   │   └── ...
│   └── prerequisites.json             # Level 1 fundamentals mapping
├── gaussian-splatting/
│   ├── page.tsx                       # Track A main page
│   ├── [concept]/page.tsx             # Dynamic drill-down pages
│   └── build/page.tsx                 # Implementation walkthrough
├── metahuman/
│   └── ...
├── generative-video/
│   └── ...
└── streaming-avatars/
    └── ...
```

## Data Schema

### Content File (e.g., `gaussian-splatting.json`)

```typescript
interface TrackContent {
  id: string;
  title: string;
  subtitle: string;
  color: string;  // CSS variable reference

  // 60-second intro (can be read aloud)
  intro: {
    text: string;
    duration: "60s";
  };

  // Pipeline diagram
  pipeline: {
    steps: Array<{
      id: string;
      label: string;
      description: string;
      icon?: string;
    }>;
    connections: Array<[string, string]>;
  };

  // Level 3 concepts
  concepts: Array<{
    id: string;
    title: string;
    summary: string;           // 1-2 sentences
    visualMetaphor: string;    // Real-world analogy
    demoId?: string;           // Reference to interactive demo
    drillDown: string;         // Link to Level 2 concept
  }>;

  // Implementation steps
  implementation: {
    steps: Array<{
      title: string;
      description: string;
      code?: string;
      language?: string;
    }>;
    resources: Array<{
      title: string;
      url: string;
      type: "github" | "paper" | "docs";
    }>;
  };

  // Trade-offs
  tradeoffs: {
    when: string[];      // When to use
    whenNot: string[];   // When not to use
    bestFor: string;     // Primary use case
  };
}
```

### Concept File (e.g., `covariance-matrix.json`)

```typescript
interface ConceptContent {
  id: string;
  title: string;
  level: 2 | 1;

  // Parent concept (for Level 2)
  parentConcept?: string;

  // The explanation
  explanation: {
    level3Assumes: string;   // What the parent assumed
    thisExplains: string;    // What this concept clarifies
    text: string;            // The explanation itself
  };

  // Visual aid
  visual: {
    type: "interactive" | "static" | "animation";
    demoId?: string;
    imageUrl?: string;
    caption: string;
  };

  // Further drill-down
  prerequisites: string[];  // Links to Level 1 concepts

  // "Aha moment" insight
  insight: string;
}
```

## Component Design Principles

### 1. Data-Driven Rendering
```tsx
// Components receive data, not hardcoded content
<ConceptCard data={conceptData} onDrillDown={handleDrillDown} />
```

### 2. Progressive Disclosure
```tsx
// Level 3 shows summary, click to expand Level 2
<DrillDownPanel
  summary={concept.summary}
  expanded={<Level2Content conceptId={concept.drillDown} />}
/>
```

### 3. Interactive Parameters
```tsx
// All demos expose tweakable parameters
<SingleGaussianDemo
  parameters={{
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    opacity: 1.0
  }}
  onParameterChange={handleChange}
/>
```

### 4. Linear Progression
```tsx
// Track completion state
<ProgressTracker
  sections={['intro', 'pipeline', 'concepts', 'build', 'tradeoffs']}
  current="concepts"
  completed={['intro', 'pipeline']}
/>
```

## Visualization Tech Stack

| Type | Technology | Use Case |
|------|------------|----------|
| 3D Interactive | Three.js + React Three Fiber | Gaussian manipulation, 3D scenes |
| 2D Diagrams | SVG + Framer Motion | Pipeline animations, flowcharts |
| Math Visualization | Canvas 2D | Covariance ellipses, SH plots |
| Code Sandbox | Monaco Editor | Live code examples |
| Parameter Controls | Custom sliders | Tweakable demo inputs |

## Navigation Flow

```
/learn
  │
  ├── Overview: "The Four Paths to Real-Time Avatars"
  │   └── Visual comparison + "Choose your path"
  │
  ├── /learn/gaussian-splatting
  │   ├── 1. What is it? (60s intro + demo)
  │   ├── 2. How does it work? (animated pipeline)
  │   ├── 3. Key concepts (Level 3 cards)
  │   │   ├── [click] → /learn/gaussian-splatting/gaussian-primitive
  │   │   │   └── [drill] → /learn/concepts/covariance-matrix
  │   │   │       └── [drill] → /learn/fundamentals/linear-algebra
  │   │   └── ...
  │   ├── 4. Build it yourself (code walkthrough)
  │   └── 5. When to use (trade-offs)
  │
  ├── /learn/metahuman
  │   └── ... (same structure)
  │
  ├── /learn/generative-video
  │   └── ... (same structure)
  │
  └── /learn/streaming-avatars
      └── ... (same structure)
```
