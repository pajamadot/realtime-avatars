import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Cpu, ExternalLink, Network, Workflow } from 'lucide-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: 'MetaHuman Architecture and Implementation - Learn | Real-Time Avatars',
  description:
    'Full end-to-end MetaHuman implementation dossier: web control path, Unreal bridge/plugin, UE 5.7 MetaHuman module architecture, key classes, and function-level details.',
};

export const dynamic = 'force-dynamic';

type PluginInventory = {
  plugin: string;
  path: string;
  moduleCount: number;
  modules: string[];
  role: string;
};

type EvolutionSnapshot = {
  cycle?: number;
  generated_at?: string;
  ue_root?: string;
  totals?: {
    plugins?: number;
    modules?: number;
    source_files?: number;
    internal_dependency_edges?: number;
  };
  delta?: {
    new_plugins?: string[];
    removed_plugins?: string[];
    new_modules?: string[];
    removed_modules?: string[];
    changed_modules?: string[];
  };
  plugins?: Array<{
    name: string;
    modules?: Array<{
      type?: string;
    }>;
  }>;
  scan_roots?: string[];
};

type ArchitectureSnapshot = {
  cycle?: number;
  generated_at?: string;
  ue_root?: string;
  totals?: {
    plugins?: number;
    modules?: number;
    source_files?: number;
    internal_dependency_edges?: number;
  };
  plugin_inventory?: Array<{
    name: string;
    path?: string;
    category?: string;
    description?: string;
    module_count?: number;
    module_types?: Record<string, number>;
    top_modules?: Array<{
      name: string;
      type?: string;
      header_files?: number;
      source_files?: number;
    }>;
    docs?: Array<{
      relative_path?: string;
      line?: string;
    }>;
  }>;
  dependency_hubs?: {
    module_targets?: Array<{ module: string; incoming_edges: number }>;
    plugin_targets?: Array<{ plugin: string; incoming_edges: number }>;
    plugin_sources?: Array<{ plugin: string; outgoing_edges: number }>;
  };
};

type DependencyGraphSnapshot = {
  cycle?: number;
  generated_at?: string;
  ue_root?: string;
  totals?: {
    plugin_nodes?: number;
    plugin_edges?: number;
    module_edges?: number;
  };
  plugin_nodes?: Array<{
    id?: string;
    name: string;
    category?: string;
    module_count?: number;
    module_types?: Record<string, number>;
  }>;
  plugin_edges?: Array<{
    from_plugin: string;
    to_plugin: string;
    count: number;
    dependency_kinds?: string[];
    module_pair_count?: number;
    intra_plugin?: boolean;
  }>;
};

