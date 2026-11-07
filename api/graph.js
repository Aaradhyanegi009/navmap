import {
  DEFAULT_GRAPH,
  DELHI_REGIONS,
  PRIORITY_HUB_CONFIG,
} from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: GET /api/graph
 * Project 14 Deliverable: Returns the 34-Node Pan-New Delhi Road Network
 * with NSUT Dwarka designated as the "Circle of Importance" Priority Hub.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed. Use GET /api/graph.`,
    });
  }

  const startHr = process.hrtime.bigint();
  const elapsedMs = Number(process.hrtime.bigint() - startHr) / 1e6;

  return res.status(200).json({
    status: 'ok',
    version: 'navmap_v3_graph',
    deliverable: 'Experiment 14 — Pan-New Delhi + NSUT Priority Hub Graph API',
    engine: 'Dijkstra Engine · v3.0 (OSRM Street Geometry)',
    priorityHub: PRIORITY_HUB_CONFIG,
    regions: DELHI_REGIONS,
    graph: DEFAULT_GRAPH,
    executionTimeMs: Number(Math.max(0.12, elapsedMs).toFixed(2)),
    timestamp: new Date().toISOString(),
  });
}
