import React from 'react';
import { Layers, Eye, Map, Sparkles, Activity, Tag } from 'lucide-react';

export default function LayersTab({ layerSettings, onToggleLayer, onChangeTileStyle }) {
  const toggles = [
    {
      key: 'showVisitedWave',
      title: 'Dijkstra Exploration Wave',
      subtitle: 'Highlight relaxed frontier edges in electric lavender (#A594F9)',
      icon: Sparkles,
      badgeColor: 'bg-[#282249] text-[#A594F9]',
    },
    {
      key: 'showEdgeWeights',
      title: 'Edge Distance & Weight Pills',
      subtitle: 'Display floating meter weights & traffic multipliers on roads',
      icon: Tag,
      badgeColor: 'bg-[#1A313D] text-[#67E8F9]',
    },
    {
      key: 'showTrafficColors',
      title: 'Simulated Live Traffic Heatmap',
      subtitle: 'Color edges by congestion (1.0x Emerald, 1.4x Amber, 2.1x Coral)',
      icon: Activity,
      badgeColor: 'bg-[#14331C] text-[#4ADE80]',
    },
    {
      key: 'showNodeLabels',
      title: 'Permanent Node Callouts',
      subtitle: 'Show floating node IDs and landmark titles on map',
      icon: Eye,
      badgeColor: 'bg-[#282249] text-[#A594F9]',
    },
  ];

  const tileOptions = [
    {
      id: 'dark',
      name: 'CartoDB Dark Matter',
      desc: 'Default pitch-obsidian vector streets & labels',
    },
    {
      id: 'matrix',
      name: 'Obsidian Pure Matrix',
      desc: 'Unlabeled ultra-dark road geometry for pure graph focus',
    },
    {
      id: 'voyager',
      name: 'High-Contrast Urban',
      desc: 'Detailed transit & building footprints layer',
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-white">
              Map Layers &amp; Telemetry HUD
            </h2>
            <p className="text-xs text-zinc-400">
              Customize graph overlays &amp; CartoDB dark tile aesthetics
            </p>
          </div>
        </div>
      </div>

      {/* Overlay Toggles Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4 space-y-2.5">
        <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase px-1">
          GRAPH VISUALIZATION OVERLAYS
        </div>

        {toggles.map((item) => {
          const IconComponent = item.icon;
          const active = Boolean(layerSettings[item.key]);
          return (
            <button
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className="w-full bg-[#1C1C20] hover:bg-white/[0.06] rounded-2xl p-3.5 border border-white/[0.04] flex items-center justify-between gap-3 text-left transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.badgeColor}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  <div className="text-xs text-zinc-400 leading-snug mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {/* Pill Switch */}
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                  active ? 'bg-[#4ADE80]' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#09090B] transition-transform ${
                    active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Tile Style Selector Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4 space-y-2.5">
        <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase px-1">
          LEAFLET BASE TILE ENGINE
        </div>

        <div className="space-y-2">
          {tileOptions.map((tile) => {
            const isSelected = layerSettings.tileStyle === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => onChangeTileStyle(tile.id)}
                className={`w-full rounded-2xl p-3.5 border text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-[#14331C] border-[#4ADE80]/40 text-white'
                    : 'bg-[#1C1C20] border-white/[0.04] text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{tile.name}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-[#9BC4A5]' : 'text-zinc-400'
                    }`}
                  >
                    {tile.desc}
                  </div>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? 'border-[#4ADE80] bg-[#4ADE80]'
                      : 'border-zinc-600'
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#09090B]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