const pluginInventory: PluginInventory[] = [
  {
    plugin: 'LiveLink',
    path: 'Engine/Plugins/Animation/LiveLink/LiveLink.uplugin',
    moduleCount: 7,
    role: 'Base Live Link framework that MetaHumanLiveLink builds on for subjects, components, and sequencer tracks.',
    modules: [
      'LiveLink',
      'LiveLinkEditor',
      'LiveLinkComponents',
      'LiveLinkMovieScene',
      'LiveLinkGraphNode',
      'LiveLinkSequencer',
      'LiveLinkMultiUser',
    ],
  },
  {
    plugin: 'MetaHumanAnimator',
    path: 'Engine/Plugins/MetaHuman/MetaHumanAnimator/MetaHuman.uplugin',
    moduleCount: 28,
    role: 'Animator toolkit: capture, solving, performance, speech-to-face, and batch workflows.',
    modules: [
      'MetaHumanCore',
      'MetaHumanCoreEditor',
      'MetaHumanImageViewerEditor',
      'MetaHumanPipeline',
      'MetaHumanFaceContourTracker',
      'MetaHumanFaceContourTrackerEditor',
      'MetaHumanIdentity',
      'MetaHumanIdentityEditor',
      'MetaHumanCaptureDataEditor',
      'MetaHumanCaptureSource',
      'MetaHumanFootageIngest',
      'MetaHumanDepthGenerator',
      'MetaHumanPerformance',
      'MetaHumanSequencer',
      'MetaHumanCaptureUtils',
      'MetaHumanCaptureProtocolStack',
      'MetaHumanToolkit',
      'MetaHumanSpeech2Face',
      'MetaHumanBatchProcessor',
      'MetaHumanConfig',
      'MetaHumanConfigEditor',
      'MetaHumanFaceAnimationSolver',
      'MetaHumanFaceAnimationSolverEditor',
      'MetaHumanFaceFittingSolver',
      'MetaHumanFaceFittingSolverEditor',
      'MetaHumanPlatform',
      'MetaHumanControlsConversionTest',
      'MeshTrackerInterface',
    ],
  },
  {
    plugin: 'MetaHumanCharacter',
    path: 'Engine/Plugins/MetaHuman/MetaHumanCharacter/MetaHumanCharacter.uplugin',
    moduleCount: 7,
    role: 'Character asset model and assembly pipeline with runtime + editor tooling.',
    modules: [
      'MetaHumanCharacterEditor',
      'MetaHumanCharacter',
      'MetaHumanCharacterPaletteEditor',
      'MetaHumanCharacterPalette',
      'MetaHumanDefaultPipeline',
      'MetaHumanDefaultEditorPipeline',
      'MetaHumanCharacterMigrationEditor',
    ],
  },
  {
    plugin: 'MetaHumanCoreTech',
    path: 'Engine/Plugins/MetaHuman/MetaHumanCoreTechLib/MetaHumanCoreTech.uplugin',
    moduleCount: 5,
    role: 'Core tech libraries, image/capture utilities, and generic pipeline runtime.',
    modules: [
      'MetaHumanCoreTechLib',
      'MetaHumanCoreTech',
      'MetaHumanImageViewer',
      'MetaHumanCaptureData',
      'MetaHumanPipelineCore',
    ],
  },
  {
    plugin: 'MetaHumanLiveLink',
    path: 'Engine/Plugins/MetaHuman/MetaHumanLiveLink/MetaHumanLiveLink.uplugin',
    moduleCount: 7,
    role: 'Realtime capture/stream source stack for face and local media sources.',
    modules: [
      'MetaHumanLiveLinkSource',
      'MetaHumanLiveLinkSourceEditor',
      'LiveLinkFaceSource',
      'LiveLinkFaceSourceEditor',
      'LiveLinkFaceDiscovery',
      'MetaHumanLocalLiveLinkSource',
      'MetaHumanLocalLiveLinkSourceEditor',
    ],
  },
  {
    plugin: 'MetaHumanSDK',
    path: 'Engine/Plugins/MetaHuman/MetaHumanSDK/MetaHumanSDK.uplugin',
    moduleCount: 3,
    role: 'Runtime component integration and editor import/verification pipeline.',
    modules: ['MetaHumanSDKEditor', 'MetaHumanSDKRuntime', 'InterchangeDNA'],
  },
  {
    plugin: 'MetaHumanCalibrationProcessing',
    path: 'Engine/Plugins/MetaHuman/MetaHumanCalibrationProcessing/MetaHumanCalibrationProcessing.uplugin',
    moduleCount: 3,
    role: 'Calibration generator/core/lib for multi-camera solving and robust feature matching.',
    modules: ['MetaHumanCalibrationGenerator', 'MetaHumanCalibrationLib', 'MetaHumanCalibrationCore'],
  },
];

