import React, { useState } from 'react';
import {
  Network,
  Plus,
  RotateCcw,
  Sliders,
  MapPin,
  ArrowLeftRight,
} from 'lucide-react';
import { haversineDistance } from '../lib/dijkstra.js';

export default function GraphEditorTab({
  graph,
  onUpdateEdgeTraffic,
  onAddCustomEdge,
  onStartAddCustomNode,
  onResetGraphToPreset,
}) {
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const [newEdgeFrom, setNewEdgeFrom] = useState(nodes[0]?.id || 'N1');
  const [newEdgeTo, setNewEdgeTo] = useState(nodes[3]?.id || 'N4');
  const [newEdgeTraffic, setNewEdgeTraffic] = useState(1.0);

  const nodesMap = React.useMemo(() => {
    const map = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (!newEdgeFrom || !newEdgeTo || newEdgeFrom === newEdgeTo) return;
    const u = nodesMap[newEdgeFrom];
    const v = nodesMap[newEdgeTo];
    if (!u || !v) return;
    const dist = haversineDistance(u.lat, u.lng, v.lat, v.lng);
    onAddCustomEdge({
      from: newEdgeFrom,
      to: newEdgeTo,
      distance: dist,
      trafficMultiplier: Number(newEdgeTraffic),
      roadName: `${u.shortName}–${v.shortName} Link`,
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Graph Topology Summary Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white">
                Graph Topology Editor
              </h2>
              <p className="text-xs text-zinc-400">
                {nodes.length} Nodes · {edges.length} Bidirectional Weighted Edges
              </p>
            </div>
          </div>

          <button
            onClick={onResetGraphToPreset}
            title="Restore default weights"
            className="px-3 py-1.5 rounded-full bg-[#1C1C20] hover:bg-white/10 text-xs text-zinc-300 flex items-center gap-1.5 border border-white/5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Add Custom Node or Edge Actions */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-400">
            Drop a new node directly on the map canvas:
          </div>
          <button
            onClick={onStartAddCustomNode}
            className="px-3.5 py-2 rounded-full bg-[#A594F9] text-[#09090B] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>+ Drop Map Node</span>
          </button>
        </div>
      </div>

      {/* Add Custom Edge Card */}
      <form
        onSubmit={handleCreateEdge}
        className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4 space-y-3"
      >
        <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
          CONNECT CUSTOM EDGE (AUTO-HAVERSINE)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newEdgeFrom}
            onChange={(e) => setNewEdgeFrom(e.target.value)}
            className="bg-[#1C1C20] text-white text-xs font-semibold rounded-2xl px-3 py-2.5 border border-white/5 focus:outline-none"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id} className="bg-[#141417]">
                {n.id}: {n.shortName}
              </option>
            ))}
          </select>
          <select
            value={newEdgeTo}
            onChange={(e) => setNewEdgeTo(e.target.value)}
            className="bg-[#1C1C20] text-white text-xs font-semibold rounded-2xl px-3 py-2.5 border border-white/5 focus:outline-none"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id} className="bg-[#141417]">
                {n.id}: {n.shortName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {[1.0, 1.4, 2.1].map((mult) => (
              <button
                type="button"
                key={mult}
                onClick={() => setNewEdgeTraffic(mult)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                  newEdgeTraffic === mult
                    ? 'bg-[#282249] text-[#A594F9] border-[#A594F9]/40'
                    : 'bg-[#1C1C20] text-zinc-400 border-transparent'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-full bg-[#14331C] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-semibold hover:bg-[#14331C]/80 transition"
          >
            + Connect Edge
          </button>
        </div>
      </form>

      {/* Live Edge Weights & Traffic Multipliers List */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
            EDGE WEIGHTS &amp; TRAFFIC MULTIPLIERS
          </span>
          <span className="text-[11px] text-zinc-500">
            Click 1.0x / 1.4x / 2.1x
          </span>
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {edges.map((edge) => {
            const u = nodesMap[edge.from];
            const v = nodesMap[edge.to];
            const mult = Number(edge.trafficMultiplier || 1.0);

            return (
              <div
                key={edge.id}
                className="bg-[#1C1C20] rounded-2xl p-3 border border-white/[0.04] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[#A594F9]">{edge.from}</span>
                    <ArrowLeftRight className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="font-mono text-[#4ADE80]">{edge.to}</span>
                    <span className="text-zinc-300 truncate">
                      {edge.roadName}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {edge.distance} m ·{' '}
                    {u?.shortName || edge.from} ↔ {v?.shortName || edge.to}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { val: 1.0, label: '1.0x', color: 'text-[#4ADE80]' },
                    { val: 1.4, label: '1.4x', color: 'text-[#F28B66]' },
                    { val: 2.1, label: '2.1x', color: 'text-[#F87171]' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => onUpdateEdgeTraffic(edge.id, opt.val)}
                      className={`px-2 py-1 rounded-full text-[11px] font-mono font-semibold transition ${
                        Math.abs(mult - opt.val) < 0.05
                          ? 'bg-white text-[#09090B]'
                          : `bg-black/30 ${opt.color} hover:bg-white/10`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
