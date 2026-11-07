import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCw,
  ArrowUpDown,
  Car,
  Footprints,
  Home,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Layers,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DEFAULT_GRAPH,
  NSUT_CAMPUS_CONFIG,
  DELHI_VIEW_CONFIG,
  injectCustomNode,
} from './lib/dijkstra.js';
import { fetchGraphTopology, requestDijkstraRoute } from './lib/apiClient.js';
import MapCanvas from './components/MapCanvas.jsx';
import SearchCombobox from './components/SearchCombobox.jsx';

function formatDuration(minutes) {
  const mins = Math.max(1, Math.round(Number(minutes) || 0));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function App() {
  // Purge any stale cache on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem('navmap_v4_cache');
      if (v !== 'v4_clean') {
        localStorage.clear();
        localStorage.setItem('navmap_v4_cache', 'v4_clean');
      }
    } catch {
      // Ignore
    }
  }, []);

  // 4 Clean Dock Tabs: 'navigate' | 'campus' | 'playback' | 'layers'
  const [activeTab, setActiveTab] = useState('navigate');

  // Unified Two-Tier Graph
  const [graph, setGraph] = useState(DEFAULT_GRAPH);

  // Routing State: Origin (A), Destination (B), Intermediate Via Stops (1..n)
  const [sourceId, setSourceId] = useState('nsut_admin');
  const [targetId, setTargetId] = useState('nsut_sports');
  const [viaNodeIds, setViaNodeIds] = useState([]);
  const [mode, setMode] = useState('walk'); // 'car' | 'walk'

  // Route Results & Computation
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Map Camera Target & Trigger
  const [cameraTarget, setCameraTarget] = useState({
    center: NSUT_CAMPUS_CONFIG.center,
    zoom: NSUT_CAMPUS_CONFIG.zoom,
    tick: 1,
  });
  const [fitTrigger, setFitTrigger] = useState(0);

  // Layer Toggles
  const [showGraphMesh, setShowGraphMesh] = useState(false);
  const [showWalkwaysOnly, setShowWalkwaysOnly] = useState(false);

  // Dijkstra Playback Animation State
  const [playbackStep, setPlaybackStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // UI State
  const [showTurnSteps, setShowTurnSteps] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(true);

  const nodes = graph?.nodes || [];
  const nodesMap = useMemo(() => {
    const map = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const sourceNode = nodesMap[sourceId];
  const targetNode = nodesMap[targetId];

  // Load Graph from /api/graph on mount
  useEffect(() => {
    fetchGraphTopology().then((res) => {
      if (res?.graph?.nodes?.length) {
        setGraph(res.graph);
      }
    });
  }, []);

  // Execute Chained Dijkstra + OSRM via /api/navigate
  const executeNavigation = useCallback(async () => {
    if (!sourceId || !targetId || sourceId === targetId) {
      setRouteResult(null);
      return;
    }

    setIsRouting(true);
    const res = await requestDijkstraRoute({
      sourceId,
      targetId,
      viaNodeIds,
      mode,
      customGraph: graph,
    });
    setIsRouting(false);

    setRouteResult(res);
    setPlaybackStep(res?.visitedOrder?.length || 0);
  }, [sourceId, targetId, viaNodeIds, mode, graph]);

  useEffect(() => {
    executeNavigation();
  }, [executeNavigation]);

  // Handle Dynamic Geocoded Result Injection (from Nominatim)
  const handleSelectCustomLocation = (customNode, role = 'target') => {
    setGraph((prev) => injectCustomNode(prev, customNode));
    if (role === 'source') {
      setSourceId(customNode.id);
    } else if (role === 'target') {
      setTargetId(customNode.id);
    } else if (role === 'via') {
      setViaNodeIds((prev) => [...prev, customNode.id]);
    }
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const prevSrc = sourceId;
    setSourceId(targetId);
    setTargetId(prevSrc);
    setViaNodeIds((prev) => [...prev].reverse());
  };

  // Intermediate Stop Reorder
  const handleMoveViaStop = (index, direction) => {
    setViaNodeIds((prev) => {
      const next = [...prev];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
  };

  // Remove Intermediate Stop
  const handleRemoveViaStop = (nodeId) => {
    setViaNodeIds((prev) => prev.filter((id) => id !== nodeId));
  };

  // Fly to NSUT Campus
  const handleFlyToCampus = () => {
    setActiveTab('navigate');
    setCameraTarget({
      center: NSUT_CAMPUS_CONFIG.center,
      zoom: NSUT_CAMPUS_CONFIG.zoom,
      tick: Date.now(),
    });
  };

  // Fly to Delhi View
  const handleFlyToDelhi = () => {
    setActiveTab('navigate');
    setCameraTarget({
      center: DELHI_VIEW_CONFIG.center,
      zoom: DELHI_VIEW_CONFIG.zoom,
      tick: Date.now(),
    });
  };

  // Reset Route to default
  const handleReset = () => {
    setSourceId('nsut_admin');
    setTargetId('nsut_sports');
    setViaNodeIds([]);
    setMode('walk');
    handleFlyToCampus();
  };

  // Map Node Selection
  const handleSelectMapNode = (nodeId) => {
    if (!sourceId) {
      setSourceId(nodeId);
      return;
    }
    if (!targetId && nodeId !== sourceId) {
      setTargetId(nodeId);
      return;
    }
    if (nodeId === sourceId || nodeId === targetId) return;

    // Toggle or append as Via Stop
    setViaNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Playback timer loop
  useEffect(() => {
    let timer;
    if (isPlaying && routeResult?.visitedOrder?.length) {
      timer = setInterval(() => {
        setPlaybackStep((prev) => {
          if (prev >= routeResult.visitedOrder.length) {
            setIsPlaying(false);
            return routeResult.visitedOrder.length;
          }
          return prev + 1;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isPlaying, routeResult]);

  const hasRoute =
    Boolean(routeResult) &&
    Array.isArray(routeResult.shortestPath) &&
    routeResult.shortestPath.length >= 2;

  const carComp = routeResult?.comparison?.car;
  const walkComp = routeResult?.comparison?.walk;
  const timeSavedByCar = routeResult?.comparison?.timeSavedByCarMin || 0;

  const turnSteps = routeResult?.turnByTurnSteps || [];
  const visibleTurnSteps = showTurnSteps ? turnSteps : turnSteps.slice(0, 4);

  return (
    <div className="w-screen h-screen bg-[#09090B] text-white flex flex-col-reverse md:flex-row overflow-hidden select-none">
      {/* =====================================================================
          SINGLE-SOURCE MINIMALIST CONTROL PANEL (NO DUPLICATE JSX)
         ===================================================================== */}
      <aside
        className={`w-full md:w-[420px] xl:w-[440px] shrink-0 obsidian-ambient-bg border-t md:border-t-0 md:border-r border-white/[0.07] flex flex-col z-20 transition-all duration-300 ${
          mobileExpanded ? 'h-[58vh] md:h-full' : 'h-[175px] md:h-full'
        }`}
      >
        {/* HEADER BLOCK */}
        <header className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-zinc-400 font-medium">
              New Delhi · Campus &amp; City Network
            </span>

            <button
              onClick={() => setMobileExpanded((v) => !v)}
              className="md:hidden px-2.5 py-1 rounded-full bg-[#1C1C20] border border-white/10 text-xs text-zinc-300 flex items-center gap-1"
            >
              <span>{mobileExpanded ? 'More Map' : 'Expand'}</span>
              {mobileExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="mt-0.5 flex items-baseline justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              NavMap
            </h1>
            <span className="text-[11px] font-mono text-zinc-500">
              CAMPUS + DELHI
            </span>
          </div>

          {/* Quick Filter Pills Row (NO STAR ICONS) */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleFlyToCampus}
                className="px-3 py-1 rounded-full bg-[#282249] text-[#A594F9] border border-[#A594F9]/40 text-xs font-semibold hover:brightness-110 transition"
              >
                NSUT Campus
              </button>
              <button
                onClick={handleFlyToDelhi}
                className="px-3 py-1 rounded-full bg-[#1C1C20] text-zinc-300 border border-white/5 text-xs font-semibold hover:text-white transition"
              >
                All Delhi
              </button>
            </div>

            <button
              onClick={handleReset}
              title="Reset to default route"
              className="w-8 h-8 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white shrink-0 transition"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${
                  isRouting ? 'animate-spin text-[#A594F9]' : ''
                }`}
              />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CARD STACK */}
        <main className="flex-1 overflow-y-auto px-5 pt-1 pb-4 space-y-4">
          {activeTab === 'navigate' && (
            <>
              {/* CARD 1: TYPE-TO-SEARCH INPUTS & ROUTE TELEMETRY (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
                {/* Search Omnibox: Origin (A) & Destination (B) */}
                <div className="relative space-y-2">
                  <SearchCombobox
                    label="Origin Location"
                    badgeText="A"
                    badgeBg="bg-[#4ADE80]"
                    selectedNode={sourceNode}
                    allNodes={nodes}
                    placeholder="Search campus landmark or Delhi place..."
                    onSelectNodeId={(id) => setSourceId(id)}
                    onSelectCustomLocation={(loc) =>
                      handleSelectCustomLocation(loc, 'source')
                    }
                    onClear={() => setSourceId('')}
                  />

                  {/* Swap Button */}
                  <div className="relative py-0.5 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white/[0.05]" />
                    <button
                      onClick={handleSwap}
                      title="Swap Origin & Destination"
                      className="absolute w-7 h-7 rounded-full bg-[#282249] hover:bg-[#A594F9] text-[#A594F9] hover:text-[#09090B] border border-[#A594F9]/30 flex items-center justify-center shadow-md transition"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <SearchCombobox
                    label="Destination Location"
                    badgeText="B"
                    badgeBg="bg-[#F28B66]"
                    selectedNode={targetNode}
                    allNodes={nodes}
                    placeholder="Search campus landmark or Delhi place..."
                    onSelectNodeId={(id) => setTargetId(id)}
                    onSelectCustomLocation={(loc) =>
                      handleSelectCustomLocation(loc, 'target')
                    }
                    onClear={() => setTargetId('')}
                  />
                </div>

                {/* Car vs Walk Capsule Toggle */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setMode('car')}
                    className={`py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition border ${
                      mode === 'car'
                        ? 'bg-[#14331C] text-white border-[#4ADE80]/50 shadow-[0_0_15px_rgba(74,222,128,0.18)]'
                        : 'bg-[#1C1C20] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <Car
                      className={`w-3.5 h-3.5 ${
                        mode === 'car' ? 'text-[#4ADE80]' : 'text-zinc-400'
                      }`}
                    />
                    <span>
                      🚗 Car ·{' '}
                      {carComp ? formatDuration(carComp.durationMin) : '--'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMode('walk')}
                    className={`py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition border ${
                      mode === 'walk'
                        ? 'bg-[#282249] text-white border-[#A594F9]/50 shadow-[0_0_15px_rgba(165,148,249,0.22)]'
                        : 'bg-[#1C1C20] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <Footprints
                      className={`w-3.5 h-3.5 ${
                        mode === 'walk' ? 'text-[#A594F9]' : 'text-zinc-400'
                      }`}
                    />
                    <span>
                      🚶 Walk ·{' '}
                      {walkComp ? formatDuration(walkComp.durationMin) : '--'}
                    </span>
                  </button>
                </div>

                {/* Dual Comparison Telemetry Row */}
                {carComp && walkComp && (
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      {mode === 'car'
                        ? `Walk ${formatDuration(
                            walkComp.durationMin
                          )} → Drive ${formatDuration(carComp.durationMin)}`
                        : `Drive ${carComp.distanceKm}km → Walk ${walkComp.distanceKm}km`}
                    </span>
                    <span className="text-[#4ADE80] font-semibold">
                      {mode === 'car'
                        ? `+${formatDuration(timeSavedByCar)} faster`
                        : 'Footpath mode'}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 2: FOREST GREEN ACTIVE ROUTE SUMMARY CARD (#14331C) */}
              <div className="bg-[#14331C] border border-[#4ADE80]/20 rounded-3xl p-5 shadow-xl">
                {!hasRoute ? (
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      Nothing routed yet
                    </h3>
                    <p className="text-sm text-[#9BC4A5] mt-1">
                      Search and select any two campus or Delhi locations.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9BC4A5]">
                          {mode === 'car'
                            ? 'Optimal Driving Path'
                            : 'Optimal Walking Path'}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                          {routeResult.totalDistanceKm} km ·{' '}
                          {formatDuration(routeResult.estimatedTime)}
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-black/30 border border-[#9BC4A5]/25 text-[#4ADE80] text-xs font-semibold shrink-0">
                        {routeResult.totalDistance.toLocaleString()} m
                      </span>
                    </div>

                    <p className="text-xs text-[#9BC4A5] mt-1">
                      Via {routeResult.shortestPath.length} path nodes across
                      real road geometry
                    </p>

                    {/* Step-by-Step Path Breadcrumbs */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {routeResult.shortestPath.map((node, index) => (
                        <React.Fragment key={`${node.id}-${index}`}>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              node.isOrigin
                                ? 'bg-[#4ADE80] text-[#09090B]'
                                : node.isViaStop
                                ? 'bg-[#282249] text-[#A594F9] border border-[#A594F9]/50'
                                : node.isDestination
                                ? 'bg-[#F28B66] text-[#09090B]'
                                : 'bg-black/30 text-white border border-white/10'
                            }`}
                          >
                            <span>{node.shortName}</span>
                          </span>
                          {index < routeResult.shortestPath.length - 1 && (
                            <span className="text-[#9BC4A5] text-xs font-bold">
                              →
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Turn-by-Turn Street Maneuvers */}
                    {turnSteps.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9BC4A5]">
                            TURN-BY-TURN MANEUVERS
                          </span>
                          {turnSteps.length > 4 && (
                            <button
                              onClick={() => setShowTurnSteps((s) => !s)}
                              className="text-xs text-white underline underline-offset-2"
                            >
                              {showTurnSteps
                                ? 'Show less'
                                : `All ${turnSteps.length} steps`}
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {visibleTurnSteps.map((st, idx) => (
                            <div
                              key={idx}
                              className="bg-black/25 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <CornerDownRight className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                                <span className="text-white font-medium truncate">
                                  {st.instruction}
                                </span>
                              </div>
                              <span className="text-[#9BC4A5] font-mono shrink-0">
                                {st.distanceMeters}m
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 3: INTERMEDIATE STOPS ("VIA" WAYPOINTS) (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Intermediate stops
                  </h3>
                  {viaNodeIds.length > 0 && (
                    <button
                      onClick={() => setViaNodeIds([])}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      Clear all &gt;
                    </button>
                  )}
                </div>

                {/* Inline Type-to-Search for Adding a Stop */}
                <SearchCombobox
                  label=""
                  badgeText="+"
                  badgeBg="bg-[#282249]"
                  badgeTextColor="text-[#A594F9]"
                  selectedNode={null}
                  allNodes={nodes.filter(
                    (n) =>
                      n.id !== sourceId &&
                      n.id !== targetId &&
                      !viaNodeIds.includes(n.id)
                  )}
                  placeholder="Type to insert a must-visit middle stop..."
                  onSelectNodeId={(id) => setViaNodeIds((prev) => [...prev, id])}
                  onSelectCustomLocation={(loc) =>
                    handleSelectCustomLocation(loc, 'via')
                  }
                />

                {/* List of Active Via Stops */}
                {viaNodeIds.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {viaNodeIds.map((vid, idx) => {
                      const vNode = nodesMap[vid];
                      return (
                        <div
                          key={vid}
                          className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 rounded-full bg-[#282249] text-[#A594F9] text-[11px] font-bold shrink-0">
                              Stop {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-white truncate">
                              {vNode?.name || vid}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveViaStop(idx, -1)}
                              disabled={idx === 0}
                              title="Move Stop Up"
                              className="w-6 h-6 rounded-full bg-black/30 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-zinc-300"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveViaStop(idx, 1)}
                              disabled={idx === viaNodeIds.length - 1}
                              title="Move Stop Down"
                              className="w-6 h-6 rounded-full bg-black/30 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-zinc-300"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveViaStop(vid)}
                              title="Remove Stop"
                              className="w-6 h-6 rounded-full bg-black/30 hover:bg-[#F87171]/20 text-zinc-400 hover:text-[#F87171] flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 3: DIJKSTRA PLAYBACK ANIMATION */}
          {activeTab === 'playback' && (
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Dijkstra Algorithm Playback
                </h2>
                <p className="text-xs text-zinc-400">
                  Step-by-step Min-Heap Priority Queue node relaxation
                </p>
              </div>

              {/* Scrubber Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Step {playbackStep}</span>
                  <span>{routeResult?.visitedOrder?.length || 0} Total</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={routeResult?.visitedOrder?.length || 1}
                  value={playbackStep}
                  onChange={(e) => setPlaybackStep(Number(e.target.value))}
                  className="w-full accent-[#A594F9] cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPlaybackStep(0)}
                  className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 flex items-center justify-center text-zinc-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPlaybackStep((p) => Math.max(0, p - 1))}
                  className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 flex items-center justify-center text-zinc-300"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-5 py-2 rounded-full bg-[#A594F9] text-[#09090B] font-bold text-xs flex items-center gap-1.5 hover:brightness-110"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Animate
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    setPlaybackStep((p) =>
                      Math.min(routeResult?.visitedOrder?.length || 0, p + 1)
                    )
                  }
                  className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 flex items-center justify-center text-zinc-300"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Step info */}
              {routeResult?.visitedOrder?.[playbackStep - 1] && (
                <div className="bg-[#1C1C20] rounded-2xl p-3 border border-white/5 text-xs">
                  <div className="font-semibold text-white">
                    Popped Node:{' '}
                    {
                      routeResult.visitedOrder[playbackStep - 1]
                        .currentNodeName
                    }
                  </div>
                  <div className="text-zinc-400 mt-1">
                    Settled Distance:{' '}
                    {
                      routeResult.visitedOrder[playbackStep - 1]
                        .distanceMetersSoFar
                    }
                    m
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MAP LAYERS */}
          {activeTab === 'layers' && (
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Map &amp; Graph Layers
                </h2>
                <p className="text-xs text-zinc-400">
                  Toggle graph geometry and campus footpath shortcuts
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowGraphMesh((p) => !p)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                    showGraphMesh
                      ? 'bg-[#282249] text-white border-[#A594F9]/40'
                      : 'bg-[#1C1C20] text-zinc-300 border-white/5'
                  }`}
                >
                  <div>
                    <div>Full Road Graph Mesh</div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      Shows all 95 road connections across Delhi &amp; Campus
                    </div>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      showGraphMesh ? 'bg-[#A594F9]' : 'bg-zinc-700'
                    }`}
                  />
                </button>

                <button
                  onClick={() => setShowWalkwaysOnly((p) => !p)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                    showWalkwaysOnly
                      ? 'bg-[#14331C] text-white border-[#4ADE80]/40'
                      : 'bg-[#1C1C20] text-zinc-300 border-white/5'
                  }`}
                >
                  <div>
                    <div>Campus Footpath Shortcuts</div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      Highlight pedestrian-only walkways across Moksha &amp;
                      lawns
                    </div>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      showWalkwaysOnly ? 'bg-[#4ADE80]' : 'bg-zinc-700'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM FLOATING DOCK (4 Clean Tabs, NO API Tab) + DETACHED LAVENDER FAB */}
        <footer className="px-5 py-3 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            <nav className="flex-1 bg-[#18181C]/95 backdrop-blur-2xl border border-white/[0.09] rounded-full px-2 py-1.5 flex items-center justify-around shadow-2xl">
              {[
                { id: 'navigate', label: 'Navigate', icon: Home },
                {
                  id: 'campus',
                  label: 'Campus Zoom',
                  icon: Navigation,
                  onClick: handleFlyToCampus,
                },
                { id: 'playback', label: 'Playback', icon: Play },
                { id: 'layers', label: 'Layers', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.onClick) {
                        tab.onClick();
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-white text-[#09090B] shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Detached Lavender Circular + FAB (#A594F9) */}
            <button
              onClick={() => {
                setActiveTab('navigate');
                // Scroll down or focus
              }}
              title="Add Waypoint"
              className="w-11 h-11 rounded-full bg-[#A594F9] hover:brightness-110 text-[#09090B] flex items-center justify-center shrink-0 shadow-[0_8px_24px_rgba(165,148,249,0.35)] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </footer>
      </aside>

      {/* =====================================================================
          RIGHT / TOP FULL-BLEED LEAFLET MAP CANVAS
         ===================================================================== */}
      <section className="flex-1 h-[42vh] md:h-full relative z-10">
        <MapCanvas
          graph={graph}
          sourceId={sourceId}
          targetId={targetId}
          viaNodeIds={viaNodeIds}
          mode={mode}
          routeResult={routeResult}
          showGraphMesh={showGraphMesh}
          showWalkwaysOnly={showWalkwaysOnly}
          onSelectNode={handleSelectMapNode}
          cameraTarget={cameraTarget}
          fitTrigger={fitTrigger}
          onTriggerFitRoute={() => setFitTrigger((c) => c + 1)}
          onFlyToCampus={handleFlyToCampus}
        />
      </section>
    </div>
  );
}
