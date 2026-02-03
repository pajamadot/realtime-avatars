# Educational Content Iteration Mega Prompt

Use this prompt to continue building educational content for the Real-Time Avatars website after context compression. Copy the relevant section based on what phase you're in.

---

## Context Summary

**Project**: Real-Time Avatars educational website
**Goal**: Explain avatar technologies (MetaHuman, Gaussian Splatting, Generative Video, Streaming) to developers from fundamentals up
**Structure**: `/learn` route with modular components, data separated from logic
**Tech Stack**: Next.js 16, React 19, Three.js, Tailwind CSS
**Inspiration**: bbycroft.net/llm, TensorFlow Playground, The Book of Shaders

### Content Levels
- **Level 3 (Entry)**: Practical explanation assuming basic programming knowledge
- **Level 2 (Drill-down)**: Deeper concepts that Level 3 assumes
- **Level 1 (Fundamentals)**: Math/CS basics that Level 2 assumes

### File Structure
```
web/app/learn/
├── page.tsx                       # Entry page "Four Paths to Real-Time Avatars"
├── layout.tsx                     # Shared layout with track navigation
├── data/
│   ├── content/
│   │   ├── gaussian-splatting.json
│   │   ├── generative-video.json
│   │   ├── metahuman.json
│   │   ├── streaming-avatars.json
│   │   └── end-to-end.json        # NEW: Complete system guide
│   └── concepts/                   # 17+ drill-down concepts
│       ├── covariance-matrix.json
│       ├── spherical-harmonics-math.json
│       ├── alpha-compositing.json
│       ├── diffusion-math.json
│       ├── gradient-descent.json
│       ├── arkit-blendshapes.json
│       ├── skinning-weights.json
│       ├── vae-encoder.json
│       ├── phoneme-viseme.json
│       ├── ice-protocol.json
│       ├── media-routing.json
│       ├── turn-detection.json
│       ├── transformation-matrices.json
│       ├── convolutional-networks.json
│       ├── probability-distributions.json
│       ├── networking-basics.json
│       ├── differentiable-rendering.json
│       ├── neural-network-basics.json
│       └── rtp-protocol.json
├── components/
│   ├── core/
│   │   ├── ConceptCard.tsx        # Displays concept with drill-down
│   │   ├── AnimatedDiagram.tsx    # Step-through pipeline
│   │   ├── CodeWalkthrough.tsx    # Tabbed code steps
│   │   ├── ParameterSlider.tsx    # Tweakable parameter
│   │   └── index.ts
│   └── demos/
│       ├── gaussian/
│       │   ├── SingleGaussianDemo.tsx   # 3D Gaussian manipulator
│       │   ├── AlphaBlendingDemo.tsx    # Layer ordering demo
│       │   └── index.ts
│       ├── generative/
│       │   ├── DenoisingDemo.tsx        # Diffusion step visualizer
│       │   └── index.ts
│       ├── metahuman/
│       │   ├── BlendshapeDemo.tsx       # ARKit 52 blendshape playground
│       │   └── index.ts
│       └── streaming/
│           ├── LatencyDemo.tsx          # Voice AI pipeline latency
│           └── index.ts
├── gaussian-splatting/
│   ├── page.tsx
│   └── concepts/[concept]/page.tsx
├── generative-video/
│   ├── page.tsx
│   └── concepts/[concept]/page.tsx
├── metahuman/
│   ├── page.tsx
│   └── concepts/[concept]/page.tsx
├── streaming-avatars/
│   ├── page.tsx
│   └── concepts/[concept]/page.tsx
└── end-to-end/
    └── page.tsx                   # End-to-end system guide
```

---

## Phase 1: Research Prompt

