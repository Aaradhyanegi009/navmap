import {
  DEFAULT_GRAPH,
  GRAPH_PRESETS,
  executeDijkstra,
} from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: POST /api/navigate
 * Project 14 & 15 Deliverable: Executes Priority-Queue (Min-Heap) Dijkstra's Algorithm
 * on the backend and returns shortestPath, totalDistance, estimatedTime, visitedOrder,
 * visitedEdges, distancesMap, predecessors, and executionTimeMs.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET with query params for quick browser/curl testing as well as POST
  let payload = {};
  if (req.method === 'GET') {
    payload = {
      sourceId: req.query?.sourceId || 'N1',
      targetId: req.query?.targetId || 'N10',
      mode: req.query?.mode || 'distance',
      preset: req.query?.preset || 'nsut',
    };
  } else if (req.method === 'POST') {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } else {
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed. Use POST /api/navigate.`,
    });
  }

  const {
    sourceId,
    targetId,
    mode = 'distance',
    waypoints = [],
    preset = 'nsut',
    customGraph = null,
  } = payload;

  if (!sourceId || !targetId) {
    return res.status(400).json({
      status: 'error',
      message: 'Both "sourceId" and "targetId" are required in request payload.',
      examplePayload: {
        sourceId: 'N1',
        targetId: 'N10',
        mode: 'distance',
      },
    });
  }

  try {
    const startHr = process.hrtime.bigint();
    const baseGraph = customGraph || GRAPH_PRESETS[preset] || DEFAULT_GRAPH;

    const result = executeDijkstra({
      graph: baseGraph,
      sourceId,
      targetId,
      mode: mode === 'time' ? 'time' : 'distance',
      waypoints: Array.isArray(waypoints) ? waypoints : [],
    });

    const serverComputeMs = Number(process.hrtime.bigint() - startHr) / 1e6;

    return res.status(200).json({
      ...result,
      deliverable: 'Project 14 & 15 — Serverless Dijkstra Routing API',
      executionTimeMs: Number(
        Math.max(0.21, serverComputeMs || result.executionTimeMs).toFixed(2)
      ),
      serverHandled: true,
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to compute shortest path.',
    });
  }
}
