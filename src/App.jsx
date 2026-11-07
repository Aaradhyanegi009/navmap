import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Clock,
  Ruler,
  ChevronDown,
  ChevronUp,
  Zap,
  Code2,
  X,
} from 'lucide-react';
import { DEFAULT_GRAPH, GRAPH_PRESETS } from './lib/dijkstra.js';
import { fetchGraphTopology, requestDijkstraRoute } from './lib/apiClient.js';
import MapCanvas from './components/MapCanvas.jsx';

export default function App() {
  // Graph Network & Preset
  const [activePreset, setActivePreset] = useState('nsut');
  const [graph, setGraph] = useState(DEFAULT_GRAPH);

  // Origin & Destination Selection
  const [sourceId, setSourceId] = useState('N2'); // Dwarka Mor
  const [targetId, setTargetId] = useState('N13'); // Akash Chowk
  const [mode, setMode] = useState('distance'); // 'distance' | 'time'
  const [nextSelectionTarget, setNextSelectionTarget] = useState('source');

  // Routing Results & API Telemetry
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [apiLatencyMs, setApiLatencyMs] = useState(4);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Map Controls
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [mobilePanelCollapsed, setMobilePanelCollapsed] = useState(false);

  const nodes = graph?.nodes || [];
  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);

  // Load Graph Topology Preset from API
  const loadPreset = useCallback(async (presetKey) => {
    const data = await fetchGraphTopology(presetKey);
    if (data?.graph) {
      setGraph(data.graph);
      const graphNodes = data.graph.nodes || [];
      if (graphNodes.length >= 2) {
        setSourceId(graphNodes[1]?.id || graphNodes[0].id);
        setTargetId(graphNodes[graphNodes.length - 3]?.id || graphNodes[graphNodes.length - 1].id);
      }
    }
  }, []);

  useEffect(() => {
    loadPreset(activePreset);
  }, [activePreset, loadPreset]);

  // Execute Dijkstra's Algorithm via Backend REST API (POST /api/navigate)
  const calculateRoute = useCallback(async () => {
    if (!sourceId || !targetId || sourceId === targetId) {
      setRouteResult(null);
      return;
    }

    setIsRouting(true);
    const result = await requestDijkstraRoute({
      sourceId,
      targetId,
      mode,
      preset: activePreset,
      customGraph: graph,
    });
    setIsRouting(false);

    setRouteResult(result);
    setApiLatencyMs(result.roundTripMs || 4);
  }, [sourceId, targetId, mode, activePreset, graph]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  // Click node on the map to set Origin or Destination
  const handleSelectNode = (nodeId) => {
    if (!sourceId || (sourceId && targetId && nextSelectionTarget === 'source')) {
      if (nodeId === targetId) setTargetId('');
      setSourceId(nodeId);
      setNextSelectionTarget('target');
    } else {
      if (nodeId === sourceId) return;
      setTargetId(nodeId);
      setNextSelectionTarget('source');
    }
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const prevSource = sourceId;
    setSourceId(targetId);
    setTargetId(prevSource);
  };

  // Clear current route
  const handleClear = () => {
    setSourceId('');
    setTargetId('');
    setRouteResult(null);
    setNextSelectionTarget('source');
  };

  const hasRoute =
    Boolean(routeResult) &&
    Array.isArray(routeResult.shortestPath) &&
    routeResult.shortestPath.length >= 2;

  return (
    <div className="relative w-screen h-screen bg-[#09090B] overflow-hidden select-none">
      {/* =====================================================================
          1. FULLSCREEN LEAFLET MAP CANVAS (ALWAYS VISIBLE & FRONT-AND-CENTER)
         ===================================================================== */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          graph={graph}
          sourceId={sourceId}
          targetId={targetId}
          routeResult={routeResult}
          onSelectNode={handleSelectNode}
          recenterTrigger={recenterTrigger}
          onTriggerRecenter={() => setRecenterTrigger((c) => c + 1)}
        />
      </div>

      {/* =====================================================================
          2. FLOATING CLEAN GOOGLE MAPS / ANDROID 16 CONTROLLER CARD
         ===================================================================== */}
      <div className="absolute top-4 left-4 z-20 w-[calc(100vw-32px)] sm:w-[400px] max-h-[calc(100vh-32px)] flex flex-col pointer-events-none">
        <div className="pointer-events-auto bg-[#141417]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-4 overflow-y-auto">
          
          {/* Header Block: Title & Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#282249] flex items-center justify-center text-[#A594F9]">
                  <Navigation className="w-4 h-4 fill-current" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  NavMap
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dijkstra Shortest-Path Navigator · Projects 14 &amp; 15
              </p>
            </div>

            {/* Mobile Collapse Toggle */}
            <button
              onClick={() => setMobilePanelCollapsed((c) => !c)}
              className="sm:hidden w-8 h-8 rounded-full bg-[#1C1C20] border border-white/10 flex items-center justify-center text-zinc-300"
            >
              {mobilePanelCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {!mobilePanelCollapsed && (
            <>
              {/* Preset Selector */}
              <div className="flex items-center gap-1.5 bg-[#1C1C20] p-1 rounded-2xl border border-white/5">
                {Object.values(GRAPH_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset.id);
                      setRecenterTrigger((c) => c + 1);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                      activePreset === preset.id
                        ? 'bg-white text-[#09090B] shadow-sm'
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

              {/* Location Selectors: Origin & Destination */}
              <div className="relative space-y-2 bg-[#1C1C20] p-3 rounded-2xl border border-white/5">
                {/* Origin Selector */}
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#A594F9] shrink-0 shadow-[0_0_8px_#A594F9]" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                      Starting Location
                    </label>
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
                    >
                      <option value="" className="bg-[#141417] text-zinc-400">
                        Select start location or tap map...
                      </option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id} className="bg-[#141417]">
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Divider & Swap Button */}
                <div className="relative py-1 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-white/[0.06]" />
                  <button
                    onClick={handleSwap}
                    title="Swap locations"
                    className="absolute w-7 h-7 rounded-full bg-[#282249] hover:bg-[#A594F9] text-[#A594F9] hover:text-[#09090B] border border-[#A594F9]/30 flex items-center justify-center transition shadow-md"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Destination Selector */}
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#4ADE80] shrink-0 shadow-[0_0_8px_#4ADE80]" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                      Destination
                    </label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
                    >
                      <option value="" className="bg-[#141417] text-zinc-400">
                        Select destination or tap map...
                      </option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id} className="bg-[#141417]">
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optimization Mode: Shortest Distance vs Fastest Time */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('distance')}
                  className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                    mode === 'distance'
                      ? 'bg-[#282249] text-[#A594F9] border-[#A594F9]/40'
                      : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Shortest Distance</span>
                </button>
                <button
                  onClick={() => setMode('time')}
                  className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                    mode === 'time'
                      ? 'bg-[#14331C] text-[#4ADE80] border-[#4ADE80]/40'
                      : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fastest Time</span>
                </button>
              </div>

              {/* Route Summary Card (Forest Green #14331C) */}
              {hasRoute ? (
                <div className="bg-[#14331C] border border-[#4ADE80]/30 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#9BC4A5] uppercase tracking-wider">
                      Optimal Path Locked
                    </span>
                    <button
                      onClick={handleClear}
                      className="text-xs text-[#9BC4A5] hover:text-white flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {routeResult.totalDistanceKm} km
                    </span>
                    <span className="text-sm font-semibold text-[#9BC4A5]">
                      ({routeResult.totalDistance} meters) · ~{routeResult.estimatedTime} min
                    </span>
                  </div>

                  {/* Step-by-step route sequence */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {routeResult.shortestPath.map((node, index) => (
                      <React.Fragment key={node.id}>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            index === 0
                              ? 'bg-[#282249] text-[#A594F9]'
                              : index === routeResult.shortestPath.length - 1
                              ? 'bg-[#4ADE80] text-[#09090B]'
                              : 'bg-black/30 text-white'
                          }`}
                        >
                          {node.shortName}
                        </span>
                        {index < routeResult.shortestPath.length - 1 && (
                          <span className="text-[#9BC4A5] text-xs">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1C1C20] rounded-2xl p-4 text-center border border-white/5">
                  <p className="text-sm text-zinc-300 font-medium">
                    Pick any two locations to route
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Select from dropdowns above or tap two circles on the map.
                  </p>
                </div>
              )}

              {/* Telemetry & Academic API Inspector Trigger */}
              <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
                  <span>
                    API {routeResult?.httpStatus || '200 OK'} ({apiLatencyMs}ms)
                  </span>
                </div>

                <button
                  onClick={() => setShowJsonModal(true)}
                  className="text-zinc-400 hover:text-[#A594F9] flex items-center gap-1 transition"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View API JSON</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================================
          3. ACADEMIC REST API MODAL (CLEAN & NON-INTRUSIVE FOR DELIVERABLES)
         ===================================================================== */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-white/10 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">
                  REST API Response Payload
                </h3>
                <p className="text-xs text-zinc-400">
                  Projects 14 &amp; 15 · POST /api/navigate · 200 OK
                </p>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="w-8 h-8 rounded-full bg-[#1C1C20] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="mt-3 flex-1 overflow-y-auto bg-[#09090B] p-4 rounded-2xl text-xs font-mono text-[#9BC4A5] leading-relaxed">
              {JSON.stringify(
                routeResult || {
                  message: 'Select origin & destination to view live Dijkstra payload',
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
