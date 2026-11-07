import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { LocateFixed } from 'lucide-react';

/**
 * Controller to smoothly animate map camera when route or preset changes
 */
function CameraController({ center, zoom, bounds, recenterTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      try {
        map.fitBounds(bounds, {
          paddingTopLeft: [70, 70],
          paddingBottomRight: [70, 70],
          maxZoom: 16,
          animate: true,
          duration: 0.8,
        });
        return;
      } catch (e) {
        // Fallback to center/zoom if bounds fail
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
  routeResult,
  onSelectNode,
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

  // Determine path node sequence and positions
  const shortestPath = routeResult?.shortestPath || [];
  const shortestPathNodeIds = React.useMemo(() => {
    return new Set(shortestPath.map((n) => n.id));
  }, [shortestPath]);

  const shortestPathPositions = React.useMemo(() => {
    if (shortestPath.length < 2) return [];
    return shortestPath.map((n) => [n.lat, n.lng]);
  }, [shortestPath]);

  // Bounding box for camera centering
  const cameraBounds = React.useMemo(() => {
    if (shortestPathPositions.length >= 2) {
      return shortestPathPositions;
    }
    return null;
  }, [shortestPathPositions]);

  return (
    <div className="relative w-full h-full bg-[#09090B] select-none overflow-hidden">
      <MapContainer
        center={graph.center || [28.6085, 77.0352]}
        zoom={graph.zoom || 15}
        zoomControl={false}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* OpenStreetMap Standard Tiles (Rendered in pitch-black dark mode via CSS filter - ZERO WATERMARKS / NO API KEY) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <CameraController
          center={graph.center}
          zoom={graph.zoom}
          bounds={cameraBounds}
          recenterTrigger={recenterTrigger}
        />

        {/* 1. Base Graph Network Edges */}
        {edges.map((edge) => {
          const u = nodesMap[edge.from];
          const v = nodesMap[edge.to];
          if (!u || !v) return null;

          return (
            <Polyline
              key={edge.id}
              positions={[
                [u.lat, u.lng],
                [v.lat, v.lng],
              ]}
              pathOptions={{
                color: 'rgba(255, 255, 255, 0.16)',
                weight: 2,
                lineCap: 'round',
              }}
            >
              <Tooltip
                direction="center"
                className="navmap-edge-tooltip"
                opacity={0.8}
              >
                <span>{edge.distance}m</span>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Highlighted Dijkstra Shortest Path */}
        {shortestPathPositions.length >= 2 && (
          <>
            {/* Outer Glowing Halo */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#4ADE80',
                weight: 12,
                opacity: 0.25,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Solid Emerald Core */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#4ADE80',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Animated Flow Pulse */}
            <Polyline
              positions={shortestPathPositions}
              pathOptions={{
                color: '#FFFFFF',
                weight: 2.2,
                opacity: 0.8,
                className: 'route-dash-flow',
              }}
            />
          </>
        )}

        {/* 3. Interactive Graph Nodes */}
        {nodes.map((node) => {
          const isOrigin = node.id === sourceId;
          const isTarget = node.id === targetId;
          const isInPath = shortestPathNodeIds.has(node.id);

          let fillColor = '#1C1C20';
          let strokeColor = '#71717A';
          let radius = 6.5;
          let strokeWeight = 2;

          if (isOrigin) {
            fillColor = '#A594F9';
            strokeColor = '#FFFFFF';
            radius = 10;
            strokeWeight = 3;
          } else if (isTarget) {
            fillColor = '#4ADE80';
            strokeColor = '#FFFFFF';
            radius = 10;
            strokeWeight = 3;
          } else if (isInPath) {
            fillColor = '#4ADE80';
            strokeColor = '#14331C';
            radius = 8;
            strokeWeight = 2.5;
          }

          return (
            <React.Fragment key={node.id}>
              {/* Pulsing ring for Origin & Destination */}
              {(isOrigin || isTarget) && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={18}
                  pathOptions={{
                    color: isOrigin ? '#A594F9' : '#4ADE80',
                    fillColor: isOrigin ? '#A594F9' : '#4ADE80',
                    fillOpacity: 0.2,
                    weight: 1,
                    opacity: 0.5,
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
                  permanent={isOrigin || isTarget || isInPath}
                  direction="top"
                  offset={[0, -10]}
                  className={`navmap-node-tooltip ${
                    isOrigin ? 'origin' : isTarget ? 'destination' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] opacity-75">
                      {node.id}
                    </span>
                    <span>{node.shortName || node.name}</span>
                    {isOrigin && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-black/40 text-[#A594F9] font-bold">
                        FROM
                      </span>
                    )}
                    {isTarget && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-black/40 text-[#4ADE80] font-bold">
                        TO
                      </span>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Re-center Map Floating Action Button */}
      <button
        onClick={onTriggerRecenter}
        title="Re-center map"
        className="absolute top-4 right-4 z-[400] w-10 h-10 rounded-full bg-[#141417]/90 hover:bg-[#1C1C20] border border-white/10 backdrop-blur-xl flex items-center justify-center text-zinc-300 hover:text-white shadow-xl transition active:scale-95"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
    </div>
  );
}
