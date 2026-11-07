import {
  DEFAULT_GRAPH,
  executeDijkstraAsync,
} from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: POST /api/navigate
 * Deliverables:
 *   - Project 14: Standalone Backend REST API for Dijkstra Shortest-Path Routing
 *   - Project 15: Pan-New Delhi + NSUT Dwarka Priority Hub, Chained "Via" Stops,
 *     Car vs. Walk Dual-Mode Comparison, and Real OSRM Street Snapping
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let payload = {};
  if (req.method === 'GET') {
    const viaRaw = req.query?.viaNodeIds || '';
    payload = {
      sourceId: req.query?.sourceId || 'nsut_main',
      targetId: req.query?.targetId || 'connaught_place',
      viaNodeIds: viaRaw ? viaRaw.split(',').filter(Boolean) : [],
      mode: req.query?.mode || 'car',
    };
  } else if (req.method === 'POST') {
    payload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } else {
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed. Use POST /api/navigate.`,
    });
  }

  const {
    sourceId,
    targetId,
    viaNodeIds = [],
    mode = 'car',
    customGraph = null,
  } = payload;

  if (!sourceId || !targetId) {
    return res.status(400).json({
      status: 'error',
      message: 'Both "sourceId" and "targetId" are required.',
      examplePayload: {
        sourceId: 'nsut_main',
        targetId: 'connaught_place',
        viaNodeIds: ['dhaula_kuan'],
        mode: 'car',
      },
    });
  }

  try {
    const startHr = process.hrtime.bigint();
    const baseGraph =
      customGraph && customGraph.version === 'navmap_v3_graph'
        ? customGraph
        : DEFAULT_GRAPH;

    const result = await executeDijkstraAsync({
      graph: baseGraph,
      sourceId,
      targetId,
      viaNodeIds: Array.isArray(viaNodeIds) ? viaNodeIds : [],
      mode: mode === 'walk' ? 'walk' : 'car',
      enableLiveOSRM: true,
    });

    const elapsedMs = Number(process.hrtime.bigint() - startHr) / 1e6;

    return res.status(200).json({
      ...result,
      version: 'navmap_v3_graph',
      deliverable: 'Experiments 14 & 15 — Pan-Delhi Hybrid Dijkstra + OSRM API',
      serverExecutionTimeMs: Number(elapsedMs.toFixed(2)),
      serverHandled: true,
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to execute Dijkstra navigation.',
    });
  }
}
