/**
 * ============================================================================
 * NavMap v4.0 — Unified Two-Tier GIS & Dijkstra Engine
 * - Tier A: Internal NSUT Dwarka Campus (15 Landmarks & Walkways)
 * - Tier B: Pan-New Delhi City Network (32 Hubs & Arterials)
 * ============================================================================
 */

export const NSUT_CAMPUS_CONFIG = {
  id: "nsut_campus",
  name: "NSUT Dwarka Campus",
  shortLabel: "NSUT Campus",
  center: [28.6105, 77.0378],
  radiusMeters: 650,
  zoom: 17,
};

export const DELHI_VIEW_CONFIG = {
  center: [28.6139, 77.1650],
  zoom: 11,
};

export class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }
  enqueue(nodeId, priority, meta = {}) {
    this.heap.push({ nodeId, priority, ...meta });
    this._bubbleUp(this.heap.length - 1);
  }
  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min;
  }
  isEmpty() { return this.heap.length === 0; }
  size() { return this.heap.length; }
  toArray() {
    return [...this.heap]
      .sort((a, b) => a.priority - b.priority)
      .map((item) => ({
        nodeId: item.nodeId,
        priority: Number(item.priority.toFixed(2)),
      }));
  }
  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[parentIdx].priority <= this.heap[index].priority) break;
      [this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]];
      index = parentIdx;
    }
  }
  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.max(15, Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export const UNIFIED_GRAPH = {
  "id": "delhi_nsut_v4",
  "name": "Unified NSUT Campus & Pan-New Delhi Graph",
  "center": [
    28.6105,
    77.0378
  ],
  "zoom": 14,
  "campusConfig": {
    "center": [
      28.6105,
      77.0378
    ],
    "radiusMeters": 650,
    "label": "NSUT Dwarka Campus"
  },
  "nodes": [
    {
      "id": "nsut_main_gate",
      "name": "NSUT Main Gate (Azad Hind Fauj Marg)",
      "shortName": "NSUT Main Gate",
      "lat": 28.6083,
      "lng": 77.0325,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Main Gate",
        "Southwest Gate",
        "Gate 1",
        "Azad Hind Fauj Marg"
      ]
    },
    {
      "id": "nsut_admin",
      "name": "Admin Block & Main Auditorium",
      "shortName": "Admin Block",
      "lat": 28.6096,
      "lng": 77.0357,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "VC Office",
        "SBI ATM",
        "Main Audi",
        "Administration",
        "Auditorium"
      ]
    },
    {
      "id": "nsut_moksha",
      "name": "Moksha Ground (Main Fest Lawn)",
      "shortName": "Moksha Ground",
      "lat": 28.6088,
      "lng": 77.0368,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Moksha Stage",
        "Central Lawn",
        "Fest Ground",
        "Open Theatre"
      ]
    },
    {
      "id": "nsut_apj",
      "name": "APJ Lecture Complex (APJ 1–11)",
      "shortName": "APJ Complex",
      "lat": 28.6105,
      "lng": 77.0372,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Lecture Theatres",
        "Smart Block",
        "APJ 1",
        "APJ Hall",
        "Classrooms"
      ]
    },
    {
      "id": "nsut_block4",
      "name": "Block 4 (ECE, EE & Biotech Dept)",
      "shortName": "Block 4 (ECE/EE)",
      "lat": 28.6102,
      "lng": 77.0381,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Electrical Engineering",
        "ECE Block",
        "Biotech Block",
        "Block IV"
      ]
    },
    {
      "id": "nsut_connecting",
      "name": "Connecting Block (Mini Audi & Room 110)",
      "shortName": "Connecting Block",
      "lat": 28.6106,
      "lng": 77.0386,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Mini Audi",
        "Room 110",
        "TRP Lab",
        "Dean Office"
      ]
    },
    {
      "id": "nsut_block5",
      "name": "Block 5 (COE & IT Dept)",
      "shortName": "Block 5 (CS/IT)",
      "lat": 28.611,
      "lng": 77.0391,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Computer Science",
        "CS Block",
        "IT Dept",
        "Block V",
        "CC Lab"
      ]
    },
    {
      "id": "nsut_block6",
      "name": "Block 6 (ICE, MPAE & Workshop)",
      "shortName": "Block 6 (ICE/Mech)",
      "lat": 28.6098,
      "lng": 77.039,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Mechanical",
        "ICE Block",
        "Central Workshop",
        "MPAE",
        "Block VI"
      ]
    },
    {
      "id": "nsut_library",
      "name": "Central Library Block",
      "shortName": "Central Library",
      "lat": 28.6116,
      "lng": 77.0395,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Library",
        "Reading Hall",
        "Digital Library",
        "Reference Section"
      ]
    },
    {
      "id": "nsut_sc_amul",
      "name": "Student Centre (Amul, Nescafe & JC Canteen)",
      "shortName": "Student Centre (Amul)",
      "lat": 28.6113,
      "lng": 77.0376,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Just Cafe",
        "Amul Parlour",
        "Canteen",
        "Nescafe",
        "SC Canteen"
      ]
    },
    {
      "id": "nsut_sac",
      "name": "SAC (Student Activity Centre & Gym)",
      "shortName": "SAC Gym & Hub",
      "lat": 28.6122,
      "lng": 77.0384,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Gymnasium",
        "Indoor Sports",
        "Society Rooms",
        "SAC Building"
      ]
    },
    {
      "id": "nsut_sports",
      "name": "Sports Complex & Cricket/Football Ground",
      "shortName": "Sports Complex",
      "lat": 28.6125,
      "lng": 77.0405,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "Cricket Ground",
        "Football Ground",
        "Running Track",
        "Tennis Court",
        "Basketball Court"
      ]
    },
    {
      "id": "nsut_bh",
      "name": "Boys Hostels (BH 1–4 · Ramanujan / Bose)",
      "shortName": "Boys Hostels (BH 1–4)",
      "lat": 28.6135,
      "lng": 77.0378,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "BH1",
        "BH2",
        "BH3",
        "BH4",
        "Hostel Mess",
        "Ramanujan Hostel",
        "Bose Hostel"
      ]
    },
    {
      "id": "nsut_gh",
      "name": "Girls Hostels (Alaknanda GH-1 & Kaveri GH-2)",
      "shortName": "Girls Hostels (GH 1–2)",
      "lat": 28.6082,
      "lng": 77.0348,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "GH1",
        "GH2",
        "Alaknanda",
        "Kaveri",
        "Girls Hostel"
      ]
    },
    {
      "id": "nsut_north_gate",
      "name": "NSUT North / Hostel Gate (Dwarka Mor Side)",
      "shortName": "NSUT North Gate",
      "lat": 28.6138,
      "lng": 77.036,
      "zone": "NSUT Campus",
      "isCampus": true,
      "aliases": [
        "North Gate",
        "Dwarka Mor Gate",
        "Gate 2",
        "Hostel Gate"
      ]
    },
    {
      "id": "dwarka_mor",
      "name": "Dwarka Mor Metro Junction",
      "shortName": "Dwarka Mor",
      "lat": 28.6193,
      "lng": 77.0332,
      "region": "NSUT Hub",
      "category": "Priority Hub",
      "isPriorityHub": true,
      "isCampus": false,
      "zone": "NSUT Hub Delhi",
      "aliases": [
        "Dwarka Mor Metro Junction",
        "Dwarka Mor"
      ]
    },
    {
      "id": "vegas_mall",
      "name": "Vegas Mall (Dwarka Sec-14)",
      "shortName": "Vegas Mall",
      "lat": 28.6011,
      "lng": 77.0294,
      "region": "NSUT Hub",
      "category": "Priority Hub",
      "isPriorityHub": true,
      "isCampus": false,
      "zone": "NSUT Hub Delhi",
      "aliases": [
        "Vegas Mall (Dwarka Sec-14)",
        "Vegas Mall"
      ]
    },
    {
      "id": "dwarka_sec10",
      "name": "Dwarka Sector 10 District Center",
      "shortName": "Dwarka Sec-10",
      "lat": 28.5815,
      "lng": 77.0592,
      "region": "NSUT Hub",
      "category": "Priority Hub",
      "isPriorityHub": true,
      "isCampus": false,
      "zone": "NSUT Hub Delhi",
      "aliases": [
        "Dwarka Sector 10 District Center",
        "Dwarka Sec-10"
      ]
    },
    {
      "id": "dwarka_sec21",
      "name": "Dwarka Sector 21 Metro / IGI Link",
      "shortName": "Dwarka Sec-21",
      "lat": 28.5522,
      "lng": 77.0583,
      "region": "NSUT Hub",
      "category": "Priority Hub",
      "isPriorityHub": true,
      "isCampus": false,
      "zone": "NSUT Hub Delhi",
      "aliases": [
        "Dwarka Sector 21 Metro / IGI Link",
        "Dwarka Sec-21"
      ]
    },
    {
      "id": "dabri_more",
      "name": "Dabri More / Pankha Road Flyover",
      "shortName": "Dabri More",
      "lat": 28.6095,
      "lng": 77.0825,
      "region": "NSUT Hub",
      "category": "Priority Hub",
      "isPriorityHub": true,
      "isCampus": false,
      "zone": "NSUT Hub Delhi",
      "aliases": [
        "Dabri More / Pankha Road Flyover",
        "Dabri More"
      ]
    },
    {
      "id": "janakpuri_west",
      "name": "Janakpuri West (District Center)",
      "shortName": "Janakpuri West",
      "lat": 28.6289,
      "lng": 77.0777,
      "region": "West",
      "category": "Transit",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "Janakpuri West (District Center)",
        "Janakpuri West"
      ]
    },
    {
      "id": "uttam_nagar",
      "name": "Uttam Nagar East Junction",
      "shortName": "Uttam Nagar",
      "lat": 28.6219,
      "lng": 77.0652,
      "region": "West",
      "category": "Transit",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "Uttam Nagar East Junction",
        "Uttam Nagar"
      ]
    },
    {
      "id": "rajouri_garden",
      "name": "Rajouri Garden Ring Road",
      "shortName": "Rajouri Garden",
      "lat": 28.6492,
      "lng": 77.1225,
      "region": "West",
      "category": "Commercial",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "Rajouri Garden Ring Road",
        "Rajouri Garden"
      ]
    },
    {
      "id": "punjabi_bagh",
      "name": "Punjabi Bagh Chowk",
      "shortName": "Punjabi Bagh",
      "lat": 28.669,
      "lng": 77.1332,
      "region": "West",
      "category": "Arterial",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "Punjabi Bagh Chowk",
        "Punjabi Bagh"
      ]
    },
    {
      "id": "peeragarhi",
      "name": "Peeragarhi Chowk (Rohtak Rd)",
      "shortName": "Peeragarhi",
      "lat": 28.6796,
      "lng": 77.0928,
      "region": "West",
      "category": "Gateway",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "Peeragarhi Chowk (Rohtak Rd)",
        "Peeragarhi"
      ]
    },
    {
      "id": "igi_t3",
      "name": "IGI Airport Terminal 3",
      "shortName": "IGI Airport T3",
      "lat": 28.5562,
      "lng": 77.1,
      "region": "West",
      "category": "Airport",
      "isCampus": false,
      "zone": "West Delhi",
      "aliases": [
        "IGI Airport Terminal 3",
        "IGI Airport T3"
      ]
    },
    {
      "id": "dhaula_kuan",
      "name": "Dhaula Kuan Intersection (NH-48)",
      "shortName": "Dhaula Kuan",
      "lat": 28.5919,
      "lng": 77.1615,
      "region": "Central",
      "category": "Arterial",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "Dhaula Kuan Intersection (NH-48)",
        "Dhaula Kuan"
      ]
    },
    {
      "id": "karol_bagh",
      "name": "Karol Bagh (Pusa Road)",
      "shortName": "Karol Bagh",
      "lat": 28.6441,
      "lng": 77.1885,
      "region": "Central",
      "category": "Commercial",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "Karol Bagh (Pusa Road)",
        "Karol Bagh"
      ]
    },
    {
      "id": "connaught_place",
      "name": "Connaught Place (Rajiv Chowk)",
      "shortName": "Connaught Place",
      "lat": 28.6328,
      "lng": 77.2197,
      "region": "Central",
      "category": "Landmark",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "Connaught Place (Rajiv Chowk)",
        "Connaught Place"
      ]
    },
    {
      "id": "india_gate",
      "name": "India Gate Hexagon (Kartavya Path)",
      "shortName": "India Gate",
      "lat": 28.6129,
      "lng": 77.2295,
      "region": "Central",
      "category": "Landmark",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "India Gate Hexagon (Kartavya Path)",
        "India Gate"
      ]
    },
    {
      "id": "ndls",
      "name": "New Delhi Railway Station",
      "shortName": "New Delhi Stn",
      "lat": 28.6425,
      "lng": 77.222,
      "region": "Central",
      "category": "Transit",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "New Delhi Railway Station",
        "New Delhi Stn"
      ]
    },
    {
      "id": "ito_junction",
      "name": "ITO Crossing",
      "shortName": "ITO Junction",
      "lat": 28.6285,
      "lng": 77.2415,
      "region": "Central",
      "category": "Arterial",
      "isCampus": false,
      "zone": "Central Delhi",
      "aliases": [
        "ITO Crossing",
        "ITO Junction"
      ]
    },
    {
      "id": "aiims_chowk",
      "name": "AIIMS / Safdarjung Ring Road",
      "shortName": "AIIMS Chowk",
      "lat": 28.5672,
      "lng": 77.21,
      "region": "South",
      "category": "Medical",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "AIIMS / Safdarjung Ring Road",
        "AIIMS Chowk"
      ]
    },
    {
      "id": "iit_hauz_khas",
      "name": "IIT Delhi / Hauz Khas",
      "shortName": "IIT Delhi",
      "lat": 28.5457,
      "lng": 77.1928,
      "region": "South",
      "category": "Academic",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "IIT Delhi / Hauz Khas",
        "IIT Delhi"
      ]
    },
    {
      "id": "vasant_kunj",
      "name": "Vasant Kunj (Nelson Mandela Marg)",
      "shortName": "Vasant Kunj",
      "lat": 28.5402,
      "lng": 77.1535,
      "region": "South",
      "category": "Commercial",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "Vasant Kunj (Nelson Mandela Marg)",
        "Vasant Kunj"
      ]
    },
    {
      "id": "qutub_minar",
      "name": "Qutub Minar (Mehrauli)",
      "shortName": "Qutub Minar",
      "lat": 28.5245,
      "lng": 77.1855,
      "region": "South",
      "category": "Landmark",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "Qutub Minar (Mehrauli)",
        "Qutub Minar"
      ]
    },
    {
      "id": "saket_citywalk",
      "name": "Saket (Press Enclave Road)",
      "shortName": "Saket Hub",
      "lat": 28.5286,
      "lng": 77.2194,
      "region": "South",
      "category": "Commercial",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "Saket (Press Enclave Road)",
        "Saket Hub"
      ]
    },
    {
      "id": "nehru_place",
      "name": "Nehru Place Outer Ring Road",
      "shortName": "Nehru Place",
      "lat": 28.5494,
      "lng": 77.2519,
      "region": "South",
      "category": "Commercial",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "Nehru Place Outer Ring Road",
        "Nehru Place"
      ]
    },
    {
      "id": "lajpat_nagar",
      "name": "Lajpat Nagar (Moolchand Flyover)",
      "shortName": "Lajpat Nagar",
      "lat": 28.5677,
      "lng": 77.2356,
      "region": "South",
      "category": "Commercial",
      "isCampus": false,
      "zone": "South Delhi",
      "aliases": [
        "Lajpat Nagar (Moolchand Flyover)",
        "Lajpat Nagar"
      ]
    },
    {
      "id": "nsp_pitampura",
      "name": "Netaji Subhash Place (NSP)",
      "shortName": "NSP Pitampura",
      "lat": 28.6961,
      "lng": 77.1526,
      "region": "North",
      "category": "Commercial",
      "isCampus": false,
      "zone": "North Delhi",
      "aliases": [
        "Netaji Subhash Place (NSP)",
        "NSP Pitampura"
      ]
    },
    {
      "id": "rohini_sec18",
      "name": "Rohini Sector 18",
      "shortName": "Rohini Sec-18",
      "lat": 28.7383,
      "lng": 77.1398,
      "region": "North",
      "category": "Residential",
      "isCampus": false,
      "zone": "North Delhi",
      "aliases": [
        "Rohini Sector 18",
        "Rohini Sec-18"
      ]
    },
    {
      "id": "du_north_campus",
      "name": "Delhi University (North Campus)",
      "shortName": "DU North Campus",
      "lat": 28.688,
      "lng": 77.21,
      "region": "North",
      "category": "Academic",
      "isCampus": false,
      "zone": "North Delhi",
      "aliases": [
        "Delhi University (North Campus)",
        "DU North Campus"
      ]
    },
    {
      "id": "kashmere_gate",
      "name": "Kashmere Gate ISBT",
      "shortName": "Kashmere Gate",
      "lat": 28.6675,
      "lng": 77.2282,
      "region": "North",
      "category": "Transit",
      "isCampus": false,
      "zone": "North Delhi",
      "aliases": [
        "Kashmere Gate ISBT",
        "Kashmere Gate"
      ]
    },
    {
      "id": "red_fort",
      "name": "Red Fort / Chandni Chowk",
      "shortName": "Red Fort",
      "lat": 28.6562,
      "lng": 77.241,
      "region": "North",
      "category": "Landmark",
      "isCampus": false,
      "zone": "North Delhi",
      "aliases": [
        "Red Fort / Chandni Chowk",
        "Red Fort"
      ]
    },
    {
      "id": "akshardham",
      "name": "Akshardham Setu (NH-9)",
      "shortName": "Akshardham",
      "lat": 28.6127,
      "lng": 77.2773,
      "region": "East",
      "category": "Landmark",
      "isCampus": false,
      "zone": "East Delhi",
      "aliases": [
        "Akshardham Setu (NH-9)",
        "Akshardham"
      ]
    },
    {
      "id": "laxmi_nagar",
      "name": "Laxmi Nagar (Vikas Marg)",
      "shortName": "Laxmi Nagar",
      "lat": 28.6304,
      "lng": 77.2777,
      "region": "East",
      "category": "Commercial",
      "isCampus": false,
      "zone": "East Delhi",
      "aliases": [
        "Laxmi Nagar (Vikas Marg)",
        "Laxmi Nagar"
      ]
    },
    {
      "id": "anand_vihar",
      "name": "Anand Vihar ISBT",
      "shortName": "Anand Vihar",
      "lat": 28.6469,
      "lng": 77.316,
      "region": "East",
      "category": "Transit",
      "isCampus": false,
      "zone": "East Delhi",
      "aliases": [
        "Anand Vihar ISBT",
        "Anand Vihar"
      ]
    }
  ],
  "edges": [
    {
      "id": "CE1",
      "from": "nsut_main_gate",
      "to": "nsut_admin",
      "roadName": "NSUT Main Boulevard",
      "distance": 345,
      "speedKmh": 25,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6083,
          77.0325
        ],
        [
          28.6089,
          77.0342
        ],
        [
          28.6096,
          77.0357
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE2",
      "from": "nsut_admin",
      "to": "nsut_moksha",
      "roadName": "Admin–Moksha Open Walkway",
      "distance": 135,
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.6096,
          77.0357
        ],
        [
          28.6092,
          77.0362
        ],
        [
          28.6088,
          77.0368
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE3",
      "from": "nsut_admin",
      "to": "nsut_apj",
      "roadName": "Central Academic Spine",
      "distance": 180,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6096,
          77.0357
        ],
        [
          28.6101,
          77.0365
        ],
        [
          28.6105,
          77.0372
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE4",
      "from": "nsut_moksha",
      "to": "nsut_apj",
      "roadName": "Moksha Lawn Cut-Through",
      "distance": 155,
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.6088,
          77.0368
        ],
        [
          28.6098,
          77.037
        ],
        [
          28.6105,
          77.0372
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE5",
      "from": "nsut_moksha",
      "to": "nsut_block4",
      "roadName": "Fest Lawn to ECE Shortcut",
      "distance": 195,
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.6088,
          77.0368
        ],
        [
          28.6095,
          77.0375
        ],
        [
          28.6102,
          77.0381
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE6",
      "from": "nsut_apj",
      "to": "nsut_block4",
      "roadName": "APJ–ECE Departmental Corridor",
      "distance": 98,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6105,
          77.0372
        ],
        [
          28.6103,
          77.0377
        ],
        [
          28.6102,
          77.0381
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE7",
      "from": "nsut_block4",
      "to": "nsut_connecting",
      "roadName": "Block 4 to Connecting Block Arcade",
      "distance": 72,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6102,
          77.0381
        ],
        [
          28.6104,
          77.0384
        ],
        [
          28.6106,
          77.0386
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE8",
      "from": "nsut_connecting",
      "to": "nsut_block5",
      "roadName": "Connecting to CS/IT Block Corridor",
      "distance": 68,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6106,
          77.0386
        ],
        [
          28.6108,
          77.0388
        ],
        [
          28.611,
          77.0391
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE9",
      "from": "nsut_block5",
      "to": "nsut_library",
      "roadName": "CS Block–Library Approach",
      "distance": 88,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.611,
          77.0391
        ],
        [
          28.6113,
          77.0393
        ],
        [
          28.6116,
          77.0395
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE10",
      "from": "nsut_block4",
      "to": "nsut_block6",
      "roadName": "ECE–Workshop South Lane",
      "distance": 110,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6102,
          77.0381
        ],
        [
          28.61,
          77.0386
        ],
        [
          28.6098,
          77.039
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE11",
      "from": "nsut_admin",
      "to": "nsut_gh",
      "roadName": "Girls Hostel West Avenue",
      "distance": 175,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6096,
          77.0357
        ],
        [
          28.6088,
          77.0352
        ],
        [
          28.6082,
          77.0348
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE12",
      "from": "nsut_main_gate",
      "to": "nsut_gh",
      "roadName": "South Gate Promenade",
      "distance": 235,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6083,
          77.0325
        ],
        [
          28.6082,
          77.0337
        ],
        [
          28.6082,
          77.0348
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE13",
      "from": "nsut_apj",
      "to": "nsut_sc_amul",
      "roadName": "Central Plaza Walkway",
      "distance": 115,
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.6105,
          77.0372
        ],
        [
          28.6109,
          77.0374
        ],
        [
          28.6113,
          77.0376
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE14",
      "from": "nsut_sc_amul",
      "to": "nsut_library",
      "roadName": "Student Centre–Library Spine",
      "distance": 195,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6113,
          77.0376
        ],
        [
          28.6114,
          77.0385
        ],
        [
          28.6116,
          77.0395
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE15",
      "from": "nsut_sc_amul",
      "to": "nsut_sac",
      "roadName": "Student Hub to SAC Pathway",
      "distance": 125,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6113,
          77.0376
        ],
        [
          28.6118,
          77.038
        ],
        [
          28.6122,
          77.0384
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE16",
      "from": "nsut_sac",
      "to": "nsut_bh",
      "roadName": "SAC to Boys Hostel Avenue",
      "distance": 165,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6122,
          77.0384
        ],
        [
          28.6129,
          77.0381
        ],
        [
          28.6135,
          77.0378
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE17",
      "from": "nsut_library",
      "to": "nsut_sports",
      "roadName": "Library to Sports Complex Link",
      "distance": 145,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6116,
          77.0395
        ],
        [
          28.612,
          77.04
        ],
        [
          28.6125,
          77.0405
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE18",
      "from": "nsut_sac",
      "to": "nsut_sports",
      "roadName": "SAC to Sports Complex Crossway",
      "distance": 215,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6122,
          77.0384
        ],
        [
          28.6124,
          77.0395
        ],
        [
          28.6125,
          77.0405
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE19",
      "from": "nsut_bh",
      "to": "nsut_north_gate",
      "roadName": "Hostel to North Gate Road",
      "distance": 185,
      "speedKmh": 25,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6135,
          77.0378
        ],
        [
          28.6137,
          77.0369
        ],
        [
          28.6138,
          77.036
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE20",
      "from": "nsut_sc_amul",
      "to": "nsut_north_gate",
      "roadName": "North Campus Internal Loop",
      "distance": 315,
      "speedKmh": 25,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6113,
          77.0376
        ],
        [
          28.6126,
          77.0368
        ],
        [
          28.6138,
          77.036
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE21",
      "from": "nsut_north_gate",
      "to": "dwarka_mor",
      "roadName": "Old Palam & Dwarka Mor Link Rd",
      "distance": 680,
      "speedKmh": 40,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6138,
          77.036
        ],
        [
          28.6165,
          77.0345
        ],
        [
          28.6193,
          77.0332
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "E1",
      "from": "nsut_main_gate",
      "to": "nsut_main_gate",
      "roadName": "NSUT Main Campus Boulevard",
      "speedKmh": 35,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60844,
          77.03507
        ],
        [
          28.60845,
          77.03514
        ],
        [
          28.60846,
          77.03518
        ],
        [
          28.60848,
          77.03525
        ],
        [
          28.6085,
          77.03531
        ],
        [
          28.60853,
          77.03542
        ],
        [
          28.60922,
          77.0352
        ],
        [
          28.6093,
          77.03517
        ],
        [
          28.60937,
          77.03515
        ],
        [
          28.60939,
          77.03523
        ],
        [
          28.60965,
          77.0362
        ],
        [
          28.60965,
          77.03621
        ],
        [
          28.60966,
          77.03622
        ],
        [
          28.60967,
          77.03623
        ],
        [
          28.60969,
          77.03624
        ],
        [
          28.60971,
          77.03624
        ],
        [
          28.60972,
          77.03626
        ],
        [
          28.60974,
          77.03627
        ],
        [
          28.60975,
          77.03629
        ],
        [
          28.60977,
          77.03632
        ],
        [
          28.6098,
          77.03644
        ],
        [
          28.60981,
          77.03647
        ],
        [
          28.60981,
          77.03649
        ],
        [
          28.60996,
          77.03645
        ],
        [
          28.6101,
          77.0364
        ],
        [
          28.61029,
          77.03634
        ],
        [
          28.61029,
          77.03634
        ]
      ],
      "distance": 357,
      "bidirectional": true
    },
    {
      "id": "E2",
      "from": "nsut_main_gate",
      "to": "nsut_main_gate",
      "roadName": "NSUT Academic Lawn Walkway (Shortcut)",
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60844,
          77.03507
        ],
        [
          28.60845,
          77.03514
        ],
        [
          28.60846,
          77.03518
        ],
        [
          28.60848,
          77.03525
        ],
        [
          28.6085,
          77.03531
        ],
        [
          28.60853,
          77.03542
        ],
        [
          28.60922,
          77.0352
        ],
        [
          28.6093,
          77.03517
        ],
        [
          28.60937,
          77.03515
        ],
        [
          28.60939,
          77.03523
        ],
        [
          28.60965,
          77.0362
        ],
        [
          28.60965,
          77.03621
        ],
        [
          28.60966,
          77.03622
        ],
        [
          28.60967,
          77.03623
        ],
        [
          28.60969,
          77.03624
        ],
        [
          28.60971,
          77.03624
        ],
        [
          28.60972,
          77.03626
        ],
        [
          28.60974,
          77.03627
        ],
        [
          28.60975,
          77.03629
        ],
        [
          28.60977,
          77.03632
        ],
        [
          28.6098,
          77.03644
        ],
        [
          28.60981,
          77.03647
        ],
        [
          28.60981,
          77.03649
        ],
        [
          28.60996,
          77.03645
        ],
        [
          28.6101,
          77.0364
        ],
        [
          28.61029,
          77.03634
        ],
        [
          28.61029,
          77.03634
        ]
      ],
      "distance": 303,
      "bidirectional": true
    },
    {
      "id": "E3",
      "from": "nsut_main_gate",
      "to": "dwarka_mor",
      "roadName": "Azad Hind Fauj Marg North",
      "speedKmh": 40,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60844,
          77.03507
        ],
        [
          28.60842,
          77.03502
        ],
        [
          28.60795,
          77.03514
        ],
        [
          28.60633,
          77.03568
        ],
        [
          28.60629,
          77.0357
        ],
        [
          28.60624,
          77.03573
        ],
        [
          28.60623,
          77.03553
        ],
        [
          28.60627,
          77.03551
        ],
        [
          28.60763,
          77.03506
        ],
        [
          28.60773,
          77.03502
        ],
        [
          28.60925,
          77.03452
        ],
        [
          28.61062,
          77.03408
        ],
        [
          28.61116,
          77.0339
        ],
        [
          28.61134,
          77.03384
        ],
        [
          28.61254,
          77.03345
        ],
        [
          28.61372,
          77.03306
        ],
        [
          28.61421,
          77.0329
        ],
        [
          28.61462,
          77.03276
        ],
        [
          28.61512,
          77.03259
        ],
        [
          28.61583,
          77.03236
        ],
        [
          28.61669,
          77.03209
        ],
        [
          28.61771,
          77.03178
        ],
        [
          28.61839,
          77.03159
        ],
        [
          28.61894,
          77.03146
        ],
        [
          28.61914,
          77.03158
        ],
        [
          28.61927,
          77.03243
        ],
        [
          28.6194,
          77.03318
        ]
      ],
      "distance": 1971,
      "bidirectional": true
    },
    {
      "id": "E4",
      "from": "nsut_main_gate",
      "to": "dwarka_mor",
      "roadName": "Old Palam & Shivaji Marg Link",
      "speedKmh": 40,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61029,
          77.03634
        ],
        [
          28.6101,
          77.0364
        ],
        [
          28.60981,
          77.03649
        ],
        [
          28.60956,
          77.03653
        ],
        [
          28.60953,
          77.03636
        ],
        [
          28.60954,
          77.03631
        ],
        [
          28.60957,
          77.03626
        ],
        [
          28.60957,
          77.03623
        ],
        [
          28.60932,
          77.03525
        ],
        [
          28.60922,
          77.0352
        ],
        [
          28.60853,
          77.03542
        ],
        [
          28.60846,
          77.03518
        ],
        [
          28.60844,
          77.03507
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.60633,
          77.03568
        ],
        [
          28.60624,
          77.03573
        ],
        [
          28.60623,
          77.03553
        ],
        [
          28.60773,
          77.03502
        ],
        [
          28.61009,
          77.03425
        ],
        [
          28.61116,
          77.0339
        ],
        [
          28.61254,
          77.03345
        ],
        [
          28.61372,
          77.03306
        ],
        [
          28.61462,
          77.03276
        ],
        [
          28.61583,
          77.03236
        ],
        [
          28.61771,
          77.03178
        ],
        [
          28.61894,
          77.03146
        ],
        [
          28.61914,
          77.03158
        ],
        [
          28.6194,
          77.03318
        ]
      ],
      "distance": 2295,
      "bidirectional": true
    },
    {
      "id": "E5",
      "from": "nsut_main_gate",
      "to": "vegas_mall",
      "roadName": "Azad Hind Fauj Marg South (Sec-14)",
      "speedKmh": 40,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60842,
          77.03502
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.60633,
          77.03568
        ],
        [
          28.60629,
          77.0357
        ],
        [
          28.60618,
          77.03555
        ],
        [
          28.60604,
          77.03544
        ],
        [
          28.60603,
          77.03543
        ],
        [
          28.6049,
          77.03446
        ],
        [
          28.60383,
          77.03353
        ],
        [
          28.60179,
          77.03179
        ],
        [
          28.59991,
          77.03019
        ],
        [
          28.59967,
          77.03011
        ],
        [
          28.59943,
          77.03012
        ],
        [
          28.59932,
          77.03004
        ],
        [
          28.59923,
          77.02978
        ],
        [
          28.59926,
          77.02962
        ],
        [
          28.59943,
          77.02945
        ],
        [
          28.59968,
          77.02932
        ],
        [
          28.59977,
          77.02926
        ],
        [
          28.60125,
          77.02693
        ],
        [
          28.60138,
          77.02693
        ],
        [
          28.60146,
          77.02701
        ],
        [
          28.60136,
          77.02726
        ],
        [
          28.60092,
          77.02791
        ],
        [
          28.601,
          77.02824
        ],
        [
          28.60107,
          77.02835
        ],
        [
          28.60153,
          77.02874
        ]
      ],
      "distance": 1886,
      "bidirectional": true
    },
    {
      "id": "E6",
      "from": "nsut_main_gate",
      "to": "vegas_mall",
      "roadName": "NSUT Hostel–Vegas Footpath (Shortcut)",
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60842,
          77.03502
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.60633,
          77.03568
        ],
        [
          28.60629,
          77.0357
        ],
        [
          28.60618,
          77.03555
        ],
        [
          28.60604,
          77.03544
        ],
        [
          28.60603,
          77.03543
        ],
        [
          28.6049,
          77.03446
        ],
        [
          28.60383,
          77.03353
        ],
        [
          28.60179,
          77.03179
        ],
        [
          28.59991,
          77.03019
        ],
        [
          28.59967,
          77.03011
        ],
        [
          28.59943,
          77.03012
        ],
        [
          28.59932,
          77.03004
        ],
        [
          28.59923,
          77.02978
        ],
        [
          28.59926,
          77.02962
        ],
        [
          28.59943,
          77.02945
        ],
        [
          28.59968,
          77.02932
        ],
        [
          28.59977,
          77.02926
        ],
        [
          28.60125,
          77.02693
        ],
        [
          28.60138,
          77.02693
        ],
        [
          28.60146,
          77.02701
        ],
        [
          28.60136,
          77.02726
        ],
        [
          28.60092,
          77.02791
        ],
        [
          28.601,
          77.02824
        ],
        [
          28.60107,
          77.02835
        ],
        [
          28.60153,
          77.02874
        ]
      ],
      "distance": 1603,
      "bidirectional": true
    },
    {
      "id": "E7",
      "from": "dwarka_mor",
      "to": "vegas_mall",
      "roadName": "Sector 14 Metro Corridor Rd",
      "speedKmh": 40,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6194,
          77.03318
        ],
        [
          28.61955,
          77.03416
        ],
        [
          28.61967,
          77.03488
        ],
        [
          28.61975,
          77.03542
        ],
        [
          28.61958,
          77.03548
        ],
        [
          28.61955,
          77.03531
        ],
        [
          28.61936,
          77.03425
        ],
        [
          28.61928,
          77.03376
        ],
        [
          28.61909,
          77.03251
        ],
        [
          28.619,
          77.03188
        ],
        [
          28.61859,
          77.0318
        ],
        [
          28.61776,
          77.03192
        ],
        [
          28.61637,
          77.03234
        ],
        [
          28.61257,
          77.03361
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.60629,
          77.0357
        ],
        [
          28.60605,
          77.03544
        ],
        [
          28.60584,
          77.03526
        ],
        [
          28.60375,
          77.03346
        ],
        [
          28.59991,
          77.03019
        ],
        [
          28.59943,
          77.03012
        ],
        [
          28.59926,
          77.02962
        ],
        [
          28.59953,
          77.02943
        ],
        [
          28.60118,
          77.02718
        ],
        [
          28.60142,
          77.02695
        ],
        [
          28.60136,
          77.02726
        ],
        [
          28.601,
          77.02824
        ],
        [
          28.60153,
          77.02874
        ]
      ],
      "distance": 3728,
      "bidirectional": true
    },
    {
      "id": "E8",
      "from": "nsut_main_gate",
      "to": "dwarka_sec10",
      "roadName": "Dwarka Sector 3–10 Central Ave",
      "speedKmh": 45,
      "trafficMultiplier": 1.1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.60629,
          77.0357
        ],
        [
          28.6037,
          77.03947
        ],
        [
          28.60184,
          77.0422
        ],
        [
          28.6013,
          77.04303
        ],
        [
          28.59858,
          77.04713
        ],
        [
          28.59803,
          77.04794
        ],
        [
          28.59687,
          77.04969
        ],
        [
          28.59645,
          77.05033
        ],
        [
          28.59424,
          77.0536
        ],
        [
          28.59335,
          77.05499
        ],
        [
          28.59154,
          77.05767
        ],
        [
          28.59078,
          77.05881
        ],
        [
          28.58888,
          77.06163
        ],
        [
          28.58822,
          77.06104
        ],
        [
          28.58736,
          77.06029
        ],
        [
          28.58665,
          77.05976
        ],
        [
          28.58648,
          77.05985
        ],
        [
          28.5862,
          77.06026
        ],
        [
          28.58586,
          77.06077
        ],
        [
          28.58508,
          77.06195
        ],
        [
          28.58489,
          77.06202
        ],
        [
          28.58377,
          77.06112
        ],
        [
          28.58338,
          77.06077
        ],
        [
          28.5827,
          77.06018
        ],
        [
          28.58275,
          77.05991
        ],
        [
          28.58172,
          77.05923
        ]
      ],
      "distance": 4586,
      "bidirectional": true
    },
    {
      "id": "E9",
      "from": "vegas_mall",
      "to": "dwarka_sec10",
      "roadName": "Dwarka Sector 14–10 Arterial Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60153,
          77.02874
        ],
        [
          28.60096,
          77.02813
        ],
        [
          28.59993,
          77.0294
        ],
        [
          28.59983,
          77.02992
        ],
        [
          28.59943,
          77.03012
        ],
        [
          28.59923,
          77.02978
        ],
        [
          28.59807,
          77.02867
        ],
        [
          28.59503,
          77.03101
        ],
        [
          28.59347,
          77.03333
        ],
        [
          28.59232,
          77.03505
        ],
        [
          28.58872,
          77.04044
        ],
        [
          28.58856,
          77.04081
        ],
        [
          28.58785,
          77.04209
        ],
        [
          28.58734,
          77.04266
        ],
        [
          28.58599,
          77.04455
        ],
        [
          28.58264,
          77.04957
        ],
        [
          28.58303,
          77.05046
        ],
        [
          28.58462,
          77.0516
        ],
        [
          28.58475,
          77.05186
        ],
        [
          28.58481,
          77.05193
        ],
        [
          28.58503,
          77.05198
        ],
        [
          28.58512,
          77.05214
        ],
        [
          28.58499,
          77.05234
        ],
        [
          28.58334,
          77.05468
        ],
        [
          28.58312,
          77.05516
        ],
        [
          28.5829,
          77.05728
        ],
        [
          28.58188,
          77.05751
        ],
        [
          28.58172,
          77.05923
        ]
      ],
      "distance": 4691,
      "bidirectional": true
    },
    {
      "id": "E10",
      "from": "dwarka_sec10",
      "to": "dwarka_sec21",
      "roadName": "Dwarka Sector 9–21 Expressway Link",
      "speedKmh": 50,
      "trafficMultiplier": 1.1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.58172,
          77.05923
        ],
        [
          28.58279,
          77.05912
        ],
        [
          28.58285,
          77.05797
        ],
        [
          28.58291,
          77.05891
        ],
        [
          28.58282,
          77.06007
        ],
        [
          28.58271,
          77.06036
        ],
        [
          28.5818,
          77.06172
        ],
        [
          28.58154,
          77.0615
        ],
        [
          28.57903,
          77.05936
        ],
        [
          28.57744,
          77.05801
        ],
        [
          28.57713,
          77.05798
        ],
        [
          28.57595,
          77.05962
        ],
        [
          28.57411,
          77.06225
        ],
        [
          28.57242,
          77.06479
        ],
        [
          28.57202,
          77.06545
        ],
        [
          28.57161,
          77.06606
        ],
        [
          28.57036,
          77.06662
        ],
        [
          28.56841,
          77.06677
        ],
        [
          28.56569,
          77.06446
        ],
        [
          28.56346,
          77.06259
        ],
        [
          28.56315,
          77.06281
        ],
        [
          28.5615,
          77.06359
        ],
        [
          28.56042,
          77.0636
        ],
        [
          28.55978,
          77.06345
        ],
        [
          28.55354,
          77.05822
        ],
        [
          28.55181,
          77.05703
        ],
        [
          28.55175,
          77.05712
        ],
        [
          28.55204,
          77.05752
        ]
      ],
      "distance": 5138,
      "bidirectional": true
    },
    {
      "id": "E11",
      "from": "nsut_main_gate",
      "to": "dabri_more",
      "roadName": "Dabri–Dwarka Sector 3 Road",
      "speedKmh": 40,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60821,
          77.03515
        ],
        [
          28.60633,
          77.03568
        ],
        [
          28.6037,
          77.03947
        ],
        [
          28.60275,
          77.04309
        ],
        [
          28.6044,
          77.04578
        ],
        [
          28.60512,
          77.04821
        ],
        [
          28.60514,
          77.0519
        ],
        [
          28.60446,
          77.05416
        ],
        [
          28.60355,
          77.0558
        ],
        [
          28.60307,
          77.05656
        ],
        [
          28.60004,
          77.06106
        ],
        [
          28.59953,
          77.06188
        ],
        [
          28.59864,
          77.06324
        ],
        [
          28.5999,
          77.06484
        ],
        [
          28.60112,
          77.06692
        ],
        [
          28.60262,
          77.06885
        ],
        [
          28.60364,
          77.07124
        ],
        [
          28.60493,
          77.07229
        ],
        [
          28.60624,
          77.07486
        ],
        [
          28.60758,
          77.07815
        ],
        [
          28.60862,
          77.07972
        ],
        [
          28.61059,
          77.0822
        ],
        [
          28.6109,
          77.08339
        ],
        [
          28.61119,
          77.08397
        ],
        [
          28.61085,
          77.08407
        ],
        [
          28.61008,
          77.08351
        ],
        [
          28.60888,
          77.08268
        ],
        [
          28.60951,
          77.08249
        ]
      ],
      "distance": 6530,
      "bidirectional": true
    },
    {
      "id": "E12",
      "from": "nsut_main_gate",
      "to": "dabri_more",
      "roadName": "Madhu Vihar–Dabri Pedestrian Greenway",
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.61029,
          77.03634
        ],
        [
          28.60956,
          77.03653
        ],
        [
          28.60954,
          77.03631
        ],
        [
          28.60932,
          77.03525
        ],
        [
          28.6085,
          77.03531
        ],
        [
          28.60841,
          77.03499
        ],
        [
          28.6037,
          77.03947
        ],
        [
          28.60275,
          77.04309
        ],
        [
          28.60469,
          77.0465
        ],
        [
          28.60531,
          77.05023
        ],
        [
          28.60476,
          77.05338
        ],
        [
          28.60355,
          77.0558
        ],
        [
          28.60307,
          77.05656
        ],
        [
          28.60002,
          77.06109
        ],
        [
          28.59939,
          77.06208
        ],
        [
          28.59976,
          77.06471
        ],
        [
          28.60038,
          77.06569
        ],
        [
          28.60262,
          77.06885
        ],
        [
          28.6038,
          77.07154
        ],
        [
          28.60521,
          77.07246
        ],
        [
          28.60668,
          77.07619
        ],
        [
          28.6083,
          77.07933
        ],
        [
          28.61059,
          77.0822
        ],
        [
          28.61091,
          77.08341
        ],
        [
          28.61115,
          77.08435
        ],
        [
          28.61057,
          77.08379
        ],
        [
          28.60934,
          77.08297
        ],
        [
          28.60951,
          77.08249
        ]
      ],
      "distance": 5826,
      "bidirectional": true
    },
    {
      "id": "E13",
      "from": "dwarka_sec10",
      "to": "dabri_more",
      "roadName": "Palam Flyover & Manglapuri Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.58172,
          77.05923
        ],
        [
          28.5828,
          77.059
        ],
        [
          28.58299,
          77.0574
        ],
        [
          28.58283,
          77.05992
        ],
        [
          28.58271,
          77.06036
        ],
        [
          28.58513,
          77.0644
        ],
        [
          28.58694,
          77.06593
        ],
        [
          28.59087,
          77.0693
        ],
        [
          28.59379,
          77.07137
        ],
        [
          28.59466,
          77.0717
        ],
        [
          28.59562,
          77.07189
        ],
        [
          28.59675,
          77.07202
        ],
        [
          28.59885,
          77.07178
        ],
        [
          28.60143,
          77.07079
        ],
        [
          28.60318,
          77.07017
        ],
        [
          28.60404,
          77.07179
        ],
        [
          28.60521,
          77.07246
        ],
        [
          28.60638,
          77.07524
        ],
        [
          28.60758,
          77.07815
        ],
        [
          28.60862,
          77.07972
        ],
        [
          28.61048,
          77.08199
        ],
        [
          28.61075,
          77.08312
        ],
        [
          28.61104,
          77.08374
        ],
        [
          28.61097,
          77.08419
        ],
        [
          28.61061,
          77.08382
        ],
        [
          28.60984,
          77.08334
        ],
        [
          28.60871,
          77.08258
        ],
        [
          28.60951,
          77.08249
        ]
      ],
      "distance": 5674,
      "bidirectional": true
    },
    {
      "id": "E14",
      "from": "dwarka_mor",
      "to": "uttam_nagar",
      "roadName": "Najafgarh Road (Blue Line Corridor)",
      "speedKmh": 40,
      "trafficMultiplier": 1.6,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6194,
          77.03318
        ],
        [
          28.61955,
          77.03416
        ],
        [
          28.61967,
          77.03488
        ],
        [
          28.61975,
          77.03542
        ],
        [
          28.6199,
          77.03661
        ],
        [
          28.62014,
          77.03837
        ],
        [
          28.62026,
          77.03917
        ],
        [
          28.62035,
          77.04018
        ],
        [
          28.62035,
          77.04186
        ],
        [
          28.62027,
          77.04348
        ],
        [
          28.62038,
          77.04509
        ],
        [
          28.62056,
          77.04665
        ],
        [
          28.62069,
          77.04767
        ],
        [
          28.62088,
          77.04916
        ],
        [
          28.62113,
          77.05115
        ],
        [
          28.62132,
          77.05264
        ],
        [
          28.62151,
          77.054
        ],
        [
          28.62189,
          77.05612
        ],
        [
          28.62215,
          77.05739
        ],
        [
          28.62254,
          77.05871
        ],
        [
          28.62273,
          77.05947
        ],
        [
          28.62334,
          77.06125
        ],
        [
          28.62365,
          77.06204
        ],
        [
          28.62412,
          77.06322
        ],
        [
          28.62429,
          77.06407
        ],
        [
          28.62322,
          77.06536
        ],
        [
          28.6222,
          77.06534
        ],
        [
          28.62188,
          77.06527
        ]
      ],
      "distance": 3445,
      "bidirectional": true
    },
    {
      "id": "E15",
      "from": "uttam_nagar",
      "to": "janakpuri_west",
      "roadName": "Shivaji Marg / Janakpuri District Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62188,
          77.06527
        ],
        [
          28.62211,
          77.06533
        ],
        [
          28.62282,
          77.06535
        ],
        [
          28.62357,
          77.06535
        ],
        [
          28.62424,
          77.06397
        ],
        [
          28.62441,
          77.06391
        ],
        [
          28.62479,
          77.06486
        ],
        [
          28.62506,
          77.06558
        ],
        [
          28.62544,
          77.06656
        ],
        [
          28.62574,
          77.06742
        ],
        [
          28.62617,
          77.06855
        ],
        [
          28.62675,
          77.07012
        ],
        [
          28.62687,
          77.07042
        ],
        [
          28.62717,
          77.07118
        ],
        [
          28.62734,
          77.07161
        ],
        [
          28.62754,
          77.07212
        ],
        [
          28.62819,
          77.0739
        ],
        [
          28.6286,
          77.07512
        ],
        [
          28.62852,
          77.07521
        ],
        [
          28.62807,
          77.07547
        ],
        [
          28.6281,
          77.07591
        ],
        [
          28.62807,
          77.07609
        ],
        [
          28.62736,
          77.0767
        ],
        [
          28.62756,
          77.07701
        ],
        [
          28.62796,
          77.07713
        ],
        [
          28.62836,
          77.07744
        ],
        [
          28.62857,
          77.07783
        ],
        [
          28.62888,
          77.07765
        ]
      ],
      "distance": 2073,
      "bidirectional": true
    },
    {
      "id": "E16",
      "from": "dabri_more",
      "to": "janakpuri_west",
      "roadName": "Pankha Road Flyover Corridor",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60951,
          77.08249
        ],
        [
          28.61016,
          77.08345
        ],
        [
          28.6106,
          77.08337
        ],
        [
          28.61119,
          77.08397
        ],
        [
          28.61172,
          77.08466
        ],
        [
          28.61213,
          77.08568
        ],
        [
          28.61266,
          77.08616
        ],
        [
          28.61341,
          77.0862
        ],
        [
          28.61375,
          77.08575
        ],
        [
          28.61446,
          77.08424
        ],
        [
          28.61641,
          77.08035
        ],
        [
          28.61752,
          77.07799
        ],
        [
          28.61772,
          77.07757
        ],
        [
          28.61953,
          77.07378
        ],
        [
          28.62089,
          77.07093
        ],
        [
          28.62156,
          77.06972
        ],
        [
          28.6226,
          77.06862
        ],
        [
          28.62453,
          77.06764
        ],
        [
          28.62529,
          77.06726
        ],
        [
          28.62608,
          77.06832
        ],
        [
          28.62684,
          77.07035
        ],
        [
          28.62734,
          77.07161
        ],
        [
          28.62819,
          77.0739
        ],
        [
          28.62833,
          77.0753
        ],
        [
          28.6281,
          77.07602
        ],
        [
          28.62739,
          77.07675
        ],
        [
          28.62836,
          77.07744
        ],
        [
          28.62888,
          77.07765
        ]
      ],
      "distance": 4421,
      "bidirectional": true
    },
    {
      "id": "E17",
      "from": "dabri_more",
      "to": "uttam_nagar",
      "roadName": "Dabri–Uttam Nagar Link Rd",
      "speedKmh": 38,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60951,
          77.08249
        ],
        [
          28.6096,
          77.08303
        ],
        [
          28.61032,
          77.0835
        ],
        [
          28.61076,
          77.08337
        ],
        [
          28.61117,
          77.08393
        ],
        [
          28.61151,
          77.08449
        ],
        [
          28.61181,
          77.08481
        ],
        [
          28.61213,
          77.08568
        ],
        [
          28.61234,
          77.08593
        ],
        [
          28.61315,
          77.08637
        ],
        [
          28.61341,
          77.0862
        ],
        [
          28.61368,
          77.08594
        ],
        [
          28.61391,
          77.08543
        ],
        [
          28.61503,
          77.08312
        ],
        [
          28.61549,
          77.08233
        ],
        [
          28.61737,
          77.07829
        ],
        [
          28.61754,
          77.07794
        ],
        [
          28.61772,
          77.07757
        ],
        [
          28.6183,
          77.07635
        ],
        [
          28.62081,
          77.07108
        ],
        [
          28.62103,
          77.07062
        ],
        [
          28.62156,
          77.06972
        ],
        [
          28.62218,
          77.06887
        ],
        [
          28.62212,
          77.06847
        ],
        [
          28.62251,
          77.06759
        ],
        [
          28.62255,
          77.0667
        ],
        [
          28.62197,
          77.06668
        ],
        [
          28.62188,
          77.06527
        ]
      ],
      "distance": 3121,
      "bidirectional": true
    },
    {
      "id": "E18",
      "from": "janakpuri_west",
      "to": "rajouri_garden",
      "roadName": "Najafgarh Rd & Raja Garden Flyover",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62888,
          77.07765
        ],
        [
          28.62887,
          77.07707
        ],
        [
          28.62855,
          77.07671
        ],
        [
          28.62756,
          77.07701
        ],
        [
          28.6281,
          77.07602
        ],
        [
          28.62759,
          77.07572
        ],
        [
          28.6271,
          77.07567
        ],
        [
          28.62692,
          77.0755
        ],
        [
          28.62729,
          77.07565
        ],
        [
          28.62769,
          77.0756
        ],
        [
          28.62863,
          77.0752
        ],
        [
          28.62982,
          77.07757
        ],
        [
          28.63013,
          77.0781
        ],
        [
          28.63038,
          77.07911
        ],
        [
          28.6314,
          77.08175
        ],
        [
          28.63275,
          77.08549
        ],
        [
          28.63425,
          77.08944
        ],
        [
          28.63448,
          77.09019
        ],
        [
          28.63569,
          77.09328
        ],
        [
          28.63813,
          77.09917
        ],
        [
          28.6391,
          77.10132
        ],
        [
          28.64069,
          77.10537
        ],
        [
          28.6414,
          77.10713
        ],
        [
          28.64237,
          77.10935
        ],
        [
          28.64425,
          77.1135
        ],
        [
          28.64592,
          77.11612
        ],
        [
          28.64741,
          77.11846
        ],
        [
          28.64911,
          77.12256
        ]
      ],
      "distance": 6036,
      "bidirectional": true
    },
    {
      "id": "E19",
      "from": "janakpuri_west",
      "to": "peeragarhi",
      "roadName": "Outer Ring Road West (Vikaspuri)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62888,
          77.07765
        ],
        [
          28.62887,
          77.07707
        ],
        [
          28.62841,
          77.0768
        ],
        [
          28.62736,
          77.0767
        ],
        [
          28.62807,
          77.07554
        ],
        [
          28.62743,
          77.07575
        ],
        [
          28.62677,
          77.07546
        ],
        [
          28.62724,
          77.07564
        ],
        [
          28.62759,
          77.07563
        ],
        [
          28.6286,
          77.07512
        ],
        [
          28.62989,
          77.07764
        ],
        [
          28.63016,
          77.0782
        ],
        [
          28.6305,
          77.07936
        ],
        [
          28.6315,
          77.08157
        ],
        [
          28.63355,
          77.08075
        ],
        [
          28.63579,
          77.08061
        ],
        [
          28.64101,
          77.08245
        ],
        [
          28.64845,
          77.08498
        ],
        [
          28.65493,
          77.0891
        ],
        [
          28.6608,
          77.09145
        ],
        [
          28.66514,
          77.09217
        ],
        [
          28.66879,
          77.09264
        ],
        [
          28.66953,
          77.09282
        ],
        [
          28.67281,
          77.0934
        ],
        [
          28.67674,
          77.09347
        ],
        [
          28.67763,
          77.09363
        ],
        [
          28.67789,
          77.09263
        ],
        [
          28.67961,
          77.0928
        ]
      ],
      "distance": 7481,
      "bidirectional": true
    },
    {
      "id": "E20",
      "from": "rajouri_garden",
      "to": "punjabi_bagh",
      "roadName": "Mahatma Gandhi Ring Road West",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64911,
          77.12256
        ],
        [
          28.64937,
          77.1231
        ],
        [
          28.65004,
          77.12444
        ],
        [
          28.65045,
          77.12462
        ],
        [
          28.65142,
          77.12417
        ],
        [
          28.65227,
          77.12389
        ],
        [
          28.6528,
          77.12384
        ],
        [
          28.65331,
          77.12398
        ],
        [
          28.65388,
          77.12418
        ],
        [
          28.65414,
          77.12432
        ],
        [
          28.65493,
          77.12496
        ],
        [
          28.65675,
          77.12656
        ],
        [
          28.65736,
          77.1271
        ],
        [
          28.65846,
          77.12808
        ],
        [
          28.65946,
          77.12891
        ],
        [
          28.65981,
          77.12912
        ],
        [
          28.66021,
          77.12917
        ],
        [
          28.66118,
          77.12911
        ],
        [
          28.66189,
          77.1293
        ],
        [
          28.66241,
          77.12959
        ],
        [
          28.66274,
          77.12981
        ],
        [
          28.66369,
          77.13084
        ],
        [
          28.66393,
          77.13111
        ],
        [
          28.66572,
          77.13321
        ],
        [
          28.6661,
          77.13365
        ],
        [
          28.66741,
          77.13349
        ],
        [
          28.66786,
          77.13297
        ],
        [
          28.66884,
          77.13337
        ]
      ],
      "distance": 2818,
      "bidirectional": true
    },
    {
      "id": "E21",
      "from": "punjabi_bagh",
      "to": "peeragarhi",
      "roadName": "Rohtak Road (NH-9 Corridor)",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.66884,
          77.13337
        ],
        [
          28.66862,
          77.13198
        ],
        [
          28.66877,
          77.13176
        ],
        [
          28.66934,
          77.13056
        ],
        [
          28.66946,
          77.13026
        ],
        [
          28.66983,
          77.12934
        ],
        [
          28.6699,
          77.12846
        ],
        [
          28.67068,
          77.12848
        ],
        [
          28.67141,
          77.12859
        ],
        [
          28.67214,
          77.1287
        ],
        [
          28.67433,
          77.12902
        ],
        [
          28.67507,
          77.12913
        ],
        [
          28.67568,
          77.12419
        ],
        [
          28.67626,
          77.12009
        ],
        [
          28.67641,
          77.11902
        ],
        [
          28.67664,
          77.11713
        ],
        [
          28.67699,
          77.1142
        ],
        [
          28.67703,
          77.1139
        ],
        [
          28.67708,
          77.11347
        ],
        [
          28.67718,
          77.11267
        ],
        [
          28.6778,
          77.10775
        ],
        [
          28.67802,
          77.106
        ],
        [
          28.67892,
          77.09887
        ],
        [
          28.67924,
          77.09597
        ],
        [
          28.67938,
          77.09491
        ],
        [
          28.67945,
          77.09431
        ],
        [
          28.67955,
          77.09354
        ],
        [
          28.67961,
          77.0928
        ]
      ],
      "distance": 4734,
      "bidirectional": true
    },
    {
      "id": "E22",
      "from": "dwarka_sec21",
      "to": "igi_t3",
      "roadName": "IGI Airport Express Tunnel Rd",
      "speedKmh": 50,
      "trafficMultiplier": 1.1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.55204,
          77.05752
        ],
        [
          28.55125,
          77.05644
        ],
        [
          28.54999,
          77.05509
        ],
        [
          28.54807,
          77.05723
        ],
        [
          28.54557,
          77.06126
        ],
        [
          28.54472,
          77.0635
        ],
        [
          28.54331,
          77.06948
        ],
        [
          28.54261,
          77.07304
        ],
        [
          28.54156,
          77.07762
        ],
        [
          28.54062,
          77.08118
        ],
        [
          28.53847,
          77.08998
        ],
        [
          28.53746,
          77.09561
        ],
        [
          28.5378,
          77.09934
        ],
        [
          28.53659,
          77.10601
        ],
        [
          28.53523,
          77.10874
        ],
        [
          28.53553,
          77.11113
        ],
        [
          28.53815,
          77.1159
        ],
        [
          28.54192,
          77.11726
        ],
        [
          28.54413,
          77.11517
        ],
        [
          28.54615,
          77.10648
        ],
        [
          28.54718,
          77.10543
        ],
        [
          28.54926,
          77.10461
        ],
        [
          28.55216,
          77.10299
        ],
        [
          28.55323,
          77.10084
        ],
        [
          28.55295,
          77.10357
        ],
        [
          28.55419,
          77.10427
        ],
        [
          28.55571,
          77.09742
        ],
        [
          28.55638,
          77.10005
        ]
      ],
      "distance": 11116,
      "bidirectional": true
    },
    {
      "id": "E23",
      "from": "dwarka_sec10",
      "to": "igi_t3",
      "roadName": "Dwarka–Airport Underpass Road",
      "speedKmh": 50,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.58172,
          77.05923
        ],
        [
          28.58283,
          77.05992
        ],
        [
          28.57971,
          77.05993
        ],
        [
          28.57595,
          77.05962
        ],
        [
          28.57161,
          77.06606
        ],
        [
          28.56552,
          77.06432
        ],
        [
          28.55989,
          77.06347
        ],
        [
          28.55068,
          77.05555
        ],
        [
          28.54892,
          77.0558
        ],
        [
          28.54577,
          77.0608
        ],
        [
          28.54459,
          77.06405
        ],
        [
          28.54309,
          77.07075
        ],
        [
          28.5423,
          77.07449
        ],
        [
          28.54062,
          77.08118
        ],
        [
          28.53837,
          77.09086
        ],
        [
          28.53782,
          77.09666
        ],
        [
          28.53667,
          77.10555
        ],
        [
          28.53521,
          77.10893
        ],
        [
          28.53551,
          77.11143
        ],
        [
          28.54132,
          77.11732
        ],
        [
          28.54413,
          77.11517
        ],
        [
          28.54637,
          77.10581
        ],
        [
          28.5484,
          77.10506
        ],
        [
          28.55177,
          77.10338
        ],
        [
          28.55331,
          77.10085
        ],
        [
          28.55313,
          77.10394
        ],
        [
          28.5551,
          77.10006
        ],
        [
          28.55638,
          77.10005
        ]
      ],
      "distance": 16088,
      "bidirectional": true
    },
    {
      "id": "E24",
      "from": "dabri_more",
      "to": "igi_t3",
      "roadName": "Palam–IGI Terminal Approach Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60951,
          77.08249
        ],
        [
          28.61117,
          77.08393
        ],
        [
          28.60956,
          77.08313
        ],
        [
          28.6062,
          77.08116
        ],
        [
          28.60427,
          77.08287
        ],
        [
          28.60179,
          77.08231
        ],
        [
          28.59812,
          77.08149
        ],
        [
          28.59437,
          77.08085
        ],
        [
          28.59236,
          77.08213
        ],
        [
          28.58761,
          77.08466
        ],
        [
          28.58199,
          77.09466
        ],
        [
          28.5785,
          77.10557
        ],
        [
          28.57517,
          77.11739
        ],
        [
          28.57192,
          77.12154
        ],
        [
          28.56835,
          77.12627
        ],
        [
          28.56855,
          77.13093
        ],
        [
          28.5705,
          77.13449
        ],
        [
          28.56879,
          77.13184
        ],
        [
          28.56458,
          77.12741
        ],
        [
          28.55906,
          77.12875
        ],
        [
          28.55409,
          77.12695
        ],
        [
          28.55487,
          77.12122
        ],
        [
          28.54864,
          77.11915
        ],
        [
          28.55118,
          77.10882
        ],
        [
          28.55165,
          77.11051
        ],
        [
          28.55329,
          77.10812
        ],
        [
          28.55477,
          77.10123
        ],
        [
          28.55638,
          77.10005
        ]
      ],
      "distance": 15956,
      "bidirectional": true
    },
    {
      "id": "E25",
      "from": "dabri_more",
      "to": "dhaula_kuan",
      "roadName": "Cariappa Marg (Delhi Cantt)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.60951,
          77.08249
        ],
        [
          28.61091,
          77.08341
        ],
        [
          28.61209,
          77.08561
        ],
        [
          28.61343,
          77.08639
        ],
        [
          28.61325,
          77.08775
        ],
        [
          28.6112,
          77.0924
        ],
        [
          28.60937,
          77.09661
        ],
        [
          28.60931,
          77.09974
        ],
        [
          28.60821,
          77.10322
        ],
        [
          28.60557,
          77.10956
        ],
        [
          28.60423,
          77.11342
        ],
        [
          28.6072,
          77.12238
        ],
        [
          28.60503,
          77.12759
        ],
        [
          28.60287,
          77.13311
        ],
        [
          28.59857,
          77.14404
        ],
        [
          28.59259,
          77.15921
        ],
        [
          28.59391,
          77.16521
        ],
        [
          28.59623,
          77.16477
        ],
        [
          28.59699,
          77.16488
        ],
        [
          28.59696,
          77.16577
        ],
        [
          28.59464,
          77.16638
        ],
        [
          28.59387,
          77.16782
        ],
        [
          28.59324,
          77.16835
        ],
        [
          28.5926,
          77.16822
        ],
        [
          28.59238,
          77.16764
        ],
        [
          28.59279,
          77.16701
        ],
        [
          28.59388,
          77.16584
        ],
        [
          28.59207,
          77.16141
        ]
      ],
      "distance": 11042,
      "bidirectional": true
    },
    {
      "id": "E26",
      "from": "igi_t3",
      "to": "dhaula_kuan",
      "roadName": "NH-48 Delhi–Gurgaon Expressway",
      "speedKmh": 55,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.55638,
          77.10005
        ],
        [
          28.55422,
          77.10439
        ],
        [
          28.55169,
          77.10897
        ],
        [
          28.54973,
          77.11726
        ],
        [
          28.55065,
          77.11934
        ],
        [
          28.55523,
          77.1211
        ],
        [
          28.55479,
          77.12483
        ],
        [
          28.55479,
          77.12755
        ],
        [
          28.56131,
          77.12664
        ],
        [
          28.5663,
          77.12797
        ],
        [
          28.56896,
          77.13187
        ],
        [
          28.57149,
          77.13543
        ],
        [
          28.57505,
          77.14218
        ],
        [
          28.57976,
          77.14486
        ],
        [
          28.58666,
          77.14746
        ],
        [
          28.59034,
          77.15648
        ],
        [
          28.59275,
          77.16233
        ],
        [
          28.59473,
          77.16564
        ],
        [
          28.59689,
          77.16478
        ],
        [
          28.59705,
          77.16565
        ],
        [
          28.59524,
          77.16596
        ],
        [
          28.59391,
          77.16768
        ],
        [
          28.5933,
          77.16833
        ],
        [
          28.59265,
          77.16827
        ],
        [
          28.59238,
          77.16769
        ],
        [
          28.59273,
          77.16705
        ],
        [
          28.59388,
          77.16584
        ],
        [
          28.59207,
          77.16141
        ]
      ],
      "distance": 11956,
      "bidirectional": true
    },
    {
      "id": "E27",
      "from": "janakpuri_west",
      "to": "dhaula_kuan",
      "roadName": "Jail Road & Mayapuri Ring Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62888,
          77.07765
        ],
        [
          28.62854,
          77.07671
        ],
        [
          28.62807,
          77.07554
        ],
        [
          28.62687,
          77.07555
        ],
        [
          28.62159,
          77.07148
        ],
        [
          28.61757,
          77.07806
        ],
        [
          28.61157,
          77.09122
        ],
        [
          28.60908,
          77.0975
        ],
        [
          28.60931,
          77.1006
        ],
        [
          28.6077,
          77.10445
        ],
        [
          28.60471,
          77.11125
        ],
        [
          28.60507,
          77.11558
        ],
        [
          28.60604,
          77.12512
        ],
        [
          28.60447,
          77.12901
        ],
        [
          28.60218,
          77.13486
        ],
        [
          28.59394,
          77.15589
        ],
        [
          28.5927,
          77.16216
        ],
        [
          28.59463,
          77.16566
        ],
        [
          28.59677,
          77.16473
        ],
        [
          28.59708,
          77.16558
        ],
        [
          28.59555,
          77.1659
        ],
        [
          28.59391,
          77.16768
        ],
        [
          28.59336,
          77.16831
        ],
        [
          28.5927,
          77.16832
        ],
        [
          28.59238,
          77.16769
        ],
        [
          28.59273,
          77.16705
        ],
        [
          28.59388,
          77.16584
        ],
        [
          28.59207,
          77.16141
        ]
      ],
      "distance": 13437,
      "bidirectional": true
    },
    {
      "id": "E28",
      "from": "rajouri_garden",
      "to": "dhaula_kuan",
      "roadName": "Naraina Ring Road Flyover",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64911,
          77.12256
        ],
        [
          28.65026,
          77.12486
        ],
        [
          28.64866,
          77.12597
        ],
        [
          28.64472,
          77.12733
        ],
        [
          28.63929,
          77.12948
        ],
        [
          28.63657,
          77.1305
        ],
        [
          28.63127,
          77.13244
        ],
        [
          28.62609,
          77.13455
        ],
        [
          28.62093,
          77.13647
        ],
        [
          28.61964,
          77.13653
        ],
        [
          28.61582,
          77.13653
        ],
        [
          28.6139,
          77.13671
        ],
        [
          28.61074,
          77.13898
        ],
        [
          28.60795,
          77.14101
        ],
        [
          28.60596,
          77.14413
        ],
        [
          28.60388,
          77.15618
        ],
        [
          28.59936,
          77.16261
        ],
        [
          28.59436,
          77.16657
        ],
        [
          28.59396,
          77.16734
        ],
        [
          28.59366,
          77.16819
        ],
        [
          28.59313,
          77.16838
        ],
        [
          28.5927,
          77.16832
        ],
        [
          28.59242,
          77.16794
        ],
        [
          28.59241,
          77.16748
        ],
        [
          28.59273,
          77.16705
        ],
        [
          28.59377,
          77.16633
        ],
        [
          28.59373,
          77.16514
        ],
        [
          28.59207,
          77.16141
        ]
      ],
      "distance": 9499,
      "bidirectional": true
    },
    {
      "id": "E29",
      "from": "rajouri_garden",
      "to": "karol_bagh",
      "roadName": "Patel Road & Pusa Road Corridor",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64911,
          77.12256
        ],
        [
          28.65004,
          77.12444
        ],
        [
          28.65042,
          77.12516
        ],
        [
          28.65219,
          77.12914
        ],
        [
          28.65241,
          77.12997
        ],
        [
          28.65313,
          77.13286
        ],
        [
          28.65379,
          77.13505
        ],
        [
          28.65554,
          77.13825
        ],
        [
          28.65665,
          77.14023
        ],
        [
          28.6581,
          77.14286
        ],
        [
          28.65893,
          77.14447
        ],
        [
          28.65931,
          77.14581
        ],
        [
          28.65863,
          77.14694
        ],
        [
          28.65804,
          77.1479
        ],
        [
          28.65698,
          77.14949
        ],
        [
          28.65627,
          77.15064
        ],
        [
          28.65299,
          77.15611
        ],
        [
          28.65135,
          77.15887
        ],
        [
          28.64996,
          77.16125
        ],
        [
          28.64824,
          77.16411
        ],
        [
          28.64574,
          77.16827
        ],
        [
          28.64364,
          77.17177
        ],
        [
          28.64227,
          77.17423
        ],
        [
          28.64213,
          77.17564
        ],
        [
          28.64248,
          77.17762
        ],
        [
          28.64297,
          77.18086
        ],
        [
          28.64368,
          77.18578
        ],
        [
          28.64406,
          77.18851
        ]
      ],
      "distance": 7349,
      "bidirectional": true
    },
    {
      "id": "E30",
      "from": "punjabi_bagh",
      "to": "karol_bagh",
      "roadName": "New Rohtak Road Central",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.66884,
          77.13337
        ],
        [
          28.66958,
          77.13503
        ],
        [
          28.66821,
          77.13666
        ],
        [
          28.6675,
          77.13771
        ],
        [
          28.6665,
          77.13864
        ],
        [
          28.66506,
          77.13964
        ],
        [
          28.66258,
          77.14137
        ],
        [
          28.66082,
          77.14287
        ],
        [
          28.65961,
          77.14485
        ],
        [
          28.65883,
          77.14639
        ],
        [
          28.65698,
          77.14947
        ],
        [
          28.65687,
          77.14968
        ],
        [
          28.65391,
          77.15452
        ],
        [
          28.65299,
          77.15611
        ],
        [
          28.65135,
          77.15887
        ],
        [
          28.65036,
          77.16055
        ],
        [
          28.64883,
          77.16314
        ],
        [
          28.64666,
          77.16671
        ],
        [
          28.64499,
          77.16951
        ],
        [
          28.64393,
          77.17129
        ],
        [
          28.64238,
          77.17387
        ],
        [
          28.64215,
          77.17472
        ],
        [
          28.6422,
          77.1761
        ],
        [
          28.64248,
          77.17762
        ],
        [
          28.6427,
          77.17896
        ],
        [
          28.64317,
          77.18228
        ],
        [
          28.6438,
          77.18675
        ],
        [
          28.64406,
          77.18851
        ]
      ],
      "distance": 6580,
      "bidirectional": true
    },
    {
      "id": "E31",
      "from": "dhaula_kuan",
      "to": "karol_bagh",
      "roadName": "Upper Ridge Road & Vandemataram Marg",
      "speedKmh": 50,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.59207,
          77.16141
        ],
        [
          28.58989,
          77.15596
        ],
        [
          28.58867,
          77.15346
        ],
        [
          28.58795,
          77.1515
        ],
        [
          28.58844,
          77.15098
        ],
        [
          28.58844,
          77.15137
        ],
        [
          28.58983,
          77.15525
        ],
        [
          28.59216,
          77.1606
        ],
        [
          28.59411,
          77.16544
        ],
        [
          28.59538,
          77.16532
        ],
        [
          28.59677,
          77.16473
        ],
        [
          28.59769,
          77.16598
        ],
        [
          28.60173,
          77.16842
        ],
        [
          28.60554,
          77.17064
        ],
        [
          28.60924,
          77.17257
        ],
        [
          28.61205,
          77.1748
        ],
        [
          28.61519,
          77.17515
        ],
        [
          28.61891,
          77.17637
        ],
        [
          28.6223,
          77.17878
        ],
        [
          28.62394,
          77.18091
        ],
        [
          28.62751,
          77.18534
        ],
        [
          28.63147,
          77.18813
        ],
        [
          28.63402,
          77.18926
        ],
        [
          28.63523,
          77.19066
        ],
        [
          28.64338,
          77.19675
        ],
        [
          28.64505,
          77.19701
        ],
        [
          28.6443,
          77.19154
        ],
        [
          28.64406,
          77.18851
        ]
      ],
      "distance": 10672,
      "bidirectional": true
    },
    {
      "id": "E32",
      "from": "dhaula_kuan",
      "to": "connaught_place",
      "roadName": "Sardar Patel Marg & Mother Teresa Cres",
      "speedKmh": 50,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.59207,
          77.16141
        ],
        [
          28.58906,
          77.15392
        ],
        [
          28.58798,
          77.15181
        ],
        [
          28.58828,
          77.15109
        ],
        [
          28.58859,
          77.15124
        ],
        [
          28.5892,
          77.15348
        ],
        [
          28.59216,
          77.1606
        ],
        [
          28.5945,
          77.16642
        ],
        [
          28.59921,
          77.17535
        ],
        [
          28.60418,
          77.1848
        ],
        [
          28.60977,
          77.19118
        ],
        [
          28.61383,
          77.18998
        ],
        [
          28.61723,
          77.19053
        ],
        [
          28.62022,
          77.19265
        ],
        [
          28.62152,
          77.19444
        ],
        [
          28.6234,
          77.19794
        ],
        [
          28.62421,
          77.20003
        ],
        [
          28.62542,
          77.20312
        ],
        [
          28.6271,
          77.20595
        ],
        [
          28.62759,
          77.20662
        ],
        [
          28.62776,
          77.20835
        ],
        [
          28.62864,
          77.21028
        ],
        [
          28.63167,
          77.21666
        ],
        [
          28.63392,
          77.21681
        ],
        [
          28.63553,
          77.21862
        ],
        [
          28.63491,
          77.21984
        ],
        [
          28.63362,
          77.22057
        ],
        [
          28.6325,
          77.22092
        ]
      ],
      "distance": 11077,
      "bidirectional": true
    },
    {
      "id": "E33",
      "from": "dhaula_kuan",
      "to": "india_gate",
      "roadName": "Teen Murti Marg & Akbar Road",
      "speedKmh": 50,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.59207,
          77.16141
        ],
        [
          28.58989,
          77.15596
        ],
        [
          28.58863,
          77.15337
        ],
        [
          28.58828,
          77.15128
        ],
        [
          28.58854,
          77.15103
        ],
        [
          28.58845,
          77.15146
        ],
        [
          28.59071,
          77.15749
        ],
        [
          28.59249,
          77.16151
        ],
        [
          28.59505,
          77.16748
        ],
        [
          28.59921,
          77.17535
        ],
        [
          28.60354,
          77.18355
        ],
        [
          28.60881,
          77.18988
        ],
        [
          28.60817,
          77.19315
        ],
        [
          28.60501,
          77.1985
        ],
        [
          28.6049,
          77.1993
        ],
        [
          28.60219,
          77.20332
        ],
        [
          28.60158,
          77.20503
        ],
        [
          28.60186,
          77.20647
        ],
        [
          28.60384,
          77.2109
        ],
        [
          28.60431,
          77.21121
        ],
        [
          28.6044,
          77.21208
        ],
        [
          28.60663,
          77.21713
        ],
        [
          28.60754,
          77.21738
        ],
        [
          28.60759,
          77.21861
        ],
        [
          28.60899,
          77.22244
        ],
        [
          28.60993,
          77.22427
        ],
        [
          28.61016,
          77.225
        ],
        [
          28.61296,
          77.22766
        ]
      ],
      "distance": 10306,
      "bidirectional": true
    },
    {
      "id": "E34",
      "from": "karol_bagh",
      "to": "connaught_place",
      "roadName": "Panchkuian Road Radial",
      "speedKmh": 40,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64406,
          77.18851
        ],
        [
          28.64447,
          77.1912
        ],
        [
          28.64497,
          77.19476
        ],
        [
          28.64536,
          77.19688
        ],
        [
          28.6455,
          77.19697
        ],
        [
          28.6456,
          77.19712
        ],
        [
          28.64565,
          77.19746
        ],
        [
          28.6456,
          77.19763
        ],
        [
          28.6455,
          77.19775
        ],
        [
          28.64527,
          77.19796
        ],
        [
          28.64459,
          77.1995
        ],
        [
          28.64341,
          77.20213
        ],
        [
          28.64324,
          77.20314
        ],
        [
          28.64329,
          77.20348
        ],
        [
          28.64308,
          77.20369
        ],
        [
          28.64248,
          77.20382
        ],
        [
          28.64123,
          77.20521
        ],
        [
          28.63985,
          77.20768
        ],
        [
          28.63931,
          77.20866
        ],
        [
          28.63761,
          77.21162
        ],
        [
          28.63446,
          77.21708
        ],
        [
          28.63536,
          77.2182
        ],
        [
          28.6357,
          77.21967
        ],
        [
          28.63547,
          77.21987
        ],
        [
          28.63391,
          77.2199
        ],
        [
          28.63362,
          77.22057
        ],
        [
          28.6332,
          77.22089
        ],
        [
          28.6325,
          77.22092
        ]
      ],
      "distance": 4002,
      "bidirectional": true
    },
    {
      "id": "E35",
      "from": "karol_bagh",
      "to": "ndls",
      "roadName": "Deshbandhu Gupta Road (Paharganj)",
      "speedKmh": 35,
      "trafficMultiplier": 1.8,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64406,
          77.18851
        ],
        [
          28.64447,
          77.1912
        ],
        [
          28.64521,
          77.1963
        ],
        [
          28.64538,
          77.19689
        ],
        [
          28.64553,
          77.197
        ],
        [
          28.64565,
          77.1973
        ],
        [
          28.64564,
          77.19754
        ],
        [
          28.64556,
          77.1977
        ],
        [
          28.64542,
          77.19779
        ],
        [
          28.64493,
          77.19875
        ],
        [
          28.64419,
          77.20041
        ],
        [
          28.64313,
          77.20299
        ],
        [
          28.64331,
          77.20341
        ],
        [
          28.64313,
          77.20367
        ],
        [
          28.6426,
          77.20376
        ],
        [
          28.64145,
          77.20487
        ],
        [
          28.64042,
          77.20666
        ],
        [
          28.63931,
          77.20866
        ],
        [
          28.63761,
          77.21162
        ],
        [
          28.63446,
          77.21708
        ],
        [
          28.63544,
          77.21836
        ],
        [
          28.63571,
          77.21976
        ],
        [
          28.63557,
          77.22044
        ],
        [
          28.63546,
          77.22157
        ],
        [
          28.63768,
          77.22319
        ],
        [
          28.63998,
          77.22342
        ],
        [
          28.64107,
          77.22287
        ],
        [
          28.64251,
          77.22205
        ]
      ],
      "distance": 4663,
      "bidirectional": true
    },
    {
      "id": "E36",
      "from": "connaught_place",
      "to": "ndls",
      "roadName": "Chelmsford Road & Minto Bridge",
      "speedKmh": 38,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6325,
          77.22092
        ],
        [
          28.63203,
          77.22065
        ],
        [
          28.63177,
          77.22026
        ],
        [
          28.63165,
          77.21982
        ],
        [
          28.63168,
          77.21939
        ],
        [
          28.63196,
          77.21885
        ],
        [
          28.63231,
          77.21854
        ],
        [
          28.63262,
          77.21843
        ],
        [
          28.63295,
          77.21842
        ],
        [
          28.63326,
          77.21853
        ],
        [
          28.63394,
          77.21768
        ],
        [
          28.63425,
          77.21713
        ],
        [
          28.63484,
          77.21756
        ],
        [
          28.63536,
          77.2182
        ],
        [
          28.63564,
          77.21917
        ],
        [
          28.63571,
          77.21976
        ],
        [
          28.63572,
          77.21993
        ],
        [
          28.63557,
          77.22044
        ],
        [
          28.6353,
          77.22135
        ],
        [
          28.63546,
          77.22157
        ],
        [
          28.63738,
          77.22298
        ],
        [
          28.63768,
          77.22319
        ],
        [
          28.63801,
          77.22328
        ],
        [
          28.63998,
          77.22342
        ],
        [
          28.64079,
          77.22311
        ],
        [
          28.64107,
          77.22287
        ],
        [
          28.64131,
          77.22238
        ],
        [
          28.64251,
          77.22205
        ]
      ],
      "distance": 2034,
      "bidirectional": true
    },
    {
      "id": "E37",
      "from": "connaught_place",
      "to": "india_gate",
      "roadName": "Janpath & Kartavya Path Radial",
      "speedKmh": 45,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6325,
          77.22092
        ],
        [
          28.63134,
          77.22223
        ],
        [
          28.63082,
          77.22207
        ],
        [
          28.63042,
          77.22157
        ],
        [
          28.63005,
          77.22082
        ],
        [
          28.62988,
          77.2198
        ],
        [
          28.62977,
          77.21961
        ],
        [
          28.62837,
          77.21949
        ],
        [
          28.62716,
          77.21941
        ],
        [
          28.62621,
          77.21933
        ],
        [
          28.62461,
          77.21924
        ],
        [
          28.62246,
          77.21911
        ],
        [
          28.62039,
          77.21907
        ],
        [
          28.62007,
          77.21943
        ],
        [
          28.61972,
          77.21949
        ],
        [
          28.619,
          77.22047
        ],
        [
          28.61808,
          77.22207
        ],
        [
          28.61722,
          77.22358
        ],
        [
          28.6166,
          77.22468
        ],
        [
          28.61666,
          77.22504
        ],
        [
          28.61639,
          77.22533
        ],
        [
          28.6161,
          77.22503
        ],
        [
          28.61524,
          77.22498
        ],
        [
          28.61315,
          77.22485
        ],
        [
          28.61171,
          77.22476
        ],
        [
          28.61016,
          77.22474
        ],
        [
          28.61107,
          77.22701
        ],
        [
          28.61296,
          77.22766
        ]
      ],
      "distance": 3602,
      "bidirectional": true
    },
    {
      "id": "E38",
      "from": "connaught_place",
      "to": "india_gate",
      "roadName": "Central Vista Pedestrian Promenade",
      "speedKmh": 5,
      "trafficMultiplier": 1,
      "pedestrianOnly": true,
      "waypoints": [
        [
          28.6325,
          77.22092
        ],
        [
          28.63134,
          77.22223
        ],
        [
          28.63082,
          77.22207
        ],
        [
          28.63042,
          77.22157
        ],
        [
          28.63005,
          77.22082
        ],
        [
          28.62988,
          77.2198
        ],
        [
          28.62977,
          77.21961
        ],
        [
          28.62837,
          77.21949
        ],
        [
          28.62716,
          77.21941
        ],
        [
          28.62621,
          77.21933
        ],
        [
          28.62461,
          77.21924
        ],
        [
          28.62246,
          77.21911
        ],
        [
          28.62039,
          77.21907
        ],
        [
          28.62007,
          77.21943
        ],
        [
          28.61972,
          77.21949
        ],
        [
          28.619,
          77.22047
        ],
        [
          28.61808,
          77.22207
        ],
        [
          28.61722,
          77.22358
        ],
        [
          28.6166,
          77.22468
        ],
        [
          28.61666,
          77.22504
        ],
        [
          28.61639,
          77.22533
        ],
        [
          28.6161,
          77.22503
        ],
        [
          28.61524,
          77.22498
        ],
        [
          28.61315,
          77.22485
        ],
        [
          28.61171,
          77.22476
        ],
        [
          28.61016,
          77.22474
        ],
        [
          28.61107,
          77.22701
        ],
        [
          28.61296,
          77.22766
        ]
      ],
      "distance": 3062,
      "bidirectional": true
    },
    {
      "id": "E39",
      "from": "connaught_place",
      "to": "ito_junction",
      "roadName": "Barakhamba Road & DDU Marg",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6325,
          77.22092
        ],
        [
          28.63187,
          77.2213
        ],
        [
          28.63125,
          77.22243
        ],
        [
          28.63072,
          77.22335
        ],
        [
          28.63046,
          77.22381
        ],
        [
          28.6293,
          77.22585
        ],
        [
          28.62924,
          77.22653
        ],
        [
          28.62934,
          77.22666
        ],
        [
          28.62943,
          77.22682
        ],
        [
          28.63456,
          77.2306
        ],
        [
          28.63565,
          77.23093
        ],
        [
          28.63818,
          77.23116
        ],
        [
          28.64039,
          77.23144
        ],
        [
          28.64096,
          77.23176
        ],
        [
          28.64201,
          77.23251
        ],
        [
          28.64141,
          77.2339
        ],
        [
          28.64098,
          77.23559
        ],
        [
          28.64082,
          77.23788
        ],
        [
          28.64054,
          77.23924
        ],
        [
          28.64021,
          77.24009
        ],
        [
          28.64026,
          77.24098
        ],
        [
          28.63924,
          77.2412
        ],
        [
          28.63773,
          77.24118
        ],
        [
          28.63581,
          77.24117
        ],
        [
          28.63454,
          77.24102
        ],
        [
          28.6328,
          77.24099
        ],
        [
          28.63012,
          77.24126
        ],
        [
          28.62849,
          77.24138
        ]
      ],
      "distance": 4457,
      "bidirectional": true
    },
    {
      "id": "E40",
      "from": "india_gate",
      "to": "ito_junction",
      "roadName": "Tilak Marg Boulevard",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61296,
          77.22766
        ],
        [
          28.61406,
          77.22776
        ],
        [
          28.61498,
          77.22838
        ],
        [
          28.61553,
          77.2296
        ],
        [
          28.61616,
          77.2311
        ],
        [
          28.6161,
          77.23177
        ],
        [
          28.61554,
          77.23271
        ],
        [
          28.61562,
          77.23316
        ],
        [
          28.62008,
          77.23641
        ],
        [
          28.62078,
          77.23691
        ],
        [
          28.62132,
          77.23732
        ],
        [
          28.62288,
          77.23852
        ],
        [
          28.62385,
          77.23925
        ],
        [
          28.62499,
          77.2401
        ],
        [
          28.62534,
          77.24034
        ],
        [
          28.62577,
          77.24062
        ],
        [
          28.62658,
          77.24117
        ],
        [
          28.62754,
          77.24129
        ],
        [
          28.62802,
          77.24125
        ],
        [
          28.6293,
          77.24118
        ],
        [
          28.63082,
          77.24103
        ],
        [
          28.63233,
          77.24089
        ],
        [
          28.63397,
          77.24082
        ],
        [
          28.63462,
          77.24104
        ],
        [
          28.63328,
          77.24097
        ],
        [
          28.63187,
          77.24107
        ],
        [
          28.6296,
          77.24129
        ],
        [
          28.62849,
          77.24138
        ]
      ],
      "distance": 3812,
      "bidirectional": true
    },
    {
      "id": "E41",
      "from": "ndls",
      "to": "ito_junction",
      "roadName": "Jawaharlal Nehru Marg",
      "speedKmh": 40,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64251,
          77.22205
        ],
        [
          28.64341,
          77.22283
        ],
        [
          28.64344,
          77.22329
        ],
        [
          28.644,
          77.22379
        ],
        [
          28.64494,
          77.2236
        ],
        [
          28.64525,
          77.22365
        ],
        [
          28.64522,
          77.22381
        ],
        [
          28.64531,
          77.22466
        ],
        [
          28.64457,
          77.22614
        ],
        [
          28.6439,
          77.22775
        ],
        [
          28.64383,
          77.22793
        ],
        [
          28.64359,
          77.22796
        ],
        [
          28.64323,
          77.22928
        ],
        [
          28.6428,
          77.23038
        ],
        [
          28.64241,
          77.23178
        ],
        [
          28.64204,
          77.23267
        ],
        [
          28.64124,
          77.23499
        ],
        [
          28.64081,
          77.23877
        ],
        [
          28.64054,
          77.23924
        ],
        [
          28.64021,
          77.24009
        ],
        [
          28.64026,
          77.24098
        ],
        [
          28.63888,
          77.24122
        ],
        [
          28.63773,
          77.24118
        ],
        [
          28.63581,
          77.24117
        ],
        [
          28.63454,
          77.24102
        ],
        [
          28.63235,
          77.24101
        ],
        [
          28.63012,
          77.24126
        ],
        [
          28.62849,
          77.24138
        ]
      ],
      "distance": 3633,
      "bidirectional": true
    },
    {
      "id": "E42",
      "from": "dhaula_kuan",
      "to": "aiims_chowk",
      "roadName": "Mahatma Gandhi Ring Road (Moti Bagh)",
      "speedKmh": 50,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.59207,
          77.16141
        ],
        [
          28.58969,
          77.15625
        ],
        [
          28.58555,
          77.1586
        ],
        [
          28.58386,
          77.16017
        ],
        [
          28.58107,
          77.15924
        ],
        [
          28.58005,
          77.1587
        ],
        [
          28.57738,
          77.15821
        ],
        [
          28.57605,
          77.15771
        ],
        [
          28.5751,
          77.15995
        ],
        [
          28.57193,
          77.16226
        ],
        [
          28.56752,
          77.16536
        ],
        [
          28.56337,
          77.16799
        ],
        [
          28.55957,
          77.17125
        ],
        [
          28.55718,
          77.17424
        ],
        [
          28.55355,
          77.17947
        ],
        [
          28.55214,
          77.18182
        ],
        [
          28.55066,
          77.18411
        ],
        [
          28.54789,
          77.19062
        ],
        [
          28.54571,
          77.19776
        ],
        [
          28.54498,
          77.2014
        ],
        [
          28.55123,
          77.20415
        ],
        [
          28.55607,
          77.20619
        ],
        [
          28.55897,
          77.20687
        ],
        [
          28.56322,
          77.20752
        ],
        [
          28.56475,
          77.20762
        ],
        [
          28.56343,
          77.20798
        ],
        [
          28.56354,
          77.21044
        ],
        [
          28.56544,
          77.21015
        ]
      ],
      "distance": 11059,
      "bidirectional": true
    },
    {
      "id": "E43",
      "from": "dhaula_kuan",
      "to": "vasant_kunj",
      "roadName": "Rao Tula Ram Marg & Nelson Mandela Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.59207,
          77.16141
        ],
        [
          28.58987,
          77.15622
        ],
        [
          28.5864,
          77.15809
        ],
        [
          28.58507,
          77.15904
        ],
        [
          28.58395,
          77.16013
        ],
        [
          28.58269,
          77.16014
        ],
        [
          28.58083,
          77.15918
        ],
        [
          28.57893,
          77.1581
        ],
        [
          28.57785,
          77.15804
        ],
        [
          28.57678,
          77.15805
        ],
        [
          28.57591,
          77.15841
        ],
        [
          28.57506,
          77.16
        ],
        [
          28.57219,
          77.16206
        ],
        [
          28.56984,
          77.16376
        ],
        [
          28.56671,
          77.1659
        ],
        [
          28.56337,
          77.16799
        ],
        [
          28.5616,
          77.16917
        ],
        [
          28.55814,
          77.16971
        ],
        [
          28.5551,
          77.16659
        ],
        [
          28.55331,
          77.16633
        ],
        [
          28.55151,
          77.16504
        ],
        [
          28.54812,
          77.16246
        ],
        [
          28.53809,
          77.15499
        ],
        [
          28.53465,
          77.15223
        ],
        [
          28.53803,
          77.15435
        ],
        [
          28.53945,
          77.15333
        ],
        [
          28.53992,
          77.15305
        ],
        [
          28.54021,
          77.15358
        ]
      ],
      "distance": 8859,
      "bidirectional": true
    },
    {
      "id": "E44",
      "from": "igi_t3",
      "to": "vasant_kunj",
      "roadName": "Abdul Ghaffar Khan Marg (Mahipalpur)",
      "speedKmh": 50,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.55638,
          77.10005
        ],
        [
          28.55427,
          77.10429
        ],
        [
          28.5529,
          77.10422
        ],
        [
          28.55186,
          77.10599
        ],
        [
          28.55167,
          77.10381
        ],
        [
          28.54784,
          77.10559
        ],
        [
          28.54608,
          77.10746
        ],
        [
          28.54421,
          77.11558
        ],
        [
          28.5441,
          77.11921
        ],
        [
          28.54688,
          77.12449
        ],
        [
          28.54529,
          77.12777
        ],
        [
          28.54432,
          77.12832
        ],
        [
          28.54287,
          77.12885
        ],
        [
          28.54159,
          77.1296
        ],
        [
          28.54017,
          77.13106
        ],
        [
          28.5388,
          77.13317
        ],
        [
          28.5383,
          77.13443
        ],
        [
          28.538,
          77.13687
        ],
        [
          28.53737,
          77.1391
        ],
        [
          28.53676,
          77.14006
        ],
        [
          28.53457,
          77.14204
        ],
        [
          28.5329,
          77.14365
        ],
        [
          28.53078,
          77.14675
        ],
        [
          28.5333,
          77.15122
        ],
        [
          28.5365,
          77.15363
        ],
        [
          28.53876,
          77.15442
        ],
        [
          28.53987,
          77.15303
        ],
        [
          28.54021,
          77.15358
        ]
      ],
      "distance": 8565,
      "bidirectional": true
    },
    {
      "id": "E45",
      "from": "india_gate",
      "to": "aiims_chowk",
      "roadName": "Sri Aurobindo Marg & Safdarjung Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61296,
          77.22766
        ],
        [
          28.61495,
          77.22737
        ],
        [
          28.61605,
          77.22503
        ],
        [
          28.61363,
          77.22488
        ],
        [
          28.61171,
          77.22476
        ],
        [
          28.61007,
          77.22486
        ],
        [
          28.60959,
          77.22465
        ],
        [
          28.60835,
          77.22454
        ],
        [
          28.60584,
          77.22435
        ],
        [
          28.60437,
          77.22428
        ],
        [
          28.60387,
          77.22441
        ],
        [
          28.60252,
          77.22336
        ],
        [
          28.59999,
          77.22089
        ],
        [
          28.59814,
          77.21913
        ],
        [
          28.59583,
          77.21693
        ],
        [
          28.59237,
          77.21364
        ],
        [
          28.58917,
          77.21295
        ],
        [
          28.58469,
          77.21254
        ],
        [
          28.58237,
          77.21238
        ],
        [
          28.57707,
          77.21061
        ],
        [
          28.57368,
          77.20947
        ],
        [
          28.572,
          77.20928
        ],
        [
          28.56758,
          77.20802
        ],
        [
          28.56471,
          77.20768
        ],
        [
          28.56331,
          77.20793
        ],
        [
          28.56355,
          77.20927
        ],
        [
          28.56402,
          77.21048
        ],
        [
          28.56544,
          77.21015
        ]
      ],
      "distance": 7428,
      "bidirectional": true
    },
    {
      "id": "E46",
      "from": "india_gate",
      "to": "lajpat_nagar",
      "roadName": "Lodhi Road & Oberoi Flyover",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61296,
          77.22766
        ],
        [
          28.61498,
          77.22838
        ],
        [
          28.61606,
          77.23078
        ],
        [
          28.61551,
          77.2327
        ],
        [
          28.61446,
          77.23441
        ],
        [
          28.6115,
          77.2345
        ],
        [
          28.61061,
          77.23386
        ],
        [
          28.60656,
          77.23477
        ],
        [
          28.60468,
          77.23585
        ],
        [
          28.60049,
          77.2387
        ],
        [
          28.59664,
          77.24123
        ],
        [
          28.59358,
          77.24349
        ],
        [
          28.59313,
          77.24403
        ],
        [
          28.59284,
          77.24356
        ],
        [
          28.59295,
          77.2417
        ],
        [
          28.59256,
          77.24055
        ],
        [
          28.59064,
          77.24007
        ],
        [
          28.58898,
          77.24031
        ],
        [
          28.58788,
          77.24091
        ],
        [
          28.58566,
          77.24102
        ],
        [
          28.5842,
          77.24087
        ],
        [
          28.58141,
          77.23918
        ],
        [
          28.57953,
          77.23857
        ],
        [
          28.57579,
          77.23862
        ],
        [
          28.57412,
          77.23837
        ],
        [
          28.57074,
          77.23637
        ],
        [
          28.56863,
          77.23537
        ],
        [
          28.56773,
          77.2355
        ]
      ],
      "distance": 7032,
      "bidirectional": true
    },
    {
      "id": "E47",
      "from": "aiims_chowk",
      "to": "iit_hauz_khas",
      "roadName": "Sri Aurobindo Marg (Green Park)",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.56544,
          77.21015
        ],
        [
          28.56481,
          77.21061
        ],
        [
          28.56427,
          77.21051
        ],
        [
          28.56371,
          77.21048
        ],
        [
          28.56349,
          77.21036
        ],
        [
          28.56359,
          77.20858
        ],
        [
          28.56356,
          77.20805
        ],
        [
          28.56331,
          77.20793
        ],
        [
          28.56316,
          77.20773
        ],
        [
          28.56169,
          77.20748
        ],
        [
          28.5602,
          77.20722
        ],
        [
          28.5577,
          77.2067
        ],
        [
          28.55753,
          77.20667
        ],
        [
          28.55638,
          77.20648
        ],
        [
          28.55529,
          77.20626
        ],
        [
          28.55357,
          77.20539
        ],
        [
          28.55172,
          77.2045
        ],
        [
          28.55081,
          77.2041
        ],
        [
          28.54962,
          77.20372
        ],
        [
          28.54711,
          77.20284
        ],
        [
          28.54522,
          77.20179
        ],
        [
          28.54481,
          77.20156
        ],
        [
          28.54482,
          77.20061
        ],
        [
          28.54537,
          77.19825
        ],
        [
          28.54619,
          77.19543
        ],
        [
          28.54629,
          77.19472
        ],
        [
          28.54619,
          77.19461
        ],
        [
          28.54666,
          77.1932
        ]
      ],
      "distance": 3632,
      "bidirectional": true
    },
    {
      "id": "E48",
      "from": "aiims_chowk",
      "to": "lajpat_nagar",
      "roadName": "Ring Road South Extension Flyover",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.56544,
          77.21015
        ],
        [
          28.56547,
          77.21107
        ],
        [
          28.5661,
          77.21197
        ],
        [
          28.56702,
          77.21225
        ],
        [
          28.56883,
          77.21233
        ],
        [
          28.56866,
          77.21586
        ],
        [
          28.56879,
          77.21574
        ],
        [
          28.56886,
          77.21412
        ],
        [
          28.56897,
          77.21381
        ],
        [
          28.56916,
          77.21396
        ],
        [
          28.5691,
          77.21556
        ],
        [
          28.56895,
          77.21649
        ],
        [
          28.56883,
          77.21863
        ],
        [
          28.56869,
          77.22174
        ],
        [
          28.56835,
          77.22418
        ],
        [
          28.56645,
          77.229
        ],
        [
          28.5658,
          77.23127
        ],
        [
          28.56544,
          77.23449
        ],
        [
          28.56507,
          77.24018
        ],
        [
          28.56588,
          77.24022
        ],
        [
          28.56679,
          77.23988
        ],
        [
          28.56813,
          77.23932
        ],
        [
          28.56879,
          77.23913
        ],
        [
          28.56928,
          77.23928
        ],
        [
          28.5705,
          77.2366
        ],
        [
          28.56867,
          77.23523
        ],
        [
          28.5679,
          77.23526
        ],
        [
          28.56773,
          77.2355
        ]
      ],
      "distance": 5065,
      "bidirectional": true
    },
    {
      "id": "E49",
      "from": "vasant_kunj",
      "to": "iit_hauz_khas",
      "roadName": "Outer Ring Road (Munirka–IIT Flyover)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.54021,
          77.15358
        ],
        [
          28.53968,
          77.15424
        ],
        [
          28.53978,
          77.15482
        ],
        [
          28.53897,
          77.15461
        ],
        [
          28.54048,
          77.15612
        ],
        [
          28.54433,
          77.15888
        ],
        [
          28.54683,
          77.16125
        ],
        [
          28.5492,
          77.16309
        ],
        [
          28.55174,
          77.16488
        ],
        [
          28.55295,
          77.16576
        ],
        [
          28.55319,
          77.1661
        ],
        [
          28.55523,
          77.1665
        ],
        [
          28.55747,
          77.16883
        ],
        [
          28.55885,
          77.17201
        ],
        [
          28.55776,
          77.17341
        ],
        [
          28.55612,
          77.17572
        ],
        [
          28.55403,
          77.17873
        ],
        [
          28.55319,
          77.18019
        ],
        [
          28.55195,
          77.18211
        ],
        [
          28.55091,
          77.18372
        ],
        [
          28.55038,
          77.18456
        ],
        [
          28.54885,
          77.1882
        ],
        [
          28.5463,
          77.19544
        ],
        [
          28.54571,
          77.19776
        ],
        [
          28.5451,
          77.20028
        ],
        [
          28.54537,
          77.19825
        ],
        [
          28.54629,
          77.19472
        ],
        [
          28.54666,
          77.1932
        ]
      ],
      "distance": 7287,
      "bidirectional": true
    },
    {
      "id": "E50",
      "from": "vasant_kunj",
      "to": "qutub_minar",
      "roadName": "Mehrauli–Mahipalpur Road",
      "speedKmh": 40,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.54021,
          77.15358
        ],
        [
          28.53969,
          77.15461
        ],
        [
          28.53892,
          77.15467
        ],
        [
          28.54163,
          77.15738
        ],
        [
          28.53575,
          77.15322
        ],
        [
          28.53208,
          77.1505
        ],
        [
          28.52792,
          77.15084
        ],
        [
          28.52561,
          77.15432
        ],
        [
          28.52424,
          77.15586
        ],
        [
          28.52158,
          77.15808
        ],
        [
          28.51855,
          77.15998
        ],
        [
          28.52075,
          77.16394
        ],
        [
          28.52157,
          77.16704
        ],
        [
          28.52219,
          77.16814
        ],
        [
          28.52247,
          77.17008
        ],
        [
          28.52258,
          77.17042
        ],
        [
          28.52312,
          77.17122
        ],
        [
          28.5239,
          77.17172
        ],
        [
          28.52449,
          77.17282
        ],
        [
          28.52421,
          77.17474
        ],
        [
          28.52366,
          77.17569
        ],
        [
          28.52306,
          77.17601
        ],
        [
          28.52288,
          77.17651
        ],
        [
          28.5231,
          77.17748
        ],
        [
          28.52298,
          77.1786
        ],
        [
          28.52292,
          77.17996
        ],
        [
          28.52294,
          77.18238
        ],
        [
          28.52491,
          77.18442
        ]
      ],
      "distance": 6938,
      "bidirectional": true
    },
    {
      "id": "E51",
      "from": "iit_hauz_khas",
      "to": "qutub_minar",
      "roadName": "Sri Aurobindo Marg (Adchini)",
      "speedKmh": 42,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.54666,
          77.1932
        ],
        [
          28.54616,
          77.19464
        ],
        [
          28.54516,
          77.1952
        ],
        [
          28.54485,
          77.1946
        ],
        [
          28.54434,
          77.19543
        ],
        [
          28.54396,
          77.19643
        ],
        [
          28.54279,
          77.19954
        ],
        [
          28.54383,
          77.20094
        ],
        [
          28.54453,
          77.20143
        ],
        [
          28.54328,
          77.20083
        ],
        [
          28.53846,
          77.1986
        ],
        [
          28.53765,
          77.19821
        ],
        [
          28.53568,
          77.19721
        ],
        [
          28.53338,
          77.19623
        ],
        [
          28.53181,
          77.19493
        ],
        [
          28.53132,
          77.19442
        ],
        [
          28.53018,
          77.19266
        ],
        [
          28.52867,
          77.19035
        ],
        [
          28.52778,
          77.18936
        ],
        [
          28.52743,
          77.18902
        ],
        [
          28.52644,
          77.18797
        ],
        [
          28.5256,
          77.18743
        ],
        [
          28.52609,
          77.1872
        ],
        [
          28.5265,
          77.18712
        ],
        [
          28.52652,
          77.18476
        ],
        [
          28.52635,
          77.18446
        ],
        [
          28.52597,
          77.18433
        ],
        [
          28.52491,
          77.18442
        ]
      ],
      "distance": 4431,
      "bidirectional": true
    },
    {
      "id": "E52",
      "from": "iit_hauz_khas",
      "to": "saket_citywalk",
      "roadName": "Press Enclave Marg (Malviya Nagar)",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.54666,
          77.1932
        ],
        [
          28.54615,
          77.19465
        ],
        [
          28.54492,
          77.19458
        ],
        [
          28.54456,
          77.19485
        ],
        [
          28.54402,
          77.19626
        ],
        [
          28.54298,
          77.19903
        ],
        [
          28.54411,
          77.20106
        ],
        [
          28.54416,
          77.20128
        ],
        [
          28.54099,
          77.1997
        ],
        [
          28.53777,
          77.19827
        ],
        [
          28.53609,
          77.19742
        ],
        [
          28.53338,
          77.19623
        ],
        [
          28.53187,
          77.19511
        ],
        [
          28.53172,
          77.19519
        ],
        [
          28.5313,
          77.19702
        ],
        [
          28.53039,
          77.1994
        ],
        [
          28.52829,
          77.20374
        ],
        [
          28.52794,
          77.20552
        ],
        [
          28.52791,
          77.2061
        ],
        [
          28.52816,
          77.20942
        ],
        [
          28.52828,
          77.21099
        ],
        [
          28.52876,
          77.21298
        ],
        [
          28.52931,
          77.21476
        ],
        [
          28.5288,
          77.21499
        ],
        [
          28.52695,
          77.21558
        ],
        [
          28.52583,
          77.21644
        ],
        [
          28.52623,
          77.21818
        ],
        [
          28.52823,
          77.21951
        ]
      ],
      "distance": 5885,
      "bidirectional": true
    },
    {
      "id": "E53",
      "from": "qutub_minar",
      "to": "saket_citywalk",
      "roadName": "Mehrauli–Badarpur Road West",
      "speedKmh": 40,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.52491,
          77.18442
        ],
        [
          28.52605,
          77.18434
        ],
        [
          28.52634,
          77.18438
        ],
        [
          28.52652,
          77.18463
        ],
        [
          28.5265,
          77.18644
        ],
        [
          28.52647,
          77.1879
        ],
        [
          28.52715,
          77.18867
        ],
        [
          28.52772,
          77.18916
        ],
        [
          28.53013,
          77.19237
        ],
        [
          28.53056,
          77.19305
        ],
        [
          28.53118,
          77.19401
        ],
        [
          28.53188,
          77.19479
        ],
        [
          28.53161,
          77.19549
        ],
        [
          28.53092,
          77.19817
        ],
        [
          28.53029,
          77.19962
        ],
        [
          28.52808,
          77.20443
        ],
        [
          28.52792,
          77.20585
        ],
        [
          28.52791,
          77.20612
        ],
        [
          28.52816,
          77.20942
        ],
        [
          28.52824,
          77.21061
        ],
        [
          28.52858,
          77.21252
        ],
        [
          28.52926,
          77.21457
        ],
        [
          28.52925,
          77.21485
        ],
        [
          28.52784,
          77.2153
        ],
        [
          28.52595,
          77.21599
        ],
        [
          28.52591,
          77.21677
        ],
        [
          28.52623,
          77.21818
        ],
        [
          28.52823,
          77.21951
        ]
      ],
      "distance": 4489,
      "bidirectional": true
    },
    {
      "id": "E54",
      "from": "saket_citywalk",
      "to": "nehru_place",
      "roadName": "Outer Ring Road (Chirag Delhi Flyover)",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.52823,
          77.21951
        ],
        [
          28.52699,
          77.22114
        ],
        [
          28.52734,
          77.22272
        ],
        [
          28.52773,
          77.22446
        ],
        [
          28.52797,
          77.22563
        ],
        [
          28.52785,
          77.22717
        ],
        [
          28.52772,
          77.22868
        ],
        [
          28.5276,
          77.23055
        ],
        [
          28.52814,
          77.23144
        ],
        [
          28.5292,
          77.23183
        ],
        [
          28.53256,
          77.23189
        ],
        [
          28.53346,
          77.23192
        ],
        [
          28.53932,
          77.23209
        ],
        [
          28.54126,
          77.23196
        ],
        [
          28.54171,
          77.23193
        ],
        [
          28.54131,
          77.23338
        ],
        [
          28.54072,
          77.23588
        ],
        [
          28.54147,
          77.2381
        ],
        [
          28.54233,
          77.24019
        ],
        [
          28.54392,
          77.24465
        ],
        [
          28.54518,
          77.24769
        ],
        [
          28.54629,
          77.24997
        ],
        [
          28.5493,
          77.24864
        ],
        [
          28.54956,
          77.24901
        ],
        [
          28.5503,
          77.2509
        ],
        [
          28.55067,
          77.25147
        ],
        [
          28.54985,
          77.25149
        ],
        [
          28.54922,
          77.25191
        ]
      ],
      "distance": 5726,
      "bidirectional": true
    },
    {
      "id": "E55",
      "from": "lajpat_nagar",
      "to": "nehru_place",
      "roadName": "Lala Lajpat Rai Marg (Kailash Colony)",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.56773,
          77.2355
        ],
        [
          28.56786,
          77.23525
        ],
        [
          28.56863,
          77.23535
        ],
        [
          28.56821,
          77.23491
        ],
        [
          28.56589,
          77.23426
        ],
        [
          28.5635,
          77.23316
        ],
        [
          28.56276,
          77.23274
        ],
        [
          28.56067,
          77.23168
        ],
        [
          28.56044,
          77.23178
        ],
        [
          28.56014,
          77.23228
        ],
        [
          28.55998,
          77.23271
        ],
        [
          28.55944,
          77.23518
        ],
        [
          28.55914,
          77.23657
        ],
        [
          28.55861,
          77.23857
        ],
        [
          28.55818,
          77.23944
        ],
        [
          28.55632,
          77.24111
        ],
        [
          28.55535,
          77.24203
        ],
        [
          28.55484,
          77.24272
        ],
        [
          28.55291,
          77.24544
        ],
        [
          28.55214,
          77.24701
        ],
        [
          28.55032,
          77.24828
        ],
        [
          28.54956,
          77.24901
        ],
        [
          28.55023,
          77.25071
        ],
        [
          28.55046,
          77.25109
        ],
        [
          28.55067,
          77.25147
        ],
        [
          28.55025,
          77.25131
        ],
        [
          28.54981,
          77.25143
        ],
        [
          28.54922,
          77.25191
        ]
      ],
      "distance": 3812,
      "bidirectional": true
    },
    {
      "id": "E56",
      "from": "ito_junction",
      "to": "lajpat_nagar",
      "roadName": "Mathura Road & Barapullah Link",
      "speedKmh": 50,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62849,
          77.24138
        ],
        [
          28.62759,
          77.24143
        ],
        [
          28.62652,
          77.24136
        ],
        [
          28.62553,
          77.24076
        ],
        [
          28.62472,
          77.24072
        ],
        [
          28.62374,
          77.24082
        ],
        [
          28.6218,
          77.24052
        ],
        [
          28.61879,
          77.24045
        ],
        [
          28.61656,
          77.2404
        ],
        [
          28.61474,
          77.24025
        ],
        [
          28.61241,
          77.24018
        ],
        [
          28.60743,
          77.24022
        ],
        [
          28.60614,
          77.24031
        ],
        [
          28.59928,
          77.24069
        ],
        [
          28.59752,
          77.24088
        ],
        [
          28.59505,
          77.24041
        ],
        [
          28.58997,
          77.23993
        ],
        [
          28.58861,
          77.24056
        ],
        [
          28.58717,
          77.24096
        ],
        [
          28.58459,
          77.24098
        ],
        [
          28.5839,
          77.24071
        ],
        [
          28.58098,
          77.23891
        ],
        [
          28.57825,
          77.23859
        ],
        [
          28.57549,
          77.23863
        ],
        [
          28.57368,
          77.23814
        ],
        [
          28.57074,
          77.23637
        ],
        [
          28.56863,
          77.23537
        ],
        [
          28.56773,
          77.2355
        ]
      ],
      "distance": 6993,
      "bidirectional": true
    },
    {
      "id": "E57",
      "from": "punjabi_bagh",
      "to": "nsp_pitampura",
      "roadName": "Ring Road (Britannia–NSP Flyover)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.66884,
          77.13337
        ],
        [
          28.66958,
          77.13503
        ],
        [
          28.66892,
          77.13705
        ],
        [
          28.6699,
          77.13807
        ],
        [
          28.67069,
          77.1386
        ],
        [
          28.6721,
          77.13924
        ],
        [
          28.67353,
          77.13971
        ],
        [
          28.67375,
          77.13965
        ],
        [
          28.67406,
          77.14
        ],
        [
          28.67674,
          77.14085
        ],
        [
          28.67916,
          77.14169
        ],
        [
          28.6804,
          77.14234
        ],
        [
          28.68098,
          77.143
        ],
        [
          28.68149,
          77.14377
        ],
        [
          28.68488,
          77.14877
        ],
        [
          28.68741,
          77.15222
        ],
        [
          28.68864,
          77.15269
        ],
        [
          28.69187,
          77.15349
        ],
        [
          28.69271,
          77.15368
        ],
        [
          28.69308,
          77.15332
        ],
        [
          28.69397,
          77.15078
        ],
        [
          28.69425,
          77.14989
        ],
        [
          28.69484,
          77.14802
        ],
        [
          28.69448,
          77.14999
        ],
        [
          28.69529,
          77.15097
        ],
        [
          28.69548,
          77.15139
        ],
        [
          28.69565,
          77.15156
        ],
        [
          28.69624,
          77.1525
        ]
      ],
      "distance": 4938,
      "bidirectional": true
    },
    {
      "id": "E58",
      "from": "peeragarhi",
      "to": "nsp_pitampura",
      "roadName": "Outer Ring Road (Madhuban Chowk)",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.67961,
          77.0928
        ],
        [
          28.67991,
          77.09025
        ],
        [
          28.68051,
          77.08481
        ],
        [
          28.6806,
          77.08556
        ],
        [
          28.67978,
          77.09412
        ],
        [
          28.68035,
          77.09458
        ],
        [
          28.68314,
          77.09521
        ],
        [
          28.68725,
          77.0958
        ],
        [
          28.69062,
          77.0969
        ],
        [
          28.69223,
          77.09859
        ],
        [
          28.69306,
          77.10052
        ],
        [
          28.69457,
          77.10619
        ],
        [
          28.69543,
          77.10918
        ],
        [
          28.69767,
          77.11737
        ],
        [
          28.69843,
          77.11996
        ],
        [
          28.7018,
          77.12797
        ],
        [
          28.70293,
          77.12971
        ],
        [
          28.70418,
          77.13106
        ],
        [
          28.70324,
          77.13243
        ],
        [
          28.70082,
          77.13586
        ],
        [
          28.69897,
          77.13867
        ],
        [
          28.69849,
          77.13965
        ],
        [
          28.69612,
          77.14508
        ],
        [
          28.69544,
          77.14681
        ],
        [
          28.69436,
          77.14994
        ],
        [
          28.69529,
          77.15097
        ],
        [
          28.6955,
          77.1515
        ],
        [
          28.69624,
          77.1525
        ]
      ],
      "distance": 9225,
      "bidirectional": true
    },
    {
      "id": "E59",
      "from": "peeragarhi",
      "to": "rohini_sec18",
      "roadName": "Outer Ring Road North (Mangolpuri)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.67961,
          77.0928
        ],
        [
          28.68012,
          77.08811
        ],
        [
          28.68067,
          77.08491
        ],
        [
          28.67972,
          77.09398
        ],
        [
          28.68056,
          77.09462
        ],
        [
          28.68387,
          77.09533
        ],
        [
          28.6895,
          77.09628
        ],
        [
          28.69223,
          77.09859
        ],
        [
          28.69386,
          77.10364
        ],
        [
          28.69511,
          77.1081
        ],
        [
          28.69727,
          77.11586
        ],
        [
          28.69919,
          77.1223
        ],
        [
          28.70237,
          77.12878
        ],
        [
          28.7039,
          77.13081
        ],
        [
          28.70652,
          77.13323
        ],
        [
          28.7102,
          77.13644
        ],
        [
          28.71304,
          77.13834
        ],
        [
          28.71473,
          77.13894
        ],
        [
          28.71837,
          77.13979
        ],
        [
          28.72153,
          77.14049
        ],
        [
          28.72406,
          77.14151
        ],
        [
          28.72603,
          77.14294
        ],
        [
          28.72732,
          77.14326
        ],
        [
          28.72995,
          77.14042
        ],
        [
          28.73169,
          77.14028
        ],
        [
          28.73392,
          77.13868
        ],
        [
          28.73699,
          77.1385
        ],
        [
          28.73829,
          77.13981
        ]
      ],
      "distance": 11494,
      "bidirectional": true
    },
    {
      "id": "E60",
      "from": "nsp_pitampura",
      "to": "rohini_sec18",
      "roadName": "Lala Jagat Narayan Marg (Rohini)",
      "speedKmh": 45,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.69624,
          77.1525
        ],
        [
          28.69547,
          77.15156
        ],
        [
          28.69528,
          77.15152
        ],
        [
          28.69524,
          77.1512
        ],
        [
          28.69669,
          77.15103
        ],
        [
          28.69889,
          77.15181
        ],
        [
          28.69987,
          77.15102
        ],
        [
          28.70064,
          77.15005
        ],
        [
          28.70247,
          77.14777
        ],
        [
          28.70385,
          77.14605
        ],
        [
          28.70668,
          77.14254
        ],
        [
          28.70838,
          77.14418
        ],
        [
          28.71056,
          77.14369
        ],
        [
          28.71213,
          77.14174
        ],
        [
          28.7128,
          77.14091
        ],
        [
          28.7136,
          77.13978
        ],
        [
          28.7137,
          77.1386
        ],
        [
          28.71632,
          77.13932
        ],
        [
          28.71859,
          77.13983
        ],
        [
          28.72157,
          77.1405
        ],
        [
          28.72437,
          77.14169
        ],
        [
          28.7264,
          77.14329
        ],
        [
          28.7277,
          77.14281
        ],
        [
          28.73015,
          77.14039
        ],
        [
          28.73223,
          77.14008
        ],
        [
          28.73392,
          77.13868
        ],
        [
          28.73699,
          77.1385
        ],
        [
          28.73829,
          77.13981
        ]
      ],
      "distance": 6802,
      "bidirectional": true
    },
    {
      "id": "E61",
      "from": "nsp_pitampura",
      "to": "du_north_campus",
      "roadName": "Ring Road (Azadpur–Model Town)",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.69624,
          77.1525
        ],
        [
          28.69541,
          77.1516
        ],
        [
          28.69531,
          77.15138
        ],
        [
          28.69446,
          77.15012
        ],
        [
          28.69397,
          77.15134
        ],
        [
          28.69325,
          77.15383
        ],
        [
          28.69622,
          77.15555
        ],
        [
          28.69703,
          77.15772
        ],
        [
          28.69015,
          77.16112
        ],
        [
          28.68432,
          77.16395
        ],
        [
          28.68471,
          77.16694
        ],
        [
          28.68697,
          77.17309
        ],
        [
          28.68811,
          77.17441
        ],
        [
          28.68671,
          77.17806
        ],
        [
          28.68488,
          77.18177
        ],
        [
          28.68235,
          77.1841
        ],
        [
          28.68033,
          77.18548
        ],
        [
          28.67783,
          77.18872
        ],
        [
          28.67939,
          77.19403
        ],
        [
          28.6798,
          77.19539
        ],
        [
          28.68177,
          77.19862
        ],
        [
          28.68449,
          77.20282
        ],
        [
          28.68475,
          77.20307
        ],
        [
          28.68704,
          77.20589
        ],
        [
          28.68613,
          77.2083
        ],
        [
          28.6868,
          77.20873
        ],
        [
          28.68856,
          77.20963
        ],
        [
          28.68809,
          77.21013
        ]
      ],
      "distance": 8890,
      "bidirectional": true
    },
    {
      "id": "E62",
      "from": "karol_bagh",
      "to": "du_north_campus",
      "roadName": "Rani Jhansi Flyover & Mall Road",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64406,
          77.18851
        ],
        [
          28.64452,
          77.19163
        ],
        [
          28.64735,
          77.19453
        ],
        [
          28.64835,
          77.19539
        ],
        [
          28.64893,
          77.19587
        ],
        [
          28.64976,
          77.19653
        ],
        [
          28.65046,
          77.19712
        ],
        [
          28.65472,
          77.20014
        ],
        [
          28.65581,
          77.20092
        ],
        [
          28.65804,
          77.20242
        ],
        [
          28.66063,
          77.20352
        ],
        [
          28.66238,
          77.20503
        ],
        [
          28.66277,
          77.20531
        ],
        [
          28.66322,
          77.2072
        ],
        [
          28.66442,
          77.2079
        ],
        [
          28.66752,
          77.20924
        ],
        [
          28.66875,
          77.20801
        ],
        [
          28.67126,
          77.20722
        ],
        [
          28.67338,
          77.20717
        ],
        [
          28.6766,
          77.20772
        ],
        [
          28.68015,
          77.20851
        ],
        [
          28.68222,
          77.20872
        ],
        [
          28.68338,
          77.20837
        ],
        [
          28.68398,
          77.20733
        ],
        [
          28.68602,
          77.20832
        ],
        [
          28.6868,
          77.20873
        ],
        [
          28.68856,
          77.20963
        ],
        [
          28.68809,
          77.21013
        ]
      ],
      "distance": 6233,
      "bidirectional": true
    },
    {
      "id": "E63",
      "from": "du_north_campus",
      "to": "kashmere_gate",
      "roadName": "Alipur Road (Civil Lines)",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.68809,
          77.21013
        ],
        [
          28.68841,
          77.21002
        ],
        [
          28.68834,
          77.20947
        ],
        [
          28.6869,
          77.20878
        ],
        [
          28.68637,
          77.2085
        ],
        [
          28.68605,
          77.20855
        ],
        [
          28.68416,
          77.21358
        ],
        [
          28.6841,
          77.21368
        ],
        [
          28.68249,
          77.21434
        ],
        [
          28.6808,
          77.21505
        ],
        [
          28.67851,
          77.21594
        ],
        [
          28.67621,
          77.21608
        ],
        [
          28.67506,
          77.21655
        ],
        [
          28.67467,
          77.21665
        ],
        [
          28.6743,
          77.21683
        ],
        [
          28.67175,
          77.21711
        ],
        [
          28.67056,
          77.21762
        ],
        [
          28.66969,
          77.22011
        ],
        [
          28.66899,
          77.22118
        ],
        [
          28.66748,
          77.22128
        ],
        [
          28.66635,
          77.22154
        ],
        [
          28.66616,
          77.22175
        ],
        [
          28.6662,
          77.222
        ],
        [
          28.66605,
          77.22232
        ],
        [
          28.66655,
          77.22591
        ],
        [
          28.66662,
          77.22691
        ],
        [
          28.66679,
          77.22742
        ],
        [
          28.66696,
          77.228
        ]
      ],
      "distance": 3978,
      "bidirectional": true
    },
    {
      "id": "E64",
      "from": "kashmere_gate",
      "to": "red_fort",
      "roadName": "Netaji Subhash Marg",
      "speedKmh": 35,
      "trafficMultiplier": 1.8,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.66696,
          77.228
        ],
        [
          28.66677,
          77.22753
        ],
        [
          28.6668,
          77.22736
        ],
        [
          28.66662,
          77.22691
        ],
        [
          28.66657,
          77.22649
        ],
        [
          28.66644,
          77.22529
        ],
        [
          28.66547,
          77.22494
        ],
        [
          28.66538,
          77.22496
        ],
        [
          28.6657,
          77.22761
        ],
        [
          28.66532,
          77.22772
        ],
        [
          28.66501,
          77.22794
        ],
        [
          28.66469,
          77.22819
        ],
        [
          28.66425,
          77.22848
        ],
        [
          28.66403,
          77.22991
        ],
        [
          28.66434,
          77.22994
        ],
        [
          28.66475,
          77.23058
        ],
        [
          28.66489,
          77.23069
        ],
        [
          28.6635,
          77.2324
        ],
        [
          28.66254,
          77.23387
        ],
        [
          28.66192,
          77.23499
        ],
        [
          28.66131,
          77.23577
        ],
        [
          28.66039,
          77.23612
        ],
        [
          28.65946,
          77.23657
        ],
        [
          28.6584,
          77.23694
        ],
        [
          28.65725,
          77.23692
        ],
        [
          28.65595,
          77.23742
        ],
        [
          28.65548,
          77.23794
        ],
        [
          28.65524,
          77.2383
        ]
      ],
      "distance": 2666,
      "bidirectional": true
    },
    {
      "id": "E65",
      "from": "ndls",
      "to": "red_fort",
      "roadName": "Asaf Ali Road & Daryaganj",
      "speedKmh": 35,
      "trafficMultiplier": 1.7,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.64251,
          77.22205
        ],
        [
          28.64342,
          77.22287
        ],
        [
          28.64373,
          77.2238
        ],
        [
          28.64494,
          77.2236
        ],
        [
          28.64563,
          77.22356
        ],
        [
          28.64638,
          77.22381
        ],
        [
          28.64669,
          77.22446
        ],
        [
          28.64763,
          77.22535
        ],
        [
          28.64897,
          77.22614
        ],
        [
          28.64926,
          77.2264
        ],
        [
          28.64935,
          77.22654
        ],
        [
          28.64923,
          77.22663
        ],
        [
          28.64941,
          77.22728
        ],
        [
          28.65046,
          77.23014
        ],
        [
          28.65141,
          77.23233
        ],
        [
          28.65156,
          77.23286
        ],
        [
          28.65162,
          77.23333
        ],
        [
          28.65272,
          77.23333
        ],
        [
          28.65316,
          77.23472
        ],
        [
          28.65369,
          77.23643
        ],
        [
          28.65695,
          77.23686
        ],
        [
          28.65858,
          77.23686
        ],
        [
          28.65954,
          77.23645
        ],
        [
          28.66003,
          77.2363
        ],
        [
          28.65867,
          77.23689
        ],
        [
          28.65672,
          77.23689
        ],
        [
          28.65566,
          77.2378
        ],
        [
          28.65524,
          77.2383
        ]
      ],
      "distance": 3762,
      "bidirectional": true
    },
    {
      "id": "E66",
      "from": "ito_junction",
      "to": "red_fort",
      "roadName": "Mahatma Gandhi Ring Road (Rajghat)",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62849,
          77.24138
        ],
        [
          28.62783,
          77.24143
        ],
        [
          28.62802,
          77.24125
        ],
        [
          28.63033,
          77.24108
        ],
        [
          28.63231,
          77.24089
        ],
        [
          28.63344,
          77.24082
        ],
        [
          28.635,
          77.24082
        ],
        [
          28.63697,
          77.24093
        ],
        [
          28.63852,
          77.24104
        ],
        [
          28.6399,
          77.24083
        ],
        [
          28.64067,
          77.24055
        ],
        [
          28.64115,
          77.24042
        ],
        [
          28.64424,
          77.24032
        ],
        [
          28.64815,
          77.24007
        ],
        [
          28.64874,
          77.23973
        ],
        [
          28.65152,
          77.23765
        ],
        [
          28.65286,
          77.23672
        ],
        [
          28.65464,
          77.23647
        ],
        [
          28.65736,
          77.23689
        ],
        [
          28.65858,
          77.23686
        ],
        [
          28.65921,
          77.23661
        ],
        [
          28.66004,
          77.23611
        ],
        [
          28.65995,
          77.23633
        ],
        [
          28.65887,
          77.23684
        ],
        [
          28.6578,
          77.23695
        ],
        [
          28.65598,
          77.23693
        ],
        [
          28.65548,
          77.23794
        ],
        [
          28.65524,
          77.2383
        ]
      ],
      "distance": 4531,
      "bidirectional": true
    },
    {
      "id": "E67",
      "from": "kashmere_gate",
      "to": "ito_junction",
      "roadName": "Salimugarh Bypass Ring Road",
      "speedKmh": 55,
      "trafficMultiplier": 1.1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.66696,
          77.228
        ],
        [
          28.66678,
          77.22748
        ],
        [
          28.66662,
          77.22691
        ],
        [
          28.66656,
          77.22614
        ],
        [
          28.66552,
          77.22493
        ],
        [
          28.6658,
          77.22731
        ],
        [
          28.66532,
          77.22772
        ],
        [
          28.66495,
          77.22799
        ],
        [
          28.66425,
          77.22848
        ],
        [
          28.66403,
          77.22996
        ],
        [
          28.66472,
          77.23055
        ],
        [
          28.66494,
          77.23076
        ],
        [
          28.66257,
          77.23365
        ],
        [
          28.66178,
          77.23521
        ],
        [
          28.66039,
          77.23612
        ],
        [
          28.6591,
          77.23675
        ],
        [
          28.6578,
          77.23695
        ],
        [
          28.65364,
          77.23663
        ],
        [
          28.65169,
          77.23781
        ],
        [
          28.64978,
          77.23922
        ],
        [
          28.64505,
          77.24042
        ],
        [
          28.64205,
          77.24059
        ],
        [
          28.64109,
          77.24074
        ],
        [
          28.6381,
          77.24119
        ],
        [
          28.63626,
          77.24118
        ],
        [
          28.63454,
          77.24102
        ],
        [
          28.63084,
          77.24118
        ],
        [
          28.62849,
          77.24138
        ]
      ],
      "distance": 5631,
      "bidirectional": true
    },
    {
      "id": "E68",
      "from": "ito_junction",
      "to": "laxmi_nagar",
      "roadName": "ITO Yamuna Bridge & Vikas Marg",
      "speedKmh": 45,
      "trafficMultiplier": 1.6,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62849,
          77.24138
        ],
        [
          28.62811,
          77.24152
        ],
        [
          28.62803,
          77.24165
        ],
        [
          28.62791,
          77.24191
        ],
        [
          28.62795,
          77.24323
        ],
        [
          28.62814,
          77.24562
        ],
        [
          28.62822,
          77.24671
        ],
        [
          28.62825,
          77.24779
        ],
        [
          28.62821,
          77.24926
        ],
        [
          28.62812,
          77.25053
        ],
        [
          28.62813,
          77.25215
        ],
        [
          28.62817,
          77.25935
        ],
        [
          28.62822,
          77.26059
        ],
        [
          28.62823,
          77.26815
        ],
        [
          28.62824,
          77.27193
        ],
        [
          28.62832,
          77.2735
        ],
        [
          28.62857,
          77.27436
        ],
        [
          28.6289,
          77.27491
        ],
        [
          28.62955,
          77.27601
        ],
        [
          28.62985,
          77.27687
        ],
        [
          28.62977,
          77.27694
        ],
        [
          28.62935,
          77.27733
        ],
        [
          28.62912,
          77.27754
        ],
        [
          28.62911,
          77.27785
        ],
        [
          28.62929,
          77.27808
        ],
        [
          28.62989,
          77.27768
        ],
        [
          28.63023,
          77.27736
        ],
        [
          28.63039,
          77.27768
        ]
      ],
      "distance": 3934,
      "bidirectional": true
    },
    {
      "id": "E69",
      "from": "ito_junction",
      "to": "akshardham",
      "roadName": "NH-9 Yamuna Bridge (Indraprastha)",
      "speedKmh": 55,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.62849,
          77.24138
        ],
        [
          28.62803,
          77.24165
        ],
        [
          28.62792,
          77.24237
        ],
        [
          28.62816,
          77.24593
        ],
        [
          28.62825,
          77.24779
        ],
        [
          28.62812,
          77.25053
        ],
        [
          28.62814,
          77.25338
        ],
        [
          28.62822,
          77.26681
        ],
        [
          28.62824,
          77.27193
        ],
        [
          28.62854,
          77.27266
        ],
        [
          28.62903,
          77.27278
        ],
        [
          28.62937,
          77.27253
        ],
        [
          28.62947,
          77.27198
        ],
        [
          28.62925,
          77.27159
        ],
        [
          28.62875,
          77.27141
        ],
        [
          28.62795,
          77.27171
        ],
        [
          28.62717,
          77.27245
        ],
        [
          28.62615,
          77.27446
        ],
        [
          28.62573,
          77.27494
        ],
        [
          28.62353,
          77.27645
        ],
        [
          28.61971,
          77.27903
        ],
        [
          28.6159,
          77.28149
        ],
        [
          28.61472,
          77.28247
        ],
        [
          28.61388,
          77.28267
        ],
        [
          28.61404,
          77.28237
        ],
        [
          28.61607,
          77.28119
        ],
        [
          28.61573,
          77.27836
        ],
        [
          28.61276,
          77.27635
        ]
      ],
      "distance": 6583,
      "bidirectional": true
    },
    {
      "id": "E70",
      "from": "lajpat_nagar",
      "to": "akshardham",
      "roadName": "Barapullah Elevated & NH-24 Link",
      "speedKmh": 55,
      "trafficMultiplier": 1.1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.56773,
          77.2355
        ],
        [
          28.56863,
          77.23535
        ],
        [
          28.56781,
          77.23481
        ],
        [
          28.56575,
          77.23461
        ],
        [
          28.56518,
          77.23769
        ],
        [
          28.56507,
          77.24291
        ],
        [
          28.56591,
          77.25171
        ],
        [
          28.56657,
          77.25266
        ],
        [
          28.56979,
          77.25437
        ],
        [
          28.57127,
          77.25653
        ],
        [
          28.57394,
          77.26039
        ],
        [
          28.57871,
          77.26681
        ],
        [
          28.58044,
          77.26678
        ],
        [
          28.58157,
          77.26569
        ],
        [
          28.5833,
          77.26331
        ],
        [
          28.58546,
          77.26011
        ],
        [
          28.58695,
          77.25924
        ],
        [
          28.59024,
          77.25812
        ],
        [
          28.59292,
          77.25714
        ],
        [
          28.59704,
          77.25589
        ],
        [
          28.59885,
          77.25722
        ],
        [
          28.59996,
          77.26037
        ],
        [
          28.606,
          77.27374
        ],
        [
          28.60889,
          77.27874
        ],
        [
          28.61319,
          77.28239
        ],
        [
          28.61404,
          77.28237
        ],
        [
          28.61681,
          77.2805
        ],
        [
          28.61276,
          77.27635
        ]
      ],
      "distance": 11250,
      "bidirectional": true
    },
    {
      "id": "E71",
      "from": "nehru_place",
      "to": "akshardham",
      "roadName": "Outer Ring Road & Sarai Kale Khan",
      "speedKmh": 50,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.54922,
          77.25191
        ],
        [
          28.55035,
          77.25117
        ],
        [
          28.54935,
          77.24875
        ],
        [
          28.55209,
          77.24681
        ],
        [
          28.55549,
          77.24783
        ],
        [
          28.55601,
          77.24998
        ],
        [
          28.55796,
          77.25101
        ],
        [
          28.56052,
          77.25058
        ],
        [
          28.56229,
          77.25025
        ],
        [
          28.56512,
          77.25002
        ],
        [
          28.56596,
          77.25146
        ],
        [
          28.56653,
          77.25245
        ],
        [
          28.56876,
          77.25384
        ],
        [
          28.57127,
          77.25653
        ],
        [
          28.57584,
          77.26338
        ],
        [
          28.57982,
          77.26695
        ],
        [
          28.58144,
          77.26581
        ],
        [
          28.58421,
          77.26192
        ],
        [
          28.58616,
          77.25958
        ],
        [
          28.58968,
          77.2583
        ],
        [
          28.59292,
          77.25714
        ],
        [
          28.59828,
          77.25551
        ],
        [
          28.59899,
          77.2581
        ],
        [
          28.60565,
          77.27296
        ],
        [
          28.60957,
          77.27939
        ],
        [
          28.61369,
          77.28245
        ],
        [
          28.61607,
          77.28119
        ],
        [
          28.61276,
          77.27635
        ]
      ],
      "distance": 11967,
      "bidirectional": true
    },
    {
      "id": "E72",
      "from": "red_fort",
      "to": "laxmi_nagar",
      "roadName": "Geeta Colony Bridge Corridor",
      "speedKmh": 45,
      "trafficMultiplier": 1.5,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.65524,
          77.2383
        ],
        [
          28.65592,
          77.23783
        ],
        [
          28.65448,
          77.23663
        ],
        [
          28.65169,
          77.23781
        ],
        [
          28.65013,
          77.23916
        ],
        [
          28.65032,
          77.24005
        ],
        [
          28.65034,
          77.24366
        ],
        [
          28.6507,
          77.24486
        ],
        [
          28.65115,
          77.2455
        ],
        [
          28.65126,
          77.24925
        ],
        [
          28.65135,
          77.25403
        ],
        [
          28.6516,
          77.26576
        ],
        [
          28.65112,
          77.26729
        ],
        [
          28.65022,
          77.26804
        ],
        [
          28.64864,
          77.26862
        ],
        [
          28.6434,
          77.26912
        ],
        [
          28.63816,
          77.26968
        ],
        [
          28.63324,
          77.27012
        ],
        [
          28.63171,
          77.2711
        ],
        [
          28.63052,
          77.272
        ],
        [
          28.62918,
          77.27288
        ],
        [
          28.62847,
          77.2734
        ],
        [
          28.62848,
          77.27415
        ],
        [
          28.62955,
          77.27601
        ],
        [
          28.62949,
          77.27721
        ],
        [
          28.62899,
          77.27766
        ],
        [
          28.62958,
          77.27799
        ],
        [
          28.63039,
          77.27768
        ]
      ],
      "distance": 7122,
      "bidirectional": true
    },
    {
      "id": "E73",
      "from": "akshardham",
      "to": "laxmi_nagar",
      "roadName": "Noida Link Road & Patparganj Rd",
      "speedKmh": 45,
      "trafficMultiplier": 1.3,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61276,
          77.27635
        ],
        [
          28.61437,
          77.27537
        ],
        [
          28.61688,
          77.28043
        ],
        [
          28.61821,
          77.27978
        ],
        [
          28.61966,
          77.27892
        ],
        [
          28.62365,
          77.27622
        ],
        [
          28.62465,
          77.27551
        ],
        [
          28.62569,
          77.27478
        ],
        [
          28.62617,
          77.27418
        ],
        [
          28.62721,
          77.27217
        ],
        [
          28.62763,
          77.27175
        ],
        [
          28.62844,
          77.27131
        ],
        [
          28.62872,
          77.27128
        ],
        [
          28.62928,
          77.27108
        ],
        [
          28.62955,
          77.27059
        ],
        [
          28.62948,
          77.27013
        ],
        [
          28.62917,
          77.26982
        ],
        [
          28.62875,
          77.2698
        ],
        [
          28.62842,
          77.27007
        ],
        [
          28.62824,
          77.27193
        ],
        [
          28.62848,
          77.27415
        ],
        [
          28.62915,
          77.2753
        ],
        [
          28.62993,
          77.2768
        ],
        [
          28.62949,
          77.27721
        ],
        [
          28.62912,
          77.27754
        ],
        [
          28.62929,
          77.27808
        ],
        [
          28.63016,
          77.27742
        ],
        [
          28.63039,
          77.27768
        ]
      ],
      "distance": 3811,
      "bidirectional": true
    },
    {
      "id": "E74",
      "from": "laxmi_nagar",
      "to": "anand_vihar",
      "roadName": "Vikas Marg & Karkardooma Ave",
      "speedKmh": 45,
      "trafficMultiplier": 1.4,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.63039,
          77.27768
        ],
        [
          28.631,
          77.27847
        ],
        [
          28.63194,
          77.27989
        ],
        [
          28.63282,
          77.28124
        ],
        [
          28.63392,
          77.28293
        ],
        [
          28.63437,
          77.2832
        ],
        [
          28.63592,
          77.28556
        ],
        [
          28.63608,
          77.28581
        ],
        [
          28.63758,
          77.28853
        ],
        [
          28.63863,
          77.29066
        ],
        [
          28.64073,
          77.29418
        ],
        [
          28.64213,
          77.29597
        ],
        [
          28.643,
          77.29707
        ],
        [
          28.64415,
          77.29887
        ],
        [
          28.64034,
          77.30208
        ],
        [
          28.63686,
          77.30528
        ],
        [
          28.63637,
          77.30605
        ],
        [
          28.63608,
          77.30705
        ],
        [
          28.63618,
          77.30927
        ],
        [
          28.63642,
          77.31424
        ],
        [
          28.63689,
          77.31429
        ],
        [
          28.6373,
          77.31427
        ],
        [
          28.6384,
          77.31451
        ],
        [
          28.63979,
          77.31499
        ],
        [
          28.64222,
          77.31599
        ],
        [
          28.64533,
          77.3171
        ],
        [
          28.64667,
          77.31734
        ],
        [
          28.64717,
          77.31643
        ]
      ],
      "distance": 5898,
      "bidirectional": true
    },
    {
      "id": "E75",
      "from": "akshardham",
      "to": "anand_vihar",
      "roadName": "NH-9 Ghazipur & Chaudhary Charan Singh Marg",
      "speedKmh": 55,
      "trafficMultiplier": 1.2,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.61276,
          77.27635
        ],
        [
          28.61559,
          77.27779
        ],
        [
          28.61717,
          77.28044
        ],
        [
          28.61839,
          77.27948
        ],
        [
          28.62038,
          77.27814
        ],
        [
          28.61905,
          77.27952
        ],
        [
          28.6159,
          77.28149
        ],
        [
          28.61527,
          77.28241
        ],
        [
          28.61495,
          77.28339
        ],
        [
          28.61492,
          77.28385
        ],
        [
          28.61636,
          77.28593
        ],
        [
          28.61773,
          77.28839
        ],
        [
          28.61901,
          77.29186
        ],
        [
          28.62093,
          77.29774
        ],
        [
          28.62298,
          77.3036
        ],
        [
          28.62457,
          77.30847
        ],
        [
          28.62559,
          77.31165
        ],
        [
          28.62632,
          77.3134
        ],
        [
          28.62758,
          77.31733
        ],
        [
          28.62776,
          77.31741
        ],
        [
          28.63271,
          77.31557
        ],
        [
          28.63524,
          77.31468
        ],
        [
          28.63748,
          77.31447
        ],
        [
          28.63885,
          77.31481
        ],
        [
          28.64129,
          77.31567
        ],
        [
          28.64482,
          77.31691
        ],
        [
          28.64667,
          77.31734
        ],
        [
          28.64717,
          77.31643
        ]
      ],
      "distance": 8063,
      "bidirectional": true
    },
    {
      "id": "CE22",
      "from": "nsut_main_gate",
      "to": "nsut_moksha",
      "roadName": "Moksha Ground South Access Rd",
      "distance": 380,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6083,
          77.0325
        ],
        [
          28.6085,
          77.0345
        ],
        [
          28.6088,
          77.0368
        ]
      ],
      "bidirectional": true
    },
    {
      "id": "CE23",
      "from": "nsut_admin",
      "to": "nsut_moksha",
      "roadName": "Admin–Moksha Perimeter Road",
      "distance": 190,
      "speedKmh": 20,
      "trafficMultiplier": 1,
      "pedestrianOnly": false,
      "waypoints": [
        [
          28.6096,
          77.0357
        ],
        [
          28.609,
          77.036
        ],
        [
          28.6088,
          77.0368
        ]
      ],
      "bidirectional": true
    }
  ]
};

