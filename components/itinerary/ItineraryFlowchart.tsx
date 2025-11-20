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
} from "reactflow";
import "reactflow/dist/style.css";
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
}

export default function ItineraryFlowchart({
  itineraries,
  activeTab,
  onNodeClick,
}: ItineraryFlowchartProps) {
  const itinerary = itineraries?.[activeTab] || itineraries?.balanced || itineraries?.economic || {};

  // Convert itinerary to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    itinerary.days.forEach((day: any, dayIndex: number) => {
      const dayNumber = dayIndex + 1;
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
                <span className="font-bold text-lg">Day {dayNumber}</span>
                {day.date && <span className="text-sm opacity-90">({day.date})</span>}
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
                  <h4 className="font-bold text-gray-900 mb-1">{activity.title || activity.name}</h4>
                  {activity.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  {activity.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                  )}
                  {activity.weather && (
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      {activity.weather.includes("rain") || activity.weather.includes("cloud") ? (
                        <Cloud className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Sun className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-gray-600">{activity.weather}</span>
                    </div>
                  )}
                </div>
              ),
            },
            style: { width: 280 },
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
  }, [itinerary]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
    <div className="w-full h-[700px] bg-white rounded-lg border-2 border-purple-200 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        fitView
        className="bg-gradient-to-br from-purple-50 to-pink-50"
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

