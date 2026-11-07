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
import { LocateFixed, Navigation } from 'lucide-react';
import { NSUT_CAMPUS_CONFIG } from '../lib/dijkstra.js';

/**
 * Smooth camera controller + ResizeObserver projection lock.
 * Ensures Leaflet's pixel origin never drifts when flex layouts resize or zoom.
 */
function CameraController({ cameraTarget, routeBounds, fitTrigger, focusedTurn }) {
  const map = useMap();

  // Lock Leaflet container size on mount & resize to prevent marker/SVG projection drift
  useEffect(() => {
    const container = map.getContainer();
    const syncSize = () => {
      try {
        map.invalidateSize({ animate: false, pan: false });
      } catch {
        // Ignore
      }
    };

    syncSize();
    const rafId = requestAnimationFrame(syncSize);
    const timerId = setTimeout(syncSize, 250);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      observer = new ResizeObserver(() => {
        syncSize();
      });
      observer.observe(container);
    }

    window.addEventListener('resize', syncSize);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', syncSize);
    };
  }, [map]);

  useEffect(() => {
    if (focusedTurn && focusedTurn.coordinate && focusedTurn.coordinate.length === 2) {
      map.invalidateSize({ animate: false, pan: false });
      map.flyTo(focusedTurn.coordinate, 17, {
        duration: 0.8,
      });
      return;
    }

    if (cameraTarget && cameraTarget.center) {
      map.invalidateSize({ animate: false, pan: false });
      map.flyTo(cameraTarget.center, cameraTarget.zoom || 16, {
        duration: 0.9,
      });
    }
  }, [cameraTarget, focusedTurn, map]);

  useEffect(() => {
    if (routeBounds && routeBounds.length >= 2) {
      try {
        map.invalidateSize({ animate: false, pan: false });
        map.fitBounds(routeBounds, {
          paddingTopLeft: [70, 70],
          paddingBottomRight: [70, 90],
          maxZoom: 17,
          animate: true,
          duration: 0.8,
        });
      } catch {
        // Fallback
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
  showWalkwaysOnly = false,
  onSelectNode,
  cameraTarget,
  fitTrigger,
  onTriggerFitRoute,
  onFlyToCampus,
  focusedTurn,
  onSelectTurnStep,
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
        center={NSUT_CAMPUS_CONFIG.center}
        zoom={16}
        zoomControl={false}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
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
          focusedTurn={focusedTurn}
        />

        {/* 1. NSUT Dwarka Campus Boundary Ring (Non-interactive so it never blocks markers) */}
        <Circle
          center={NSUT_CAMPUS_CONFIG.center}
          radius={NSUT_CAMPUS_CONFIG.radiusMeters}
          interactive={false}
          pathOptions={{
            color: '#A594F9',
            weight: 1.5,
            opacity: 0.45,
            dashArray: '5 7',
            fillColor: '#14331C',
            fillOpacity: 0.08,
          }}
        />

        {/* 2. Optional Graph Mesh / Walkway Overlay */}
        {(showGraphMesh || showWalkwaysOnly) &&
          edges.map((edge) => {
            const u = nodesMap[edge.from];
            const v = nodesMap[edge.to];
            if (!u || !v) return null;
            if (showWalkwaysOnly && !edge.pedestrianOnly) return null;

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
                interactive={false}
                pathOptions={{
                  color: edge.pedestrianOnly
                    ? 'rgba(165, 148, 249, 0.5)'
                    : 'rgba(255, 255, 255, 0.16)',
                  weight: edge.pedestrianOnly ? 2.5 : 2,
                  dashArray: edge.pedestrianOnly ? '4 6' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })}

        {/* 3. Snapped Route Polyline (Follows exact OpenStreetMap road & footway geometry) */}
        {snappedRoutePositions.length >= 2 && (
          <>
            <Polyline
              positions={snappedRoutePositions}
              interactive={false}
              pathOptions={{
                color: primaryColor,
                weight: 12,
                opacity: 0.24,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={snappedRoutePositions}
              interactive={false}
              pathOptions={{
                color: primaryColor,
                weight: 5,
                opacity: 0.96,
                dashArray: isWalkMode ? '9 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {!isWalkMode && (
              <Polyline
                positions={snappedRoutePositions}
                interactive={false}
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

        {/* 4. Turn Maneuver Dots along Polyline */}
        {(routeResult?.turnByTurnSteps || []).map((step, idx) => {
          if (!step.coordinate || step.coordinate.length < 2) return null;
          const isFocused = focusedTurn?.step === step.step;
          return (
            <CircleMarker
              key={`turn-dot-${idx}`}
              center={step.coordinate}
              radius={isFocused ? 6.5 : 3.5}
              pathOptions={{
                color: isFocused ? '#FFFFFF' : primaryColor,
                fillColor: isFocused ? '#4ADE80' : '#FFFFFF',
                fillOpacity: 1,
                weight: isFocused ? 2.5 : 1.5,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  if (onSelectTurnStep) onSelectTurnStep(step);
                },
              }}
            >
              <Tooltip direction="top" className="navmap-node-tooltip">
                <span className="font-semibold">{step.instruction}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* 5. Focused Turn Pulse Highlight */}
        {focusedTurn && focusedTurn.coordinate && (
          <>
            <CircleMarker
              center={focusedTurn.coordinate}
              radius={18}
              interactive={false}
              pathOptions={{
                color: '#4ADE80',
                fillColor: '#4ADE80',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
            <CircleMarker
              center={focusedTurn.coordinate}
              radius={7}
              interactive={false}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#4ADE80',
                fillOpacity: 1,
                weight: 2.5,
              }}
            />
          </>
        )}

        {/* 6. Interactive Graph Nodes (Exact OpenStreetMap Building Coordinates) */}
        {nodes.map((node) => {
          const isOrigin = node.id === sourceId;
          const isTarget = node.id === targetId;
          const viaIndex = viaNodeIds.indexOf(node.id);
          const isViaStop = viaIndex !== -1;
          const isInPath = shortestPathNodeIds.has(node.id);
          const isCampusNode = Boolean(node.isCampus);

          let fillColor = isCampusNode ? '#282249' : '#1C1C20';
          let strokeColor = isCampusNode ? '#A594F9' : '#71717A';
          let radius = isCampusNode ? 7.5 : 6;
          let strokeWeight = isCampusNode ? 2.2 : 1.8;

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
              {(isOrigin || isTarget || isViaStop) && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={18}
                  interactive={false}
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
                    weight: 1,
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
                    <span>{node.shortName || node.name}</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Floating HUD Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2.5 pointer-events-none">
        <div className="pointer-events-auto bg-[#141417]/90 backdrop-blur-xl border border-white/[0.08] rounded-full px-3.5 py-2 flex items-center gap-3 shadow-2xl">
          <button
            onClick={onFlyToCampus}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#A594F9] hover:text-white transition"
          >
            <Navigation className="w-3.5 h-3.5 fill-[#A594F9]" />
            <span>NSUT Campus</span>
          </button>
          <span className="text-zinc-700">|</span>
          <button
            onClick={onTriggerFitRoute}
            title="Fit Route on Map"
            className="w-7 h-7 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
