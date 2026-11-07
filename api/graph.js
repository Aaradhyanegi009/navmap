import { DEFAULT_GRAPH, NSUT_CAMPUS_CONFIG } from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: GET /api/graph
 * Returns the unified two-tier graph (Internal NSUT Campus + Pan-New Delhi).
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
    version: 'navmap_v4_graph',
    campusConfig: NSUT_CAMPUS_CONFIG,
    graph: DEFAULT_GRAPH,
    executionTimeMs: Number(Math.max(0.12, elapsedMs).toFixed(2)),
    timestamp: new Date().toISOString(),
  });
}
