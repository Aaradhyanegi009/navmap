import React, { useState } from 'react';
import {
  Zap,
  X,
  ChevronRight,
  Radio,
  ArrowUpDown,
  ListChecks,
  Navigation,
  Clock,
  Ruler,
  Plus,
  Sparkles,
  MapPin,
  Route,
} from 'lucide-react';

export default function NavigateTab({
  graph,
  presets,
  activePreset,
  onSelectPreset,
  sourceId,
  targetId,
  waypoints,
  mode,
  onChangeSource,
  onChangeTarget,
  onSwapNodes,
  onChangeMode,
  onToggleWaypoint,
  onResetAll,
  routeResult,
  lastRoutedTime,
  onOpenApiInspector,
  onOpenVisualizer,
  onStartAddCustomNode,
}) {
  const [telemetryDismissed, setTelemetryDismissed] = useState(false);

  const nodes = graph?.nodes || [];
  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);

  const hasActiveRoute =
    Boolean(routeResult) &&
    Array.isArray(routeResult.shortestPath) &&
    routeResult.shortestPath.length >= 2;

  const naiveComp = routeResult?.naiveComparison;
  const intermediateNodes = hasActiveRoute
    ? routeResult.shortestPath.slice(1, -1)
    : [];

  return (
    <div className="space-y-4 pb-6">
      {/* 1. SIGNATURE "SINCE LAST ROUTE" / TELEMETRY CARD (#141417) */}
      {!telemetryDismissed && (
        <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 shadow-xl transition-all">
          {/* Card Top Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Electric Indigo Squircle Lightning Icon */}
              <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0 shadow-inner">
                <Zap className="w-5 h-5 fill-[#A594F9]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-white leading-tight">
                  {hasActiveRoute ? 'Since last route' : 'Route Engine Ready'}
                </h2>
                <p className="text-[13px] text-zinc-400 mt-0.5">
                  {hasActiveRoute
                    ? `Since ${lastRoutedTime} · ${routeResult.executionTimeMs}ms compute`
                    : `Dijkstra Min-Heap · ${nodes.length} nodes indexed`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTelemetryDismissed(true)}
              title="Dismiss card"
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Micro Section Header: ROUTE TELEMETRY */}
          <div className="mt-4 pt-1">
            <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-2">
              ROUTE TELEMETRY
            </div>

            <button
              onClick={onOpenVisualizer}
              className="w-full flex items-center justify-between gap-2 text-left group py-1 rounded-xl hover:bg-white/[0.02] transition"
            >
              <div className="min-w-0 pr-2">
                <div className="text-[15px] font-semibold text-white truncate">
                  {sourceNode && targetNode
                    ? `${sourceNode.shortName || sourceNode.name} → ${
                        targetNode.shortName || targetNode.name
                      }`
                    : 'Awaiting Origin & Destination'}
                </div>
                <div className="text-[13px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  {hasActiveRoute && naiveComp ? (
                    <>
                      <span className="text-[#4ADE80] font-medium">
                        +{naiveComp.nodesRelaxedCount} relaxed
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[#F87171] font-medium">
                        {naiveComp.nodesBypassed} bypassed
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#4ADE80] font-medium">
                        +optimal ready
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[#F87171] font-medium">
                        0 congestion penalty
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {hasActiveRoute && naiveComp ? (
                  <div className="text-right">
                    <span className="text-zinc-400 text-[14px]">
                      {naiveComp.naiveDistanceKm} km →{' '}
                    </span>
                    <span className="text-white font-bold text-[16px]">
                      {routeResult.totalDistanceKm} km
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-400 text-sm">Select nodes</span>
                )}
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
              </div>
            </button>
          </div>

          {/* Micro Section Header: ON API */}
          <div className="mt-4 pt-1">
            <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-2">
              ON API
            </div>

            <button
              onClick={onOpenApiInspector}
              className="w-full flex items-center justify-between gap-3 py-1 rounded-xl hover:bg-white/[0.03] transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Deep Teal Squircle Badge */}
                <div className="w-9 h-9 rounded-[12px] bg-[#1A313D] flex items-center justify-center text-[#67E8F9] shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="text-[15px] font-medium text-white truncate">
                  POST /api/navigate · {routeResult?.httpStatus || '200 OK'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 transition" />
            </button>
          </div>
        </div>
      )}

      {/* 2. FOREST GREEN HERO STATUS CARD (#14331C) */}
      <div className="bg-[#14331C] border border-[#4ADE80]/15 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
        {!hasActiveRoute ? (
          <div>
            <h3 className="text-[26px] leading-[1.15] font-bold tracking-tight text-white">
              Nothing routed
              <br />
              yet
            </h3>
            <p className="text-[15px] text-[#9BC4A5] mt-2 leading-relaxed">
              Select an origin and destination node on the map.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[26px] leading-[1.15] font-bold tracking-tight text-white">
                Optimal path
                <br />
                locked
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-black/25 border border-[#9BC4A5]/25 text-[#4ADE80] text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {naiveComp?.percentSaved || 24}% shorter
              </span>
            </div>

            <p className="text-[15px] text-[#9BC4A5] mt-2 font-medium">
              {routeResult.totalDistanceKm} km ({routeResult.totalDistance} m) via{' '}
              {routeResult.shortestPath.length} nodes · Est.{' '}
              {routeResult.estimatedTime} mins
            </p>

            {/* Turn-by-Turn Node Sequence Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {routeResult.shortestPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      index === 0
                        ? 'bg-[#282249] text-[#A594F9] border border-[#A594F9]/40'
                        : index === routeResult.shortestPath.length - 1
                        ? 'bg-[#4ADE80] text-[#09090B]'
                        : 'bg-black/30 text-white border border-white/10'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75">
                      {node.id}
                    </span>
                    <span>{node.shortName}</span>
                  </span>
                  {index < routeResult.shortestPath.length - 1 && (
                    <span className="text-[#9BC4A5] text-xs font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. ROUTE ORIGIN / DESTINATION & WEIGHT MODE CONTROLS (#141417) */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4 space-y-3.5">
        {/* Preset Network Switcher */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
            TOPOLOGY PRESET
          </span>
          <div className="flex items-center gap-1 bg-[#1C1C20] p-1 rounded-full border border-white/5">
            {Object.values(presets).map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
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

        {/* Origin & Destination Selectors */}
        <div className="relative space-y-2">
          {/* Origin Pill */}
          <div className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A594F9] shrink-0 shadow-[0_0_8px_#A594F9]" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Origin Node
              </div>
              <select
                value={sourceId || ''}
                onChange={(e) => onChangeSource(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
              >
                <option value="" className="bg-[#141417] text-zinc-400">
                  Select origin node...
                </option>
                {nodes.map((n) => (
                  <option
                    key={n.id}
                    value={n.id}
                    className="bg-[#141417] text-white"
                  >
                    [{n.id}] {n.name} ({n.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={onSwapNodes}
            title="Swap Origin & Destination"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#282249] hover:bg-[#A594F9] text-[#A594F9] hover:text-[#09090B] border border-[#A594F9]/30 flex items-center justify-center shadow-lg transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* Destination Pill */}
          <div className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.05] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shrink-0 shadow-[0_0_8px_#4ADE80]" />
            <div className="flex-1 min-w-0 pr-8">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Destination Node
              </div>
              <select
                value={targetId || ''}
                onChange={(e) => onChangeTarget(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
              >
                <option value="" className="bg-[#141417] text-zinc-400">
                  Select destination node...
                </option>
                {nodes.map((n) => (
                  <option
                    key={n.id}
                    value={n.id}
                    className="bg-[#141417] text-white"
                  >
                    [{n.id}] {n.name} ({n.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Optimization Mode Toggle: Shortest Distance vs Fastest Time */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={() => onChangeMode('distance')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-semibold transition border ${
              mode === 'distance'
                ? 'bg-[#282249] text-[#A594F9] border-[#A594F9]/40'
                : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Shortest Distance</span>
          </button>
          <button
            onClick={() => onChangeMode('time')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-semibold transition border ${
              mode === 'time'
                ? 'bg-[#1A313D] text-[#67E8F9] border-[#67E8F9]/40'
                : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fastest Time (Traffic)</span>
          </button>
        </div>
      </div>

      {/* 4. WAYPOINTS & GRAPH TASKS SECTION (Matches "Notes & tasks" from reference) */}
      <div className="pt-1">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <h3 className="text-[17px] font-bold text-white">
            Waypoints &amp; stops
          </h3>
          <button
            onClick={onResetAll}
            className="text-sm text-zinc-400 hover:text-white flex items-center gap-0.5 transition"
          >
            <span>Reset all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4">
          {!hasActiveRoute || intermediateNodes.length === 0 ? (
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="text-[14px] text-zinc-200 leading-snug">
                Nothing queued. Add a custom node with the{' '}
                <button
                  onClick={onStartAddCustomNode}
                  className="text-[#A594F9] font-semibold underline underline-offset-2 hover:text-white"
                >
                  + button
                </button>
                .
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {intermediateNodes.length} Intermediate Traverse{' '}
                      {intermediateNodes.length === 1 ? 'Stop' : 'Stops'}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Turn-by-turn sequence along optimal path
                    </div>
                  </div>
                </div>
                <button
                  onClick={onStartAddCustomNode}
                  className="px-2.5 py-1 rounded-full bg-[#1C1C20] hover:bg-[#282249] text-xs text-[#A594F9] font-semibold border border-white/10 transition"
                >
                  + Drop Node
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {intermediateNodes.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#282249] text-[#A594F9] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {stop.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          via {stop.roadFromPrev} · +{stop.segmentDistance}m
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-bold text-[#4ADE80]">
                        {(stop.cumulativeDistance / 1000).toFixed(2)} km
                      </div>
                      {stop.trafficMultiplier > 1.0 && (
                        <div className="text-[10px] text-[#F87171] font-medium">
                          +{stop.trafficMultiplier}x traffic
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Bottom Helper Caption matching screenshot */}
      <p className="text-center text-xs text-zinc-600 pt-1">
        Since last route shows Dijkstra relaxation vs naive paths
      </p>
    </div>
  );
}