```
RESEARCH PHASE for [TOPIC_NAME]

I'm building educational content for developers learning about [TOPIC_NAME] for real-time avatar applications.

Research and compile:

1. **Core Concepts (3-5)** that a developer MUST understand:
   - What are the fundamental building blocks?
   - What math is involved (keep accessible)?
   - What's the processing/rendering pipeline?

2. **Visual Metaphors** for each concept:
   - Real-world analogies
   - How to explain to someone who knows programming but not this domain

3. **Interactive Demo Ideas**:
   - What parameters could a learner tweak?
   - What "aha moment" visualizations would help?

4. **Common Misconceptions**:
   - What do people often get wrong?
   - Confusing terminology to clarify

5. **Prerequisite Chain**:
   - Level 3: What does the main explanation assume?
   - Level 2: What does Level 3 assume?
   - Level 1: What does Level 2 assume?

6. **Relation to Avatars**:
   - How is this used for face/body representation?
   - What makes it good/bad for real-time avatars?

Search the web for academic sources, tutorials, and implementations.
Output a structured educational breakdown.
```

---

## Phase 2: Structure Prompt

```
STRUCTURE PHASE for [TOPIC_NAME]

Using the research from Phase 1, create the content structure.

Read the architecture file at: web/app/learn/ARCHITECTURE.md

Create the content file following the TrackContent schema:

1. **60-second intro**: Write text that could be read aloud in ~60 seconds
   - Start with the problem being solved
   - Explain the core approach in plain terms
   - End with why it matters for avatars

2. **Pipeline diagram**: Define the processing steps
   - 4-6 steps maximum
   - Each step: id, label, description
   - Define connections between steps

3. **Level 3 concepts**: For each core concept:
   - Title and 1-2 sentence summary
   - Visual metaphor (real-world analogy)
   - Demo reference (if applicable)
   - Drill-down link (to Level 2 concept)

4. **Implementation steps**: Practical getting-started guide
   - 4-6 steps with code snippets
   - Resource links (GitHub, papers, docs)

5. **Trade-offs**: When to use / when not to use

Output: JSON file matching the TrackContent schema
```

---

## Phase 3: Drill-Down Prompt

```
DRILL-DOWN PHASE for [CONCEPT_NAME]

This concept was referenced as a drill-down from [PARENT_CONCEPT].

Create the concept explanation file following the ConceptContent schema:

1. **Level 3 assumes**: What did the parent explanation assume the reader knows?

2. **This explains**: What specific knowledge gap does this concept fill?

3. **Explanation**: Clear explanation with:
   - Building from what they already know
   - Concrete examples
   - Visual description

4. **Visual aid**:
   - Type: interactive, static, or animation
   - Demo ID or image URL
   - Caption explaining what to look at

5. **Prerequisites**: Links to Level 1 concepts (if this is Level 2)

6. **Insight**: The "aha moment" - one sentence that makes it click

Output: JSON file matching the ConceptContent schema
```

---

## Phase 4: Demo Implementation Prompt

```
DEMO IMPLEMENTATION for [DEMO_NAME]

Create an interactive React component for the [DEMO_NAME] demo.

Requirements:
- Use Three.js / React Three Fiber for 3D visualizations
- Use Canvas 2D or SVG for 2D visualizations
- Expose tweakable parameters via props
- Follow existing component patterns in web/app/learn/components/demos/

Read these files for patterns:
- web/app/learn/components/demos/gaussian/SingleGaussianDemo.tsx
- web/app/learn/components/core/ParameterSlider.tsx

The demo should:
1. Have a clear visual focus (what are we looking at?)
2. Expose 2-4 parameters the user can tweak
3. Show immediate visual feedback when parameters change
4. Include a reset button to return to defaults
5. Work on both desktop and mobile

Output: Complete React component code
```

---

## Phase 5: Content Review Prompt

```
CONTENT REVIEW for [TRACK_NAME]

Review the educational content for accuracy, clarity, and completeness.

Read these files:
- web/app/learn/data/content/[track].json
- web/app/learn/data/concepts/[related-concepts].json

Check:
1. **Accuracy**: Are technical details correct?
2. **Clarity**: Would a developer with basic programming knowledge understand?
3. **Completeness**: Are all prerequisite concepts linked?
4. **Flow**: Does the linear progression make sense?
5. **Demos**: Are interactive elements appropriately placed?

Suggest improvements or corrections.
```

