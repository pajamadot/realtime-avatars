'use client';

import {
  ReactFlow,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface SlideFlowNode {
  id: string;
  label: string;
  color?: string;
  description?: string;
}

interface SlideFlowEdge {
  source: string;
  target: string;
}

interface SlideFlowProps {
  nodes: SlideFlowNode[];
  edges?: SlideFlowEdge[];
  direction?: 'horizontal' | 'vertical';
  accentColor?: string;
}

const NODE_WIDTH = 170;
const NODE_HEIGHT = 52;
const H_GAP = 60;
const V_GAP = 70;

export default function SlideFlow({
  nodes: inputNodes,
  edges: inputEdges,
  direction = 'horizontal',
  accentColor = '#e08840',
}: SlideFlowProps) {
  const isHorizontal = direction === 'horizontal';

  const rfNodes: Node[] = inputNodes.map((n, i) => ({
    id: n.id,
    position: isHorizontal
      ? { x: i * (NODE_WIDTH + H_GAP), y: 0 }
      : { x: 0, y: i * (NODE_HEIGHT + V_GAP) },
    data: { label: n.label },
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
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
    draggable: false,
    selectable: false,
    connectable: false,
  }));

  // Auto-generate edges from sequential node order if not provided
  const edgeList: SlideFlowEdge[] =
    inputEdges ??
    inputNodes.slice(0, -1).map((n, i) => ({
      source: n.id,
      target: inputNodes[i + 1].id,
    }));

  const rfEdges: Edge[] = edgeList.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: accentColor, strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: accentColor,
      width: 16,
      height: 16,
    },
  }));

  const totalW = isHorizontal
    ? inputNodes.length * (NODE_WIDTH + H_GAP) - H_GAP
    : NODE_WIDTH;
  const totalH = isHorizontal
    ? NODE_HEIGHT
    : inputNodes.length * (NODE_HEIGHT + V_GAP) - V_GAP;

  return (
    <div
      style={{
        width: '100%',
        height: Math.max(totalH + 40, 80),
        minHeight: 80,
      }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
