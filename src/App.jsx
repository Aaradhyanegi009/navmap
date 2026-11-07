import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCw,
  ChevronUp,
  ChevronDown,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_GRAPH,
  GRAPH_PRESETS,
  haversineDistance,
} from './lib/dijkstra.js';
import {
  fetchGraphTopology,
  requestDijkstraRoute,
} from './lib/apiClient.js';
import MapCanvas from './components/MapCanvas.jsx';
import NavigateTab from './components/NavigateTab.jsx';
import VisualizerTab from './components/VisualizerTab.jsx';
import GraphEditorTab from './components/GraphEditorTab.jsx';
import ApiInspectorTab from './components/ApiInspectorTab.jsx';
import LayersTab from './components/LayersTab.jsx';
import BottomDock from './components/BottomDock.jsx';

export default function App() {
  // Active Dock Tab: 'navigate' | 'visualizer' | 'editor' | 'api' | 'layers'
  const [activeTab, setActiveTab] = useState('navigate');

  // Graph Topology State
  const [activePreset, setActivePreset] = useState('nsut');
  const [graph, setGraph] = useState(DEFAULT_GRAPH);
  const [graphApiMeta, setGraphApiMeta] = useState(null);

  // Routing State
  const [sourceId, setSourceId] = useState('N2'); // Dwarka Mor Metro
  const [targetId, setTargetId] = useState('N13'); // Akash Hospital Chowk
  const [waypoints, setWaypoints] = useState([]);
  const [mode, setMode] = useState('distance'); // 'distance' | 'time'
  const [nextClickRole, setNextClickRole] = useState('source'); // 'source' | 'target'

  // Dijkstra API Response & Telemetry State
  const [routeResult, setRouteResult] = useState(null);
  const [apiLatencyMs, setApiLatencyMs] = useState(4);
  const [lastRoutedTime, setLastRoutedTime] = useState('12:27');
  const [isRouting, setIsRouting] = useState(false);

  // Relaxation Wave Animation State
  const [activeStepIndex, setActiveStepIndex] = useState(null);
  const [isPlayingWave, setIsPlayingWave] = useState(false);
  const waveTimerRef = useRef(null);

  // Map Layers & Custom Node Mode
  const [layerSettings, setLayerSettings] = useState({
    showVisitedWave: true,
    showEdgeWeights: true,
    showTrafficColors: false,
    showNodeLabels: true,
    tileStyle: 'dark',
  });
  const [isAddingCustomNode, setIsAddingCustomNode] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(true);

  // Format current header date like "Saturday, 7 November"
  const formattedHeaderDate = React.useMemo(() => {
    try {
      const now = new Date();
      return now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return 'Saturday, 7 November';
    }
  }, []);

  // Stop wave playback timer helper
  const clearWaveTimer = useCallback(() => {
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    setIsPlayingWave(false);
  }, []);

  // Animate Dijkstra exploration wave from step 1 to visitedOrder.length
  const startWaveAnimation = useCallback(
    (totalSteps) => {
      clearWaveTimer();
      if (!totalSteps || totalSteps <= 0) {
        setActiveStepIndex(null);
        return;
      }

      setActiveStepIndex(1);
      setIsPlayingWave(true);

      waveTimerRef.current = setInterval(() => {
        setActiveStepIndex((prev) => {
          const next = (prev || 0) + 1;
          if (next >= totalSteps) {
            clearWaveTimer();
            return totalSteps;
          }
          return next;
        });
      }, 110);
    },
    [clearWaveTimer]
  );

  useEffect(() => {
    return () => clearWaveTimer();
  }, [clearWaveTimer]);

  // Execute GET /api/graph when preset changes
  const loadGraphPreset = useCallback(async (presetKey) => {
    const data = await fetchGraphTopology(presetKey);
    if (data?.graph) {
      setGraph(data.graph);
      setGraphApiMeta(data);
      setApiLatencyMs(data.roundTripMs || 4);
      const nodes = data.graph.nodes || [];
      if (nodes.length >= 2) {
        const defaultSrc = nodes[1]?.id || nodes[0].id;
        const defaultDst = nodes[nodes.length - 3]?.id || nodes[nodes.length - 1].id;
        setSourceId(defaultSrc);
        setTargetId(defaultDst);
        setWaypoints([]);
      }
    }
  }, []);

  useEffect(() => {
    loadGraphPreset(activePreset);
  }, [activePreset, loadGraphPreset]);

  // Execute POST /api/navigate whenever sourceId, targetId, mode, waypoints, or graph changes
  const runNavigation = useCallback(
    async (overrideParams = {}) => {
      const src =
        overrideParams.sourceId !== undefined ? overrideParams.sourceId : sourceId;
      const dst =
        overrideParams.targetId !== undefined ? overrideParams.targetId : targetId;
      const activeMode = overrideParams.mode || mode;
      const activeWps = overrideParams.waypoints || waypoints;
      const activeGraphObj = overrideParams.graph || graph;

      if (!src || !dst || src === dst) {
        setRouteResult(null);
        setActiveStepIndex(null);
        return;
      }

      setIsRouting(true);
      const res = await requestDijkstraRoute({
        sourceId: src,
        targetId: dst,
        mode: activeMode,
        waypoints: activeWps,
        preset: activePreset,
        customGraph: activeGraphObj,
      });
      setIsRouting(false);

      setRouteResult(res);
      setApiLatencyMs(res.roundTripMs || 4);
      const now = new Date();
      setLastRoutedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );

      if (res.visitedOrder?.length) {
        startWaveAnimation(res.visitedOrder.length);
      }
    },
    [sourceId, targetId, mode, waypoints, graph, activePreset, startWaveAnimation]
  );

  useEffect(() => {
    if (sourceId && targetId && sourceId !== targetId) {
      runNavigation();
    }
  }, [sourceId, targetId, mode, waypoints, graph, runNavigation]);

  // Handle clicking a node directly on the Leaflet map
  const handleSelectMapNode = (nodeId) => {
    if (isAddingCustomNode) return;
    if (!sourceId || (sourceId && targetId && nextClickRole === 'source')) {
      if (nodeId === targetId) {
        setTargetId(sourceId);
      }
      setSourceId(nodeId);
      setNextClickRole('target');
    } else {
      if (nodeId === sourceId) return;
      setTargetId(nodeId);
      setNextClickRole('source');
    }
  };

  // Swap Origin & Destination
  const handleSwapNodes = () => {
    if (!sourceId && !targetId) return;
    const prevSrc = sourceId;
    setSourceId(targetId);
    setTargetId(prevSrc);
  };

  // Reset all waypoints and clear route (or restore default)
  const handleResetAll = () => {
    clearWaveTimer();
    setWaypoints([]);
    setSourceId('');
    setTargetId('');
    setRouteResult(null);
    setActiveStepIndex(null);
    setNextClickRole('source');
  };

  // Refresh / Re-run current route or restore preset default route
  const handleRefreshEngine = () => {
    if (!sourceId || !targetId) {
      const nodes = graph?.nodes || [];
      if (nodes.length >= 2) {
        setSourceId(nodes[1]?.id || nodes[0].id);
        setTargetId(nodes[nodes.length - 3]?.id || nodes[nodes.length - 1].id);
      }
    } else {
      runNavigation();
    }
  };

  // Add a custom node at [lat, lng] on the map and auto-connect to 2 nearest existing nodes via Haversine
  const handleAddCustomNodeAtCoords = (lat, lng) => {
    const existingNodes = graph.nodes || [];
    const newIndex = existingNodes.length + 1;
    const newNodeId = `N${newIndex}`;

    // Find 2 nearest existing nodes by Haversine distance
    const ranked = existingNodes
      .map((n) => ({
        node: n,
        dist: haversineDistance(lat, lng, n.lat, n.lng),
      }))
      .sort((a, b) => a.dist - b.dist);

    const nearest = ranked.slice(0, 2);

    const newNode = {
      id: newNodeId,
      name: `Custom Waypoint ${newNodeId}`,
      shortName: `Custom ${newNodeId}`,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      category: 'Custom',
      zone: 'User Added',
    };

    const newEdges = nearest.map((item, idx) => ({
      id: `EC_${newNodeId}_${idx + 1}`,
      from: newNodeId,
      to: item.node.id,
      roadName: `Custom Link → ${item.node.shortName}`,
      distance: item.dist,
      trafficMultiplier: 1.0,
      bidirectional: true,
    }));

    const updatedGraph = {
      ...graph,
      nodes: [...existingNodes, newNode],
      edges: [...(graph.edges || []), ...newEdges],
    };

    setGraph(updatedGraph);
    setTargetId(newNodeId);
    if (!sourceId && existingNodes.length > 0) {
      setSourceId(existingNodes[0].id);
    }
    setIsAddingCustomNode(false);
  };

  // Update edge traffic multiplier in Graph Editor
  const handleUpdateEdgeTraffic = (edgeId, newTrafficMultiplier) => {
    setGraph((prev) => ({
      ...prev,
      edges: (prev.edges || []).map((e) =>
        e.id === edgeId
          ? { ...e, trafficMultiplier: Number(newTrafficMultiplier) }
          : e
      ),
    }));
  };

  // Add custom edge in Graph Editor
  const handleAddCustomEdge = ({ from, to, distance, trafficMultiplier, roadName }) => {
    const edgeId = `EC_${from}_${to}_${Date.now().toString().slice(-3)}`;
    setGraph((prev) => ({
      ...prev,
      edges: [
        {
          id: edgeId,
          from,
          to,
          distance,
          trafficMultiplier,
          roadName,
          bidirectional: true,
        },
        ...(prev.edges || []),
      ],
    }));
  };

  // Toggle Map Layer setting
  const handleToggleLayer = (key) => {
    setLayerSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangeTileStyle = (tileStyle) => {
    setLayerSettings((prev) => ({
      ...prev,
      tileStyle,
    }));
  };

  return (
    <div className="w-screen h-screen bg-[#09090B] text-white flex flex-col lg:flex-row overflow-hidden select-none">
      {/* =====================================================================
          LEFT CONTROL COLUMN (410px on Desktop, Collapsible Drawer on Mobile)
         ===================================================================== */}
      <aside
        className={`w-full lg:w-[415px] xl:w-[430px] shrink-0 obsidian-ambient-bg border-b lg:border-b-0 lg:border-r border-white/[0.07] flex flex-col z-20 transition-all duration-300 ${
          mobileSheetExpanded ? 'h-[64vh] lg:h-full' : 'h-[195px] lg:h-full'
        }`}
      >
        {/* 1. STRICT ANDROID 16 HEADER BLOCK */}
        <header className="px-6 pt-6 pb-3 shrink-0">
          {/* Top Meta Line + Profile Avatar */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400 font-medium tracking-normal">
              {formattedHeaderDate}
            </span>

            <div className="flex items-center gap-2">
              {/* Mobile Collapse Sheet Button */}
              <button
                onClick={() => setMobileSheetExpanded((v) => !v)}
                className="lg:hidden w-8 h-8 rounded-full bg-[#1C1C20] border border-white/10 flex items-center justify-center text-zinc-300"
                title="Toggle Map / Panel Height"
              >
                {mobileSheetExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>

              {/* Profile Badge matching top-right avatar in screenshot */}
              <div
                title="Aaradhya Negi · NSUT (Projects 14 & 15)"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#282249] via-[#14331C] to-[#1C1C20] border border-white/15 flex items-center justify-center text-xs font-bold text-white shadow-md"
              >
                AN
              </div>
            </div>
          </div>

          {/* Main App Title: NavMap */}
          <div className="mt-0.5 flex items-baseline justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              NavMap
            </h1>
            <span className="text-[11px] font-mono text-zinc-500">
              EXP 14 · 15
            </span>
          </div>

          {/* Status Pills Row */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Pill 1: Engine Version */}
              <div className="px-3.5 py-1.5 rounded-full bg-[#141417] border border-white/[0.07] text-xs font-bold text-white tracking-tight">
                Dijkstra Engine · v1.0
              </div>

              {/* Pill 2: Live API Status Indicator with Warm Coral/Amber or Emerald Dot */}
              <button
                onClick={() => setActiveTab('api')}
                className="px-3.5 py-1.5 rounded-full bg-[#18181C] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-zinc-200 flex items-center gap-2 transition"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRouting
                      ? 'bg-[#4ADE80] animate-ping'
                      : 'bg-[#F28B66] shadow-[0_0_8px_#F28B66]'
                  }`}
                />
                <span>API connected · {apiLatencyMs}ms</span>
              </button>
            </div>

            {/* Far Right Circular Refresh / Reset Button (#1C1C20) */}
            <button
              onClick={handleRefreshEngine}
              title="Recalculate Dijkstra Route"
              className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white shrink-0 transition active:rotate-180"
            >
              <RotateCw
                className={`w-4 h-4 ${isRouting ? 'animate-spin text-[#A594F9]' : ''}`}
              />
            </button>
          </div>
        </header>

        {/* 2. SCROLLABLE CARD STACK CONTAINER */}
        <main className="flex-1 overflow-y-auto px-5 pt-2">
          {activeTab === 'navigate' && (
            <NavigateTab
              graph={graph}
              presets={GRAPH_PRESETS}
              activePreset={activePreset}
              onSelectPreset={(id) => {
                setActivePreset(id);
                setRecenterTrigger((c) => c + 1);
              }}
              sourceId={sourceId}
              targetId={targetId}
              waypoints={waypoints}
              mode={mode}
              onChangeSource={setSourceId}
              onChangeTarget={setTargetId}
              onSwapNodes={handleSwapNodes}
              onChangeMode={setMode}
              onToggleWaypoint={(wpId) =>
                setWaypoints((prev) =>
                  prev.includes(wpId)
                    ? prev.filter((x) => x !== wpId)
                    : [...prev, wpId]
                )
              }
              onResetAll={handleResetAll}
              routeResult={routeResult}
              lastRoutedTime={lastRoutedTime}
              onOpenApiInspector={() => setActiveTab('api')}
              onOpenVisualizer={() => setActiveTab('visualizer')}
              onStartAddCustomNode={() => setIsAddingCustomNode(true)}
            />
          )}

          {activeTab === 'visualizer' && (
            <VisualizerTab
              routeResult={routeResult}
              activeStepIndex={activeStepIndex}
              isPlaying={isPlayingWave}
              onPlayPause={() => {
                if (isPlayingWave) {
                  clearWaveTimer();
                } else {
                  startWaveAnimation(routeResult?.visitedOrder?.length || 0);
                }
              }}
              onStepForward={() => {
                clearWaveTimer();
                const max = routeResult?.visitedOrder?.length || 0;
                setActiveStepIndex((prev) => Math.min(max, (prev || 0) + 1));
              }}
              onStepBack={() => {
                clearWaveTimer();
                setActiveStepIndex((prev) => Math.max(1, (prev || 1) - 1));
              }}
              onResetReplay={() =>
                startWaveAnimation(routeResult?.visitedOrder?.length || 0)
              }
              onScrubStep={(step) => {
                clearWaveTimer();
                setActiveStepIndex(step);
              }}
            />
          )}

          {activeTab === 'editor' && (
            <GraphEditorTab
              graph={graph}
              onUpdateEdgeTraffic={handleUpdateEdgeTraffic}
              onAddCustomEdge={handleAddCustomEdge}
              onStartAddCustomNode={() => setIsAddingCustomNode(true)}
              onResetGraphToPreset={() => loadGraphPreset(activePreset)}
            />
          )}

          {activeTab === 'api' && (
            <ApiInspectorTab
              sourceId={sourceId}
              targetId={targetId}
              mode={mode}
              activePreset={activePreset}
              routeResult={routeResult}
              graphApiMeta={graphApiMeta}
              onTriggerLiveNavigate={() => runNavigation()}
              onTriggerLiveGraphFetch={() => loadGraphPreset(activePreset)}
            />
          )}

          {activeTab === 'layers' && (
            <LayersTab
              layerSettings={layerSettings}
              onToggleLayer={handleToggleLayer}
              onChangeTileStyle={handleChangeTileStyle}
            />
          )}
        </main>

        {/* 3. BOTTOM FLOATING NAVIGATION DOCK + DETACHED LAVENDER FAB */}
        <footer className="px-5 py-3.5 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent shrink-0">
          <BottomDock
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onFabClick={() => setIsAddingCustomNode((prev) => !prev)}
            isAddingCustomNode={isAddingCustomNode}
          />
        </footer>
      </aside>

      {/* =====================================================================
          RIGHT FULL-BLEED INTERACTIVE LEAFLET DARK MAP CANVAS
         ===================================================================== */}
      <section className="flex-1 h-full relative z-10">
        <MapCanvas
          graph={graph}
          sourceId={sourceId}
          targetId={targetId}
          waypoints={waypoints}
          routeResult={routeResult}
          activeStepIndex={activeStepIndex}
          isAnimatingWave={isPlayingWave}
          layerSettings={layerSettings}
          isAddingCustomNode={isAddingCustomNode}
          onSelectNode={handleSelectMapNode}
          onMapClickAddNode={handleAddCustomNodeAtCoords}
          onCancelCustomNodeMode={() => setIsAddingCustomNode(false)}
          recenterTrigger={recenterTrigger}
          onTriggerRecenter={() => setRecenterTrigger((c) => c + 1)}
        />
      </section>
    </div>
  );
}