const keyFunctions = [
  {
    component: 'PajamaRealtimeControl (repo plugin)',
    file: 'metahuman/avatar01/Plugins/PajamaRealtimeControl/.../PajamaRealtimeControlModule.cpp',
    methods: 'StartupModule, HandleControl, ParsePayload, ApplyPayloadOnGameThread',
    purpose:
      'Starts UE HTTP routes, parses control payload, and dispatches morph/head changes to game thread.',
  },
  {
    component: 'UPajamaMetaHumanControllerComponent',
    file: 'metahuman/avatar01/Plugins/PajamaRealtimeControl/.../PajamaMetaHumanControllerComponent.cpp',
    methods: 'CollectControlledMeshes, ApplyMorphTargets, ApplyHeadPose, ResetMorphTargets',
    purpose: 'Applies morph target values and head pose to selected skeletal meshes/owner actor.',
  },
  {
    component: 'Next.js proxy route',
    file: 'web/app/api/metahuman/control/route.ts',
    methods: 'GET, POST',
    purpose: 'Forwards browser calls to bridge health/command endpoints with optional bearer token.',
  },
  {
    component: 'Bridge server',
    file: 'metahuman/editor-bridge/server.mjs',
    methods: 'GET /health, POST /v1/command',
    purpose: 'Token-gated HTTP bridge from web layer to local Unreal plugin endpoints.',
  },
  {
    component: 'Live Link face source',
    file: 'Engine/Plugins/MetaHuman/MetaHumanLiveLink/Source/LiveLinkFaceSource/Private/LiveLinkFaceSource.cpp',
    methods: 'Connect, OnDataReceived, ProcessPacket, PushStaticData',
    purpose: 'Connects to device control channel and ingests UDP face packets into Live Link subjects.',
  },
  {
    component: 'Live Link subject settings',
    file: '.../MetaHumanLiveLinkSource/Public/MetaHumanLiveLinkSubjectSettings.h',
    methods: 'PreProcess, CaptureNeutrals, CaptureNeutralFrame, CaptureNeutralHeadPose',
    purpose: 'Calibration/smoothing/neutrals/head-pose preprocessing for realtime frame streams.',
  },
  {
    component: 'Local source subject worker',
    file: '.../MetaHumanLocalLiveLinkSource/Public/MetaHumanLocalLiveLinkSubject.h',
    methods: 'Run, FrameComplete, ProcessComplete, PushFrameData',
    purpose: 'FRunnable worker that executes local processing pipeline and emits Live Link frames.',
  },
  {
    component: 'Pipeline runtime',
    file: '.../MetaHumanPipelineCore/Public/Pipeline/Pipeline.h',
    methods: 'MakeConnection, Run, Cancel, IsRunning',
    purpose: 'Node graph orchestration with push/pull execution modes and completion delegates.',
  },
  {
    component: 'Speech-to-animation node',
    file: '.../MetaHumanPipelineCore/Public/Nodes/RealtimeSpeechToAnimNode.h',
    methods: 'Start, Process, End, SetMood, SetLookahead',
    purpose: 'Audio-driven realtime animation node in pipeline graph.',
  },
  {
    component: 'MetaHuman component runtime',
    file: '.../MetaHumanSDKRuntime/Public/MetaHumanComponentBase.h',
    methods: 'LoadAndRunAnimBP, PostInitAnimBP, PostConnectAnimBPVariables',
    purpose: 'Wires MetaHuman body/face settings into anim BP variables and runtime component setup.',
  },
  {
    component: 'Speech2Face API',
    file: '.../MetaHumanAnimator/Source/MetaHumanSpeech2Face/Public/Speech2Face.h',
    methods: 'Create, SetMood, SetMoodIntensity, GenerateFaceAnimation',
    purpose: 'Produces RigLogic control animation from speech audio.',
  },
  {
    component: 'Calibration wrappers',
    file: '.../MetaHumanCalibrationLib/Public/MetaHumanStereoCalibrator.h',
    methods: 'Init, AddCamera, DetectPattern, Calibrate, ExportCalibrations',
    purpose: 'Stereo calibration and export pipeline for capture rigs.',
  },
  {
    component: 'Robust matcher wrappers',
    file: '.../MetaHumanCalibrationLib/Public/MetaHumanRobustFeatureMatcher.h',
    methods: 'Init, AddCamera, DetectFeatures, GetFeatures',
    purpose: 'Robust multi-camera feature matching and triangulation retrieval.',
  },
];

