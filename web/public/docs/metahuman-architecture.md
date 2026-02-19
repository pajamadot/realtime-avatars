# MetaHuman UE 5.7 End-to-End Architecture and Implementation

Last updated: 2026-02-19

## Scope

This document combines:

1. **Local implementation in this repository**
   - Web UI and API forwarding path
   - Local editor bridge service
   - Unreal Editor plugin for realtime control
2. **Engine-level MetaHuman source architecture**
   - `G:\UE\UnrealEngine\Engine\Plugins\MetaHuman\...`
3. **Official online documentation references**
   - Epic MetaHuman docs + Unreal API pages
   - EpicGames MetaHuman DNA tooling repository

## Source Roots Used

- Local repo:
  - `metahuman/avatar01/`
  - `metahuman/editor-bridge/`
  - `web/app/api/metahuman/control/route.ts`
  - `web/app/components/MetaHumanEditorControlPanel.tsx`
- Unreal Engine source root:
  - `G:\UE\UnrealEngine\Engine\Plugins\MetaHuman\`

## End-to-End System Topology

```text
Browser (/rapport)
  -> Next.js API route (/api/metahuman/control)
  -> Editor bridge (http://127.0.0.1:8788/v1/command)
  -> Unreal plugin HTTPServer (http://127.0.0.1:5189/pajama/control)
  -> Target Actor (tag: PajamaMetaHuman)
  -> UPajamaMetaHumanControllerComponent
  -> USkeletalMeshComponent::SetMorphTarget + Actor rotation
```

## Repo Implementation Details

### 1) Browser control surface

- File: `web/app/components/MetaHumanEditorControlPanel.tsx`
- Responsibility:
  - Provides sliders/preset buttons for expression + head pose
  - Builds payload:
    - `targetActorTag`
    - `morphTargets` (`mouthSmileLeft`, `mouthSmileRight`, `jawOpen`, `browInnerUp`)
    - `headYaw`, `headPitch`, `headRoll`
  - Calls:
    - `GET /api/metahuman/control` (health)
    - `POST /api/metahuman/control` (command)

### 2) Web API proxy layer

- File: `web/app/api/metahuman/control/route.ts`
- Responsibility:
  - Loads repo secrets env
  - Forwards health and command requests to bridge endpoint
  - Injects optional bearer token (`METAHUMAN_CONTROL_TOKEN`)
  - Isolates browser from direct local bridge details

### 3) Local editor bridge

- File: `metahuman/editor-bridge/server.mjs`
- Default endpoints:
  - Health: `GET /health`
  - Command: `POST /v1/command`
- Default Unreal upstream:
  - `http://127.0.0.1:5189/pajama/health`
  - `http://127.0.0.1:5189/pajama/control`
- Responsibility:
  - Validates optional token
  - Handles CORS
  - Proxies JSON to Unreal plugin endpoint

### 4) Unreal Editor plugin: `PajamaRealtimeControl`

- Root: `metahuman/avatar01/Plugins/PajamaRealtimeControl/`
- Key files:
  - `.../Private/PajamaRealtimeControlModule.cpp`
  - `.../Public/PajamaMetaHumanControllerComponent.h`
  - `.../Private/PajamaMetaHumanControllerComponent.cpp`
  - `.../Public/PajamaRealtimeControlSettings.h`

#### Startup and routes

- `FPajamaRealtimeControlModule::StartupModule()`
  - Creates HTTP router on `ListenPort` (default `5189`)
  - Binds:
    - `GET /pajama/health`
    - `POST /pajama/control`
  - Starts listeners through `FHttpServerModule`

#### Command parse/dispatch path

- `HandleControl(...)`
  - Validates request body
  - Parses JSON into `FControlPayload`:
    - `targetActorTag`
    - `morphTargets` or `expressions`
    - `headPose` object or `headYaw/headPitch/headRoll`
    - optional `preset` + `strength`
  - Presets currently mapped:
    - `smile`
    - `talk`
    - `surprised`
  - Dispatches to game thread using `AsyncTask(ENamedThreads::GameThread, ...)`

#### Actor and mesh application

- `ApplyPayloadOnGameThread(...)`
  - Finds world (`PIE` / `Editor` / `Game`)
  - Finds target actor by tag
  - Preferred path:
    - If `UPajamaMetaHumanControllerComponent` exists:
      - `ApplyMorphTargets(...)`
      - `ApplyHeadPose(...)`
  - Fallback path:
    - Iterate `USkeletalMeshComponent`s and call `SetMorphTarget(...)`
    - Apply actor rotation for head pose

#### Config

- File: `metahuman/avatar01/Config/DefaultEditor.ini`
- Values:
  - `ListenPort=5189`
  - `RoutePrefix=/pajama`
  - `DefaultActorTag=PajamaMetaHuman`

## Unreal Engine MetaHuman Plugin Ecosystem (UE 5.7)

Scanned from `G:\UE\UnrealEngine\Engine\Plugins\MetaHuman`.

### Plugin inventory

| Plugin | Purpose | Module count |
|---|---|---:|
| `MetaHumanAnimator` (`MetaHuman.uplugin`) | Animator toolkit, capture, solver, performance tooling | 28 |
| `MetaHumanCharacter` | Character asset/editor/pipeline system | 7 |
| `MetaHumanCoreTech` | Core algorithms, capture data, pipeline core runtime/editor libs | 5 |
| `MetaHumanLiveLink` | Live Link sources (device, local media, settings, smoothing) | 7 |
| `MetaHumanSDK` | Runtime component + editor import/verification + DNA interchange | 3 |
| `MetaHumanCalibrationProcessing` | Multi-camera calibration generator/core/lib | 3 |

## Module Architecture by Layer

### A) Character asset and build pipeline layer

Main modules:

- `MetaHumanCharacter` (runtime)
- `MetaHumanCharacterPalette` (runtime)
- `MetaHumanDefaultPipeline` (runtime)
- Editor companions:
  - `MetaHumanCharacterEditor`
  - `MetaHumanCharacterPaletteEditor`
  - `MetaHumanDefaultEditorPipeline`
  - `MetaHumanCharacterMigrationEditor`

Representative classes:

- `UMetaHumanCharacter` (`MetaHumanCharacter.h`)
  - Serialized source of truth for face/body DNA and character state
- `UMetaHumanCharacterPipeline` (`MetaHumanCharacterPipeline.h`)
  - Defines assembly contract and instance-parameter update contract
- `UMetaHumanDefaultPipelineBase` (`MetaHumanDefaultPipelineBase.h`)
  - Assembles meshes, grooms, cloth outputs via default pipeline
- `UMetaHumanDefaultPipeline` (`MetaHumanDefaultPipeline.h`)
  - Concrete default pipeline facade for most users

Dependency direction (from Build.cs):

- `MetaHumanCharacter` -> `MetaHumanCharacterPalette`, `MetaHumanSDKRuntime`
- `MetaHumanDefaultPipeline` -> `MetaHumanCharacter`, `MetaHumanCharacterPalette`

### B) Live capture and realtime subject processing layer

Main modules:

- `LiveLinkFaceSource`
- `LiveLinkFaceDiscovery`
- `MetaHumanLiveLinkSource`
- `MetaHumanLocalLiveLinkSource`
- Editor companions for customization UI

Representative classes:

- `FLiveLinkFaceSource` (`LiveLinkFaceSource.h/.cpp`)
  - UDP receive, device control/session, subject creation, packet processing
- `FLiveLinkFaceControl` (`LiveLinkFaceControl.h`)
  - Control channel runnable for remote stream/session management
- `UMetaHumanLiveLinkSubjectSettings` (`MetaHumanLiveLinkSubjectSettings.h`)
  - Calibration + smoothing + neutral capture + head pose controls
- `UMetaHumanSmoothingPreProcessor` (`MetaHumanSmoothingPreProcessor.h`)
  - LiveLink frame preprocessor worker for smoothing
- `FMetaHumanLocalLiveLinkSource` (`MetaHumanLocalLiveLinkSource.h`)
  - Generic source hosting local subject instances
- `FMetaHumanLocalLiveLinkSubject` (`MetaHumanLocalLiveLinkSubject.h`)
  - FRunnable with pipeline execution + frame push loop

### C) Pipeline runtime and core tech layer

Main modules:

- `MetaHumanPipelineCore`
- `MetaHumanCoreTech`
- `MetaHumanCoreTechLib`
- `MetaHumanCaptureData`

Representative classes:

- `UE::MetaHuman::Pipeline::FNode` (`Pipeline/Node.h`)
  - Base processing unit with `Start/Process/Idle/End`
- `UE::MetaHuman::Pipeline::FPipeline` (`Pipeline/Pipeline.h`)
  - Graph orchestration, connection topology, run modes, cancel lifecycle
- `UE::MetaHuman::Pipeline::FRealtimeSpeechToAnimNode` (`Nodes/RealtimeSpeechToAnimNode.h`)
  - Audio-driven animation node (mood, lookahead, model instance)

Key internals:

- Heavy numeric/geometry/rig libraries in `MetaHumanCoreTechLib` private includes:
  - `nls`, `nrr`, `carbon`, `rig`, `texture_synthesis`

### D) SDK runtime/editor integration layer

Main modules:

- `MetaHumanSDKRuntime`
- `MetaHumanSDKEditor`
- `InterchangeDNA`

Representative classes:

- `UMetaHumanComponentBase` (`MetaHumanComponentBase.h/.cpp`)
  - Component discovery, anim BP loading, variable wiring, LOD/perf controls
- `UMetaHumanComponentUE` (`MetaHumanComponentUE.h/.cpp`)
  - Runtime setup of torso/legs/feet customizable parts and post-process AnimBP
- `FMetaHumanImport` (`MetaHumanImport.h`)
  - Editor import flow for MetaHuman assets
- `UMetaHumanInterchangeDnaTranslator` (`MetaHumanInterchangeDnaTranslator.h`)
  - DNA translator for Interchange pipeline

### E) Audio-driven animation and solver layer

Main modules (inside `MetaHumanAnimator` plugin):

- `MetaHumanSpeech2Face`
- `MetaHumanFaceAnimationSolver`
- `MetaHumanFaceFittingSolver`
- Additional capture/performance modules

Representative classes:

- `FSpeech2Face` (`Speech2Face.h`)
  - `Create(...)`, mood controls, `GenerateFaceAnimation(...)`
  - Produces rig-control curves from speech

### F) Calibration processing layer

Main modules:

- `MetaHumanCalibrationLib`
- `MetaHumanCalibrationCore`
- `MetaHumanCalibrationGenerator`

Representative classes:

- `UE::Wrappers::FMetaHumanStereoCalibrator` (`MetaHumanStereoCalibrator.h`)
  - Init cameras/pattern, detect pattern, calibrate, export JSON
- `UE::Wrappers::FMetaHumanRobustFeatureMatcher` (`MetaHumanRobustFeatureMatcher.h`)
  - Multi-camera feature detection and triangulation retrieval
- `UMetaHumanCalibrationGenerator` (`MetaHumanCalibrationGenerator.h`)
  - Init/configure/process orchestrator over capture data

## Key Function-Level Responsibilities

| Component | Function / method | Responsibility |
|---|---|---|
| `PajamaRealtimeControl` | `ParsePayload(...)` | Parse command JSON into internal payload; normalize target tag, morphs, head pose, presets |
| `PajamaRealtimeControl` | `ApplyPayloadOnGameThread(...)` | Route payload to tagged actor and apply morph/head transforms |
| `UPajamaMetaHumanControllerComponent` | `CollectControlledMeshes()` | Discover skeletal mesh components on owner actor |
| `UPajamaMetaHumanControllerComponent` | `ApplyMorphTargets(...)` | Set morph target values on controlled meshes |
| `UPajamaMetaHumanControllerComponent` | `ApplyHeadPose(...)` | Apply actor rotation from yaw/pitch/roll |
| `FLiveLinkFaceSource` | `Connect(...)`, `OnDataReceived(...)`, `ProcessPacket(...)` | Device connection, UDP packet intake, frame conversion for Live Link |
| `UMetaHumanLiveLinkSubjectSettings` | `PreProcess(...)` | Per-frame calibration/smoothing/head-pose preprocessing |
| `FMetaHumanLocalLiveLinkSubject` | `Run()`, `FrameComplete(...)`, `PushFrameData()` | Threaded local source processing and Live Link frame push |
| `FPipeline` | `MakeConnection(...)`, `Run(...)`, `Cancel()` | Pipeline graph creation, execution mode control, cancellation |
| `FRealtimeSpeechToAnimNode` | `Start()`, `Process()`, `SetMood()` | Audio-to-animation inference and emotion tuning |
| `UMetaHumanComponentBase` | `LoadAndRunAnimBP(...)`, `PostInitAnimBP(...)` | Async AnimBP loading and binding of component config to anim graph variables |
| `FSpeech2Face` | `GenerateFaceAnimation(...)` | Convert audio to rig-control animation curves |
| `FMetaHumanStereoCalibrator` | `DetectPattern(...)`, `Calibrate(...)` | Chessboard corner extraction and multi-camera calibration solve |
| `FMetaHumanRobustFeatureMatcher` | `DetectFeatures(...)`, `GetFeatures(...)` | Robust multi-camera feature match and 3D/2D correspondence extraction |

## Data Contracts

### Control payload (web -> bridge -> Unreal plugin)

```json
{
  "targetActorTag": "PajamaMetaHuman",
  "preset": "smile",
  "strength": 1.0,
  "morphTargets": {
    "mouthSmileLeft": 0.6,
    "mouthSmileRight": 0.6,
    "jawOpen": 0.2
  },
  "headYaw": 8.0,
  "headPitch": -3.0,
  "headRoll": 0.0
}
```

### Health contract

- Unreal plugin: `GET /pajama/health`
- Bridge: `GET /health`
- Web API proxy: `GET /api/metahuman/control`

Each level reports `ok` plus endpoint/config context.

## Runtime and Threading Model

- Browser/UI: main thread, HTTP fetch.
- Next.js API route: Node runtime request forwarding.
- Bridge service: Node HTTP server + fetch upstream.
- Unreal plugin:
  - HTTP listener thread receives request.
  - Actual actor/morph application marshaled to **Game Thread** using `AsyncTask`.
- LiveLink local source side (engine plugin):
  - Subject processing uses `FRunnable` worker threads.
  - Pipeline completion callbacks push LiveLink frames back to client.

## Extension Points

### In this repo

1. Add additional presets in `PajamaRealtimeControlModule.cpp` (`AddPresetCurves`).
2. Add richer control schema in `MetaHumanEditorControlPanel.tsx` (eye, brow, viseme groups).
3. Add auth/rate limiting at bridge and API proxy layers.
4. Add actor selection/discovery endpoint to avoid manual tag entry.

### In engine/plugin architecture

1. Implement custom `UMetaHumanCharacterPipeline` for non-default build/assembly logic.
2. Add custom pipeline nodes in `MetaHumanPipelineCore` (`FNode` subclasses).
3. Add custom LiveLink preprocessors/settings around `UMetaHumanLiveLinkSubjectSettings`.
4. Extend calibration workflows through `MetaHumanCalibrationGenerator` + wrappers.

## Operational Runbook (local)

1. Open `metahuman/avatar01/avatar01.uproject` in UE 5.7.
2. Ensure target actor has:
   - tag `PajamaMetaHuman`
   - `UPajamaMetaHumanControllerComponent`
3. Start bridge:
   - `cd metahuman/editor-bridge`
   - `node server.mjs`
4. Configure web env:
   - `METAHUMAN_CONTROL_ENDPOINT=http://127.0.0.1:8788/v1/command`
   - `METAHUMAN_CONTROL_HEALTH_ENDPOINT=http://127.0.0.1:8788/health`
5. Run web app and use `/rapport` control panel.

## Known Constraints

- `PajamaRealtimeControl` is an **Editor** plugin module (not shipping runtime by default).
- The local control path assumes editor-local HTTP access.
- MetaHuman plugin modules are heavily editor-centric for creation/calibration workflows.
- Many advanced modules are Win64-only in current plugin descriptors.

## Official References

- MetaHuman docs hub:
  - https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-documentation
- MetaHumans in Unreal Engine:
  - https://dev.epicgames.com/documentation/en-us/metahuman/metahumans-in-unreal-engine
- MetaHuman Component for Unreal Engine:
  - https://dev.epicgames.com/documentation/en-us/metahuman/the-metahuman-component-for-unreal-engine
- Realtime Animation Using Live Link:
  - https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation-using-live-link
- MetaHuman Animator:
  - https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator
- Unreal C++ API plugin index (MetaHuman):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHuman
- Unreal C++ API plugin index (MetaHuman Character):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCharacter
- Unreal C++ API plugin index (MetaHuman Live Link):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanLiveLink
- Unreal C++ API plugin index (MetaHuman SDK):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanSDK
- Unreal C++ API plugin index (MetaHuman Core Tech):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCoreTech
- Unreal C++ API plugin index (MetaHuman Calibration Processing):
  - https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCalibrationProcessing
- Epic DNA tooling repository:
  - https://github.com/EpicGames/MetaHuman-DNA-Calibration
