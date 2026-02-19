'use client';

import { useEffect, useId, useMemo } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface SlideFlowNode {
  id: string;
  label: string;
  color?: string;
  description?: string;
  position?: { x: number; y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
}

interface SlideFlowEdge {
  source: string;
  target: string;
}

interface SlideFlowProps {
  nodes: SlideFlowNode[];
  edges?: SlideFlowEdge[];
  direction?: 'horizontal' | 'vertical';
  edgeType?: 'simplebezier' | 'straight';
  accentColor?: string;
  interactive?: boolean;
  height?: number;
}

const NODE_WIDTH = 170;
const NODE_HEIGHT = 52;
const H_GAP = 60;
const V_GAP = 70;
const CANVAS_PADDING = 32;

function wrapLabel(label: string, maxChars = 22, maxLines = 3): string[] {
  const words = label.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === 0) return [label];

  const consumed = lines.join(' ').length;
  if (consumed < label.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxChars - 1))}…`;
  }
  return lines.slice(0, maxLines);
}

function anchorX(x: number, sourceOrTarget: Position, width: number) {
  if (sourceOrTarget === Position.Left) return x;
  if (sourceOrTarget === Position.Right) return x + width;
  return x + width / 2;
}

function anchorY(y: number, sourceOrTarget: Position, height: number) {
  if (sourceOrTarget === Position.Top) return y;
  if (sourceOrTarget === Position.Bottom) return y + height;
  return y + height / 2;
}

export default function SlideFlow({
  nodes: inputNodes,
  edges: inputEdges,
  direction = 'horizontal',
  edgeType = 'simplebezier',
  accentColor = '#e08840',
  interactive = false,
  height,
}: SlideFlowProps) {
  const isHorizontal = direction === 'horizontal';
  const markerId = useId().replace(/:/g, '');

  const rfNodes: Node[] = useMemo(
    () =>
      inputNodes.map((n, i) => ({
        id: n.id,
        position:
          n.position ??
          (isHorizontal
            ? { x: i * (NODE_WIDTH + H_GAP), y: 0 }
            : { x: 0, y: i * (NODE_HEIGHT + V_GAP) }),
        data: { label: n.label },
        sourcePosition: n.sourcePosition ?? (isHorizontal ? Position.Right : Position.Bottom),
        targetPosition: n.targetPosition ?? (isHorizontal ? Position.Left : Position.Top),
        style: {
          background: '#1d1c1a',
          border: `1.5px solid ${n.color || accentColor}`,
          borderRadius: 10,
          color: '#f5f2ec',
          fontSize: 14,
          fontWeight: 600,
          padding: '10px 16px',
          width: NODE_WIDTH,
          textAlign: 'center' as const,
        },
        draggable: interactive,
        selectable: interactive,
        connectable: false,
      })),
    [inputNodes, isHorizontal, accentColor, interactive],
  );

  const rfEdges: Edge[] = useMemo(() => {
    const edgeList: SlideFlowEdge[] =
      inputEdges ??
      inputNodes.slice(0, -1).map((n, i) => ({
        source: n.id,
        target: inputNodes[i + 1].id,
      }));

    return edgeList.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: edgeType,
      animated: true,
      style: { stroke: accentColor, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: accentColor,
        width: 16,
        height: 16,
      },
    }));
  }, [inputEdges, inputNodes, accentColor, edgeType]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setFlowNodes(rfNodes);
    setFlowEdges(rfEdges);
  }, [rfNodes, rfEdges, setFlowNodes, setFlowEdges]);

  const totalH = isHorizontal
    ? NODE_HEIGHT
    : inputNodes.length * (NODE_HEIGHT + V_GAP) - V_GAP;
  const flowHeight = height ?? Math.max(totalH + 40, 80);

  const staticLayout = useMemo(() => {
    const nodes = inputNodes.map((n, i) => {
      const base =
        n.position ??
        (isHorizontal
          ? { x: i * (NODE_WIDTH + H_GAP), y: 0 }
          : { x: 0, y: i * (NODE_HEIGHT + V_GAP) });
      return {
        ...n,
        x: base.x,
        y: base.y,
        sourcePosition: n.sourcePosition ?? (isHorizontal ? Position.Right : Position.Bottom),
        targetPosition: n.targetPosition ?? (isHorizontal ? Position.Left : Position.Top),
      };
    });

    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH));
    const maxY = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT));

    const width = maxX - minX + CANVAS_PADDING * 2;
    const logicalHeight = maxY - minY + CANVAS_PADDING * 2;

    const normalized = nodes.map((n) => ({
      ...n,
      x: n.x - minX + CANVAS_PADDING,
      y: n.y - minY + CANVAS_PADDING,
    }));

    const edgeList: SlideFlowEdge[] =
      inputEdges ??
      normalized.slice(0, -1).map((n, i) => ({
        source: n.id,
        target: normalized[i + 1].id,
      }));

    return {
      nodes: normalized,
      edges: edgeList,
      width,
      logicalHeight,
    };
  }, [inputNodes, inputEdges, isHorizontal]);

  if (!interactive) {
    const nodeById = new Map(staticLayout.nodes.map((n) => [n.id, n]));
    return (
      <div
        style={{
          width: '100%',
          height: flowHeight,
          minHeight: 80,
        }}
      >
        <svg
          viewBox={`0 0 ${staticLayout.width} ${staticLayout.logicalHeight}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Flow diagram"
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="10"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={accentColor} />
            </marker>
          </defs>

          {staticLayout.edges.map((edge, idx) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;

            const sx = anchorX(source.x, source.sourcePosition ?? Position.Right, NODE_WIDTH);
            const sy = anchorY(source.y, source.sourcePosition ?? Position.Right, NODE_HEIGHT);
            const tx = anchorX(target.x, target.targetPosition ?? Position.Left, NODE_WIDTH);
            const ty = anchorY(target.y, target.targetPosition ?? Position.Left, NODE_HEIGHT);

            let d = `M ${sx} ${sy} L ${tx} ${ty}`;
            if (edgeType === 'simplebezier') {
              const dx = tx - sx;
              const dy = ty - sy;
              const c1x = sx + (isHorizontal ? dx * 0.45 : 0);
              const c1y = sy + (isHorizontal ? 0 : dy * 0.45);
              const c2x = tx - (isHorizontal ? dx * 0.45 : 0);
              const c2y = ty - (isHorizontal ? 0 : dy * 0.45);
              d = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
            }

            return (
              <path
                key={`${edge.source}-${edge.target}-${idx}`}
                d={d}
                fill="none"
                stroke={accentColor}
                strokeWidth={2}
                markerEnd={`url(#${markerId})`}
                opacity={0.95}
              />
            );
          })}

          {staticLayout.nodes.map((node) => {
            const lines = wrapLabel(node.label);
            const lineHeight = 12;
            const textStartY = node.y + NODE_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2;
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={10}
                  ry={10}
                  fill="#1d1c1a"
                  stroke={node.color || accentColor}
                  strokeWidth={1.5}
                />
                <text
                  x={node.x + NODE_WIDTH / 2}
                  y={textStartY}
                  fill="#f5f2ec"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={600}
                >
                  {lines.map((line, i) => (
                    <tspan key={`${node.id}-${i}`} x={node.x + NODE_WIDTH / 2} dy={i === 0 ? 0 : lineHeight}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: flowHeight,
        minHeight: 80,
      }}
    >
      <ReactFlow
        nodes={interactive ? flowNodes : rfNodes}
        edges={interactive ? flowEdges : rfEdges}
        fitView
        fitViewOptions={{ padding: 0.24, maxZoom: 1.15 }}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        panOnDrag={false}
        zoomOnScroll={interactive}
        zoomOnPinch={interactive}
        zoomOnDoubleClick={interactive}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
