import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Radio,
  ChevronRight,
  RotateCw,
  ArrowUpDown,
  ListChecks,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Navigation,
  Car,
  Footprints,
  Home,
  Cpu,
  FileCode2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { DEFAULT_GRAPH, GRAPH_PRESETS } from './lib/dijkstra.js';
import { fetchGraphTopology, requestDijkstraRoute } from './lib/apiClient.js';
import MapCanvas from './components/MapCanvas.jsx';

export default function App() {
  // Active Bottom Dock Tab: 'navigate' | 'trace' | 'api'
  const [activeTab, setActiveTab] = useState('navigate');

  // Graph Topology State
  const [activePreset, setActivePreset] = useState('nsut');
  const [graph, setGraph] = useState(DEFAULT_GRAPH);

  // Routing State: Origin (A), Intermediate Via Stops (1, 2...), Destination (B), Mode ('car' | 'walk')
  const [sourceId, setSourceId] = useState('N2'); // Dwarka Mor Metro
  const [targetId, setTargetId] = useState('N14'); // Sports Complex & Kaveri Hostel
  const [viaNodeIds, setViaNodeIds] = useState([]); // Intermediate must-visit Via stops
  const [mode, setMode] = useState('car'); // 'car' | 'walk'

  // API Response & Telemetry State
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [apiLatencyMs, setApiLatencyMs] = useState(4);
  const [lastRoutedTime, setLastRoutedTime] = useState('13:15');

  // UI Helpers
  const [isAddingViaStop, setIsAddingViaStop] = useState(false);
  const [selectedViaCandidate, setSelectedViaCandidate] = useState('');
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(true);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const nodes = graph?.nodes || [];
  const nodesMap = React.useMemo(() => {
    const m = {};
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  const sourceNode = nodesMap[sourceId];
  const targetNode = nodesMap[targetId];

  const formattedDate = React.useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return 'Saturday, 7 November';
    }
  }, []);

  // Load Graph Preset from GET /api/graph
  const loadPreset = useCallback(async (presetKey) => {
    const res = await fetchGraphTopology(presetKey);
    if (res?.graph) {
      setGraph(res.graph);
      const gNodes = res.graph.nodes || [];
      if (gNodes.length >= 2) {
        setSourceId(gNodes[1]?.id || gNodes[0].id);
        setTargetId(
          gNodes[gNodes.length - 2]?.id || gNodes[gNodes.length - 1].id
        );
        setViaNodeIds([]);
      }
    }
  }, []);

  useEffect(() => {
    loadPreset(activePreset);
  }, [activePreset, loadPreset]);

  // Execute Chained Dijkstra + OSRM Street Hydration via POST /api/navigate
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
      preset: activePreset,
      customGraph: graph,
    });
    setIsRouting(false);

    setRouteResult(res);
    setApiLatencyMs(res.roundTripMs || 4);
    const now = new Date();
    setLastRoutedTime(
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
  }, [sourceId, targetId, viaNodeIds, mode, activePreset, graph]);

  useEffect(() => {
    executeNavigation();
  }, [executeNavigation]);

  // Map Node Click Handler:
  // - If Origin empty -> sets Origin
  // - Else if Destination empty -> sets Destination
  // - Else -> inserts/toggles clicked node as an Intermediate Via Stop!
  const handleSelectMapNode = (nodeId) => {
    if (!sourceId) {
      setSourceId(nodeId);
      return;
    }
    if (!targetId && nodeId !== sourceId) {
      setTargetId(nodeId);
      return;
    }

    if (nodeId === sourceId || nodeId === targetId) {
      return;
    }

    // Toggle or append to viaNodeIds
    setViaNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
    setIsAddingViaStop(false);
  };

  // Swap Origin & Destination
  const handleSwapOriginDest = () => {
    const prevSrc = sourceId;
    setSourceId(targetId);
    setTargetId(prevSrc);
    setViaNodeIds((prev) => [...prev].reverse());
  };

  // Add Via Stop from Dropdown or + Button
  const handleAddViaStop = (nodeIdToAdd) => {
    const candidate = nodeIdToAdd || selectedViaCandidate;
    if (
      !candidate ||
      candidate === sourceId ||
      candidate === targetId ||
      viaNodeIds.includes(candidate)
    ) {
      return;
    }
    setViaNodeIds((prev) => [...prev, candidate]);
    setSelectedViaCandidate('');
    setIsAddingViaStop(false);
  };

  // Reorder Via Stop Up/Down
  const handleMoveViaStop = (index, direction) => {
    setViaNodeIds((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  // Remove single Via Stop
  const handleRemoveViaStop = (nodeId) => {
    setViaNodeIds((prev) => prev.filter((id) => id !== nodeId));
  };

  // Clear all Via Stops
  const handleClearViaStops = () => {
    setViaNodeIds([]);
    setIsAddingViaStop(false);
  };

  const hasActiveRoute =
    Boolean(routeResult) &&
    Array.isArray(routeResult.shortestPath) &&
    routeResult.shortestPath.length >= 2;

  const carComp = routeResult?.comparison?.car;
  const walkComp = routeResult?.comparison?.walk;
  const timeSavedByCar = routeResult?.comparison?.timeSavedByCarMin || 0;
  const walkShorterMeters =
    routeResult?.comparison?.walkShorterDistanceMeters || 0;

  const availableViaCandidates = nodes.filter(
    (n) =>
      n.id !== sourceId &&
      n.id !== targetId &&
      !viaNodeIds.includes(n.id)
  );

  const turnSteps = routeResult?.turnByTurnSteps || [];
  const visibleTurnSteps = showAllSteps ? turnSteps : turnSteps.slice(0, 4);

  return (
    <div className="w-screen h-screen bg-[#09090B] text-white flex flex-col-reverse lg:flex-row overflow-hidden select-none">
      {/* =====================================================================
          LEFT CONTROL COLUMN (Android-16 Pitch-Black Card Stack + Dock)
         ===================================================================== */}
      <aside
        className={`w-full lg:w-[425px] xl:w-[440px] shrink-0 obsidian-ambient-bg border-t lg:border-t-0 lg:border-r border-white/[0.07] flex flex-col z-20 transition-all duration-300 ${
          mobileExpanded ? 'h-[58vh] lg:h-full' : 'h-[180px] lg:h-full'
        }`}
      >
        {/* 1. HEADER BLOCK */}
        <header className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-zinc-400 font-medium">
              {formattedDate}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileExpanded((v) => !v)}
                className="lg:hidden px-2.5 py-1 rounded-full bg-[#1C1C20] border border-white/10 text-xs text-zinc-300 flex items-center gap-1"
              >
                <span>{mobileExpanded ? 'More Map' : 'Expand Panel'}</span>
                {mobileExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#282249] via-[#14331C] to-[#1C1C20] border border-white/15 flex items-center justify-center text-[11px] font-bold text-white">
                AN
              </div>
            </div>
          </div>

          <div className="mt-0.5 flex items-baseline justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              NavMap
            </h1>
            <span className="text-[11px] font-mono text-zinc-500">
              OSRM + DIJKSTRA
            </span>
          </div>

          {/* Status Pills Row */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1 rounded-full bg-[#141417] border border-white/[0.07] text-xs font-bold text-white">
                Dijkstra Engine · v2.0
              </div>

              <button
                onClick={() => setActiveTab('api')}
                className="px-3 py-1 rounded-full bg-[#18181C] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-zinc-200 flex items-center gap-2 transition"
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

            <button
              onClick={executeNavigation}
              title="Recalculate Route"
              className="w-8 h-8 rounded-full bg-[#1C1C20] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white shrink-0 transition"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${
                  isRouting ? 'animate-spin text-[#A594F9]' : ''
                }`}
              />
            </button>
          </div>

          {/* CAR vs. WALK CAPSULE PILLS (Right below header) */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('car')}
              className={`py-2 px-3.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition border ${
                mode === 'car'
                  ? 'bg-[#14331C] text-white border-[#4ADE80]/50 shadow-[0_0_20px_rgba(74,222,128,0.18)]'
                  : 'bg-[#1C1C20] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              <Car
                className={`w-4 h-4 ${
                  mode === 'car' ? 'text-[#4ADE80]' : 'text-zinc-400'
                }`}
              />
              <span>
                🚗 Car · {carComp ? `${carComp.durationMin} min` : '--'}
              </span>
            </button>

            <button
              onClick={() => setMode('walk')}
              className={`py-2 px-3.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition border ${
                mode === 'walk'
                  ? 'bg-[#282249] text-white border-[#A594F9]/50 shadow-[0_0_20px_rgba(165,148,249,0.22)]'
                  : 'bg-[#1C1C20] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              <Footprints
                className={`w-4 h-4 ${
                  mode === 'walk' ? 'text-[#A594F9]' : 'text-zinc-400'
                }`}
              />
              <span>
                🚶 Walk · {walkComp ? `${walkComp.durationMin} min` : '--'}
              </span>
            </button>
          </div>
        </header>

        {/* 2. SCROLLABLE CARD STACK */}
        <main className="flex-1 overflow-y-auto px-5 pt-1 pb-4 space-y-4">
          {activeTab === 'navigate' && (
            <>
              {/* CARD 1: DUAL TELEMETRY CARD (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
                      <Zap className="w-5 h-5 fill-[#A594F9]" />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-bold text-white leading-tight">
                        {mode === 'car'
                          ? 'Car · Optimal Street Route'
                          : 'Walk · Campus & Footpath Route'}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Since {lastRoutedTime} · OSRM Road Geometry Snapped
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro Section Header: ROUTE TELEMETRY */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-1.5">
                    ROUTE TELEMETRY (CAR VS. WALK)
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="min-w-0 pr-2">
                      <div className="text-[15px] font-semibold text-white truncate">
                        {sourceNode?.shortName || 'Origin'}
                        {viaNodeIds.length > 0
                          ? ` → +${viaNodeIds.length} via → `
                          : ' → '}
                        {targetNode?.shortName || 'Destination'}
                      </div>

                      <div className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap">
                        {carComp && walkComp ? (
                          mode === 'car' ? (
                            <>
                              <span className="text-[#4ADE80] font-semibold">
                                +{timeSavedByCar} min faster by car
                              </span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-400">
                                {carComp.distanceKm} km road
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#A594F9] font-semibold">
                                {walkShorterMeters > 0
                                  ? `-${walkShorterMeters}m shortcut unlocked`
                                  : 'Footpath mode active'}
                              </span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-[#4ADE80] font-medium">
                                0 traffic penalty
                              </span>
                            </>
                          )
                        ) : (
                          <span className="text-zinc-400">
                            Select origin &amp; destination
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Signature Inline Metric Transition: Walk 28 min -> Drive 6 min */}
                    {carComp && walkComp && (
                      <div className="text-right shrink-0">
                        {mode === 'car' ? (
                          <div className="text-sm">
                            <span className="text-zinc-400">
                              Walk {walkComp.durationMin}m →{' '}
                            </span>
                            <span className="text-white font-bold text-[15px]">
                              Drive {carComp.durationMin}m
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="text-zinc-400">
                              Drive {carComp.distanceKm}km →{' '}
                            </span>
                            <span className="text-white font-bold text-[15px]">
                              Walk {walkComp.distanceKm}km
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro Section Header: ON API */}
                <div className="mt-3.5 pt-2.5 border-t border-white/[0.05]">
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-1.5">
                    ON API
                  </div>
                  <button
                    onClick={() => setActiveTab('api')}
                    className="w-full flex items-center justify-between gap-3 py-1 rounded-xl hover:bg-white/[0.03] transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-[#1A313D] flex items-center justify-center text-[#67E8F9] shrink-0">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-white truncate">
                        POST /api/navigate · {routeResult?.httpStatus || '200 OK'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0" />
                  </button>
                </div>
              </div>

              {/* CARD 2: ORIGIN (A) & DESTINATION (B) SELECTOR CARD (#141417) */}
              <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 space-y-3">
                {/* Network Preset Selector */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
                    CITY / CAMPUS NETWORK
                  </span>
                  <div className="flex items-center gap-1 bg-[#1C1C20] p-1 rounded-full border border-white/5">
                    {Object.values(GRAPH_PRESETS).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setActivePreset(preset.id);
                          setRecenterTrigger((c) => c + 1);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          activePreset === preset.id
                            ? 'bg-white text-[#09090B]'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preset.id === 'nsut'
                          ? 'NSUT Dwarka'
                          : preset.id === 'cp'
                          ? 'Connaught Pl'
                          : 'IIT Delhi'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin (A) & Destination (B) Inputs */}
                <div className="relative space-y-2">
                  {/* Origin A */}
                  <div className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#4ADE80] text-[#09090B] text-xs font-extrabold flex items-center justify-center shrink-0">
                      A
                    </span>
                    <div className="flex-1 min-w-0 pr-7">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        Origin Location
                      </div>
                      <select
                        value={sourceId}
                        onChange={(e) => setSourceId(e.target.value)}
                        className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
                      >
                        {nodes.map((n) => (
                          <option
                            key={n.id}
                            value={n.id}
                            className="bg-[#141417] text-white"
                          >
                            [{n.id}] {n.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button
                    onClick={handleSwapOriginDest}
                    title="Swap Origin & Destination"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#282249] hover:bg-[#A594F9] text-[#A594F9] hover:text-[#09090B] border border-[#A594F9]/30 flex items-center justify-center shadow-lg transition"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Destination B */}
                  <div className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#F28B66] text-[#09090B] text-xs font-extrabold flex items-center justify-center shrink-0">
                      B
                    </span>
                    <div className="flex-1 min-w-0 pr-7">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        Destination Location
                      </div>
                      <select
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
                      >
                        {nodes.map((n) => (
                          <option
                            key={n.id}
                            value={n.id}
                            className="bg-[#141417] text-white"
                          >
                            [{n.id}] {n.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: FOREST GREEN HERO ROUTE SUMMARY CARD (#14331C) */}
              <div className="bg-[#14331C] border border-[#4ADE80]/20 rounded-3xl p-5 shadow-xl">
                {!hasActiveRoute ? (
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      Nothing routed yet
                    </h3>
                    <p className="text-sm text-[#9BC4A5] mt-1.5">
                      Select an origin and destination node on the map.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9BC4A5]">
                          {mode === 'car'
                            ? 'Optimal Driving Path Locked'
                            : 'Optimal Walking Path Locked'}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                          {routeResult.totalDistanceKm} km ·{' '}
                          {routeResult.estimatedTime} min
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-black/30 border border-[#9BC4A5]/25 text-[#4ADE80] text-xs font-semibold shrink-0">
                        {routeResult.totalDistance} m
                      </span>
                    </div>

                    <p className="text-xs text-[#9BC4A5] mt-1">
                      Snapped across {routeResult.roadGeometry?.length || 0}{' '}
                      street coordinates via {routeResult.shortestPath.length}{' '}
                      graph intersections
                    </p>

                    {/* Node Sequence Badges */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                      {routeResult.shortestPath.map((node, index) => (
                        <React.Fragment key={`${node.id}-${index}`}>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              node.isOrigin
                                ? 'bg-[#4ADE80] text-[#09090B]'
                                : node.isViaStop
                                ? 'bg-[#282249] text-[#A594F9] border border-[#A594F9]/50'
                                : node.isDestination
                                ? 'bg-[#F28B66] text-[#09090B]'
                                : 'bg-black/30 text-white border border-white/10'
                            }`}
                          >
                            {node.isOrigin && (
                              <span className="font-extrabold">A:</span>
                            )}
                            {node.isViaStop && (
                              <span className="font-extrabold">
                                Stop {node.viaStopNumber}:
                              </span>
                            )}
                            {node.isDestination && (
                              <span className="font-extrabold">B:</span>
                            )}
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

                    {/* Turn-by-Turn Street Instructions */}
                    {turnSteps.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9BC4A5]">
                            TURN-BY-TURN STREET MANEUVERS
                          </span>
                          {turnSteps.length > 4 && (
                            <button
                              onClick={() => setShowAllSteps((s) => !s)}
                              className="text-xs text-white underline underline-offset-2"
                            >
                              {showAllSteps
                                ? 'Show less'
                                : `All ${turnSteps.length} steps`}
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {visibleTurnSteps.map((st, idx) => (
                            <div
                              key={idx}
                              className="bg-black/25 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs"
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

              {/* CARD 4: INTERMEDIATE STOPS ("VIA" MUST-VISIT WAYPOINTS) */}
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-[16px] font-bold text-white">
                    Intermediate stops (Via)
                  </h3>
                  {viaNodeIds.length > 0 && (
                    <button
                      onClick={handleClearViaStops}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-0.5 transition"
                    >
                      <span>Clear all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 space-y-3">
                  {viaNodeIds.length === 0 ? (
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      <div className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed">
                        No intermediate stops. Add a must-visit node with the{' '}
                        <button
                          onClick={() => setIsAddingViaStop(true)}
                          className="text-[#A594F9] font-semibold underline underline-offset-2"
                        >
                          + button
                        </button>{' '}
                        or click any map node.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {viaNodeIds.map((vid, idx) => {
                        const vNode = nodesMap[vid];
                        const legSeg = routeResult?.segments?.[idx];
                        return (
                          <div
                            key={vid}
                            className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="px-2 py-0.5 rounded-full bg-[#282249] text-[#A594F9] text-[11px] font-bold shrink-0">
                                Stop {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">
                                  {vNode?.name || vid}
                                </div>
                                {legSeg && (
                                  <div className="text-[11px] text-zinc-400">
                                    Leg {idx + 1}: {legSeg.distanceKm} km · +
                                    {legSeg.durationMin} min
                                  </div>
                                )}
                              </div>
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

                  {/* Quick Add Via Stop Selector Row */}
                  {availableViaCandidates.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2">
                      <select
                        value={selectedViaCandidate}
                        onChange={(e) => {
                          setSelectedViaCandidate(e.target.value);
                          if (e.target.value) {
                            handleAddViaStop(e.target.value);
                          }
                        }}
                        className="flex-1 bg-[#1C1C20] text-zinc-200 text-xs font-medium rounded-full px-3.5 py-2 border border-white/5 focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#141417]">
                          + Insert a must-visit Via stop...
                        </option>
                        {availableViaCandidates.map((n) => (
                          <option
                            key={n.id}
                            value={n.id}
                            className="bg-[#141417]"
                          >
                            [{n.id}] {n.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CHAINED DIJKSTRA RELAXATION TRACE */}
          {activeTab === 'trace' && (
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Chained Dijkstra Relaxation Trace
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {routeResult?.segments?.length || 1} Leg(s) ·{' '}
                    {routeResult?.visitedOrder?.length || 0} Nodes Settled in
                    Min-Heap
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#1C1C20] text-xs font-mono text-[#4ADE80]">
                  {routeResult?.executionTimeMs || 0.32} ms
                </span>
              </div>

              {/* Segment Breakdown */}
              {(routeResult?.segments || []).map((seg) => (
                <div
                  key={seg.legIndex}
                  className="bg-[#1C1C20] rounded-2xl p-3.5 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A594F9]">
                      Leg {seg.legIndex}: {seg.fromName} → {seg.toName}
                    </span>
                    <span className="text-xs font-mono text-[#4ADE80]">
                      {seg.distanceKm} km · {seg.durationMin} min
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300">
                    Path: {seg.pathNames.join(' → ')}
                  </div>
                </div>
              ))}

              {/* Step-by-Step Popped Nodes */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {(routeResult?.visitedOrder || []).map((stepObj) => (
                  <div
                    key={stepObj.step}
                    className="bg-[#09090B] rounded-2xl p-3 border border-white/5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-[#A594F9] mr-2">
                        [Leg {stepObj.legIndex} · Step {stepObj.step}]
                      </span>
                      <span className="font-semibold text-white">
                        {stepObj.currentNodeName} ({stepObj.currentNodeId})
                      </span>
                    </div>
                    <span className="font-mono text-[#4ADE80]">
                      {stepObj.distanceMetersSoFar} m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE API INSPECTOR (EXPERIMENTS 14 & 15) */}
          {activeTab === 'api' && (
            <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Live REST API Inspector
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Experiments 14 &amp; 15 · POST /api/navigate
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#14331C] text-[#4ADE80] text-xs font-semibold">
                  {routeResult?.httpStatus || '200 OK'}
                </span>
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-1.5">
                  REQUEST PAYLOAD
                </div>
                <pre className="bg-[#09090B] border border-white/5 rounded-2xl p-3 text-xs font-mono text-[#A594F9] overflow-x-auto">
                  {JSON.stringify(
                    {
                      sourceId,
                      targetId,
                      viaNodeIds,
                      mode,
                      preset: activePreset,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
                    RESPONSE JSON (/API/NAVIGATE)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(routeResult, null, 2)
                      );
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 1500);
                    }}
                    className="text-xs text-[#A594F9] flex items-center gap-1"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                        <span className="text-[#4ADE80]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#09090B] border border-white/5 rounded-2xl p-3 text-[11px] font-mono text-[#9BC4A5] max-h-[300px] overflow-y-auto">
                  {JSON.stringify(
                    {
                      status: routeResult?.status,
                      mode: routeResult?.mode,
                      totalDistance: routeResult?.totalDistance,
                      totalDistanceKm: routeResult?.totalDistanceKm,
                      estimatedTime: routeResult?.estimatedTime,
                      viaNodeIds: routeResult?.viaNodeIds,
                      shortestPath: routeResult?.shortestPath?.map((n) => ({
                        id: n.id,
                        name: n.shortName,
                        cumulativeDistance: n.cumulativeDistance,
                      })),
                      segments: routeResult?.segments?.map((s) => ({
                        legIndex: s.legIndex,
                        from: s.from,
                        to: s.to,
                        distanceKm: s.distanceKm,
                        durationMin: s.durationMin,
                      })),
                      comparison: {
                        car: {
                          distanceKm: routeResult?.comparison?.car?.distanceKm,
                          durationMin:
                            routeResult?.comparison?.car?.durationMin,
                        },
                        walk: {
                          distanceKm: routeResult?.comparison?.walk?.distanceKm,
                          durationMin:
                            routeResult?.comparison?.walk?.durationMin,
                        },
                      },
                      roadGeometryPointsCount:
                        routeResult?.roadGeometry?.length || 0,
                      executionTimeMs: routeResult?.executionTimeMs,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </main>

        {/* 3. BOTTOM FLOATING PILL DOCK (#18181C) + DETACHED LAVENDER + FAB (#A594F9) */}
        <footer className="px-5 py-3 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent shrink-0">
          <div className="flex items-center justify-between gap-3">
            <nav className="flex-1 bg-[#18181C]/95 backdrop-blur-2xl border border-white/[0.09] rounded-full px-2 py-1.5 flex items-center justify-around shadow-2xl">
              {[
                { id: 'navigate', label: 'Navigate', icon: Home },
                { id: 'trace', label: 'Dijkstra Trace', icon: Cpu },
                { id: 'api', label: 'API JSON', icon: FileCode2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-10 px-4 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${
                      active
                        ? 'bg-white text-[#09090B] shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Detached Lavender Circular + FAB (#A594F9) to add Via Stop */}
            <button
              onClick={() => {
                setActiveTab('navigate');
                setIsAddingViaStop((prev) => !prev);
              }}
              title="Add Intermediate Via Stop (+)"
              className={`w-13 h-13 p-3.5 rounded-full flex items-center justify-center shrink-0 shadow-[0_10px_28px_rgba(165,148,249,0.35)] transition-all active:scale-95 ${
                isAddingViaStop
                  ? 'bg-[#4ADE80] text-[#09090B] rotate-45'
                  : 'bg-[#A594F9] text-[#09090B] hover:brightness-110'
              }`}
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        </footer>
      </aside>

      {/* =====================================================================
          RIGHT / TOP FULL-BLEED INTERACTIVE DARK LEAFLET MAP
         ===================================================================== */}
      <section className="flex-1 h-[42vh] lg:h-full relative z-10">
        <MapCanvas
          graph={graph}
          sourceId={sourceId}
          targetId={targetId}
          viaNodeIds={viaNodeIds}
          mode={mode}
          routeResult={routeResult}
          isAddingViaStop={isAddingViaStop}
          onSelectNode={handleSelectMapNode}
          onCancelViaMode={() => setIsAddingViaStop(false)}
          recenterTrigger={recenterTrigger}
          onTriggerRecenter={() => setRecenterTrigger((c) => c + 1)}
        />
      </section>
    </div>
  );
}
