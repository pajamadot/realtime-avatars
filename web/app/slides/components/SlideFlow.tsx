'use client';

import { useEffect, useMemo } from 'react';
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
  accentColor?: string;
  interactive?: boolean;
  height?: number;
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
  interactive = false,
  height,
}: SlideFlowProps) {
  const isHorizontal = direction === 'horizontal';

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
      type: 'simplebezier',
      animated: true,
      style: { stroke: accentColor, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: accentColor,
        width: 16,
        height: 16,
      },
    }));
  }, [inputEdges, inputNodes, accentColor]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setFlowNodes(rfNodes);
    setFlowEdges(rfEdges);
  }, [rfNodes, rfEdges, setFlowNodes, setFlowEdges]);

  const totalH = isHorizontal
    ? NODE_HEIGHT
    : inputNodes.length * (NODE_HEIGHT + V_GAP) - V_GAP;

  return (
    <div
      style={{
        width: '100%',
        height: height ?? Math.max(totalH + 40, 80),
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
