# NavMap — Dijkstra's Shortest-Path Navigator

**Live Production App**: [https://navmap-puce.vercel.app](https://navmap-puce.vercel.app)  
**GitHub Repository**: [https://github.com/AaradhyaNegi009/navmap](https://github.com/AaradhyaNegi009/navmap)

**NavMap** is a minimalist, ultra-dark shortest-path navigator powered by a **Binary Min-Heap Dijkstra's Algorithm Engine**, built with **React 18 (Vite)**, **Tailwind CSS**, **React-Leaflet (CartoDB Dark Matter)**, and **Vercel Serverless Functions**.

### Academic Engineering Deliverables
1. **Project 14**: Map Navigator Application & Standalone Backend REST API (`/api/graph` & `/api/navigate`).
2. **Project 15**: Full-Stack Integration of the Backend Dijkstra Routing API with an Interactive Map & Relaxation Visualizer Client.

---

## Live Serverless REST API Endpoints

| Endpoint | Method | Live URL | Description |
| :--- | :--- | :--- | :--- |
| `/api/graph` | `GET` | `https://navmap-puce.vercel.app/api/graph?preset=nsut` | Returns the default topological graph dataset (`nodes` with `lat`/`lng` coordinates, categories, and weighted bidirectional `edges` with distance in meters and traffic multipliers). |
| `/api/navigate` | `POST` | `https://navmap-puce.vercel.app/api/navigate` | Executes **Dijkstra's Shortest Path Algorithm** (`O((V + E) log V)`) for `{ sourceId, targetId, mode: "distance" \| "time", waypoints?, customGraph? }` and returns `shortestPath`, `totalDistance`, `estimatedTime`, `visitedOrder` relaxation trace, `naiveComparison`, and `executionTimeMs`. |

### Quick Test via `curl`

```bash
curl -X POST "https://navmap-puce.vercel.app/api/navigate" \
  -H "Content-Type: application/json" \
  -d '{"sourceId":"N2","targetId":"N13","mode":"distance","preset":"nsut"}'
```

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
