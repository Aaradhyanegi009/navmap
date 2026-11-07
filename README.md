# NavMap — Dijkstra's Shortest-Path Navigator

**NavMap** is a minimalist, ultra-dark shortest-path navigator powered by a **Binary Min-Heap Dijkstra's Algorithm Engine**, built with **React 18 (Vite)**, **Tailwind CSS**, **React-Leaflet (CartoDB Dark Matter)**, and **Vercel Serverless Functions**.

### Academic Engineering Deliverables
1. **Project 14**: Map Navigator Application & Standalone Backend REST API (`/api/graph` & `/api/navigate`).
2. **Project 15**: Full-Stack Integration of the Backend Dijkstra Routing API with an Interactive Map & Relaxation Visualizer Client.

---

## Architecture & REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/graph` | `GET` | Returns the topological road network dataset (`nodes` with `lat`/`lng` coordinates, categories, and weighted bidirectional `edges` with distances in meters and traffic multipliers). Supports `?preset=nsut\|cp\|iitd`. |
| `/api/navigate` | `POST` | Executes **Dijkstra's Shortest Path Algorithm** (`O((V + E) log V)`) for `{ sourceId, targetId, mode: "distance" \| "time", waypoints?, customGraph? }` and returns `shortestPath`, `totalDistance`, `estimatedTime`, `visitedOrder` relaxation trace, `naiveComparison`, and `executionTimeMs`. |

---

## Local Development & Deployment

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
