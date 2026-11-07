import {
  DEFAULT_GRAPH,
  GRAPH_PRESETS,
  executeDijkstraAsync,
} from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: POST /api/navigate
 * Deliverables:
 *   - Project 14: Standalone Backend REST API for Dijkstra Shortest-Path Routing
 *   - Project 15: Chained Intermediate Waypoints ("Via" Stops), Car vs. Walk
 *     Dual-Mode Comparison, and Real OSRM Street Geometry Hydration
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let payload = {};
  if (req.method === 'GET') {
    const viaRaw = req.query?.viaNodeIds || '';
    payload = {
      sourceId: req.query?.sourceId || 'N2',
      targetId: req.query?.targetId || 'N14',
      viaNodeIds: viaRaw ? viaRaw.split(',').filter(Boolean) : [],
      mode: req.query?.mode || 'car',
      preset: req.query?.preset || 'nsut',
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
    waypoints = [],
    mode = 'car',
    preset = 'nsut',
    customGraph = null,
  } = payload;

  if (!sourceId || !targetId) {
    return res.status(400).json({
      status: 'error',
      message: 'Both "sourceId" and "targetId" are required.',
      examplePayload: {
        sourceId: 'N2',
        targetId: 'N14',
        viaNodeIds: ['N3'],
        mode: 'car',
      },
    });
  }

  try {
    const startHr = process.hrtime.bigint();
    const baseGraph = customGraph || GRAPH_PRESETS[preset] || DEFAULT_GRAPH;
    const normalizedVia =
      Array.isArray(viaNodeIds) && viaNodeIds.length > 0
        ? viaNodeIds
        : Array.isArray(waypoints)
        ? waypoints
        : [];

    const result = await executeDijkstraAsync({
      graph: baseGraph,
      sourceId,
      targetId,
      viaNodeIds: normalizedVia,
      mode: mode === 'walk' ? 'walk' : 'car',
      enableLiveOSRM: true,
    });

    const elapsedMs = Number(process.hrtime.bigint() - startHr) / 1e6;

    return res.status(200).json({
      ...result,
      deliverable: 'Experiments 14 & 15 — Hybrid Dijkstra + OSRM Routing API',
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
