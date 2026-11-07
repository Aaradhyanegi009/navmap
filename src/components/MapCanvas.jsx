import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { LocateFixed, PlusCircle } from 'lucide-react';

/**
 * Smooth camera controller that fits the road-snapped polyline bounds.
 */
function CameraController({ center, zoom, bounds, recenterTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      try {
        map.fitBounds(bounds, {
          paddingTopLeft: [60, 60],
          paddingBottomRight: [60, 80],
          maxZoom: 16,
          animate: true,
          duration: 0.75,
        });
        return;
      } catch {
        // Fallback to center/zoom
      }
    }
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [center, zoom, bounds, recenterTrigger, map]);

  return null;
}

export default function MapCanvas({
  graph,
  sourceId,
  targetId,
  viaNodeIds = [],
  mode = 'car',
  routeResult,
  isAddingViaStop,
  onSelectNode,
  onCancelViaMode,
  recenterTrigger,
  onTriggerRecenter,
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

  // Use the real OSRM road-snapped polyline coordinates (never 2-point straight lines)
  const snappedRoutePositions = React.useMemo(() => {
    if (
      Array.isArray(routeResult?.roadGeometry) &&
      routeResult.roadGeometry.length >= 2
    ) {
      return routeResult.roadGeometry;
    }
    return [];
  }, [routeResult]);

  // Also grab inactive mode road geometry for subtle ghost comparison line
  const secondaryComparisonPositions = React.useMemo(() => {
    const otherMode = mode === 'car' ? 'walk' : 'car';
    const otherGeo = routeResult?.comparison?.[otherMode]?.roadGeometry;
    if (Array.isArray(otherGeo) && otherGeo.length >= 2) {
      return otherGeo;
    }
    return [];
  }, [routeResult, mode]);

  const isWalkMode = mode === 'walk';
  const primaryColor = isWalkMode ? '#A594F9' : '#4ADE80';

  return (
    <div className="relative w-full h-full bg-[#09090B] select-none overflow-hidden">
      <MapContainer
        center={graph.center || [28.6095, 77.0352]}
        zoom={graph.zoom || 15}
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
          center={graph.center}
          zoom={graph.zoom}
          bounds={snappedRoutePositions}
          recenterTrigger={recenterTrigger}
        />

        {/* 1. Background Graph Edges Using Multi-Point Road-Snapped Waypoints */}
        {edges.map((edge) => {
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

          const isPedestrianShortcut = Boolean(edge.pedestrianOnly);

          return (
            <Polyline
              key={edge.id}
              positions={edgePositions}
              pathOptions={{
                color: isPedestrianShortcut
                  ? 'rgba(165, 148, 249, 0.28)'
                  : 'rgba(255, 255, 255, 0.14)',
                weight: isPedestrianShortcut ? 2 : 2.2,
                dashArray: isPedestrianShortcut ? '4 6' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Tooltip
                direction="center"
                className="navmap-edge-tooltip"
                opacity={0.85}
              >
                <span>
                  {edge.roadName} · {edge.distance}m
                  {isPedestrianShortcut ? ' (Walk Shortcut)' : ''}
                </span>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Subtle Secondary Comparison Route (Alternative Travel Mode) */}
        {secondaryComparisonPositions.length >= 2 && (
          <Polyline
            positions={secondaryComparisonPositions}
            pathOptions={{
              color: isWalkMode ? '#4ADE80' : '#A594F9',
              weight: 3,
              opacity: 0.22,
              dashArray: '5 7',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

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

        {/* 4. Interactive Graph Nodes (Origin 'A', Via Stops '1, 2...', Destination 'B') */}
        {nodes.map((node) => {
          const isOrigin = node.id === sourceId;
          const isTarget = node.id === targetId;
          const viaIndex = viaNodeIds.indexOf(node.id);
          const isViaStop = viaIndex !== -1;
          const isInPath = shortestPathNodeIds.has(node.id);

          let fillColor = '#1C1C20';
          let strokeColor = '#71717A';
          let radius = 6.5;
          let strokeWeight = 2;

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
            radius = 7.5;
            strokeWeight = 2.2;
          }

          return (
            <React.Fragment key={node.id}>
              {/* Pulsing Halo Ring for Origin (A), Via Stops (1..n), and Destination (B) */}
              {(isOrigin || isTarget || isViaStop) && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={18}
                  pathOptions={{
                    color: isOrigin
                      ? '#4ADE80'
                      : isViaStop
                      ? '#A594F9'
                      : '#F28B66',
                    fillColor: isOrigin
                      ? '#4ADE80'
                      : isViaStop
                      ? '#A594F9'
                      : '#F28B66',
                    fillOpacity: 0.22,
                    weight: 1.2,
                    opacity: 0.55,
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
                  permanent={isOrigin || isTarget || isViaStop || isInPath}
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
                    {!isOrigin && !isViaStop && !isTarget && (
                      <span className="font-mono text-[10px] opacity-70">
                        {node.id}
                      </span>
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
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] inline-block" />
            <span>Origin (A)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A594F9] inline-block" />
            <span>Via (1, 2)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28B66] inline-block" />
            <span>Dest (B)</span>
          </div>
          <button
            onClick={onTriggerRecenter}
            title="Fit Route on Map"
            className="ml-1 w-7 h-7 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Via Stop Map Selection Banner */}
        {isAddingViaStop && (
          <div className="pointer-events-auto bg-[#282249]/95 backdrop-blur-xl border border-[#A594F9]/50 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
            <PlusCircle className="w-4 h-4 text-[#A594F9] shrink-0" />
            <span className="text-xs font-semibold text-white">
              Tap any node on the map to insert as a Via stop
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
