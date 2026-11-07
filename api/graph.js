import { DEFAULT_GRAPH, GRAPH_PRESETS } from '../src/lib/dijkstra.js';

/**
 * Vercel Serverless Function: GET /api/graph
 * Project 14 Deliverable: Standalone REST API endpoint returning topological graph dataset
 * (nodes with lat/lng coordinates, names, categories, and weighted bidirectional edges).
 */
export default async function handler(req, res) {
  // Set CORS headers for standalone API accessibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
  const presetKey = (req.query?.preset || 'nsut').toLowerCase();
  const selectedGraph = GRAPH_PRESETS[presetKey] || DEFAULT_GRAPH;

  const presetsMeta = Object.values(GRAPH_PRESETS).map((g) => ({
    id: g.id,
    name: g.name,
    subtitle: g.subtitle,
    nodeCount: g.nodes.length,
    edgeCount: g.edges.length,
    center: g.center,
    zoom: g.zoom,
  }));

  const elapsedMs = Number(process.hrtime.bigint() - startHr) / 1e6;

  return res.status(200).json({
    status: 'ok',
    deliverable: 'Project 14 — Map Navigator Standalone Graph Topology API',
    engine: 'Dijkstra Engine · v1.0',
    preset: selectedGraph.id,
    presets: presetsMeta,
    graph: selectedGraph,
    executionTimeMs: Number(Math.max(0.12, elapsedMs).toFixed(2)),
    timestamp: new Date().toISOString(),
  });
}