const officialRefs = [
  {
    label: 'MetaHuman documentation hub',
    href: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-documentation',
  },
  {
    label: 'MetaHumans in Unreal Engine',
    href: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahumans-in-unreal-engine',
  },
  {
    label: 'MetaHuman Component for Unreal Engine',
    href: 'https://dev.epicgames.com/documentation/en-us/metahuman/the-metahuman-component-for-unreal-engine',
  },
  {
    label: 'Realtime Animation Using Live Link',
    href: 'https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation-using-live-link',
  },
  {
    label: 'MetaHuman Animator',
    href: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator',
  },
  {
    label: 'Unreal API Plugin Index: MetaHuman',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHuman',
  },
  {
    label: 'Unreal API Plugin Index: MetaHumanCharacter',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCharacter',
  },
  {
    label: 'Unreal API Plugin Index: MetaHumanLiveLink',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanLiveLink',
  },
  {
    label: 'Unreal API Plugin Index: MetaHumanCoreTech',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCoreTech',
  },
  {
    label: 'Unreal API Plugin Index: MetaHumanSDK',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanSDK',
  },
  {
    label: 'Unreal API Plugin Index: MetaHumanCalibrationProcessing',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/MetaHumanCalibrationProcessing',
  },
  {
    label: 'Unreal API Plugin Index: LiveLink',
    href: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/LiveLink',
  },
  {
    label: 'EpicGames MetaHuman DNA Calibration (GitHub)',
    href: 'https://github.com/EpicGames/MetaHuman-DNA-Calibration',
  },
];