---

## Track Status (Updated 2026-02-03)

| Track | Research | Structure | Drilldowns | Demos | Review |
|-------|----------|-----------|------------|-------|--------|
| Gaussian Splatting | Done | Done | 5/5 done | 3 done | Done |
| MetaHuman | Done | Done | 4/5 done | 3 done | Done |
| Generative Video | Done | Done | 6/6 done | 2 done | Done |
| Streaming Avatars | Done | Done | 5/5 done | 2 done | Done |
| **End-to-End** | Done | Done | N/A | N/A | Done |

### Completed Drill-Down Concepts

**Level 2 (Technical depth):**
- covariance-matrix.json (Gaussian Splatting)
- spherical-harmonics-math.json (Gaussian Splatting)
- alpha-compositing.json (Gaussian Splatting)
- diffusion-math.json (Generative Video)
- gradient-descent.json (Generative Video)
- arkit-blendshapes.json (MetaHuman)
- skinning-weights.json (MetaHuman)
- vae-encoder.json (Generative Video)
- phoneme-viseme.json (Generative Video)
- ice-protocol.json (Streaming Avatars)
- media-routing.json (Streaming Avatars)
- turn-detection.json (Streaming Avatars)
- differentiable-rendering.json (Gaussian Splatting)

**Level 1 (Fundamentals):**
- transformation-matrices.json
- convolutional-networks.json
- probability-distributions.json
- networking-basics.json
- neural-network-basics.json
- rtp-protocol.json
- matrix-math.json (Gaussian Splatting)

**Additional Concepts (End-to-End):**
- arkit-protocol.json (MetaHuman - Live Link)
- voice-activity-detection.json (Streaming/End-to-End)
- audio-to-expression.json (MetaHuman/Generative)

### Completed Demos

1. **SingleGaussianDemo** - 3D Gaussian manipulator (Three.js)
2. **AlphaBlendingDemo** - Drag-and-drop layer ordering
3. **DenoisingDemo** - Diffusion step visualizer
4. **BlendshapeDemo** - ARKit 52 blendshape playground
5. **LatencyDemo** - Voice AI pipeline latency visualizer
6. **SphericalHarmonicsDemo** - SH coefficient playground (Three.js)
7. **ICEConnectionDemo** - WebRTC ICE candidate gathering visualizer
8. **DiffusionStepsDemo** - 4-step vs 50-step quality comparison
9. **SkinningWeightDemo** - Skeletal skinning weights visualizer
10. **FaceTrackingDemo** - Simulated ARKit face tracking with blendshape output

### Missing Concepts (To Create)

**MetaHuman:**
- arkit-protocol.json (optional - ARKit blendshapes already covers this)

### Demo Ideas (Not Yet Implemented)

(All planned demos have been implemented!)

---

## Usage

1. Copy the relevant phase prompt
2. Replace `[PLACEHOLDERS]` with specific values
3. Run in Claude Code session
4. Update the "Track Status" table after completing each phase
5. Commit changes to git after each major milestone

## Completed Actions

1. ✅ **Create missing drill-down concepts** - All 27 concept files created
2. ✅ **Implement interactive demos** - 10 demos across all tracks
3. ✅ **Add concept linking** - All concept pages import their JSON files
4. ✅ **Content review** - All tracks reviewed and polished
5. ✅ **Polish and test** - Build passes, navigation complete with CrossTrackNav
6. ✅ **Optimize Gaussian Splat loading** - Lazy loading with IntersectionObserver, animated loading placeholder
7. ✅ **End-to-End Guide** - Complete system architecture showing all four approaches with code examples

## Potential Future Enhancements

1. **Add search functionality** - Search across all concepts
2. **Add progress tracking** - Remember which concepts user has visited
3. **Add quizzes** - Test understanding after each section
4. **Add video walkthroughs** - Screen recordings of demos
5. **Internationalization** - Translate content to other languages
