"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  applyNodeChanges,
  type NodeChange,
} from "reactflow";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Cloud, Sun } from "lucide-react";

interface Activity {
  id: string;
  day: number;
  time: string;
  title: string;
  description: string;
  location: string;
  type: string;
  weather?: string;
  image?: string;
}

interface ItineraryFlowchartProps {
  itineraries: any;
  activeTab: "economic" | "balanced" | "luxury";
  onNodeClick?: (nodeId: string) => void;
  onReorderDays?: (order: number[]) => void;
}

export default function ItineraryFlowchart({
  itineraries,
  activeTab,
  onNodeClick,
  onReorderDays,
}: ItineraryFlowchartProps) {
  // Convert itinerary to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const itinerary = itineraries?.[activeTab] || itineraries?.balanced || itineraries?.economic || {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Handle both old format (itinerary.days) and new format (direct array)
    const daysArray = Array.isArray(itinerary) ? itinerary : (itinerary.days || []);
    
    if (!daysArray || daysArray.length === 0) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    daysArray.forEach((day: any, dayIndex: number) => {
      const dayNumber = day.day || dayIndex;
      const dayY = dayIndex * 300;

      // Day header node
      const dayNode: Node = {
        id: `day-${dayNumber}`,
        type: "default",
        position: { x: 100, y: dayY },
        data: {
          label: (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <span className="font-bold text-lg">Day {dayNumber}</span>
                  {day.title && <div className="text-xs opacity-90 mt-0.5">{day.title}</div>}
                  {day.date && <span className="text-sm opacity-90">({day.date})</span>}
                </div>
              </div>
            </div>
          ),
        },
        style: { width: 200 },
      };
      nodes.push(dayNode);

      // Activity nodes for this day
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((activity: any, actIndex: number) => {
          const activityId = `day-${dayNumber}-act-${actIndex}`;
          const activityX = 350 + actIndex * 280;

          const activityNode: Node = {
            id: activityId,
            type: "default",
            position: { x: activityX, y: dayY + (actIndex % 2) * 120 },
            data: {
              label: (
                <div className="px-4 py-3 bg-white rounded-lg shadow-md border-2 border-purple-200 hover:border-purple-400 transition-all max-w-[250px]">
                  <div className="flex items-start gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span className="text-xs font-semibold text-gray-600">{activity.time || "All Day"}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{activity.title || activity.name || "Activity"}</h4>
                  {activity.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                  )}
                  {activity.transportation && (
                    <div className="text-xs text-purple-600 mb-1 font-medium">
                      🚇 {activity.transportation}
                    </div>
                  )}
                  {activity.description && (
                    <p className="text-xs text-gray-600 line-clamp-3 mb-1">{activity.description}</p>
                  )}
                  {activity.cost && (
                    <div className="text-xs font-semibold text-green-600 mb-1">
                      💰 {activity.cost}
                    </div>
                  )}
                  {activity.tips && (
                    <div className="text-xs text-amber-600 italic mt-1 border-t border-gray-200 pt-1">
                      💡 {activity.tips}
                    </div>
                  )}
                </div>
              ),
            },
            style: { width: 300 },
          };
          nodes.push(activityNode);

          // Connect day to first activity
          if (actIndex === 0) {
            edges.push({
              id: `e-day-${dayNumber}-to-first`,
              source: `day-${dayNumber}`,
              target: activityId,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#8b5cf6", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
            });
          }

          // Connect activities in sequence
          if (actIndex > 0) {
            edges.push({
              id: `e-${dayNumber}-${actIndex - 1}-to-${actIndex}`,
              source: `day-${dayNumber}-act-${actIndex - 1}`,
              target: activityId,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#8b5cf6", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
            });
          }
        });
      }

      // Connect days
      if (dayIndex > 0) {
        edges.push({
          id: `e-day-${dayIndex}-to-${dayNumber}`,
          source: `day-${dayIndex}`,
          target: `day-${dayNumber}`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 3, strokeDasharray: "5,5" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [itineraries, activeTab]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      if (!onReorderDays) return;

      const hasPositionChangeForDay = changes.some(
        (ch) => ch.type === "position" && ch.id.startsWith("day-")
      );

      if (!hasPositionChangeForDay) return;

      // Compute updated node positions using React Flow's helper
      const updatedNodes = applyNodeChanges(changes, nodes);

      const order = updatedNodes
        .filter((n) => n.id.startsWith("day-"))
        .sort((a, b) => a.position.y - b.position.y)
        .map((n) => {
          const num = parseInt(n.id.replace("day-", ""), 10);
          return Number.isNaN(num) ? undefined : num;
        })
        .filter((n): n is number => typeof n === "number");

      if (order.length > 0) {
        onReorderDays(order);
      }
    },
    [nodes, onNodesChange, onReorderDays]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  if (initialNodes.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600">No itinerary data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[700px] bg-white rounded-lg border-2 border-purple-200 overflow-hidden touch-pan-x touch-pan-y">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        fitView
        className="bg-gradient-to-br from-purple-50 to-pink-50"
        panOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={false}
      >
        <Background color="#e0e7ff" gap={16} />
        <Controls className="bg-white border border-purple-200 rounded-lg shadow-lg" />
        <MiniMap
          className="bg-white border border-purple-200 rounded-lg shadow-lg"
          nodeColor="#8b5cf6"
          maskColor="rgba(139, 92, 246, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