export const DEFAULT_GRAPH = UNIFIED_GRAPH;

/**
 * Inject a custom geocoded location (e.g. from Nominatim) dynamically into the graph.
 */
export function injectCustomNode(graph, customNode) {
  if (!customNode || !customNode.id || !customNode.lat || !customNode.lng) return graph;
  if (graph.nodes.some(n => n.id === customNode.id)) return graph;

  const nearest = graph.nodes
    .map(n => ({
      node: n,
      dist: haversineDistance(customNode.lat, customNode.lng, n.lat, n.lng)
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 2);

  const newEdges = nearest.map((cand, idx) => ({
    id: `custom_edge_${customNode.id}_${cand.node.id}_${idx}`,
    from: customNode.id,
    to: cand.node.id,
    roadName: `Road to ${cand.node.shortName}`,
    distance: cand.dist,
    speedKmh: 35,
    trafficMultiplier: 1.0,
    pedestrianOnly: false,
    bidirectional: true,
    waypoints: [
      [customNode.lat, customNode.lng],
      [cand.node.lat, cand.node.lng]
    ]
  }));

  return {
    ...graph,
    nodes: [...graph.nodes, customNode],
    edges: [...graph.edges, ...newEdges]
  };
}

export function evaluateEdgeForMode(edge, mode = "car") {
  const normalizedMode = mode === "walk" ? "walk" : "car";
  const distMeters = Number(edge.distance) || 150;

  if (normalizedMode === "car" && edge.pedestrianOnly) {
    return {
      allowed: false,
      weight: Infinity,
      durationMin: Infinity,
      distanceMeters: distMeters,
    };
  }

  if (normalizedMode === "walk") {
    const durationMin = distMeters / 83.3333; // 5.0 km/h walking speed
    return {
      allowed: true,
      weight: durationMin,
      durationMin,
      distanceMeters: distMeters,
    };
  }

  const speedKmh = Number(edge.speedKmh) || 35;
  const traffic = Number(edge.trafficMultiplier) || 1.0;
  const metersPerMin = (speedKmh * 1000) / 60;
  const durationMin = (distMeters / metersPerMin) * traffic;

  return {
    allowed: true,
    weight: durationMin,
    durationMin,
    distanceMeters: distMeters,
  };
}

export function buildAdjacencyList(graph, mode = "car") {
  const adjacency = {};
  const nodesMap = {};

  for (const node of graph.nodes || []) {
    adjacency[node.id] = [];
    nodesMap[node.id] = node;
  }

  for (const edge of graph.edges || []) {
    const u = nodesMap[edge.from];
    const v = nodesMap[edge.to];
    if (!u || !v) continue;

    const evalResult = evaluateEdgeForMode(edge, mode);
    if (!evalResult.allowed) continue;

    const forwardWaypoints =
      Array.isArray(edge.waypoints) && edge.waypoints.length >= 2
        ? edge.waypoints
        : [
            [u.lat, u.lng],
            [v.lat, v.lng],
          ];

    const reverseWaypoints = [...forwardWaypoints].reverse();

    adjacency[edge.from].push({
      to: edge.to,
      edgeId: edge.id,
      roadName: edge.roadName || `${u.shortName} → ${v.shortName}`,
      distance: evalResult.distanceMeters,
      durationMin: evalResult.durationMin,
      weight: evalResult.weight,
      trafficMultiplier: Number(edge.trafficMultiplier || 1.0),
      speedKmh: Number(edge.speedKmh || 35),
      pedestrianOnly: Boolean(edge.pedestrianOnly),
      waypoints: forwardWaypoints,
    });

    if (edge.bidirectional !== false) {
      adjacency[edge.to].push({
        to: edge.from,
        edgeId: edge.id,
        roadName: edge.roadName || `${v.shortName} → ${u.shortName}`,
        distance: evalResult.distanceMeters,
        durationMin: evalResult.durationMin,
        weight: evalResult.weight,
        trafficMultiplier: Number(edge.trafficMultiplier || 1.0),
        speedKmh: Number(edge.speedKmh || 35),
        pedestrianOnly: Boolean(edge.pedestrianOnly),
        waypoints: reverseWaypoints,
      });
    }
  }

  return { adjacency, nodesMap };
}

function runSegmentDijkstra(adjacency, nodesMap, segStart, segEnd, legIndex = 1) {
  const distances = {};
  const metersMap = {};
  const minutesMap = {};
  const predecessors = {};
  const predEdges = {};
  const visited = new Set();

  for (const nodeId of Object.keys(nodesMap)) {
    distances[nodeId] = Infinity;
    metersMap[nodeId] = Infinity;
    minutesMap[nodeId] = Infinity;
    predecessors[nodeId] = null;
    predEdges[nodeId] = null;
  }

  distances[segStart] = 0;
  metersMap[segStart] = 0;
  minutesMap[segStart] = 0;

  const pq = new MinPriorityQueue();
  pq.enqueue(segStart, 0);

  const visitedOrder = [];
  const visitedEdges = [];
  let stepCounter = 0;

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (!current) break;

    const { nodeId: u, priority: currentCost } = current;
    if (visited.has(u)) continue;
    visited.add(u);
    stepCounter += 1;

    const relaxedEdgesInStep = [];
    const neighbors = adjacency[u] || [];

    for (const edge of neighbors) {
      const v = edge.to;
      if (visited.has(v)) continue;

      const oldCost = distances[v];
      const newCost = currentCost + edge.weight;
      const improved = newCost < oldCost;

      if (improved) {
        distances[v] = newCost;
        metersMap[v] = metersMap[u] + edge.distance;
        minutesMap[v] = minutesMap[u] + edge.durationMin;
        predecessors[v] = u;
        predEdges[v] = edge;
        pq.enqueue(v, newCost);
      }

      const traceItem = {
        legIndex,
        step: stepCounter,
        from: u,
        fromName: nodesMap[u]?.shortName || u,
        to: v,
        toName: nodesMap[v]?.shortName || v,
        edgeId: edge.edgeId,
        roadName: edge.roadName,
        distance: edge.distance,
        durationMin: Number(edge.durationMin.toFixed(2)),
        trafficMultiplier: edge.trafficMultiplier,
        pedestrianOnly: edge.pedestrianOnly,
        oldCost: oldCost === Infinity ? "∞" : Number(oldCost.toFixed(2)),
        newCost: Number(newCost.toFixed(2)),
        improved,
      };

      relaxedEdgesInStep.push(traceItem);
      visitedEdges.push(traceItem);
    }

    visitedOrder.push({
      legIndex,
      step: stepCounter,
      currentNodeId: u,
      currentNodeName: nodesMap[u]?.name || u,
      currentShortName: nodesMap[u]?.shortName || u,
      costSoFar: Number(currentCost.toFixed(2)),
      distanceMetersSoFar: Math.round(metersMap[u]),
      relaxedEdges: relaxedEdgesInStep,
      pqSnapshot: pq.toArray(),
    });

    if (u === segEnd) break;
  }

  const pathNodeIds = [];
  const pathEdges = [];
  let curr = segEnd;

  if (predecessors[curr] !== null || curr === segStart) {
    while (curr !== null) {
      pathNodeIds.unshift(curr);
      const pe = predEdges[curr];
      const pn = predecessors[curr];
      if (pe && pn) {
        pathEdges.unshift({
          ...pe,
          from: pn,
          to: curr,
        });
      }
      curr = pn;
    }
  }

  const reachable = pathNodeIds.length > 0 && pathNodeIds[0] === segStart;

  const segmentGeometry = [];
  for (const edge of pathEdges) {
    const pts = edge.waypoints || [
      [nodesMap[edge.from].lat, nodesMap[edge.from].lng],
      [nodesMap[edge.to].lat, nodesMap[edge.to].lng],
    ];
    for (let i = 0; i < pts.length; i++) {
      if (segmentGeometry.length > 0 && i === 0) continue;
      segmentGeometry.push(pts[i]);
    }
  }

  return {
    reachable,
    pathNodeIds,
    pathEdges,
    segmentGeometry,
    segmentDistance: reachable ? Math.round(metersMap[segEnd]) : 0,
    segmentDurationMin: reachable ? Number(minutesMap[segEnd].toFixed(1)) : 0,
    visitedOrder,
    visitedEdges,
    distances,
    predecessors,
  };
}

function buildFallbackTurnByTurnSteps(pathEdges, nodesMap, mode = "car") {
  if (!pathEdges || pathEdges.length === 0) return [];
  const verb = mode === "walk" ? "Walk along" : "Continue onto";
  return pathEdges.map((edge, idx) => {
    const targetNode = nodesMap[edge.to];
    const maneuver =
      idx === 0
        ? `Depart on ${edge.roadName} toward ${targetNode?.shortName || edge.to}`
        : idx === pathEdges.length - 1
        ? `${verb} ${edge.roadName} to reach ${targetNode?.shortName || edge.to}`
        : `${verb} ${edge.roadName} (${targetNode?.shortName || edge.to})`;
    return {
      step: idx + 1,
      instruction: maneuver,
      roadName: edge.roadName,
      toNodeId: edge.to,
      toNodeName: targetNode?.shortName || edge.to,
      distanceMeters: edge.distance,
      durationMin: Math.max(1, Math.round(edge.durationMin)),
      pedestrianOnly: Boolean(edge.pedestrianOnly),
    };
  });
}

export function runChainedDijkstraForMode({
  graph = DEFAULT_GRAPH,
  sourceId,
  targetId,
  viaNodeIds = [],
  mode = "car",
}) {
  const normalizedMode = mode === "walk" ? "walk" : "car";
  const { adjacency, nodesMap } = buildAdjacencyList(graph, normalizedMode);

  if (!nodesMap[sourceId] || !nodesMap[targetId]) {
    return { reachable: false };
  }

  const cleanViaIds = (viaNodeIds || []).filter(
    (id) => nodesMap[id] && id !== sourceId && id !== targetId
  );
  const chain = [sourceId, ...cleanViaIds, targetId];

  const allNodeIds = [];
  const allPathEdges = [];
  const stitchedRoadGeometry = [];
  const segments = [];
  const combinedVisitedOrder = [];
  const combinedVisitedEdges = [];
  let lastDistances = {};
  let lastPredecessors = {};

  for (let i = 0; i < chain.length - 1; i++) {
    const fromId = chain[i];
    const toId = chain[i + 1];
    const legIndex = i + 1;

    const seg = runSegmentDijkstra(adjacency, nodesMap, fromId, toId, legIndex);
    if (!seg.reachable) {
      return {
        reachable: false,
        mode: normalizedMode,
        visitedOrder: combinedVisitedOrder,
      };
    }

    const segNodes = i === 0 ? seg.pathNodeIds : seg.pathNodeIds.slice(1);
    allNodeIds.push(...segNodes);
    allPathEdges.push(...seg.pathEdges);

    for (let p = 0; p < seg.segmentGeometry.length; p++) {
      if (stitchedRoadGeometry.length > 0 && p === 0) continue;
      stitchedRoadGeometry.push(seg.segmentGeometry[p]);
    }

    const stepOffset = combinedVisitedOrder.length;
    for (const s of seg.visitedOrder) {
      combinedVisitedOrder.push({ ...s, step: s.step + stepOffset });
    }
    for (const e of seg.visitedEdges) {
      combinedVisitedEdges.push({ ...e, step: e.step + stepOffset });
    }

    segments.push({
      legIndex,
      from: fromId,
      fromName: nodesMap[fromId]?.shortName || nodesMap[fromId]?.name || fromId,
      to: toId,
      toName: nodesMap[toId]?.shortName || nodesMap[toId]?.name || toId,
      distanceMeters: seg.segmentDistance,
      distanceKm: Number((seg.segmentDistance / 1000).toFixed(2)),
      durationMin: Math.max(1, Math.round(seg.segmentDurationMin)),
      pathNodeIds: seg.pathNodeIds,
      pathNames: seg.pathNodeIds.map((nid) => nodesMap[nid]?.shortName || nid),
      roadGeometry: seg.segmentGeometry,
    });

    lastDistances = seg.distances;
    lastPredecessors = seg.predecessors;
  }

  let cumDist = 0;
  let cumTime = 0;
  const shortestPath = allNodeIds.map((nid, idx) => {
    const node = nodesMap[nid];
    const incomingEdge = idx > 0 ? allPathEdges[idx - 1] : null;
    if (incomingEdge) {
      cumDist += incomingEdge.distance;
      cumTime += incomingEdge.durationMin;
    }
    return {
      id: node.id,
      name: node.name,
      shortName: node.shortName || node.name,
      lat: node.lat,
      lng: node.lng,
      zone: node.zone || "Delhi",
      isCampus: Boolean(node.isCampus),
      stepIndex: idx,
      isOrigin: idx === 0,
      isDestination: idx === allNodeIds.length - 1,
      isViaStop: cleanViaIds.includes(node.id),
      viaStopNumber: cleanViaIds.indexOf(node.id) + 1 || null,
      cumulativeDistance: Math.round(cumDist),
      cumulativeTime: Number(cumTime.toFixed(1)),
      roadFromPrev: incomingEdge ? incomingEdge.roadName : "Origin",
      segmentDistance: incomingEdge ? incomingEdge.distance : 0,
      pedestrianOnly: incomingEdge ? Boolean(incomingEdge.pedestrianOnly) : false,
    };
  });

  const totalDistance = Math.round(cumDist);
  const totalDistanceKm = Number((totalDistance / 1000).toFixed(2));
  const estimatedTime = totalDistance === 0 ? 0 : Math.max(1, Math.round(cumTime));

  const turnByTurnSteps = buildFallbackTurnByTurnSteps(
    allPathEdges,
    nodesMap,
    normalizedMode
  );

  const roadGeometryGeoJSON = {
    type: "LineString",
    coordinates: stitchedRoadGeometry.map(([lat, lng]) => [lng, lat]),
  };

  const cleanDistancesMap = {};
  for (const [k, v] of Object.entries(lastDistances)) {
    cleanDistancesMap[k] = v === Infinity ? null : Number(v.toFixed(2));
  }

  return {
    reachable: true,
    mode: normalizedMode,
    shortestPath,
    pathEdges: allPathEdges,
    roadGeometry: stitchedRoadGeometry,
    roadGeometryGeoJSON,
    segments,
    turnByTurnSteps,
    totalDistance,
    totalDistanceKm,
    estimatedTime,
    visitedOrder: combinedVisitedOrder,
    visitedEdges: combinedVisitedEdges,
    distancesMap: cleanDistancesMap,
    predecessors: lastPredecessors,
  };
}

export async function hydrateWithOSRM(modeResult) {
  if (!modeResult || !modeResult.reachable || modeResult.shortestPath.length < 2) {
    return modeResult;
  }

  const hasPedestrianShortcut = (modeResult.pathEdges || []).some(
    (e) => e.pedestrianOnly
  );
  if (hasPedestrianShortcut) {
    return modeResult;
  }

  const profile = modeResult.mode === "walk" ? "foot" : "driving";
  const coordsString = modeResult.shortestPath
    .map((n) => `${n.lng},${n.lat}`)
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsString}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2400);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return modeResult;
    const data = await res.json();

    if (
      data.code === "Ok" &&
      data.routes?.[0]?.geometry?.coordinates?.length >= 2
    ) {
      const route = data.routes[0];
      const latLngs = route.geometry.coordinates.map(([lon, lat]) => [
        Number(lat.toFixed(5)),
        Number(lon.toFixed(5)),
      ]);

      return {
        ...modeResult,
        roadGeometry: latLngs,
        roadGeometryGeoJSON: route.geometry,
        osrmSnapped: true,
      };
    }
  } catch {
    // Fallback to pre-snapped edge waypoints
  }

  return modeResult;
}

