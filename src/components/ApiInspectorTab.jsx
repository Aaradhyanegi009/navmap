import React, { useState } from 'react';
import {
  FileCode2,
  Send,
  Copy,
  Check,
  Server,
  Terminal,
  Activity,
} from 'lucide-react';

export default function ApiInspectorTab({
  sourceId,
  targetId,
  mode,
  activePreset,
  routeResult,
  graphApiMeta,
  onTriggerLiveNavigate,
  onTriggerLiveGraphFetch,
}) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('navigate');
  const [copied, setCopied] = useState(false);

  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://navmap.vercel.app';

  const curlSnippet =
    selectedEndpoint === 'navigate'
      ? `curl -X POST "${originUrl}/api/navigate" \\
  -H "Content-Type: application/json" \\
  -d '{"sourceId":"${sourceId || 'N1'}","targetId":"${targetId || 'N10'}","mode":"${mode}","preset":"${activePreset}"}'`
      : `curl -X GET "${originUrl}/api/graph?preset=${activePreset}"`;

  const displayedJson = React.useMemo(() => {
    if (selectedEndpoint === 'graph') {
      return (
        graphApiMeta || {
          status: 'ok',
          endpoint: 'GET /api/graph',
          note: 'Click Test Endpoint to inspect full graph payload',
        }
      );
    }
    if (!routeResult) {
      return {
        status: 'awaiting_selection',
        message: 'Select an Origin and Destination node to inspect POST /api/navigate payload.',
      };
    }
    return {
      status: routeResult.status,
      deliverable: 'Project 14 & 15 — Serverless Dijkstra Routing API',
      httpStatus: routeResult.httpStatus || '200 OK',
      executionTimeMs: routeResult.executionTimeMs,
      roundTripMs: routeResult.roundTripMs,
      mode: routeResult.mode,
      sourceId: routeResult.sourceId,
      targetId: routeResult.targetId,
      totalDistance: routeResult.totalDistance,
      totalDistanceKm: routeResult.totalDistanceKm,
      estimatedTime: routeResult.estimatedTime,
      shortestPath: routeResult.shortestPath?.map((n) => ({
        id: n.id,
        name: n.name,
        lat: n.lat,
        lng: n.lng,
        cumulativeDistance: n.cumulativeDistance,
      })),
      naiveComparison: routeResult.naiveComparison,
      visitedOrderCount: routeResult.visitedOrder?.length || 0,
      visitedOrderSample: (routeResult.visitedOrder || []).slice(0, 4),
      distancesMap: routeResult.distancesMap,
      predecessors: routeResult.predecessors,
    };
  }, [selectedEndpoint, routeResult, graphApiMeta]);

  const handleCopy = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header Deliverable Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-[#1A313D] flex items-center justify-center text-[#67E8F9] shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white">
                REST API Telemetry
              </h2>
              <p className="text-xs text-zinc-400">
                Projects 14 &amp; 15 · Vercel Serverless Functions
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-[#14331C] border border-[#4ADE80]/30 text-xs font-semibold text-[#4ADE80]">
            {routeResult?.httpStatus || '200 OK'}
          </span>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => setSelectedEndpoint('navigate')}
            className={`py-2 px-3 rounded-2xl text-xs font-mono font-semibold border transition ${
              selectedEndpoint === 'navigate'
                ? 'bg-[#282249] text-[#A594F9] border-[#A594F9]/40'
                : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            POST /api/navigate
          </button>
          <button
            onClick={() => setSelectedEndpoint('graph')}
            className={`py-2 px-3 rounded-2xl text-xs font-mono font-semibold border transition ${
              selectedEndpoint === 'graph'
                ? 'bg-[#1A313D] text-[#67E8F9] border-[#67E8F9]/40'
                : 'bg-[#1C1C20] text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            GET /api/graph
          </button>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-[#1C1C20] rounded-2xl p-2.5 text-center">
            <div className="text-[10px] uppercase text-zinc-500 font-semibold">
              Compute
            </div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {routeResult?.executionTimeMs || 0.38} ms
            </div>
          </div>
          <div className="bg-[#1C1C20] rounded-2xl p-2.5 text-center">
            <div className="text-[10px] uppercase text-zinc-500 font-semibold">
              Round-Trip
            </div>
            <div className="text-sm font-bold text-[#4ADE80] font-mono mt-0.5">
              {routeResult?.roundTripMs || 4} ms
            </div>
          </div>
          <div className="bg-[#1C1C20] rounded-2xl p-2.5 text-center">
            <div className="text-[10px] uppercase text-zinc-500 font-semibold">
              Relaxations
            </div>
            <div className="text-sm font-bold text-[#A594F9] font-mono mt-0.5">
              {routeResult?.visitedEdges?.length || 0} edges
            </div>
          </div>
        </div>

        {/* Dispatch Live API Request Button */}
        <button
          onClick={
            selectedEndpoint === 'navigate'
              ? onTriggerLiveNavigate
              : onTriggerLiveGraphFetch
          }
          className="mt-3.5 w-full py-2.5 rounded-full bg-[#A594F9] text-[#09090B] font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            Dispatch Live{' '}
            {selectedEndpoint === 'navigate'
              ? 'POST /api/navigate'
              : 'GET /api/graph'}
          </span>
        </button>
      </div>

      {/* cURL Command Card */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
            <Terminal className="w-3.5 h-3.5 text-[#67E8F9]" />
            <span>STANDALONE REST API CURL</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-[#A594F9] hover:text-white flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="text-[#4ADE80]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy cURL</span>
              </>
            )}
          </button>
        </div>
        <pre className="bg-[#09090B] border border-white/5 rounded-2xl p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
          {curlSnippet}
        </pre>
      </div>

      {/* Live JSON Response Payload Viewer */}
      <div className="bg-[#141417] border border-white/[0.07] rounded-[24px] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
            LIVE JSON PAYLOAD ({selectedEndpoint.toUpperCase()})
          </span>
          <span className="text-[11px] font-mono text-[#4ADE80]">
            application/json
          </span>
        </div>
        <pre className="bg-[#09090B] border border-white/5 rounded-2xl p-3.5 text-[11px] font-mono text-[#9BC4A5] max-h-[320px] overflow-y-auto leading-relaxed">
          {JSON.stringify(displayedJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
