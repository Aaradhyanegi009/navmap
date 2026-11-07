import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { LocateFixed, PlusCircle, Star } from 'lucide-react';
import { PRIORITY_HUB_CONFIG } from '../lib/dijkstra.js';

/**
 * Smooth camera controller that handles both region chip flyTo and route bounds fitting.
 */
function CameraController({ cameraTarget, routeBounds, fitTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (cameraTarget && cameraTarget.center) {
      map.flyTo(cameraTarget.center, cameraTarget.zoom || 13, {
        duration: 0.85,
      });
    }
  }, [cameraTarget, map]);

  useEffect(() => {
    if (routeBounds && routeBounds.length >= 2) {
      try {
        map.fitBounds(routeBounds, {
          paddingTopLeft: [65, 65],
          paddingBottomRight: [65, 85],
          maxZoom: 15,
          animate: true,
          duration: 0.8,
        });
      } catch {
        // Ignore bounds error if map not ready
      }
    }
  }, [routeBounds, fitTrigger, map]);

  return null;
}

export default function MapCanvas({
  graph,
  sourceId,
  targetId,
  viaNodeIds = [],
  mode = 'car',
  routeResult,
  showGraphMesh = false,
  isAddingViaStop = false,
  onSelectNode,
  onCancelViaMode,
  cameraTarget,
  fitTrigger,
  onTriggerFitRoute,
  onFlyToNsutHub,
}) {
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const nodesMap = React.useMemo(() => {
    const map = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const shortestPath = routeResult?.shortestPath || [];
  const shortestPathNodeIds = React.useMemo(
    () => new Set(shortestPath.map((n) => n.id)),
    [shortestPath]
  );

  // Snapped street polyline coordinates
  const snappedRoutePositions = React.useMemo(() => {
    if (
      Array.isArray(routeResult?.roadGeometry) &&
      routeResult.roadGeometry.length >= 2
    ) {
      return routeResult.roadGeometry;
    }
    return [];
  }, [routeResult]);

  const isWalkMode = mode === 'walk';
  const primaryColor = isWalkMode ? '#A594F9' : '#4ADE80';

  return (
    <div className="relative w-full h-full bg-[#09090B] select-none overflow-hidden">
      <MapContainer
        center={PRIORITY_HUB_CONFIG.center}
        zoom={13}
        zoomControl={false}
        className={`w-full h-full ${
          isAddingViaStop
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Dark-filtered OpenStreetMap tiles (zero watermarks, no API key required) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <CameraController
          cameraTarget={cameraTarget}
          routeBounds={snappedRoutePositions}
          fitTrigger={fitTrigger}
        />

        {/* 1. NSUT DWARKA "CIRCLE OF IMPORTANCE" GEODESIC BOUNDARY RING */}
        <Circle
          center={PRIORITY_HUB_CONFIG.center}
          radius={PRIORITY_HUB_CONFIG.radiusMeters}
          pathOptions={{
            color: '#A594F9',
            weight: 1.8,
            opacity: 0.65,
            dashArray: '6 8',
            fillColor: '#14331C',
            fillOpacity: 0.14,
          }}
        >
          <Tooltip
            direction="top"
            sticky
            className="navmap-node-tooltip origin"
          >
            <span>⭐ {PRIORITY_HUB_CONFIG.name} (3.5 km Priority Zone)</span>
          </Tooltip>
        </Circle>

        {/* 2. Optional Graph Topology Layer (Hidden by default so map stays ultra-clean) */}
        {showGraphMesh &&
          edges.map((edge) => {
            const u = nodesMap[edge.from];
            const v = nodesMap[edge.to];
            if (!u || !v) return null;

            const edgePositions =
              Array.isArray(edge.waypoints) && edge.waypoints.length >= 2
                ? edge.waypoints
                : [
                    [u.lat, u.lng],
                    [v.lat, v.lng],
                  ];

            return (
              <Polyline
                key={edge.id}
                positions={edgePositions}
                pathOptions={{
                  color: edge.pedestrianOnly
                    ? 'rgba(165, 148, 249, 0.35)'
                    : 'rgba(255, 255, 255, 0.16)',
                  weight: 2,
                  dashArray: edge.pedestrianOnly ? '4 6' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })}

        {/* 3. Active Snapped Street Route Polyline (Solid Emerald for Car, Dashed Lavender for Walk) */}
        {snappedRoutePositions.length >= 2 && (
          <>
            {/* Outer Ambient Glow */}
            <Polyline
              positions={snappedRoutePositions}
              pathOptions={{
                color: primaryColor,
                weight: 13,
                opacity: 0.24,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main Street-Snapped Path */}
            <Polyline
              positions={snappedRoutePositions}
              pathOptions={{
                color: primaryColor,
                weight: 5,
                opacity: 0.96,
                dashArray: isWalkMode ? '9 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Directional Flow Pulse for Car Mode */}
            {!isWalkMode && (
              <Polyline
                positions={snappedRoutePositions}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 2,
                  opacity: 0.75,
                  className: 'route-dash-flow',
                }}
              />
            )}
          </>
        )}

        {/* 4. Interactive Pan-New Delhi & NSUT Priority Hub Nodes */}
        {nodes.map((node) => {
          const isOrigin = node.id === sourceId;
          const isTarget = node.id === targetId;
          const viaIndex = viaNodeIds.indexOf(node.id);
          const isViaStop = viaIndex !== -1;
          const isInPath = shortestPathNodeIds.has(node.id);
          const isPriorityHub = Boolean(node.isPriorityHub);

          let fillColor = isPriorityHub ? '#282249' : '#1C1C20';
          let strokeColor = isPriorityHub ? '#A594F9' : '#71717A';
          let radius = isPriorityHub ? 7.5 : 6;
          let strokeWeight = isPriorityHub ? 2.2 : 1.8;

          if (isOrigin) {
            fillColor = '#4ADE80';
            strokeColor = '#FFFFFF';
            radius = 10.5;
            strokeWeight = 3;
          } else if (isViaStop) {
            fillColor = '#A594F9';
            strokeColor = '#FFFFFF';
            radius = 9.5;
            strokeWeight = 3;
          } else if (isTarget) {
            fillColor = '#F28B66';
            strokeColor = '#FFFFFF';
            radius = 10.5;
            strokeWeight = 3;
          } else if (isInPath) {
            fillColor = primaryColor;
            strokeColor = '#09090B';
            radius = 8;
            strokeWeight = 2.4;
          }

          return (
            <React.Fragment key={node.id}>
              {/* Outer Halo Ring for Origin, Via, Target, or NSUT Priority Hub Nodes */}
              {(isOrigin || isTarget || isViaStop || isPriorityHub) && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={isOrigin || isTarget || isViaStop ? 18 : 13}
                  pathOptions={{
                    color: isOrigin
                      ? '#4ADE80'
                      : isViaStop
                      ? '#A594F9'
                      : isTarget
                      ? '#F28B66'
                      : '#A594F9',
                    fillColor: isOrigin
                      ? '#4ADE80'
                      : isViaStop
                      ? '#A594F9'
                      : isTarget
                      ? '#F28B66'
                      : '#A594F9',
                    fillOpacity: isOrigin || isTarget || isViaStop ? 0.22 : 0.1,
                    weight: 1,
                    opacity: isOrigin || isTarget || isViaStop ? 0.55 : 0.35,
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
                <Tooltip
                  permanent={isOrigin || isTarget || isViaStop}
                  direction="top"
                  offset={[0, -10]}
                  className={`navmap-node-tooltip ${
                    isOrigin
                      ? 'destination'
                      : isViaStop
                      ? 'origin'
                      : isTarget
                      ? 'destination'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isOrigin && (
                      <span className="w-4 h-4 rounded-full bg-[#4ADE80] text-[#09090B] text-[10px] font-extrabold flex items-center justify-center">
                        A
                      </span>
                    )}
                    {isViaStop && (
                      <span className="w-4 h-4 rounded-full bg-[#A594F9] text-[#09090B] text-[10px] font-extrabold flex items-center justify-center">
                        {viaIndex + 1}
                      </span>
                    )}
                    {isTarget && (
                      <span className="w-4 h-4 rounded-full bg-[#F28B66] text-[#09090B] text-[10px] font-extrabold flex items-center justify-center">
                        B
                      </span>
                    )}
                    {!isOrigin && !isViaStop && !isTarget && isPriorityHub && (
                      <span className="text-[#A594F9] text-[10px]">★</span>
                    )}
                    <span>{node.shortName || node.name}</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Top-Right Map HUD Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2.5 pointer-events-none">
        <div className="pointer-events-auto bg-[#141417]/90 backdrop-blur-xl border border-white/[0.08] rounded-full px-3.5 py-2 flex items-center gap-3 shadow-2xl">
          <button
            onClick={onFlyToNsutHub}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#A594F9] hover:text-white transition"
          >
            <Star className="w-3.5 h-3.5 fill-[#A594F9]" />
            <span>NSUT Priority Circle</span>
          </button>
          <span className="text-zinc-700">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] inline-block" />
            <span>Origin (A)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28B66] inline-block" />
            <span>Dest (B)</span>
          </div>
          <button
            onClick={onTriggerFitRoute}
            title="Fit Active Route on Map"
            className="w-7 h-7 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {isAddingViaStop && (
          <div className="pointer-events-auto bg-[#282249]/95 backdrop-blur-xl border border-[#A594F9]/50 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
            <PlusCircle className="w-4 h-4 text-[#A594F9] shrink-0" />
            <span className="text-xs font-semibold text-white">
              Tap any Delhi node on the map to insert as a Via stop
            </span>
            <button
              onClick={onCancelViaMode}
              className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-zinc-300 hover:text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
