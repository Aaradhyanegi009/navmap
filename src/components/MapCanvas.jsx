import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  Compass,
  LocateFixed,
  Sparkles,
  PlusCircle,
  Navigation,
  Layers as LayersIcon,
} from 'lucide-react';

const TILE_STYLES = {
  dark: {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  matrix: {
    name: 'Obsidian No-Labels',
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  voyager: {
    name: 'CartoDB Voyager Dark',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};

/**
 * Helper component to smoothly fly the Leaflet camera when preset or fit trigger changes.
 */
function MapCameraController({ center, zoom, fitBoundsCoords, recenterTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.1 });
    }
  }, [center, zoom, recenterTrigger, map]);

  useEffect(() => {
    if (fitBoundsCoords && fitBoundsCoords.length >= 2) {
      try {
        map.fitBounds(fitBoundsCoords, {
          paddingTopLeft: [50, 50],
          paddingBottomRight: [50, 90],
          maxZoom: 16,
          animate: true,
          duration: 0.85,
        });
      } catch (e) {
        // Ignore bounds error if map not ready
      }
    }
  }, [fitBoundsCoords, map]);

  return null;
}

/**
 * Map click listener for dropping custom nodes when `isAddingCustomNode` is active.
 */
function MapClickNodeAdder({ isAddingCustomNode, onMapClickAddNode }) {
  useMapEvents({
    click(e) {
      if (isAddingCustomNode && onMapClickAddNode) {
        onMapClickAddNode(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapCanvas({
  graph,
  sourceId,
  targetId,
  waypoints = [],
  routeResult,
  activeStepIndex,
  isAnimatingWave,
  layerSettings,
  isAddingCustomNode,
  onSelectNode,
  onMapClickAddNode,
  onCancelCustomNodeMode,
  recenterTrigger,
  onTriggerRecenter,
}) {
  const nodesMap = React.useMemo(() => {
    const map = {};
    for (const n of graph?.nodes || []) {
      map[n.id] = n;
    }
    return map;
  }, [graph]);

  // Determine which visited edges and nodes are visible up to activeStepIndex
  const visibleVisitedEdges = React.useMemo(() => {
    if (!routeResult?.visitedOrder || !layerSettings.showVisitedWave) return [];
    const maxStep =
      activeStepIndex !== null && activeStepIndex !== undefined
        ? activeStepIndex
        : routeResult.visitedOrder.length;

    const edges = [];
    for (let i = 0; i < Math.min(maxStep, routeResult.visitedOrder.length); i++) {
      const stepObj = routeResult.visitedOrder[i];
      if (stepObj?.relaxedEdges) {
        edges.push(...stepObj.relaxedEdges);
      }
    }
    return edges;
  }, [routeResult, activeStepIndex, layerSettings.showVisitedWave]);

  const visitedNodeIds = React.useMemo(() => {
    const set = new Set();
    if (!routeResult?.visitedOrder) return set;
    const maxStep =
      activeStepIndex !== null && activeStepIndex !== undefined
        ? activeStepIndex
        : routeResult.visitedOrder.length;
    for (let i = 0; i < Math.min(maxStep, routeResult.visitedOrder.length); i++) {
      set.add(routeResult.visitedOrder[i].currentNodeId);
    }
    return set;
  }, [routeResult, activeStepIndex]);

  const activeStepNodeId = React.useMemo(() => {
    if (
      !routeResult?.visitedOrder ||
      activeStepIndex === null ||
      activeStepIndex <= 0
    ) {
      return null;
    }
    const step =
      routeResult.visitedOrder[
        Math.min(activeStepIndex - 1, routeResult.visitedOrder.length - 1)
      ];
    return step?.currentNodeId || null;
  }, [routeResult, activeStepIndex]);

  // Show final shortest path when animation reached the end (or isn't scrubbing mid-way)
  const showFinalShortestPath = React.useMemo(() => {
    if (!routeResult?.shortestPath || routeResult.shortestPath.length < 2) {
      return false;
    }
    if (!isAnimatingWave) return true;
    return (
      activeStepIndex !== null &&
      activeStepIndex >= (routeResult.visitedOrder?.length || 0)
    );
  }, [routeResult, isAnimatingWave, activeStepIndex]);

  const shortestPathNodeIds = React.useMemo(() => {
    if (!showFinalShortestPath || !routeResult?.shortestPath) return new Set();
    return new Set(routeResult.shortestPath.map((n) => n.id));
  }, [showFinalShortestPath, routeResult]);

  const shortestPathEdgeIds = React.useMemo(() => {
    if (!showFinalShortestPath || !routeResult?.pathEdges) return new Set();
    return new Set(routeResult.pathEdges.map((e) => e.edgeId));
  }, [showFinalShortestPath, routeResult]);

  const shortestPathPositions = React.useMemo(() => {
    if (!showFinalShortestPath || !routeResult?.shortestPath) return [];
    return routeResult.shortestPath.map((n) => [n.lat, n.lng]);
  }, [showFinalShortestPath, routeResult]);

  const tileConfig = TILE_STYLES[layerSettings.tileStyle] || TILE_STYLES.dark;

  return (
    <div className="relative w-full h-full bg-[#09090B] select-none overflow-hidden">
      <MapContainer
        center={graph.center || [28.6085, 77.0352]}
        zoom={graph.zoom || 15}
        zoomControl={false}
        className={`w-full h-full z-0 ${
          isAddingCustomNode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <TileLayer
          key={layerSettings.tileStyle}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={19}
        />

        <MapCameraController
          center={graph.center}
          zoom={graph.zoom}
          recenterTrigger={recenterTrigger}
        />

        <MapClickNodeAdder
          isAddingCustomNode={isAddingCustomNode}
          onMapClickAddNode={onMapClickAddNode}
        />

        {/* 1. Base Topological Graph Edges */}
        {(graph.edges || []).map((edge) => {
          const u = nodesMap[edge.from];
          const v = nodesMap[edge.to];
          if (!u || !v) return null;

          const isShortestEdge = shortestPathEdgeIds.has(edge.id);
          const traffic = Number(edge.trafficMultiplier || 1.0);

          let baseColor = 'rgba(255, 255, 255, 0.16)';
          let baseWeight = 2.2;

          if (layerSettings.showTrafficColors) {
            if (traffic >= 2.0) {
              baseColor = 'rgba(248, 113, 113, 0.45)'; // Coral red heavy traffic
              baseWeight = 2.8;
            } else if (traffic >= 1.3) {
              baseColor = 'rgba(242, 139, 102, 0.42)'; // Warm amber moderate traffic
              baseWeight = 2.5;
            } else {
              baseColor = 'rgba(74, 222, 128, 0.28)'; // Clear emerald
            }
          }

          return (
            <Polyline
              key={edge.id}
              positions={[
                [u.lat, u.lng],
                [v.lat, v.lng],
              ]}
              pathOptions={{
                color: baseColor,
                weight: baseWeight,
                lineCap: 'round',
              }}
            >
              {layerSettings.showEdgeWeights && (
                <Tooltip
                  permanent
                  direction="center"
                  className={`edge-weight-pill ${
                    isShortestEdge ? 'active-edge-pill' : ''
                  }`}
                >
                  <span>
                    {edge.distance}m
                    {traffic > 1.0 ? ` · ${traffic}x` : ''}
                  </span>
                </Tooltip>
              )}
            </Polyline>
          );
        })}

        {/* 2. Animated Dijkstra Exploration Wave (Relaxed Edges) */}
        {layerSettings.showVisitedWave &&
          visibleVisitedEdges.map((trace, idx) => (
            <Polyline
              key={`wave-${trace.edgeId}-${idx}`}
              positions={[trace.fromCoords, trace.toCoords]}
              pathOptions={{
                color: trace.improved ? '#A594F9' : '#67E8F9',
                weight: trace.improved ? 4 : 2.5,
                opacity: trace.improved ? 0.45 : 0.25,
                dashArray: trace.improved ? undefined : '4 6',
                lineCap: 'round',
              }}
            />
          ))}

        {/* 3. Final Shortest Path Glow + Crisp Emerald Core + Directional Flow */}
        {showFinalShortestPath && shortestPathPositions.length >= 2 && (
          <>
            {/* Outer Ambient Emerald Halo */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#4ADE80',
                weight: 12,
                opacity: 0.22,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Crisp Solid Emerald Path */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#4ADE80',
                weight: 4.5,
                opacity: 0.96,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Animated Directional Pulse Overlay */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#FFFFFF',
                weight: 2,
                opacity: 0.75,
                className: 'shortest-path-flow',
              }}
            />
          </>
        )}

        {/* 4. Graph Nodes */}
        {(graph.nodes || []).map((node) => {
          const isOrigin = node.id === sourceId;
          const isTarget = node.id === targetId;
          const isWaypoint = waypoints.includes(node.id);
          const isInOptimalPath = shortestPathNodeIds.has(node.id);
          const isVisited = visitedNodeIds.has(node.id);
          const isCurrentPop = activeStepNodeId === node.id;

          let fillColor = '#1C1C20';
          let strokeColor = '#71717A';
          let radius = 6.5;
          let strokeWeight = 2;

          if (isOrigin) {
            fillColor = '#A594F9';
            strokeColor = '#FFFFFF';
            radius = 9.5;
            strokeWeight = 3;
          } else if (isTarget) {
            fillColor = '#4ADE80';
            strokeColor = '#FFFFFF';
            radius = 9.5;
            strokeWeight = 3;
          } else if (isWaypoint) {
            fillColor = '#67E8F9';
            strokeColor = '#1A313D';
            radius = 8.5;
            strokeWeight = 2.5;
          } else if (isCurrentPop) {
            fillColor = '#F28B66';
            strokeColor = '#FFFFFF';
            radius = 9;
            strokeWeight = 2.5;
          } else if (isInOptimalPath) {
            fillColor = '#4ADE80';
            strokeColor = '#14331C';
            radius = 7.5;
            strokeWeight = 2.5;
          } else if (isVisited && layerSettings.showVisitedWave) {
            fillColor = '#A594F9';
            strokeColor = '#282249';
            radius = 7;
            strokeWeight = 2;
          }

          return (
            <React.Fragment key={node.id}>
              {/* Outer Halo for Origin / Destination / Active Relaxation Step */}
              {(isOrigin || isTarget || isCurrentPop) && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={17}
                  pathOptions={{
                    color: isOrigin
                      ? '#A594F9'
                      : isTarget
                      ? '#4ADE80'
                      : '#F28B66',
                    fillColor: isOrigin
                      ? '#A594F9'
                      : isTarget
                      ? '#4ADE80'
                      : '#F28B66',
                    fillOpacity: 0.18,
                    weight: 1,
                    opacity: 0.45,
                  }}
                />
              )}

              <CircleMarker
                center={[node.lat, node.lng]}
                radius={radius}
                pathOptions={{
                  color: strokeColor,
                  weight: strokeWeight,
                  fillColor,
                  fillOpacity: 1,
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    onSelectNode(node.id);
                  },
                }}
              >
                {layerSettings.showNodeLabels && (
                  <Tooltip
                    permanent={isOrigin || isTarget || isInOptimalPath}
                    direction="top"
                    offset={[0, -10]}
                    className={`node-label-pill ${
                      isOrigin
                        ? 'node-origin'
                        : isTarget
                        ? 'node-target'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] opacity-75">
                        {node.id}
                      </span>
                      <span>{node.shortName || node.name}</span>
                      {isOrigin && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/30 text-[#A594F9]">
                          START
                        </span>
                      )}
                      {isTarget && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/30 text-[#4ADE80]">
                          END
                        </span>
                      )}
                    </div>
                  </Tooltip>
                )}
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Top-Right Floating Map HUD Controls & Legend */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2.5 pointer-events-none">
        {/* Compact Telemetry & Legend Pill */}
        <div className="pointer-events-auto bg-[#141417]/90 backdrop-blur-xl border border-white/[0.08] rounded-full px-3.5 py-2 flex items-center gap-3 shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A594F9] inline-block shadow-[0_0_8px_#A594F9]" />
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] inline-block shadow-[0_0_8px_#4ADE80]" />
            <span>Optimal Path</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A594F9]/50 border border-[#A594F9] inline-block" />
            <span>Relaxed Wave</span>
          </div>
          <button
            onClick={onTriggerRecenter}
            title="Re-center Map Network"
            className="ml-1 w-7 h-7 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom Node Drop Active Mode Banner */}
        {isAddingCustomNode && (
          <div className="pointer-events-auto bg-[#282249]/95 backdrop-blur-xl border border-[#A594F9]/50 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-xs animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-[#A594F9] text-[#09090B] flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">
                Click anywhere on the map
              </div>
              <div className="text-[#A594F9] text-[11px]">
                Auto-connects via Haversine distance
              </div>
            </div>
            <button
              onClick={onCancelCustomNodeMode}
              className="ml-auto text-xs px-2.5 py-1 rounded-full bg-black/40 text-zinc-300 hover:text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