export async function executeDijkstraAsync({
  graph = DEFAULT_GRAPH,
  sourceId,
  targetId,
  viaNodeIds = [],
  mode = "car",
  enableLiveOSRM = true,
}) {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const activeGraph = graph && graph.nodes && graph.edges ? graph : DEFAULT_GRAPH;
  const normalizedMode = mode === "walk" ? "walk" : "car";
  const cleanViaNodeIds = Array.isArray(viaNodeIds) ? viaNodeIds : [];

  let carResult = runChainedDijkstraForMode({
    graph: activeGraph,
    sourceId,
    targetId,
    viaNodeIds: cleanViaNodeIds,
    mode: "car",
  });

  let walkResult = runChainedDijkstraForMode({
    graph: activeGraph,
    sourceId,
    targetId,
    viaNodeIds: cleanViaNodeIds,
    mode: "walk",
  });

  const dijkstraComputeMs = Number(
    Math.max(
      0.18,
      (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0
    ).toFixed(2)
  );

  if (enableLiveOSRM) {
    [carResult, walkResult] = await Promise.all([
      hydrateWithOSRM(carResult),
      hydrateWithOSRM(walkResult),
    ]);
  }

  const primary = normalizedMode === "walk" ? walkResult : carResult;

  if (!primary.reachable) {
    return {
      status: "unreachable",
      mode: normalizedMode,
      sourceId,
      targetId,
      viaNodeIds: cleanViaNodeIds,
      shortestPath: [],
      roadGeometry: [],
      roadGeometryGeoJSON: null,
      segments: [],
      turnByTurnSteps: [],
      totalDistance: 0,
      totalDistanceKm: 0,
      estimatedTime: 0,
      comparison: null,
      visitedOrder: primary.visitedOrder || [],
      executionTimeMs: dijkstraComputeMs,
    };
  }

  const timeSavedByCarMin = Math.max(
    1,
    (walkResult.estimatedTime || 0) - (carResult.estimatedTime || 0)
  );

  return {
    status: "ok",
    engine: "Dijkstra Min-Heap + OSRM Street Geometry v4.0",
    mode: normalizedMode,
    sourceId,
    targetId,
    viaNodeIds: cleanViaNodeIds,
    shortestPath: primary.shortestPath,
    pathEdges: primary.pathEdges,
    roadGeometry: primary.roadGeometry,
    roadGeometryGeoJSON: primary.roadGeometryGeoJSON,
    segments: primary.segments,
    turnByTurnSteps: primary.turnByTurnSteps,
    totalDistance: primary.totalDistance,
    totalDistanceKm: primary.totalDistanceKm,
    estimatedTime: primary.estimatedTime,
    comparison: {
      car: {
        distanceMeters: carResult.totalDistance,
        distanceKm: carResult.totalDistanceKm,
        durationMin: carResult.estimatedTime,
        path: (carResult.shortestPath || []).map((n) => ({
          id: n.id,
          name: n.name,
          shortName: n.shortName,
          lat: n.lat,
          lng: n.lng,
          zone: n.zone,
          isCampus: n.isCampus,
        })),
        roadGeometry: carResult.roadGeometry,
        roadGeometryGeoJSON: carResult.roadGeometryGeoJSON,
        segments: carResult.segments,
        turnByTurnSteps: carResult.turnByTurnSteps,
      },
      walk: {
        distanceMeters: walkResult.totalDistance,
        distanceKm: walkResult.totalDistanceKm,
        durationMin: walkResult.estimatedTime,
        path: (walkResult.shortestPath || []).map((n) => ({
          id: n.id,
          name: n.name,
          shortName: n.shortName,
          lat: n.lat,
          lng: n.lng,
          zone: n.zone,
          isCampus: n.isCampus,
        })),
        roadGeometry: walkResult.roadGeometry,
        roadGeometryGeoJSON: walkResult.roadGeometryGeoJSON,
        segments: walkResult.segments,
        turnByTurnSteps: walkResult.turnByTurnSteps,
      },
      timeSavedByCarMin,
      walkShorterDistanceMeters: Math.max(
        0,
        (carResult.totalDistance || 0) - (walkResult.totalDistance || 0)
      ),
    },
    visitedOrder: primary.visitedOrder,
    visitedEdges: primary.visitedEdges,
    distancesMap: primary.distancesMap,
    predecessors: primary.predecessors,
    executionTimeMs: dijkstraComputeMs,
    timestamp: new Date().toISOString(),
  };
}
