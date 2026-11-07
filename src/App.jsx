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
  X,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpRight,
  ArrowUpLeft,
  Flag,
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

function getManeuverIcon(maneuverType) {
  switch (maneuverType) {
    case 'turn-left':
      return CornerUpLeft;
    case 'turn-right':
      return CornerUpRight;
    case 'slight-left':
      return ArrowUpLeft;
    case 'slight-right':
      return ArrowUpRight;
    case 'uturn':
      return RotateCcw;
    case 'roundabout':
      return RotateCw;
    case 'arrive':
      return Flag;
    case 'depart':
      return Navigation;
    default:
      return ArrowUp;
  }
}

export default function App() {
  // Purge any stale cache on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem('navmap_v4_cache');
      if (v !== 'v4_3_osm_exact') {
        localStorage.clear();
        localStorage.setItem('navmap_v4_cache', 'v4_3_osm_exact');
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

  // Turn-by-Turn Focus State
  const [focusedTurn, setFocusedTurn] = useState(null);
  const [showAllTurns, setShowAllTurns] = useState(false);

  // Layer Toggles
  const [showGraphMesh, setShowGraphMesh] = useState(false);
  const [showWalkwaysOnly, setShowWalkwaysOnly] = useState(false);

  // Dijkstra Playback Animation State
  const [playbackStep, setPlaybackStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // UI State
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

  // Execute Chained Dijkstra + Real Street Intersections via /api/navigate
  const executeNavigation = useCallback(async () => {
    if (!sourceId || !targetId || sourceId === targetId) {
      setRouteResult(null);
      setFocusedTurn(null);
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

    // Auto-select first turn if available
    if (res?.turnByTurnSteps?.length > 0) {
      const nextManeuver =
        res.turnByTurnSteps.find((s) => s.maneuverType !== 'depart') ||
        res.turnByTurnSteps[0];
      setFocusedTurn(nextManeuver);
    } else {
      setFocusedTurn(null);
    }
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
    if (!isPlaying) return;
    const maxSteps = routeResult?.visitedOrder?.length || 0;
    if (maxSteps === 0) return;

    const interval = setInterval(() => {
      setPlaybackStep((curr) => {
        if (curr >= maxSteps) {
          setIsPlaying(false);
          return maxSteps;
        }
        return curr + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, routeResult]);

  const hasRoute = Boolean(routeResult && routeResult.shortestPath?.length > 0);
  const carComp = routeResult?.carComparison;
  const walkComp = routeResult?.walkComparison;
  const timeSavedByCar =
    carComp && walkComp
      ? Math.max(0, walkComp.durationMin - carComp.durationMin)
      : 0;

  const turnSteps = routeResult?.turnByTurnSteps || [];
  const nextImmediateTurn =
    turnSteps.find((s) => s.maneuverType !== 'depart') || turnSteps[0] || null;

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#09090B] text-zinc-100 font-sans antialiased overflow-hidden">
      {/* =====================================================================
          LEFT CONTROL PANEL (Single-Source JSX, Android 16 Obsidian Cards)
         ===================================================================== */}
      <aside className="w-full md:w-[420px] lg:w-[440px] shrink-0 h-[58vh] md:h-full flex flex-col bg-[#09090B] border-r border-white/[0.07] z-20 shadow-2xl overflow-hidden">
        {/* HEADER BAR */}
        <header className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">
                New Delhi · Campus &amp; City Network
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
              NavMap
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFlyToCampus}
              className="px-2.5 py-1 rounded-full bg-[#282249] text-[#A594F9] text-xs font-bold border border-[#A594F9]/30 hover:border-[#A594F9]/60 transition"
            >
              NSUT Campus
            </button>
            <button
              onClick={handleFlyToDelhi}
              className="px-2.5 py-1 rounded-full bg-[#1C1C20] text-zinc-400 text-xs font-medium border border-white/10 hover:text-white transition"
            >
              All Delhi
            </button>
            <button
              onClick={handleReset}
              title="Reset Route"
              className="w-8 h-8 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* TAB 1 & 2: NAVIGATE & ROUTE SUMMARY */}
          {activeTab === 'navigate' && (
            <>
              {/* CARD 1: ORIGIN & DESTINATION AUTOCOMPLETE OMNIBOX (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="space-y-2 relative">
                  {/* Origin Combobox */}
                  <SearchCombobox
                    label="ORIGIN LOCATION"
                    badgeText="A"
                    badgeBg="bg-[#4ADE80]"
                    badgeTextColor="text-[#09090B]"
                    selectedNode={sourceNode}
                    allNodes={nodes}
                    placeholder="Search origin in Campus or Delhi..."
                    onSelectNodeId={(id) => setSourceId(id)}
                    onSelectCustomLocation={(loc) =>
                      handleSelectCustomLocation(loc, 'source')
                    }
                    onClear={() => setSourceId('')}
                  />

                  {/* Swap Origin / Destination Button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                    <button
                      onClick={handleSwap}
                      title="Swap Origin and Destination"
                      className="w-8 h-8 rounded-full bg-[#24242A] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center shadow-lg transition active:scale-95"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Destination Combobox */}
                  <SearchCombobox
                    label="DESTINATION LOCATION"
                    badgeText="B"
                    badgeBg="bg-[#F28B66]"
                    badgeTextColor="text-[#09090B]"
                    selectedNode={targetNode}
                    allNodes={nodes}
                    placeholder="Search destination in Campus or Delhi..."
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
              <div className="bg-[#14331C] border border-[#4ADE80]/20 rounded-3xl p-5 shadow-xl space-y-3.5">
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

                    {/* NEXT IMMEDIATE TURN BANNER */}
                    {nextImmediateTurn && (
                      <div className="mt-3.5 bg-black/35 rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#4ADE80] text-[#09090B] flex items-center justify-center shrink-0">
                            {React.createElement(
                              getManeuverIcon(nextImmediateTurn.maneuverType),
                              { className: 'w-4 h-4 stroke-[2.5]' }
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase font-bold text-[#9BC4A5] tracking-wider">
                              Next turn · in {nextImmediateTurn.distanceText}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white truncate">
                              {nextImmediateTurn.instruction}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setFocusedTurn(nextImmediateTurn);
                            if (nextImmediateTurn.coordinate) {
                              setCameraTarget({
                                center: nextImmediateTurn.coordinate,
                                zoom: 17,
                                tick: Date.now(),
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white shrink-0 transition"
                        >
                          Focus
                        </button>
                      </div>
                    )}

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

                    {/* Turn-by-Turn Maneuvers List */}
                    {turnSteps.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9BC4A5]">
                            TURN-BY-TURN STREET MANEUVERS
                          </span>
                          {turnSteps.length > 3 && (
                            <button
                              onClick={() => setShowAllTurns((s) => !s)}
                              className="text-xs text-white underline underline-offset-2 flex items-center gap-1"
                            >
                              <span>
                                {showAllTurns
                                  ? 'Show less'
                                  : `All ${turnSteps.length} steps`}
                              </span>
                              {showAllTurns ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {(showAllTurns ? turnSteps : turnSteps.slice(0, 3)).map(
                            (st, idx) => {
                              const StepIcon = getManeuverIcon(st.maneuverType);
                              const isFocused =
                                focusedTurn?.step === st.step;
                              return (
                                <div
                                  key={`turn-step-${idx}`}
                                  onClick={() => {
                                    setFocusedTurn(st);
                                    if (st.coordinate) {
                                      setCameraTarget({
                                        center: st.coordinate,
                                        zoom: 17,
                                        tick: Date.now(),
                                      });
                                    }
                                  }}
                                  className={`rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs cursor-pointer transition ${
                                    isFocused
                                      ? 'bg-black/60 border border-[#4ADE80]/50'
                                      : 'bg-black/25 hover:bg-black/40 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                        isFocused
                                          ? 'bg-[#4ADE80] text-[#09090B]'
                                          : 'bg-white/10 text-white'
                                      }`}
                                    >
                                      <StepIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-white font-medium truncate">
                                        {st.instruction}
                                      </div>
                                      <div className="text-[10px] text-[#9BC4A5] truncate">
                                        {st.roadName}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="text-[#9BC4A5] font-mono text-[11px]">
                                      {st.distanceText}
                                    </div>
                                    <div className="text-zinc-400 text-[10px]">
                                      {st.durationText}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 3: INTERMEDIATE STOPS ("VIA" WAYPOINTS) (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Intermediate stops (Via)
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
                  placeholder="Type to insert a middle stop..."
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
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4 shadow-xl">
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
                  className="w-11 h-11 rounded-full bg-[#A594F9] hover:brightness-110 text-[#09090B] flex items-center justify-center font-bold"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
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

              {/* Active Step Details */}
              {routeResult?.visitedOrder?.[playbackStep - 1] && (
                <div className="bg-[#1C1C20] rounded-2xl p-3 border border-white/5 space-y-1 text-xs">
                  <div className="text-zinc-400">Current Relaxed Node</div>
                  <div className="text-white font-bold text-sm">
                    {
                      routeResult.visitedOrder[playbackStep - 1]
                        .currentNodeName
                    }
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 pt-1 font-mono">
                    <span>
                      Cost:{' '}
                      {routeResult.visitedOrder[playbackStep - 1].costSoFar}
                    </span>
                    <span>
                      {
                        routeResult.visitedOrder[playbackStep - 1]
                          .distanceMetersSoFar
                      }
                      m so far
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAYERS */}
          {activeTab === 'layers' && (
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white">Map Layers</h2>
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
                      Shows all road connections across Delhi &amp; Campus
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

        {/* BOTTOM FLOATING DOCK (CENTERED, CLEAN 4 TABS, NO '+' FAB) */}
        <footer className="px-5 py-3.5 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent shrink-0">
          <nav className="w-full max-w-sm mx-auto bg-[#18181C]/95 backdrop-blur-2xl border border-white/[0.09] rounded-full px-2.5 py-1.5 flex items-center justify-around shadow-2xl">
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
                  className={`h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all ${
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
        </footer>
      </aside>

      {/* =====================================================================
          RIGHT FULL-BLEED LEAFLET MAP CANVAS
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
          focusedTurn={focusedTurn}
          onSelectTurnStep={(step) => {
            setFocusedTurn(step);
            if (step.coordinate) {
              setCameraTarget({
                center: step.coordinate,
                zoom: 17,
                tick: Date.now(),
              });
            }
          }}
        />
      </section>
    </div>
  );
}