function formatUtcTimestamp(value?: string): string {
  if (!value) {
    return 'n/a';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().replace('.000Z', 'Z');
}

function formatModuleTypes(moduleTypes?: Record<string, number>): string {
  if (!moduleTypes || Object.keys(moduleTypes).length === 0) {
    return 'n/a';
  }
  return Object.entries(moduleTypes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}:${value}`)
    .join(' | ');
}

function shortLabel(value: string, maxLen = 16): string {
  if (value.length <= maxLen) {
    return value;
  }
  const sliceLen = Math.max(1, maxLen - 3);
  return `${value.slice(0, sliceLen)}...`;
}

function buildCircleLayout(nodeNames: string[], width: number, height: number): Record<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const count = Math.max(nodeNames.length, 1);
  const layout: Record<string, { x: number; y: number }> = {};
  nodeNames.forEach((name, index) => {
    const theta = (2 * Math.PI * index) / count - Math.PI / 2;
    layout[name] = {
      x: cx + radius * Math.cos(theta),
      y: cy + radius * Math.sin(theta),
    };
  });
  return layout;
}

async function loadPublicJson<T>(filename: string): Promise<T | null> {
  const snapshotPath = path.join(process.cwd(), 'public', 'docs', filename);
  try {
    const raw = await fs.readFile(snapshotPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function countModuleTypes(snapshot: EvolutionSnapshot | null): { editor: number; runtime: number; uncookedOnly: number } {
  let editor = 0;
  let runtime = 0;
  let uncookedOnly = 0;

  for (const plugin of snapshot?.plugins ?? []) {
    for (const module of plugin.modules ?? []) {
      if (module.type === 'Editor') {
        editor += 1;
      } else if (module.type === 'Runtime') {
        runtime += 1;
      } else if (module.type === 'UncookedOnly') {
        uncookedOnly += 1;
      }
    }
  }

  return { editor, runtime, uncookedOnly };
}

async function loadEvolutionSnapshot(): Promise<EvolutionSnapshot | null> {
  return loadPublicJson<EvolutionSnapshot>('metahuman-evolution-latest.json');
}

async function loadArchitectureSnapshot(): Promise<ArchitectureSnapshot | null> {
  return loadPublicJson<ArchitectureSnapshot>('metahuman-architecture-latest.json');
}

async function loadDependencyGraphSnapshot(): Promise<DependencyGraphSnapshot | null> {
  return loadPublicJson<DependencyGraphSnapshot>('metahuman-dependency-graph-latest.json');
}

export default async function MetaHumanArchitecturePage() {
  const evolution = await loadEvolutionSnapshot();
  const architecture = await loadArchitectureSnapshot();
  const dependencyGraph = await loadDependencyGraphSnapshot();
  const moduleTypes = countModuleTypes(evolution);
  const hasLiveLinkCore = Boolean(evolution?.plugins?.some((plugin) => plugin.name === 'LiveLink'));
  const graphNodes = dependencyGraph?.plugin_nodes ?? [];
  const graphEdges = (dependencyGraph?.plugin_edges ?? []).filter((edge) => !edge.intra_plugin);
  const graphLayout = buildCircleLayout(
    graphNodes.map((node) => node.name),
    980,
    620,
  );
  const maxGraphEdgeCount = Math.max(1, ...graphEdges.map((edge) => edge.count));
  const topPluginEdges = [...graphEdges].sort((a, b) => b.count - a.count).slice(0, 12);

  return (
    <div>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-metahuman)' }} />
          <span className="badge">Complementary Dossier</span>
          <span className="text-sm text-[var(--text-muted)]">Engine scan: UE 5.7</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">MetaHuman Full Architecture and Implementation</h1>
        <p className="text-lg text-[var(--text-muted)]">
          Complete end-to-end map of MetaHuman modules, functions, and integration details from this repo plus
          Unreal Engine plugin source.
        </p>
      </section>

      <section className="card p-5 mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Workflow size={20} />
          Live Evolution Status
        </h2>
        {evolution ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
              <div className="card-alt p-3">
                <p className="text-[var(--text-muted)]">Cycle</p>
                <p className="font-semibold">{evolution.cycle ?? 'n/a'}</p>
              </div>
              <div className="card-alt p-3">
                <p className="text-[var(--text-muted)]">Plugins / Modules</p>
                <p className="font-semibold">
                  {evolution.totals?.plugins ?? 'n/a'} / {evolution.totals?.modules ?? 'n/a'}
                </p>
              </div>
              <div className="card-alt p-3">
                <p className="text-[var(--text-muted)]">Source Files</p>
                <p className="font-semibold">{evolution.totals?.source_files ?? 'n/a'}</p>
              </div>
              <div className="card-alt p-3">
                <p className="text-[var(--text-muted)]">Dependency Edges</p>
                <p className="font-semibold">{evolution.totals?.internal_dependency_edges ?? 'n/a'}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="card-alt p-4">
                <p className="font-medium mb-2">Current scope</p>
                <ul className="space-y-1 text-[var(--text-muted)]">
                  <li>UE root: <code>{evolution.ue_root ?? 'n/a'}</code></li>
                  <li>Scan roots: <code>{evolution.scan_roots?.length ?? 0}</code></li>
                  <li>Includes core LiveLink plugin: <code>{hasLiveLinkCore ? 'yes' : 'no'}</code></li>
                  <li>Generated at: <code>{formatUtcTimestamp(evolution.generated_at)}</code></li>
                </ul>
              </div>
              <div className="card-alt p-4">
                <p className="font-medium mb-2">Module type split</p>
                <ul className="space-y-1 text-[var(--text-muted)]">
                  <li>Editor modules: <code>{moduleTypes.editor}</code></li>
                  <li>Runtime modules: <code>{moduleTypes.runtime}</code></li>
                  <li>UncookedOnly modules: <code>{moduleTypes.uncookedOnly}</code></li>
                  <li>New plugins this cycle: <code>{evolution.delta?.new_plugins?.length ?? 0}</code></li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No evolution snapshot found yet. Run{' '}
            <code>python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py</code> to generate one.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Cpu size={22} />
          Generated Architecture Snapshot
        </h2>
        {architecture ? (
          <>
            <div className="card p-5 mb-4 text-sm text-[var(--text-muted)]">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Cycle</p>
                  <p>{architecture.cycle ?? 'n/a'}</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Generated</p>
                  <p>{formatUtcTimestamp(architecture.generated_at)}</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">UE Root</p>
                  <p className="truncate">{architecture.ue_root ?? 'n/a'}</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Internal Edges</p>
                  <p>{architecture.totals?.internal_dependency_edges ?? 'n/a'}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="research-table">
                <thead>
                  <tr>
                    <th>Plugin</th>
                    <th>Category</th>
                    <th>Modules</th>
                    <th>Type Split</th>
                    <th>Largest Modules</th>
                  </tr>
                </thead>
                <tbody>
                  {(architecture.plugin_inventory ?? []).map((plugin) => (
                    <tr key={`arch-${plugin.name}`}>
                      <td>
                        <p className="font-medium">{plugin.name}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          <code>{plugin.path ?? 'n/a'}</code>
                        </p>
                      </td>
                      <td>{plugin.category ?? 'n/a'}</td>
                      <td>{plugin.module_count ?? 0}</td>
                      <td>
                        <code>{formatModuleTypes(plugin.module_types)}</code>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(plugin.top_modules ?? []).slice(0, 4).map((module) => (
                            <span key={`${plugin.name}-${module.name}`} className="badge text-xs">
                              {module.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No architecture snapshot found yet. Run the evolver skill to generate
            <code> metahuman-architecture-latest.json</code>.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Network size={22} />
          Generated Dependency Graph (Plugin-Level)
        </h2>
        {dependencyGraph && graphNodes.length > 0 ? (
          <>
            <div className="card p-4 overflow-x-auto">
              <svg viewBox="0 0 980 620" className="min-w-[900px] w-full h-auto">
                <defs>
                  <marker
                    id="dep-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)" />
                  </marker>
                </defs>
                {graphEdges.map((edge) => {
                  const source = graphLayout[edge.from_plugin];
                  const target = graphLayout[edge.to_plugin];
                  if (!source || !target) {
                    return null;
                  }
                  const weight = 1 + (edge.count / maxGraphEdgeCount) * 3;
                  return (
                    <g key={`edge-${edge.from_plugin}-${edge.to_plugin}`}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="var(--text-muted)"
                        strokeOpacity={0.5}
                        strokeWidth={weight}
                        markerEnd="url(#dep-arrow)"
                      />
                    </g>
                  );
                })}
                {graphNodes.map((node) => {
                  const point = graphLayout[node.name];
                  if (!point) {
                    return null;
                  }
                  return (
                    <g key={`node-${node.name}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={26}
                        fill="var(--bg-elevated)"
                        stroke="var(--border-strong)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={point.x}
                        y={point.y + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--foreground)"
                      >
                        {shortLabel(node.name, 14)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="research-table">
                <thead>
                  <tr>
                    <th>From Plugin</th>
                    <th>To Plugin</th>
                    <th>Edge Count</th>
                    <th>Kinds</th>
                  </tr>
                </thead>
                <tbody>
                  {topPluginEdges.map((edge) => (
                    <tr key={`top-edge-${edge.from_plugin}-${edge.to_plugin}`}>
                      <td>{edge.from_plugin}</td>
                      <td>{edge.to_plugin}</td>
                      <td>{edge.count}</td>
                      <td>
                        <code>{(edge.dependency_kinds ?? []).join(', ')}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No dependency graph snapshot found yet. Run the evolver skill to generate
            <code> metahuman-dependency-graph-latest.json</code>.
          </p>
        )}
      </section>

      <section className="card p-5 mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Workflow size={20} />
          End-to-End Realtime Control Path
        </h2>
        <pre className="code p-4 rounded-lg text-xs overflow-x-auto">
{`Browser (/rapport)
  -> Next.js API (/api/metahuman/control)
  -> Editor bridge (/v1/command @ 127.0.0.1:8788)
  -> Unreal HTTPServer (/pajama/control @ 127.0.0.1:5189)
  -> Actor tag lookup (PajamaMetaHuman)
  -> UPajamaMetaHumanControllerComponent
  -> SkeletalMesh morph targets + actor head pose`}
        </pre>
        <div className="mt-4 text-sm text-[var(--text-muted)]">
          Source roots used: <code>metahuman/avatar01</code>, <code>metahuman/editor-bridge</code>,{' '}
          <code>web/app/api/metahuman/control/route.ts</code>, and{' '}
          <code>G:/UE/UnrealEngine/Engine/Plugins/MetaHuman</code>.
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <LayersIcon />
          UE 5.7 Plugin Inventory
        </h2>
        <div className="space-y-4">
          {pluginInventory.map((plugin) => (
            <div key={plugin.plugin} className="card p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold">{plugin.plugin}</span>
                <span className="badge">{plugin.moduleCount} modules</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-2">{plugin.role}</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                <code>{plugin.path}</code>
              </p>
              <details>
                <summary className="text-sm cursor-pointer">View modules</summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plugin.modules.map((mod) => (
                    <span key={mod} className="badge text-xs">
                      {mod}
                    </span>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Cpu size={22} />
          Function-Level Map
        </h2>
        <div className="overflow-x-auto">
          <table className="research-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Methods</th>
                <th>Implementation role</th>
              </tr>
            </thead>
            <tbody>
              {keyFunctions.map((item) => (
                <tr key={`${item.component}-${item.methods}`}>
                  <td>
                    <p className="font-medium">{item.component}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      <code>{item.file}</code>
                    </p>
                  </td>
                  <td>
                    <code>{item.methods}</code>
                  </td>
                  <td>{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Network size={22} />
          Control Payload Contract
        </h2>
        <pre className="code p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "targetActorTag": "PajamaMetaHuman",
  "preset": "smile",
  "strength": 1.0,
  "morphTargets": {
    "mouthSmileLeft": 0.6,
    "mouthSmileRight": 0.6,
    "jawOpen": 0.2
  },
  "headYaw": 8,
  "headPitch": -3,
  "headRoll": 0
}`}
        </pre>
        <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
          <div className="card-alt p-4">
            <p className="font-medium mb-2">Health endpoints</p>
            <ul className="space-y-1 text-[var(--text-muted)]">
              <li>
                <code>GET /api/metahuman/control</code> (web proxy health)
              </li>
              <li>
                <code>GET /health</code> (bridge health)
              </li>
              <li>
                <code>GET /pajama/health</code> (UE plugin health)
              </li>
            </ul>
          </div>
          <div className="card-alt p-4">
            <p className="font-medium mb-2">Runtime thread boundary</p>
            <p className="text-[var(--text-muted)]">
              UE plugin receives HTTP off-thread and marshals actor/morph application onto game thread via{' '}
              <code>AsyncTask(ENamedThreads::GameThread)</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Implementation Runbook</h2>
        <ol className="list-decimal pl-6 space-y-2 text-[var(--text-muted)]">
          <li>Open <code>metahuman/avatar01/avatar01.uproject</code> in UE 5.7.</li>
          <li>Ensure actor has tag <code>PajamaMetaHuman</code> and component <code>UPajamaMetaHumanControllerComponent</code>.</li>
          <li>Start bridge: <code>cd metahuman/editor-bridge && node server.mjs</code>.</li>
          <li>Set web env to bridge endpoints (<code>METAHUMAN_CONTROL_ENDPOINT</code>, <code>METAHUMAN_CONTROL_HEALTH_ENDPOINT</code>).</li>
          <li>Run web app and use <Link href="/rapport" className="hover:underline">/rapport</Link> control panel.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Official References</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {officialRefs.map((ref) => (
            <a
              key={ref.href}
              href={ref.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 flex items-start gap-3 hover:border-[var(--border-strong)]"
            >
              <ExternalLink size={16} className="mt-0.5 text-[var(--accent)]" />
              <span className="text-sm">{ref.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <BookOpen size={20} />
          Full Markdown Dossier
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          The same architecture report is also available as a markdown document for offline review and versioning.
        </p>
        <a
          href="/docs/metahuman-architecture.md"
          target="_blank"
          rel="noopener noreferrer"
          className="badge hover:border-[var(--border-strong)]"
        >
          Open markdown version
        </a>
      </section>
    </div>
  );
}

function LayersIcon() {
  return <Cpu size={22} />;
}
