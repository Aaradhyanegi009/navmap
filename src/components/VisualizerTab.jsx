import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function VisualizerTab({
  routeResult,
  activeStepIndex,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBack,
  onResetReplay,
  onScrubStep,
}) {
  const visitedOrder = routeResult?.visitedOrder || [];
  const totalSteps = visitedOrder.length;
  const currentStepNumber =
    activeStepIndex === null || activeStepIndex === undefined
      ? totalSteps
      : activeStepIndex;

  const currentStepData =
    currentStepNumber > 0 && currentStepNumber <= totalSteps
      ? visitedOrder[currentStepNumber - 1]
      : null;

  return (
    <div className="space-y-4 pb-6">
      {/* Visualizer Hero Control Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-[#282249] flex items-center justify-center text-[#A594F9] shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white">
                Dijkstra Relaxation Trace
              </h2>
              <p className="text-xs text-zinc-400">
                Min-Heap Priority Queue · Step {currentStepNumber} of{' '}
                {totalSteps || 0}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-[#1C1C20] border border-white/10 text-xs font-mono text-[#4ADE80]">
            O((V+E) log V)
          </span>
        </div>

        {/* Scrubber Slider */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalSteps)}
            value={currentStepNumber}
            onChange={(e) => onScrubStep(Number(e.target.value))}
            className="w-full accent-[#A594F9] bg-[#1C1C20] h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
            <span>Init (0)</span>
            <span>
              Relaxed: {currentStepData?.currentShortName || 'Complete'}
            </span>
            <span>Lock ({totalSteps})</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onResetReplay}
            className="px-3 py-2 rounded-full bg-[#1C1C20] hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Wave</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onStepBack}
              disabled={currentStepNumber <= 1}
              className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 disabled:opacity-40 flex items-center justify-center text-white transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onPlayPause}
              className="px-4 h-9 rounded-full bg-[#A594F9] text-[#09090B] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Animate</span>
                </>
              )}
            </button>
            <button
              onClick={onStepForward}
              disabled={currentStepNumber >= totalSteps}
              className="w-9 h-9 rounded-full bg-[#1C1C20] hover:bg-white/10 disabled:opacity-40 flex items-center justify-center text-white transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Step Inspection Card */}
      {currentStepData ? (
        <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 space-y-4">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-2">
              POPPED FROM MIN-HEAP (STEP {currentStepData.step})
            </div>
            <div className="bg-[#14331C] border border-[#4ADE80]/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9BC4A5] font-mono">
                  u = {currentStepData.currentNodeId}
                </div>
                <div className="text-base font-bold text-white">
                  {currentStepData.currentNodeName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#9BC4A5]">d[u] settled</div>
                <div className="text-base font-bold text-[#4ADE80] font-mono">
                  {currentStepData.distanceMetersSoFar} m
                </div>
              </div>
            </div>
          </div>

          {/* Edge Evaluations in Current Step */}
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-2">
              NEIGHBOR RELAXATIONS: d[u] + w(u,v) &lt; d[v]
            </div>
            {currentStepData.relaxedEdges.length === 0 ? (
              <div className="text-xs text-zinc-500 bg-[#1C1C20] rounded-2xl p-3">
                All adjacent neighbors already settled in visited set S.
              </div>
            ) : (
              <div className="space-y-2">
                {currentStepData.relaxedEdges.map((edge, idx) => (
                  <div
                    key={`${edge.edgeId}-${idx}`}
                    className={`rounded-2xl p-3 border text-xs flex items-center justify-between ${
                      edge.improved
                        ? 'bg-[#1C1C20] border-[#4ADE80]/30'
                        : 'bg-[#1C1C20]/60 border-white/5 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span className="font-mono text-[#A594F9]">
                          {edge.from}
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="font-mono text-[#4ADE80]">
                          {edge.to}
                        </span>
                        <span className="text-zinc-300">({edge.toName})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {edge.roadName} · w = {edge.distance}m (
                        {edge.trafficMultiplier}x)
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-zinc-400">
                        {edge.oldCost} →{' '}
                        <span
                          className={
                            edge.improved
                              ? 'text-[#4ADE80] font-bold'
                              : 'text-zinc-400'
                          }
                        >
                          {edge.newCost}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] font-sans font-semibold ${
                          edge.improved ? 'text-[#4ADE80]' : 'text-[#F87171]'
                        }`}
                      >
                        {edge.improved ? '+relaxed (pq push)' : 'bypassed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Queue Snapshot */}
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase mb-2">
              MIN-HEAP FRONTIER QUEUE ({currentStepData.pqSnapshot.length} ITEMS)
            </div>
            {currentStepData.pqSnapshot.length === 0 ? (
              <div className="text-xs text-zinc-500 bg-[#1C1C20] rounded-2xl p-3">
                Priority Queue empty or target reached.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {currentStepData.pqSnapshot.map((item, i) => (
                  <span
                    key={`${item.nodeId}-${i}`}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
                      i === 0
                        ? 'bg-[#282249] text-[#A594F9] border-[#A594F9]/40 font-bold'
                        : 'bg-[#1C1C20] text-zinc-300 border-white/5'
                    }`}
                  >
                    {item.nodeId}: {item.priority}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 text-sm text-zinc-400">
          Select an origin and destination node to inspect Dijkstra relaxation steps.
        </div>
      )}
    </div>
  );
}
