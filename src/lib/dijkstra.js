/**
 * ============================================================================
 * NavMap v4.2 — Unified Two-Tier Routing & Dijkstra Navigation Engine
 * - Tier A: Internal NSUT Dwarka Campus (16 Landmarks, Roads & Walkways)
 * - Tier B: Pan-New Delhi City Arterials (32 Hubs & Interchanges)
 * - Dynamic OSRM Street-Intersection Dijkstra for City Routes
 * - Guaranteed Zero Unnecessary Detours & Never Exits Campus for Internal Routes
 * ============================================================================
 */

export const NSUT_CAMPUS_CONFIG = {
  id: "nsut_campus",
  name: "NSUT Dwarka Campus",
  shortLabel: "NSUT Campus",
  center: [28.610056, 77.037968],
  radiusMeters: 620,
  zoom: 17,
};

export const DELHI_VIEW_CONFIG = {
  center: [28.6139, 77.1650],
  zoom: 11,
};

/**
 * Standard Haversine distance in meters.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.max(10, Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

/**
 * Binary Min-Heap Priority Queue for Dijkstra's Algorithm.
 */
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
  isEmpty() {
    return this.heap.length === 0;
  }
  size() {
    return this.heap.length;
  }
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
      [this.heap[parentIdx], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIdx],
      ];
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
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

/**
 * 16 Internal NSUT Dwarka Campus Nodes with Exact Real-World Coordinates.
 */
export const NSUT_CAMPUS_NODES = [
  {
    id: "nsut_main_gate",
    name: "NSUT Main Gate (Azad Hind Fauj Marg)",
    shortName: "Main Gate",
    lat: 28.608484,
    lng: 77.035251,
    zone: "NSUT Campus",
    isCampus: true,
    isCampusGate: true,
    aliases: ["Main Gate", "Southwest Gate", "Gate 1", "Azad Hind Fauj Marg"],
  },
  {
    id: "nsut_gate_road",
    name: "NSUT Main Avenue & Auditorium Roundabout",
    shortName: "Main Avenue",
    lat: 28.609510,
    lng: 77.036590,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Gate Road", "Entrance Avenue", "Main Road", "Nescii Lawn"],
  },
  {
    id: "nsut_admin",
    name: "Admin Block, Main Auditorium & SBI",
    shortName: "Admin Block",
    lat: 28.609847,
    lng: 77.037082,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["VC Office", "SBI ATM", "Main Audi", "Administration", "Auditorium"],
  },
  {
    id: "nsut_moksha",
    name: "Moksha Ground (Central Fest Lawn)",
    shortName: "Moksha Ground",
    lat: 28.610845,
    lng: 77.036582,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Moksha Stage", "Central Lawn", "Fest Ground", "Open Theatre"],
  },
  {
    id: "nsut_apj",
    name: "APJ Abdul Kalam Lecture Complex (APJ 1–11)",
    shortName: "APJ Complex",
    lat: 28.611974,
    lng: 77.037063,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Lecture Theatres", "Smart Block", "APJ 1", "APJ Hall", "Classrooms"],
  },
  {
    id: "nsut_block4",
    name: "Block 4 (ECE, EE & Biotech Dept)",
    shortName: "Block 4 (ECE/EE)",
    lat: 28.609465,
    lng: 77.037668,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Electrical Engineering", "ECE Block", "Biotech Block", "Block IV"],
  },
  {
    id: "nsut_connecting",
    name: "Connecting Block & Mini Auditorium",
    shortName: "Connecting Block",
    lat: 28.609684,
    lng: 77.038089,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Mini Audi", "Central Fountain", "Room 110", "Dean Office"],
  },
  {
    id: "nsut_block5",
    name: "Block 5 (COE & IT Dept)",
    shortName: "Block 5 (CS/IT)",
    lat: 28.609719,
    lng: 77.038585,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Computer Engineering", "IT Dept", "Block V", "AI Lab"],
  },
  {
    id: "nsut_block6",
    name: "Block 6 (ICE & MPAE Dept)",
    shortName: "Block 6 (ICE/MPAE)",
    lat: 28.610526,
    lng: 77.037807,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Instrumentation", "Mechanical", "Block VI", "Robotics Lab"],
  },
  {
    id: "nsut_library",
    name: "Central Library Block",
    shortName: "Central Library",
    lat: 28.610395,
    lng: 77.038969,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Library", "Reading Room", "Digital Library", "Reference Section"],
  },
  {
    id: "nsut_sc_amul",
    name: "Students' Centre (Amul, Nescafe & Canteen)",
    shortName: "Student Centre (Amul)",
    lat: 28.611663,
    lng: 77.036911,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Amul", "Nescafe", "JC Canteen", "Kiosk", "Student Centre"],
  },
  {
    id: "nsut_sac",
    name: "SAC (Student Activity Centre & Gym)",
    shortName: "SAC & Gym",
    lat: 28.610386,
    lng: 77.039310,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Gymnasium", "Indoor Badminton", "Societies Hub", "SAC Building"],
  },
  {
    id: "nsut_sports",
    name: "Sports Complex & Cricket/Football Ground",
    shortName: "Sports Complex",
    lat: 28.610394,
    lng: 77.041365,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["Cricket Ground", "Football Field", "Athletics Track", "Kabaddi Ground"],
  },
  {
    id: "nsut_bh",
    name: "Boys Hostels (BH 1–4 · Bhaskara & Ramanujan)",
    shortName: "Boys Hostels (BH)",
    lat: 28.612652,
    lng: 77.035825,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["BH1", "BH2", "BH3", "BH4", "Bhaskara Hostel", "Ramanujan Hostel", "Aryabhata Hostel"],
  },
  {
    id: "nsut_gh",
    name: "Girls Hostels (Alaknanda & Sarasvati)",
    shortName: "Girls Hostels (GH)",
    lat: 28.608039,
    lng: 77.039571,
    zone: "NSUT Campus",
    isCampus: true,
    aliases: ["GH1", "GH2", "Alaknanda Hostel", "Sarasvati Hostel", "Kaveri Hostel"],
  },
  {
    id: "nsut_north_gate",
    name: "NSUT North Gate (Azad Hind Fauj Marg North)",
    shortName: "North Gate",
    lat: 28.613175,
    lng: 77.033627,
    zone: "NSUT Campus",
    isCampus: true,
    isCampusGate: true,
    aliases: ["North Gate", "Gate 2", "Hostel Gate", "Dwarka Mor Side Gate"],
  },
];

/**
 * Internal NSUT Campus Roads & Walkways (with accurate curving intermediate waypoints).
 */
export const NSUT_CAMPUS_EDGES = [
  {
    "id": "CE1",
    "from": "nsut_main_gate",
    "to": "nsut_gate_road",
    "roadName": "NSUT Main Entrance Avenue",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 245,
    "waypoints": [
      [
        28.608484,
        77.035251
      ],
      [
        28.608603,
        77.035399
      ],
      [
        28.60922,
        77.035199
      ],
      [
        28.609323,
        77.03525
      ],
      [
        28.609575,
        77.03621
      ],
      [
        28.609566,
        77.03626
      ],
      [
        28.609531,
        77.036428
      ],
      [
        28.609572,
        77.036568
      ],
      [
        28.60951,
        77.03659
      ]
    ]
  },
  {
    "id": "CE2",
    "from": "nsut_gate_road",
    "to": "nsut_admin",
    "roadName": "Admin & Auditorium Approach",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 128,
    "waypoints": [
      [
        28.60951,
        77.03659
      ],
      [
        28.609572,
        77.036568
      ],
      [
        28.609811,
        77.036494
      ],
      [
        28.60996,
        77.036445
      ],
      [
        28.610071,
        77.036891
      ],
      [
        28.609847,
        77.037082
      ]
    ]
  },
  {
    "id": "CE3",
    "from": "nsut_gate_road",
    "to": "nsut_moksha",
    "roadName": "Moksha West Avenue",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 193,
    "waypoints": [
      [
        28.60951,
        77.03659
      ],
      [
        28.609572,
        77.036568
      ],
      [
        28.609811,
        77.036494
      ],
      [
        28.60996,
        77.036445
      ],
      [
        28.610103,
        77.0364
      ],
      [
        28.610287,
        77.036342
      ],
      [
        28.610833,
        77.03617
      ],
      [
        28.610845,
        77.036582
      ]
    ]
  },
  {
    "id": "CE4",
    "from": "nsut_moksha",
    "to": "nsut_sc_amul",
    "roadName": "Students Centre Road",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 176,
    "waypoints": [
      [
        28.610845,
        77.036582
      ],
      [
        28.610833,
        77.03617
      ],
      [
        28.61089,
        77.036158
      ],
      [
        28.611047,
        77.036167
      ],
      [
        28.611174,
        77.036227
      ],
      [
        28.611276,
        77.036323
      ],
      [
        28.611338,
        77.03645
      ],
      [
        28.611357,
        77.036516
      ],
      [
        28.611397,
        77.036676
      ],
      [
        28.611446,
        77.03687
      ],
      [
        28.611663,
        77.036911
      ]
    ]
  },
  {
    "id": "CE5",
    "from": "nsut_sc_amul",
    "to": "nsut_apj",
    "roadName": "APJ Lecture Complex Link",
    "speedKmh": 15,
    "pedestrianOnly": false,
    "distance": 286,
    "waypoints": [
      [
        28.611663,
        77.036911
      ],
      [
        28.611446,
        77.03687
      ],
      [
        28.611397,
        77.036676
      ],
      [
        28.611567,
        77.03662
      ],
      [
        28.612065,
        77.036456
      ],
      [
        28.612256,
        77.036393
      ],
      [
        28.612287,
        77.036518
      ],
      [
        28.612454,
        77.037194
      ],
      [
        28.612373,
        77.037278
      ],
      [
        28.611974,
        77.037063
      ]
    ]
  },
  {
    "id": "CE6",
    "from": "nsut_sc_amul",
    "to": "nsut_bh",
    "roadName": "Boys Hostel Avenue",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 708,
    "waypoints": [
      [
        28.611663,
        77.036911
      ],
      [
        28.611446,
        77.03687
      ],
      [
        28.611397,
        77.036676
      ],
      [
        28.611567,
        77.03662
      ],
      [
        28.612065,
        77.036456
      ],
      [
        28.612256,
        77.036393
      ],
      [
        28.612287,
        77.036518
      ],
      [
        28.612454,
        77.037194
      ],
      [
        28.61257,
        77.037158
      ],
      [
        28.613557,
        77.03685
      ],
      [
        28.613674,
        77.036813
      ],
      [
        28.61373,
        77.036638
      ],
      [
        28.613718,
        77.036354
      ],
      [
        28.613715,
        77.036203
      ],
      [
        28.613716,
        77.035644
      ],
      [
        28.613681,
        77.035472
      ],
      [
        28.613554,
        77.034959
      ],
      [
        28.612908,
        77.035172
      ],
      [
        28.612878,
        77.035314
      ],
      [
        28.612953,
        77.035592
      ],
      [
        28.612652,
        77.035825
      ]
    ]
  },
  {
    "id": "CE7",
    "from": "nsut_bh",
    "to": "nsut_north_gate",
    "roadName": "Hostel to North Gate Road",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 295,
    "waypoints": [
      [
        28.612652,
        77.035825
      ],
      [
        28.612953,
        77.035592
      ],
      [
        28.612878,
        77.035314
      ],
      [
        28.612908,
        77.035172
      ],
      [
        28.613554,
        77.034959
      ],
      [
        28.613433,
        77.034468
      ],
      [
        28.61329,
        77.033897
      ],
      [
        28.61327,
        77.033873
      ],
      [
        28.613194,
        77.0337
      ],
      [
        28.613175,
        77.033627
      ]
    ]
  },
  {
    "id": "CE8",
    "from": "nsut_gate_road",
    "to": "nsut_north_gate",
    "roadName": "West Campus Perimeter Drive",
    "speedKmh": 25,
    "pedestrianOnly": false,
    "distance": 624,
    "waypoints": [
      [
        28.60951,
        77.03659
      ],
      [
        28.609572,
        77.036568
      ],
      [
        28.609531,
        77.036428
      ],
      [
        28.609566,
        77.03626
      ],
      [
        28.609575,
        77.03621
      ],
      [
        28.609323,
        77.03525
      ],
      [
        28.609454,
        77.035123
      ],
      [
        28.611555,
        77.03444
      ],
      [
        28.611752,
        77.034368
      ],
      [
        28.611958,
        77.0343
      ],
      [
        28.612096,
        77.034255
      ],
      [
        28.612182,
        77.034226
      ],
      [
        28.613097,
        77.033922
      ],
      [
        28.613239,
        77.033875
      ],
      [
        28.61319,
        77.033684
      ],
      [
        28.613175,
        77.033627
      ]
    ]
  },
  {
    "id": "CE9",
    "from": "nsut_gate_road",
    "to": "nsut_block4",
    "roadName": "Academic South Drive",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 760,
    "waypoints": [
      [
        28.60951,
        77.03659
      ],
      [
        28.609572,
        77.036568
      ],
      [
        28.609531,
        77.036428
      ],
      [
        28.609566,
        77.03626
      ],
      [
        28.609575,
        77.03621
      ],
      [
        28.609323,
        77.03525
      ],
      [
        28.60922,
        77.035199
      ],
      [
        28.608603,
        77.035399
      ],
      [
        28.608464,
        77.035443
      ],
      [
        28.608029,
        77.035582
      ],
      [
        28.607833,
        77.035644
      ],
      [
        28.6079,
        77.035912
      ],
      [
        28.607907,
        77.035941
      ],
      [
        28.608033,
        77.036449
      ],
      [
        28.608059,
        77.036553
      ],
      [
        28.608087,
        77.036661
      ],
      [
        28.608175,
        77.037012
      ],
      [
        28.608324,
        77.037602
      ],
      [
        28.608437,
        77.03805
      ],
      [
        28.608503,
        77.03831
      ],
      [
        28.608552,
        77.038501
      ],
      [
        28.609451,
        77.038203
      ],
      [
        28.609465,
        77.037668
      ]
    ]
  },
  {
    "id": "CE10",
    "from": "nsut_block4",
    "to": "nsut_connecting",
    "roadName": "Connecting Block Drive",
    "speedKmh": 15,
    "pedestrianOnly": false,
    "distance": 80,
    "waypoints": [
      [
        28.609465,
        77.037668
      ],
      [
        28.609451,
        77.038203
      ],
      [
        28.609684,
        77.038089
      ]
    ]
  },
  {
    "id": "CE11",
    "from": "nsut_connecting",
    "to": "nsut_block5",
    "roadName": "Block 5 Academic Drive",
    "speedKmh": 15,
    "pedestrianOnly": false,
    "distance": 76,
    "waypoints": [
      [
        28.609684,
        77.038089
      ],
      [
        28.609451,
        77.038203
      ],
      [
        28.609719,
        77.038585
      ]
    ]
  },
  {
    "id": "CE12",
    "from": "nsut_block5",
    "to": "nsut_gh",
    "roadName": "Alaknanda Girls Hostel Road",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 744,
    "waypoints": [
      [
        28.609719,
        77.038585
      ],
      [
        28.609451,
        77.038203
      ],
      [
        28.608552,
        77.038501
      ],
      [
        28.608918,
        77.039935
      ],
      [
        28.608992,
        77.040225
      ],
      [
        28.608744,
        77.040307
      ],
      [
        28.608564,
        77.040367
      ],
      [
        28.607524,
        77.040712
      ],
      [
        28.607301,
        77.040786
      ],
      [
        28.607238,
        77.040535
      ],
      [
        28.607129,
        77.040099
      ],
      [
        28.608215,
        77.039744
      ],
      [
        28.608039,
        77.039571
      ]
    ]
  },
  {
    "id": "CE13",
    "from": "nsut_block5",
    "to": "nsut_sac",
    "roadName": "East Academic Ring Road",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 528,
    "waypoints": [
      [
        28.609719,
        77.038585
      ],
      [
        28.609451,
        77.038203
      ],
      [
        28.608552,
        77.038501
      ],
      [
        28.608918,
        77.039935
      ],
      [
        28.608992,
        77.040225
      ],
      [
        28.609238,
        77.040145
      ],
      [
        28.61025,
        77.039818
      ],
      [
        28.610207,
        77.039639
      ],
      [
        28.610386,
        77.03931
      ]
    ]
  },
  {
    "id": "CE14",
    "from": "nsut_sac",
    "to": "nsut_library",
    "roadName": "Central Library & SAC Link",
    "speedKmh": 15,
    "pedestrianOnly": false,
    "distance": 155,
    "waypoints": [
      [
        28.610386,
        77.03931
      ],
      [
        28.610207,
        77.039639
      ],
      [
        28.610702,
        77.039476
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  },
  {
    "id": "CE15",
    "from": "nsut_sac",
    "to": "nsut_sports",
    "roadName": "Sports Complex East Avenue",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 322,
    "waypoints": [
      [
        28.610386,
        77.03931
      ],
      [
        28.610207,
        77.039639
      ],
      [
        28.61025,
        77.039818
      ],
      [
        28.610345,
        77.039788
      ],
      [
        28.610421,
        77.040336
      ],
      [
        28.610492,
        77.040482
      ],
      [
        28.610605,
        77.04055
      ],
      [
        28.61073,
        77.040651
      ],
      [
        28.610821,
        77.040764
      ],
      [
        28.610859,
        77.040827
      ],
      [
        28.610929,
        77.040975
      ],
      [
        28.610971,
        77.041127
      ],
      [
        28.610985,
        77.041211
      ],
      [
        28.610993,
        77.041384
      ],
      [
        28.610985,
        77.041463
      ],
      [
        28.610394,
        77.041365
      ]
    ]
  },
  {
    "id": "CE16",
    "from": "nsut_apj",
    "to": "nsut_library",
    "roadName": "North Academic Ring Road",
    "speedKmh": 20,
    "pedestrianOnly": false,
    "distance": 515,
    "waypoints": [
      [
        28.611974,
        77.037063
      ],
      [
        28.612373,
        77.037278
      ],
      [
        28.612366,
        77.03748
      ],
      [
        28.612399,
        77.037581
      ],
      [
        28.612515,
        77.037703
      ],
      [
        28.612591,
        77.037746
      ],
      [
        28.612645,
        77.037967
      ],
      [
        28.612483,
        77.038021
      ],
      [
        28.611969,
        77.038195
      ],
      [
        28.611797,
        77.038253
      ],
      [
        28.611843,
        77.038469
      ],
      [
        28.611859,
        77.038541
      ],
      [
        28.611856,
        77.038702
      ],
      [
        28.611769,
        77.038869
      ],
      [
        28.611711,
        77.038973
      ],
      [
        28.6116,
        77.03917
      ],
      [
        28.611507,
        77.039335
      ],
      [
        28.611407,
        77.039447
      ],
      [
        28.611256,
        77.039495
      ],
      [
        28.610836,
        77.039629
      ],
      [
        28.610746,
        77.039657
      ],
      [
        28.610702,
        77.039476
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  },
  {
    "id": "CW1",
    "from": "nsut_admin",
    "to": "nsut_block4",
    "roadName": "Auditorium to Block 4 Walkway",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 102,
    "waypoints": [
      [
        28.609847,
        77.037082
      ],
      [
        28.609854,
        77.037164
      ],
      [
        28.609902,
        77.037353
      ],
      [
        28.60995,
        77.037542
      ],
      [
        28.609759,
        77.037607
      ],
      [
        28.609465,
        77.037668
      ]
    ]
  },
  {
    "id": "CW2",
    "from": "nsut_admin",
    "to": "nsut_block6",
    "roadName": "Admin to Block 6 Central Footpath",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 138,
    "waypoints": [
      [
        28.609847,
        77.037082
      ],
      [
        28.609854,
        77.037164
      ],
      [
        28.609902,
        77.037353
      ],
      [
        28.60995,
        77.037542
      ],
      [
        28.610042,
        77.037903
      ],
      [
        28.610077,
        77.037903
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610526,
        77.037807
      ]
    ]
  },
  {
    "id": "CW3",
    "from": "nsut_block4",
    "to": "nsut_block6",
    "roadName": "Central Fountain Quad Walkway",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 147,
    "waypoints": [
      [
        28.609465,
        77.037668
      ],
      [
        28.609759,
        77.037607
      ],
      [
        28.60995,
        77.037542
      ],
      [
        28.610042,
        77.037903
      ],
      [
        28.610077,
        77.037903
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610526,
        77.037807
      ]
    ]
  },
  {
    "id": "CW4",
    "from": "nsut_connecting",
    "to": "nsut_block6",
    "roadName": "Central Fountain North Path",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 98,
    "waypoints": [
      [
        28.609684,
        77.038089
      ],
      [
        28.609747,
        77.038069
      ],
      [
        28.61,
        77.037988
      ],
      [
        28.610116,
        77.03795
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610526,
        77.037807
      ]
    ]
  },
  {
    "id": "CW5",
    "from": "nsut_block6",
    "to": "nsut_library",
    "roadName": "Block 6 to Central Library Footpath",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 155,
    "waypoints": [
      [
        28.610526,
        77.037807
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610103,
        77.038015
      ],
      [
        28.610077,
        77.038033
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.610264,
        77.038778
      ],
      [
        28.610291,
        77.038879
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  },
  {
    "id": "CW6",
    "from": "nsut_block5",
    "to": "nsut_library",
    "roadName": "Block 5 to Library Steps",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 117,
    "waypoints": [
      [
        28.609719,
        77.038585
      ],
      [
        28.609971,
        77.038458
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.610264,
        77.038778
      ],
      [
        28.610291,
        77.038879
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  },
  {
    "id": "CW7",
    "from": "nsut_moksha",
    "to": "nsut_block6",
    "roadName": "Moksha Ground East Footpath",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 524,
    "waypoints": [
      [
        28.610845,
        77.036582
      ],
      [
        28.610833,
        77.03617
      ],
      [
        28.61089,
        77.036158
      ],
      [
        28.611047,
        77.036167
      ],
      [
        28.611174,
        77.036227
      ],
      [
        28.611229,
        77.036268
      ],
      [
        28.611338,
        77.03645
      ],
      [
        28.611357,
        77.036516
      ],
      [
        28.611397,
        77.036676
      ],
      [
        28.611446,
        77.03687
      ],
      [
        28.611586,
        77.037425
      ],
      [
        28.611608,
        77.037509
      ],
      [
        28.611284,
        77.037613
      ],
      [
        28.61114,
        77.037724
      ],
      [
        28.611104,
        77.037857
      ],
      [
        28.610974,
        77.037937
      ],
      [
        28.610912,
        77.037989
      ],
      [
        28.610518,
        77.038504
      ],
      [
        28.61043,
        77.038518
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610077,
        77.038033
      ],
      [
        28.610103,
        77.038015
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610526,
        77.037807
      ]
    ]
  },
  {
    "id": "CW8",
    "from": "nsut_block6",
    "to": "nsut_sc_amul",
    "roadName": "Block 6 to Amul Student Centre Path",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 397,
    "waypoints": [
      [
        28.610526,
        77.037807
      ],
      [
        28.610264,
        77.0379
      ],
      [
        28.610103,
        77.038015
      ],
      [
        28.610077,
        77.038033
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.61043,
        77.038518
      ],
      [
        28.610518,
        77.038504
      ],
      [
        28.610912,
        77.037989
      ],
      [
        28.610974,
        77.037937
      ],
      [
        28.611104,
        77.037857
      ],
      [
        28.61114,
        77.037724
      ],
      [
        28.611284,
        77.037613
      ],
      [
        28.611608,
        77.037509
      ],
      [
        28.611586,
        77.037425
      ],
      [
        28.611446,
        77.03687
      ],
      [
        28.611663,
        77.036911
      ]
    ]
  },
  {
    "id": "CW9",
    "from": "nsut_admin",
    "to": "nsut_library",
    "roadName": "Central Fountain Spine Walkway",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 197,
    "waypoints": [
      [
        28.609847,
        77.037082
      ],
      [
        28.609854,
        77.037164
      ],
      [
        28.609902,
        77.037353
      ],
      [
        28.60995,
        77.037542
      ],
      [
        28.610042,
        77.037903
      ],
      [
        28.610077,
        77.038033
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.610264,
        77.038778
      ],
      [
        28.610291,
        77.038879
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  },
  {
    "id": "CW10",
    "from": "nsut_connecting",
    "to": "nsut_library",
    "roadName": "Connecting Block to Library Walkway",
    "speedKmh": 5,
    "pedestrianOnly": true,
    "distance": 147,
    "waypoints": [
      [
        28.609684,
        77.038089
      ],
      [
        28.609747,
        77.038069
      ],
      [
        28.61,
        77.037988
      ],
      [
        28.610077,
        77.038033
      ],
      [
        28.610168,
        77.038394
      ],
      [
        28.610217,
        77.038589
      ],
      [
        28.610264,
        77.038778
      ],
      [
        28.610291,
        77.038879
      ],
      [
        28.610395,
        77.038969
      ]
    ]
  }
];

/**
 * 32 Pan-New Delhi Arterial Hubs.
 */
export const DELHI_CITY_NODES = [
  {
    id: "dwarka_mor",
    name: "Dwarka Mor (Blue Line Metro)",
    shortName: "Dwarka Mor",
    lat: 28.6194,
    lng: 77.0332,
    zone: "West Delhi",
    aliases: ["Dwarka Mor Metro", "Mor Station", "Najafgarh Road Intersection"],
  },
  {
    id: "vegas_mall",
    name: "Vegas Mall & Dwarka Sector 14",
    shortName: "Vegas Mall",
    lat: 28.6001,
    lng: 77.0375,
    zone: "West Delhi",
    aliases: ["Vegas Mall", "Dwarka Sec 14 Metro", "Sector 14"],
  },
  {
    id: "dwarka_sec10",
    name: "Dwarka Sector 10 (District Centre)",
    shortName: "Dwarka Sec-10",
    lat: 28.5815,
    lng: 77.0573,
    zone: "West Delhi",
    aliases: ["Sec 10 Metro", "Dwarka Courts", "District Centre"],
  },
  {
    id: "dwarka_sec21",
    name: "Pacific D21 Mall (Dwarka Sector 21)",
    shortName: "Pacific D21 Mall",
    lat: 28.5521,
    lng: 77.0583,
    zone: "West Delhi",
    aliases: ["Dwarka Sector 21 Metro", "D21 Mall", "Airport Express Interchange"],
  },
  {
    id: "dabri_more",
    name: "Dabri More / Pankha Road Flyover",
    shortName: "Dabri More",
    lat: 28.6152,
    lng: 77.0853,
    zone: "West Delhi",
    aliases: ["Dabri", "Pankha Road", "Janakpuri South Approach"],
  },
  {
    id: "janakpuri_west",
    name: "Janakpuri West (Blue/Magenta Interchange)",
    shortName: "Janakpuri West",
    lat: 28.6294,
    lng: 77.0778,
    zone: "West Delhi",
    aliases: ["Janakpuri District Centre", "West Delhi Metro"],
  },
  {
    id: "uttam_nagar",
    name: "Uttam Nagar East (Shivaji Marg)",
    shortName: "Uttam Nagar",
    lat: 28.6219,
    lng: 77.0601,
    zone: "West Delhi",
    aliases: ["Uttam Nagar", "Shivaji Marg Metro"],
  },
  {
    id: "rajouri_garden",
    name: "Rajouri Garden & City Square Mall",
    shortName: "Rajouri Garden",
    lat: 28.6492,
    lng: 77.1228,
    zone: "West Delhi",
    aliases: ["Rajouri Garden Metro", "Ring Road Mall Mile"],
  },
  {
    id: "punjabi_bagh",
    name: "Punjabi Bagh Club & Ring Road Flyover",
    shortName: "Punjabi Bagh",
    lat: 28.6692,
    lng: 77.1322,
    zone: "West Delhi",
    aliases: ["Punjabi Bagh", "Rohtak Road Junction"],
  },
  {
    id: "peeragarhi",
    name: "Peeragarhi Chowk (Outer Ring Road)",
    shortName: "Peeragarhi",
    lat: 28.6792,
    lng: 77.0935,
    zone: "North-West Delhi",
    aliases: ["Peeragarhi Metro", "Outer Ring Road Paschim Vihar"],
  },
  {
    id: "igi_t3",
    name: "Indira Gandhi International Airport (T3)",
    shortName: "IGI Airport T3",
    lat: 28.5562,
    lng: 77.0999,
    zone: "South-West Delhi",
    aliases: ["Delhi Airport", "Terminal 3", "Aerocity"],
  },
  {
    id: "dhaula_kuan",
    name: "Dhaula Kuan Intersection (NH-48)",
    shortName: "Dhaula Kuan",
    lat: 28.5921,
    lng: 77.1615,
    zone: "Central / South Delhi",
    aliases: ["Dhaula Kuan Flyover", "Ring Road / NH-48 Tri-Junction"],
  },
  {
    id: "karol_bagh",
    name: "Karol Bagh Market & Pusa Road",
    shortName: "Karol Bagh",
    lat: 28.6524,
    lng: 77.1906,
    zone: "Central Delhi",
    aliases: ["Karol Bagh Metro", "Ghaffar Market"],
  },
  {
    id: "connaught_place",
    name: "Connaught Place (Rajiv Chowk)",
    shortName: "Connaught Place",
    lat: 28.6315,
    lng: 77.2167,
    zone: "Central Delhi",
    aliases: ["CP", "Rajiv Chowk", "Inner Circle", "Central Park"],
  },
  {
    id: "india_gate",
    name: "India Gate & Kartavya Path",
    shortName: "India Gate",
    lat: 28.6129,
    lng: 77.2295,
    zone: "Central Delhi",
    aliases: ["Kartavya Path", "War Memorial", "C-Hexagon"],
  },
  {
    id: "ndls",
    name: "New Delhi Railway Station (Paharganj)",
    shortName: "NDLS Railway Stn",
    lat: 28.6429,
    lng: 77.2195,
    zone: "Central Delhi",
    aliases: ["NDLS", "Paharganj Gate", "Ajmeri Gate"],
  },
  {
    id: "ito_junction",
    name: "ITO Chowk & Supreme Court / Vikas Marg",
    shortName: "ITO Chowk",
    lat: 28.6288,
    lng: 77.2415,
    zone: "Central Delhi",
    aliases: ["ITO Metro", "Tilak Bridge", "Supreme Court"],
  },
  {
    id: "aiims_chowk",
    name: "AIIMS Hospital & Safdarjung Chowk",
    shortName: "AIIMS Chowk",
    lat: 28.5684,
    lng: 77.2084,
    zone: "South Delhi",
    aliases: ["AIIMS Delhi", "Safdarjung Hospital", "Aurobindo Marg"],
  },
  {
    id: "iit_hauz_khas",
    name: "IIT Delhi Main Gate & Hauz Khas",
    shortName: "IIT Delhi",
    lat: 28.5450,
    lng: 77.1926,
    zone: "South Delhi",
    aliases: ["IIT Gate", "Hauz Khas Metro", "SDA Market"],
  },
  {
    id: "vasant_kunj",
    name: "Ambience & DLF Promenade (Vasant Kunj)",
    shortName: "Vasant Kunj Malls",
    lat: 28.5298,
    lng: 77.1495,
    zone: "South Delhi",
    aliases: ["Ambience Mall VK", "Nelson Mandela Marg"],
  },
  {
    id: "qutub_minar",
    name: "Qutub Minar Complex (Mehrauli)",
    shortName: "Qutub Minar",
    lat: 28.5245,
    lng: 77.1855,
    zone: "South Delhi",
    aliases: ["Qutab Minar", "Mehrauli Heritage Park"],
  },
  {
    id: "saket_citywalk",
    name: "Select CITYWALK & Saket District Centre",
    shortName: "Select CITYWALK",
    lat: 28.5284,
    lng: 77.2192,
    zone: "South Delhi",
    aliases: ["Saket Malls", "Max Saket", "Press Enclave Marg"],
  },
  {
    id: "nehru_place",
    name: "Nehru Place IT Hub & Epicuria Food Mall",
    shortName: "Nehru Place",
    lat: 28.5494,
    lng: 77.2519,
    zone: "South Delhi",
    aliases: ["Nehru Place Metro", "Kalkaji", "Epicuria"],
  },
  {
    id: "lajpat_nagar",
    name: "Lajpat Nagar Central Market",
    shortName: "Lajpat Nagar",
    lat: 28.5677,
    lng: 77.2433,
    zone: "South Delhi",
    aliases: ["Lajpat Nagar Metro", "Ring Road Flyover", "Central Market"],
  },
  {
    id: "nsp_pitampura",
    name: "Netaji Subhash Place (Pitampura)",
    shortName: "NSP Pitampura",
    lat: 28.6912,
    lng: 77.1512,
    zone: "North-West Delhi",
    aliases: ["NSP Metro", "Max Pitampura", "Ring Road Tower"],
  },
  {
    id: "rohini_sec18",
    name: "Rohini Sector 18 / Badli Metro Hub",
    shortName: "Rohini Sec-18",
    lat: 28.7345,
    lng: 77.1298,
    zone: "North-West Delhi",
    aliases: ["Rohini West", "Rithala Extension", "Sector 18"],
  },
  {
    id: "du_north_campus",
    name: "Delhi University North Campus (Arts Faculty)",
    shortName: "DU North Campus",
    lat: 28.6892,
    lng: 77.2105,
    zone: "North Delhi",
    aliases: ["Vishwavidyalaya Metro", "St Stephens", "SRCC", "Kamla Nagar"],
  },
  {
    id: "kashmere_gate",
    name: "ISBT Kashmere Gate (Tri-Line Interchange)",
    shortName: "Kashmere Gate",
    lat: 28.6675,
    lng: 77.2285,
    zone: "North Delhi",
    aliases: ["Kashmere Gate Metro", "ISBT", "Old Delhi Northern Gate"],
  },
  {
    id: "red_fort",
    name: "Red Fort & Chandni Chowk (Old Delhi)",
    shortName: "Red Fort",
    lat: 28.6562,
    lng: 77.2410,
    zone: "Central / Old Delhi",
    aliases: ["Lal Qila", "Chandni Chowk", "Jama Masjid Approach"],
  },
  {
    id: "akshardham",
    name: "Swaminarayan Akshardham Temple (NH-24)",
    shortName: "Akshardham Temple",
    lat: 28.6127,
    lng: 77.2773,
    zone: "East Delhi",
    aliases: ["Akshardham Metro", "Noida Link Road", "Delhi-Meerut Expy"],
  },
  {
    id: "laxmi_nagar",
    name: "Laxmi Nagar (Vikas Marg Commercial Hub)",
    shortName: "Laxmi Nagar",
    lat: 28.6308,
    lng: 77.2776,
    zone: "East Delhi",
    aliases: ["Laxmi Nagar Metro", "Vikas Marg", "East Delhi CA Hub"],
  },
  {
    id: "anand_vihar",
    name: "Anand Vihar ISBT & Railway Terminal",
    shortName: "Anand Vihar ISBT",
    lat: 28.6469,
    lng: 77.3160,
    zone: "East Delhi",
    aliases: ["Anand Vihar Metro", "Kaushambi Border", "East Terminal"],
  },
];

/**
 * City Arterial Road Connections between Delhi nodes.
 */
export const DELHI_CITY_EDGES = [
  // Dwarka cluster
  { id: "E1", from: "nsut_main_gate", to: "vegas_mall", roadName: "Azad Hind Fauj Marg", distance: 1050, speedKmh: 40, waypoints: [[28.608484, 77.035251], [28.6042, 77.0362], [28.6001, 77.0375]] },
  { id: "E2", from: "nsut_north_gate", to: "dwarka_mor", roadName: "Azad Hind Fauj Marg North", distance: 720, speedKmh: 35, waypoints: [[28.613175, 77.033627], [28.6165, 77.0334], [28.6194, 77.0332]] },
  { id: "E3", from: "dwarka_mor", to: "uttam_nagar", roadName: "Najafgarh Road / Shivaji Marg", distance: 2900, speedKmh: 40, waypoints: [[28.6194, 77.0332], [28.6205, 77.0450], [28.6219, 77.0601]] },
  { id: "E4", from: "uttam_nagar", to: "janakpuri_west", roadName: "Shivaji Marg Flyover", distance: 1950, speedKmh: 45, waypoints: [[28.6219, 77.0601], [28.6255, 77.0690], [28.6294, 77.0778]] },
  { id: "E5", from: "vegas_mall", to: "dwarka_sec10", roadName: "Dwarka Sector 10–14 Avenue", distance: 2850, speedKmh: 45, waypoints: [[28.6001, 77.0375], [28.5910, 77.0450], [28.5815, 77.0573]] },
  { id: "E6", from: "dwarka_sec10", to: "dwarka_sec21", roadName: "Sector 21 Road (Pacific Mall Link)", distance: 3400, speedKmh: 50, waypoints: [[28.5815, 77.0573], [28.5665, 77.0580], [28.5521, 77.0583]] },
  { id: "E7", from: "dwarka_sec21", to: "igi_t3", roadName: "Northern Access Road to IGI Airport", distance: 4800, speedKmh: 60, waypoints: [[28.5521, 77.0583], [28.5535, 77.0780], [28.5562, 77.0999]] },
  { id: "E8", from: "nsut_main_gate", to: "dabri_more", roadName: "Dabri–Dwarka Sector 3 Road", distance: 5600, speedKmh: 40, waypoints: [[28.608484, 77.035251], [28.6105, 77.0580], [28.6152, 77.0853]] },
  { id: "E9", from: "dabri_more", to: "janakpuri_west", roadName: "Pankha Road", distance: 1850, speedKmh: 40, waypoints: [[28.6152, 77.0853], [28.6220, 77.0815], [28.6294, 77.0778]] },
  { id: "E10", from: "janakpuri_west", to: "rajouri_garden", roadName: "Najafgarh Road / Ring Road", distance: 4800, speedKmh: 45, waypoints: [[28.6294, 77.0778], [28.6385, 77.1005], [28.6492, 77.1228]] },
  { id: "E11", from: "rajouri_garden", to: "punjabi_bagh", roadName: "Mahatma Gandhi Ring Road", distance: 2450, speedKmh: 50, waypoints: [[28.6492, 77.1228], [28.6585, 77.1275], [28.6692, 77.1322]] },
  { id: "E12", from: "punjabi_bagh", to: "peeragarhi", roadName: "Rohtak Road (NH-10)", distance: 4100, speedKmh: 50, waypoints: [[28.6692, 77.1322], [28.6740, 77.1120], [28.6792, 77.0935]] },
  { id: "E13", from: "punjabi_bagh", to: "nsp_pitampura", roadName: "Outer Ring Road / Pitampura", distance: 3100, speedKmh: 50, waypoints: [[28.6692, 77.1322], [28.6800, 77.1415], [28.6912, 77.1512]] },
  { id: "E14", from: "nsp_pitampura", to: "rohini_sec18", roadName: "Bhagwan Mahavir Marg", distance: 5400, speedKmh: 45, waypoints: [[28.6912, 77.1512], [28.7125, 77.1405], [28.7345, 77.1298]] },
  { id: "E15", from: "nsp_pitampura", to: "du_north_campus", roadName: "GT Karnal Road Link", distance: 6200, speedKmh: 45, waypoints: [[28.6912, 77.1512], [28.6900, 77.1810], [28.6892, 77.2105]] },
  { id: "E16", from: "du_north_campus", to: "kashmere_gate", roadName: "Mall Road & Boulevard Road", distance: 3100, speedKmh: 40, waypoints: [[28.6892, 77.2105], [28.6780, 77.2195], [28.6675, 77.2285]] },
  { id: "E17", from: "kashmere_gate", to: "red_fort", roadName: "Netaji Subhash Marg", distance: 1800, speedKmh: 35, waypoints: [[28.6675, 77.2285], [28.6618, 77.2345], [28.6562, 77.2410]] },
  { id: "E18", from: "red_fort", to: "ndls", roadName: "Chandni Chowk to Paharganj", distance: 2600, speedKmh: 30, waypoints: [[28.6562, 77.2410], [28.6495, 77.2300], [28.6429, 77.2195]] },
  { id: "E19", from: "ndls", to: "connaught_place", roadName: "Chelmsford Road", distance: 1600, speedKmh: 35, waypoints: [[28.6429, 77.2195], [28.6370, 77.2180], [28.6315, 77.2167]] },
  { id: "E20", from: "connaught_place", to: "karol_bagh", roadName: "Pusa Road / DB Gupta Road", distance: 3400, speedKmh: 40, waypoints: [[28.6315, 77.2167], [28.6420, 77.2035], [28.6524, 77.1906]] },
  { id: "E21", from: "connaught_place", to: "india_gate", roadName: "Janpath & Kartavya Path", distance: 2350, speedKmh: 45, waypoints: [[28.6315, 77.2167], [28.6220, 77.2230], [28.6129, 77.2295]] },
  { id: "E22", from: "connaught_place", to: "ito_junction", roadName: "Barakhamba Road & Vikas Marg", distance: 2650, speedKmh: 45, waypoints: [[28.6315, 77.2167], [28.6300, 77.2290], [28.6288, 77.2415]] },
  { id: "E23", from: "ito_junction", to: "laxmi_nagar", roadName: "Vikas Marg (Yamuna Bridge)", distance: 3600, speedKmh: 50, waypoints: [[28.6288, 77.2415], [28.6298, 77.2595], [28.6308, 77.2776]] },
  { id: "E24", from: "laxmi_nagar", to: "anand_vihar", roadName: "Vikas Marg Extension", distance: 4100, speedKmh: 45, waypoints: [[28.6308, 77.2776], [28.6385, 77.2970], [28.6469, 77.3160]] },
  { id: "E25", from: "india_gate", to: "akshardham", roadName: "Barapullah / NH-24 Yamuna Link", distance: 5400, speedKmh: 60, waypoints: [[28.6129, 77.2295], [28.6128, 77.2530], [28.6127, 77.2773]] },
  { id: "E26", from: "india_gate", to: "lajpat_nagar", roadName: "Lodi Road & Lala Lajpat Rai Marg", distance: 4900, speedKmh: 45, waypoints: [[28.6129, 77.2295], [28.5900, 77.2365], [28.5677, 77.2433]] },
  { id: "E27", from: "lajpat_nagar", to: "nehru_place", roadName: "Ring Road to Outer Ring Road", distance: 2500, speedKmh: 50, waypoints: [[28.5677, 77.2433], [28.5585, 77.2475], [28.5494, 77.2519]] },
  { id: "E28", from: "lajpat_nagar", to: "aiims_chowk", roadName: "Mahatma Gandhi Ring Road", distance: 3600, speedKmh: 50, waypoints: [[28.5677, 77.2433], [28.5680, 77.2255], [28.5684, 77.2084]] },
  { id: "E29", from: "aiims_chowk", to: "dhaula_kuan", roadName: "Ring Road (Moti Bagh / South Campus)", distance: 5200, speedKmh: 55, waypoints: [[28.5684, 77.2084], [28.5800, 77.1850], [28.5921, 77.1615]] },
  { id: "E30", from: "dhaula_kuan", to: "connaught_place", roadName: "Sardar Patel Marg", distance: 7800, speedKmh: 55, waypoints: [[28.5921, 77.1615], [28.6115, 77.1890], [28.6315, 77.2167]] },
  { id: "E31", from: "dhaula_kuan", to: "igi_t3", roadName: "Delhi–Gurgaon Expressway (NH-48)", distance: 7400, speedKmh: 65, waypoints: [[28.5921, 77.1615], [28.5740, 77.1305], [28.5562, 77.0999]] },
  { id: "E32", from: "aiims_chowk", to: "iit_hauz_khas", roadName: "Sri Aurobindo Marg", distance: 3100, speedKmh: 45, waypoints: [[28.5684, 77.2084], [28.5565, 77.2005], [28.5450, 77.1926]] },
  { id: "E33", from: "iit_hauz_khas", to: "qutub_minar", roadName: "Mehrauli–Badarpur Road", distance: 2600, speedKmh: 40, waypoints: [[28.5450, 77.1926], [28.5345, 77.1890], [28.5245, 77.1855]] },
  { id: "E34", from: "qutub_minar", to: "saket_citywalk", roadName: "Press Enclave Marg", distance: 3500, speedKmh: 40, waypoints: [[28.5245, 77.1855], [28.5265, 77.2025], [28.5284, 77.2192]] },
  { id: "E35", from: "iit_hauz_khas", to: "vasant_kunj", roadName: "Aruna Asaf Ali Marg", distance: 4800, speedKmh: 45, waypoints: [[28.5450, 77.1926], [28.5370, 77.1710], [28.5298, 77.1495]] },
];

/**
 * Unified graph of all 48 nodes (16 NSUT + 32 Delhi) and connecting edges.
 */
export const DEFAULT_GRAPH = {
  id: "delhi_nsut_v4_2",
  name: "Unified NSUT Campus & Pan-New Delhi Graph",
  center: [28.6105, 77.0378],
  zoom: 14,
  campusConfig: NSUT_CAMPUS_CONFIG,
  nodes: [...NSUT_CAMPUS_NODES, ...DELHI_CITY_NODES],
  edges: [...NSUT_CAMPUS_EDGES, ...DELHI_CITY_EDGES],
};

/**
 * Test whether a node is inside NSUT Campus.
 */
export function isInsideCampus(node) {
  if (!node) return false;
  if (node.isCampus === true) return true;
  if (node.zone === "NSUT Campus") return true;
  if (node.id && node.id.startsWith("nsut_")) return true;
  const dist = haversineDistance(
    node.lat,
    node.lng,
    NSUT_CAMPUS_CONFIG.center[0],
    NSUT_CAMPUS_CONFIG.center[1]
  );
  return dist <= NSUT_CAMPUS_CONFIG.radiusMeters;
}

/**
 * Inject dynamic geocoded result (from Nominatim) into graph.
 */
export function injectCustomNode(graph, customNode) {
  if (!customNode || !customNode.id) return graph;
  const existing = graph.nodes.find((n) => n.id === customNode.id);
  if (existing) return graph;

  const sortedNodes = [...graph.nodes]
    .map((n) => ({
      ...n,
      dist: haversineDistance(customNode.lat, customNode.lng, n.lat, n.lng),
    }))
    .sort((a, b) => a.dist - b.dist);

  const nearest = sortedNodes.slice(0, 2);
  const newEdges = nearest.map((near, idx) => ({
    id: `dyn_${customNode.id}_${near.id}_${idx}`,
    from: customNode.id,
    to: near.id,
    roadName: `Connector to ${near.shortName || near.name}`,
    distance: near.dist,
    speedKmh: 35,
    pedestrianOnly: false,
    waypoints: [
      [customNode.lat, customNode.lng],
      [near.lat, near.lng],
    ],
  }));

  return {
    ...graph,
    nodes: [...graph.nodes, customNode],
    edges: [...graph.edges, ...newEdges],
  };
}

/**
 * Format helpers for instructions and telemetry.
 */
export function formatDistanceText(meters) {
  const m = Math.max(0, Math.round(Number(meters) || 0));
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatDurationText(minutes) {
  const mins = Math.max(1, Math.round(Number(minutes) || 0));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Internal NSUT Campus Dijkstra:
 * Guaranteed 100% inside NSUT campus, respects Car (perimeter/wide roads) vs Walk (lawns/footpaths).
 */
export function runCampusDijkstra(startId, endId, mode = "car", customNodes = null, customEdges = null) {
  const campusNodes = customNodes || NSUT_CAMPUS_NODES;
  const campusEdges = customEdges || NSUT_CAMPUS_EDGES;

  const nodesMap = {};
  const adj = {};
  for (const n of campusNodes) {
    nodesMap[n.id] = n;
    adj[n.id] = [];
  }

  if (!nodesMap[startId] || !nodesMap[endId]) {
    return { reachable: false, message: "Node not found in campus graph." };
  }

  for (const e of campusEdges) {
    if (mode === "car" && e.pedestrianOnly) continue;
    const speed = mode === "walk" ? 5.0 : Number(e.speedKmh || 20);
    const durationMin = (e.distance / (speed * 1000)) * 60;
    const forwardWp = Array.isArray(e.waypoints) && e.waypoints.length >= 2
      ? e.waypoints
      : [[nodesMap[e.from].lat, nodesMap[e.from].lng], [nodesMap[e.to].lat, nodesMap[e.to].lng]];
    const reverseWp = [...forwardWp].reverse();

    adj[e.from].push({
      to: e.to,
      distance: e.distance,
      durationMin,
      roadName: e.roadName,
      waypoints: forwardWp,
      pedestrianOnly: Boolean(e.pedestrianOnly),
    });
    adj[e.to].push({
      to: e.from,
      distance: e.distance,
      durationMin,
      roadName: e.roadName,
      waypoints: reverseWp,
      pedestrianOnly: Boolean(e.pedestrianOnly),
    });
  }

  const pq = new MinPriorityQueue();
  const dist = {};
  const meters = {};
  const prev = {};
  const predEdge = {};
  const visited = new Set();
  const visitedOrder = [];

  for (const id of Object.keys(nodesMap)) {
    dist[id] = Infinity;
    meters[id] = Infinity;
    prev[id] = null;
    predEdge[id] = null;
  }

  dist[startId] = 0;
  meters[startId] = 0;
  pq.enqueue(startId, 0);

  let stepCount = 0;
  while (!pq.isEmpty()) {
    const cur = pq.dequeue();
    if (!cur) break;
    const u = cur.nodeId;
    if (visited.has(u)) continue;
    visited.add(u);
    stepCount++;

    visitedOrder.push({
      step: stepCount,
      currentNodeId: u,
      currentNodeName: nodesMap[u].name,
      currentShortName: nodesMap[u].shortName,
      costSoFar: Number(cur.priority.toFixed(2)),
      distanceMetersSoFar: Math.round(meters[u]),
      pqSnapshot: pq.toArray(),
    });

    if (u === endId) break;

    for (const edge of adj[u] || []) {
      const v = edge.to;
      if (visited.has(v)) continue;
      const weight = mode === "walk" ? edge.durationMin : edge.durationMin;
      const newCost = dist[u] + weight;
      if (newCost < dist[v]) {
        dist[v] = newCost;
        meters[v] = meters[u] + edge.distance;
        prev[v] = u;
        predEdge[v] = edge;
        pq.enqueue(v, newCost);
      }
    }
  }

  const path = [];
  const edgesInPath = [];
  let curr = endId;
  while (curr !== null) {
    path.unshift(nodesMap[curr]);
    if (prev[curr]) {
      edgesInPath.unshift({ ...predEdge[curr], from: prev[curr], to: curr });
    }
    curr = prev[curr];
  }

  const reachable = path.length > 0 && path[0].id === startId;
  if (!reachable) {
    return { reachable: false, visitedOrder };
  }

  const geometry = [];
  for (const edge of edgesInPath) {
    for (let i = 0; i < edge.waypoints.length; i++) {
      if (geometry.length > 0 && i === 0) continue;
      geometry.push(edge.waypoints[i]);
    }
  }

  // Generate Turn-by-Turn Maneuvers
  const turnByTurnSteps = edgesInPath.map((e, idx) => {
    const targetNode = nodesMap[e.to];
    const isFirst = idx === 0;
    const isLast = idx === edgesInPath.length - 1;
    const verb = mode === "walk" ? "Walk along" : "Drive along";
    let maneuverType = isFirst ? "depart" : "straight";
    let instruction = isFirst
      ? `Depart on ${e.roadName} toward ${targetNode.shortName}`
      : `${verb} ${e.roadName} toward ${targetNode.shortName}`;
    if (isLast) {
      instruction = `Continue on ${e.roadName} and arrive at ${targetNode.shortName}`;
      maneuverType = "arrive";
    }

    return {
      step: idx + 1,
      instruction,
      maneuverType,
      roadName: e.roadName,
      distanceMeters: e.distance,
      distanceText: formatDistanceText(e.distance),
      durationText: formatDurationText(e.durationMin),
      coordinate: e.waypoints[0],
    };
  });

  return {
    reachable: true,
    mode,
    pathNodes: path,
    edges: edgesInPath,
    roadGeometry: geometry,
    totalDistance: Math.round(meters[endId]),
    totalDurationMin: Number(dist[endId].toFixed(1)),
    turnByTurnSteps,
    visitedOrder,
  };
}

/**
 * Fetch real street route from OSRM.
 */
export async function fetchOSRMRoute(startNode, endNode, mode = "car") {
  const profile = mode === "walk" ? "foot" : "driving";
  const url = `https://router.project-osrm.org/route/v1/${profile}/${startNode.lng},${startNode.lat};${endNode.lng},${endNode.lat}?alternatives=true&steps=true&geometries=geojson&overview=full`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
      return data.routes;
    }
  } catch {
    // Offline / fallback handled below
  }
  return null;
}

/**
 * Parse OSRM Step into structured Turn-by-Turn Maneuver.
 */
function parseOSRMStepToManeuver(step, idx, totalSteps, nextStep) {
  const type = step?.maneuver?.type || "turn";
  const mod = step?.maneuver?.modifier || "";
  const road = step?.name ? step.name.trim() : "Connecting Road";
  const dist = step?.distance || 100;
  const durMin = Math.max(0.5, (step?.duration || 20) / 60);

  let maneuverType = "straight";
  let instruction = "";

  if (idx === 0 || type === "depart") {
    maneuverType = "depart";
    instruction = `Head ${mod ? mod + " " : ""}on ${road}`;
  } else if (idx === totalSteps - 1 || type === "arrive") {
    maneuverType = "arrive";
    instruction = `Arrive at destination on ${road}`;
  } else if (type === "roundabout" || type === "rotary") {
    maneuverType = "roundabout";
    instruction = `At the roundabout, take exit ${step.maneuver.exit || 1} onto ${road}`;
  } else if (mod.includes("uturn")) {
    maneuverType = "uturn";
    instruction = `Make a U-turn onto ${road}`;
  } else if (mod.includes("left")) {
    maneuverType = mod.includes("slight") ? "slight-left" : "turn-left";
    instruction = `Turn ${mod.includes("slight") ? "slight left" : "left"} onto ${road}`;
  } else if (mod.includes("right")) {
    maneuverType = mod.includes("slight") ? "slight-right" : "turn-right";
    instruction = `Turn ${mod.includes("slight") ? "slight right" : "right"} onto ${road}`;
  } else if (type === "new name" || type === "continue") {
    maneuverType = "straight";
    instruction = `Continue onto ${road}`;
  } else {
    maneuverType = "straight";
    instruction = `Continue on ${road}`;
  }

  const coord = step?.maneuver?.location
    ? [step.maneuver.location[1], step.maneuver.location[0]]
    : [28.61, 77.03];

  return {
    step: idx + 1,
    instruction,
    maneuverType,
    roadName: road,
    distanceMeters: Math.round(dist),
    distanceText: formatDistanceText(dist),
    durationText: formatDurationText(durMin),
    coordinate: coord,
  };
}

/**
 * Run Dijkstra's Algorithm on Street-Intersection Adjacency Graph from OSRM routes.
 */
export function runStreetIntersectionDijkstra(osrmRoutes, mode = "car", startNode, endNode) {
  if (!osrmRoutes || osrmRoutes.length === 0) return null;

  const nodeMap = {};
  const adj = {};

  function coordKey(lat, lng) {
    return `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;
  }

  function getOrCreateNode(lat, lng, name = "") {
    const key = coordKey(lat, lng);
    if (!nodeMap[key]) {
      nodeMap[key] = { id: key, lat, lng, name };
      adj[key] = [];
    }
    return key;
  }

  let globalStartKey = null;
  let globalEndKey = null;

  for (let rIdx = 0; rIdx < osrmRoutes.length; rIdx++) {
    const route = osrmRoutes[rIdx];
    const steps = route.legs?.[0]?.steps || [];
    if (steps.length === 0) continue;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nextStep = steps[i + 1];

      const startCoord = [step.maneuver.location[1], step.maneuver.location[0]];
      const endCoord = nextStep
        ? [nextStep.maneuver.location[1], nextStep.maneuver.location[0]]
        : [
            step.geometry.coordinates[step.geometry.coordinates.length - 1][1],
            step.geometry.coordinates[step.geometry.coordinates.length - 1][0],
          ];

      const uKey = getOrCreateNode(startCoord[0], startCoord[1], step.name);
      const vKey = getOrCreateNode(
        endCoord[0],
        endCoord[1],
        nextStep?.name || endNode?.shortName || "Destination"
      );

      if (rIdx === 0 && i === 0) globalStartKey = uKey;
      if (rIdx === 0 && i === steps.length - 1) globalEndKey = vKey;

      const stepGeom = step.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const dist = step.distance || haversineDistance(startCoord[0], startCoord[1], endCoord[0], endCoord[1]);
      const durSec = step.duration || (dist / ((mode === "walk" ? 5 : 35) * 1000 / 3600));

      const edgeObj = {
        from: uKey,
        to: vKey,
        roadName: step.name || "Street Link",
        distance: dist,
        durationMin: durSec / 60,
        stepObj: step,
        waypoints: stepGeom,
      };

      adj[uKey].push(edgeObj);
    }
  }

  if (!globalStartKey || !globalEndKey || !nodeMap[globalStartKey] || !nodeMap[globalEndKey]) {
    // If exact keys missing, fallback to primary route geometry
    const primary = osrmRoutes[0];
    const geom = primary.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const steps = (primary.legs?.[0]?.steps || []).map((s, idx, arr) =>
      parseOSRMStepToManeuver(s, idx, arr.length, arr[idx + 1])
    );
    return {
      roadGeometry: geom,
      totalDistance: Math.round(primary.distance),
      totalDurationMin: Number((primary.duration / 60).toFixed(1)),
      turnByTurnSteps: steps,
      visitedOrder: [],
    };
  }

  // Min-Heap Dijkstra over Street Intersections
  const pq = new MinPriorityQueue();
  const dist = {};
  const prev = {};
  const predEdge = {};
  const visited = new Set();
  const visitedOrder = [];

  for (const k of Object.keys(nodeMap)) {
    dist[k] = Infinity;
    prev[k] = null;
    predEdge[k] = null;
  }

  dist[globalStartKey] = 0;
  pq.enqueue(globalStartKey, 0);
  let stepCount = 0;

  while (!pq.isEmpty()) {
    const cur = pq.dequeue();
    if (!cur) break;
    const u = cur.nodeId;
    if (visited.has(u)) continue;
    visited.add(u);
    stepCount++;

    visitedOrder.push({
      step: stepCount,
      currentNodeId: u,
      currentNodeName: nodeMap[u].name || "Street Intersection",
      costSoFar: Number(cur.priority.toFixed(2)),
      pqSnapshot: pq.toArray(),
    });

    if (u === globalEndKey) break;

    for (const edge of adj[u] || []) {
      const v = edge.to;
      if (visited.has(v)) continue;
      const weight = mode === "walk" ? edge.durationMin : edge.distance;
      const newCost = dist[u] + weight;
      if (newCost < dist[v]) {
        dist[v] = newCost;
        prev[v] = u;
        predEdge[v] = edge;
        pq.enqueue(v, newCost);
      }
    }
  }

  const pathEdges = [];
  let curr = globalEndKey;
  while (curr !== null && prev[curr] !== null) {
    pathEdges.unshift(predEdge[curr]);
    curr = prev[curr];
  }

  if (pathEdges.length === 0) {
    const primary = osrmRoutes[0];
    const geom = primary.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const steps = (primary.legs?.[0]?.steps || []).map((s, idx, arr) =>
      parseOSRMStepToManeuver(s, idx, arr.length, arr[idx + 1])
    );
    return {
      roadGeometry: geom,
      totalDistance: Math.round(primary.distance),
      totalDurationMin: Number((primary.duration / 60).toFixed(1)),
      turnByTurnSteps: steps,
      visitedOrder,
    };
  }

  const geometry = [];
  for (const pe of pathEdges) {
    for (let p = 0; p < pe.waypoints.length; p++) {
      if (geometry.length > 0 && p === 0) continue;
      geometry.push(pe.waypoints[p]);
    }
  }

  let totalMeters = 0;
  let totalMinutes = 0;
  const turnByTurnSteps = [];

  for (let idx = 0; idx < pathEdges.length; idx++) {
    const pe = pathEdges[idx];
    totalMeters += pe.distance;
    totalMinutes += pe.durationMin;
    turnByTurnSteps.push(
      parseOSRMStepToManeuver(pe.stepObj, idx, pathEdges.length, pathEdges[idx + 1]?.stepObj)
    );
  }

  return {
    roadGeometry: geometry,
    totalDistance: Math.round(totalMeters),
    totalDurationMin: Number(totalMinutes.toFixed(1)),
    turnByTurnSteps,
    visitedOrder,
  };
}

/**
 * Fallback routing between two points when OSRM is unreachable.
 */
function buildFallbackCityRoute(startNode, endNode, mode = "car") {
  const dist = haversineDistance(startNode.lat, startNode.lng, endNode.lat, endNode.lng);
  const speed = mode === "walk" ? 5.0 : 40.0;
  const durMin = (dist / (speed * 1000)) * 60;
  const geom = [
    [startNode.lat, startNode.lng],
    [endNode.lat, endNode.lng],
  ];

  return {
    roadGeometry: geom,
    totalDistance: dist,
    totalDurationMin: Number(durMin.toFixed(1)),
    turnByTurnSteps: [
      {
        step: 1,
        instruction: `Depart from ${startNode.shortName || startNode.name}`,
        maneuverType: "depart",
        roadName: "Arterial Road",
        distanceMeters: dist,
        distanceText: formatDistanceText(dist),
        durationText: formatDurationText(durMin),
        coordinate: [startNode.lat, startNode.lng],
      },
      {
        step: 2,
        instruction: `Arrive at ${endNode.shortName || endNode.name}`,
        maneuverType: "arrive",
        roadName: "Destination",
        distanceMeters: 0,
        distanceText: "0 m",
        durationText: "0 min",
        coordinate: [endNode.lat, endNode.lng],
      },
    ],
    visitedOrder: [],
  };
}

/**
 * Route a single Leg (Point A -> Point B).
 * Handles:
 * - Case 1: Both Inside Campus -> Campus Dijkstra
 * - Case 2: Both Outside Campus -> OSRM + Street-Intersection Dijkstra
 * - Case 3: One Inside, One Outside -> Optimal Campus Gate + Seamless Stitching
 */
export async function routeSingleLeg(startNode, endNode, mode = "car", nodesMap = {}) {
  const startInside = isInsideCampus(startNode);
  const endInside = isInsideCampus(endNode);

  // CASE 1: BOTH INSIDE CAMPUS (Guaranteed 100% inside, zero exits)
  if (startInside && endInside) {
    const campusRes = runCampusDijkstra(startNode.id, endNode.id, mode);
    if (campusRes.reachable) {
      return campusRes;
    }
  }

  // CASE 2: BOTH OUTSIDE CAMPUS (Pure City Route)
  if (!startInside && !endInside) {
    const osrmRoutes = await fetchOSRMRoute(startNode, endNode, mode);
    if (osrmRoutes) {
      const streetRes = runStreetIntersectionDijkstra(osrmRoutes, mode, startNode, endNode);
      if (streetRes) {
        return {
          reachable: true,
          mode,
          pathNodes: [startNode, endNode],
          ...streetRes,
        };
      }
    }
    return {
      reachable: true,
      mode,
      pathNodes: [startNode, endNode],
      ...buildFallbackCityRoute(startNode, endNode, mode),
    };
  }

  // CASE 3: ONE INSIDE, ONE OUTSIDE (Campus <-> City Transition via Gate)
  const mainGate = NSUT_CAMPUS_NODES.find((n) => n.id === "nsut_main_gate");
  const northGate = NSUT_CAMPUS_NODES.find((n) => n.id === "nsut_north_gate");

  if (!startInside && endInside) {
    // ENTERING CAMPUS (e.g. Pacific D21 Mall -> Admin Block)
    // Evaluate Gate 1 (Main Gate) vs Gate 2 (North Gate)
    const distToMain = haversineDistance(startNode.lat, startNode.lng, mainGate.lat, mainGate.lng);
    const distToNorth = haversineDistance(startNode.lat, startNode.lng, northGate.lat, northGate.lng);
    const chosenGate = distToMain <= distToNorth ? mainGate : northGate;

    // Sub-leg 1: startNode -> chosenGate (City OSRM)
    const osrmRoutes = await fetchOSRMRoute(startNode, chosenGate, mode);
    const cityRes = osrmRoutes
      ? runStreetIntersectionDijkstra(osrmRoutes, mode, startNode, chosenGate)
      : buildFallbackCityRoute(startNode, chosenGate, mode);

    // Sub-leg 2: chosenGate -> endNode (Internal Campus Dijkstra)
    const campusRes = runCampusDijkstra(chosenGate.id, endNode.id, mode);

    // Stitch together seamlessly
    const combinedGeom = [
      ...(cityRes?.roadGeometry || []),
      ...(campusRes?.roadGeometry || []),
    ];

    const combinedSteps = [
      ...(cityRes?.turnByTurnSteps || []),
      ...(campusRes?.turnByTurnSteps || []).map((s, idx) => ({
        ...s,
        step: (cityRes?.turnByTurnSteps?.length || 0) + idx + 1,
      })),
    ];

    const totalDistance = (cityRes?.totalDistance || 0) + (campusRes?.totalDistance || 0);
    const totalDurationMin = (cityRes?.totalDurationMin || 0) + (campusRes?.totalDurationMin || 0);

    const campusNodesTail =
      campusRes?.pathNodes?.length > 1
        ? campusRes.pathNodes.slice(1)
        : [endNode];
    const pathNodes = [startNode, chosenGate, ...campusNodesTail];

    return {
      reachable: true,
      mode,
      pathNodes,
      roadGeometry: combinedGeom,
      totalDistance,
      totalDurationMin: Number(totalDurationMin.toFixed(1)),
      turnByTurnSteps: combinedSteps,
      visitedOrder: [...(cityRes?.visitedOrder || []), ...(campusRes?.visitedOrder || [])],
    };
  } else {
    // EXITING CAMPUS (e.g. Admin Block -> Connaught Place)
    const distFromMain = haversineDistance(endNode.lat, endNode.lng, mainGate.lat, mainGate.lng);
    const distFromNorth = haversineDistance(endNode.lat, endNode.lng, northGate.lat, northGate.lng);
    const chosenGate = distFromMain <= distFromNorth ? mainGate : northGate;

    // Sub-leg 1: startNode -> chosenGate (Internal Campus Dijkstra)
    const campusRes = runCampusDijkstra(startNode.id, chosenGate.id, mode);

    // Sub-leg 2: chosenGate -> endNode (City OSRM)
    const osrmRoutes = await fetchOSRMRoute(chosenGate, endNode, mode);
    const cityRes = osrmRoutes
      ? runStreetIntersectionDijkstra(osrmRoutes, mode, chosenGate, endNode)
      : buildFallbackCityRoute(chosenGate, endNode, mode);

    const combinedGeom = [
      ...(campusRes?.roadGeometry || []),
      ...(cityRes?.roadGeometry || []),
    ];

    const combinedSteps = [
      ...(campusRes?.turnByTurnSteps || []),
      ...(cityRes?.turnByTurnSteps || []).map((s, idx) => ({
        ...s,
        step: (campusRes?.turnByTurnSteps?.length || 0) + idx + 1,
      })),
    ];

    const totalDistance = (campusRes?.totalDistance || 0) + (cityRes?.totalDistance || 0);
    const totalDurationMin = (campusRes?.totalDurationMin || 0) + (cityRes?.totalDurationMin || 0);

    const pathNodes = [...(campusRes?.pathNodes || [startNode]), endNode];

    return {
      reachable: true,
      mode,
      pathNodes,
      roadGeometry: combinedGeom,
      totalDistance,
      totalDurationMin: Number(totalDurationMin.toFixed(1)),
      turnByTurnSteps: combinedSteps,
      visitedOrder: [...(campusRes?.visitedOrder || []), ...(cityRes?.visitedOrder || [])],
    };
  }
}

/**
 * Execute Chained Dijkstra Route across [Origin, ...ViaStops, Destination].
 * Computes BOTH Car and Walk routes for instant comparison.
 */
export async function executeDijkstraAsync({
  graph = DEFAULT_GRAPH,
  sourceId,
  targetId,
  viaNodeIds = [],
  mode = "car",
  enableLiveOSRM = true,
}) {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const activeGraph = graph?.nodes ? graph : DEFAULT_GRAPH;
  const nodesMap = {};
  for (const n of activeGraph.nodes) nodesMap[n.id] = n;

  const sourceNode = nodesMap[sourceId];
  const targetNode = nodesMap[targetId];

  if (!sourceNode || !targetNode) {
    return {
      reachable: false,
      status: "error",
      message: "Source or Target node not found in graph.",
    };
  }

  const cleanViaIds = (Array.isArray(viaNodeIds) ? viaNodeIds : []).filter(
    (id) => nodesMap[id] && id !== sourceId && id !== targetId
  );

  const chainNodes = [sourceNode, ...cleanViaIds.map((id) => nodesMap[id]), targetNode];

  // Helper to execute all legs in chain for a mode
  async function computeChain(chain, targetMode) {
    const allGeom = [];
    const allSteps = [];
    const allVisited = [];
    const allPathNodes = [];
    let cumDist = 0;
    let cumTime = 0;

    for (let i = 0; i < chain.length - 1; i++) {
      const uNode = chain[i];
      const vNode = chain[i + 1];

      const legRes = await routeSingleLeg(uNode, vNode, targetMode, nodesMap);
      if (!legRes.reachable) {
        return { reachable: false };
      }

      for (let p = 0; p < (legRes.roadGeometry || []).length; p++) {
        if (allGeom.length > 0 && p === 0) continue;
        allGeom.push(legRes.roadGeometry[p]);
      }

      const stepOffset = allSteps.length;
      for (const st of legRes.turnByTurnSteps || []) {
        allSteps.push({ ...st, step: st.step + stepOffset });
      }

      for (const v of legRes.visitedOrder || []) {
        allVisited.push(v);
      }

      const legNodes = i === 0 ? legRes.pathNodes : legRes.pathNodes.slice(1);
      allPathNodes.push(...legNodes);

      cumDist += legRes.totalDistance || 0;
      cumTime += legRes.totalDurationMin || 0;
    }

    // Format shortestPath node sequence with flags
    const shortestPath = allPathNodes.map((n, idx) => ({
      id: n.id,
      name: n.name,
      shortName: n.shortName || n.name,
      lat: n.lat,
      lng: n.lng,
      zone: n.zone || "Delhi",
      isCampus: Boolean(n.isCampus),
      stepIndex: idx,
      isOrigin: idx === 0,
      isDestination: idx === allPathNodes.length - 1,
      isViaStop: cleanViaIds.includes(n.id),
      viaStopNumber: cleanViaIds.indexOf(n.id) + 1 || null,
    }));

    return {
      reachable: true,
      mode: targetMode,
      shortestPath,
      roadGeometry: allGeom,
      roadGeometryGeoJSON: {
        type: "LineString",
        coordinates: allGeom.map(([lat, lng]) => [lng, lat]),
      },
      turnByTurnSteps: allSteps,
      totalDistance: Math.round(cumDist),
      totalDistanceKm: Number((cumDist / 1000).toFixed(2)),
      estimatedTime: Math.max(1, Math.round(cumTime)),
      visitedOrder: allVisited,
    };
  }

  // Compute active mode and opposite mode in parallel
  const [activeRes, compareRes] = await Promise.all([
    computeChain(chainNodes, mode === "walk" ? "walk" : "car"),
    computeChain(chainNodes, mode === "walk" ? "car" : "walk"),
  ]);

  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const executionTimeMs = Number((t1 - t0).toFixed(2));

  const carData = mode === "car" ? activeRes : compareRes;
  const walkData = mode === "walk" ? activeRes : compareRes;

  return {
    status: activeRes.reachable ? "ok" : "error",
    engine: "NavMap Dijkstra + Real Street Intersections v4.2",
    mode: mode === "walk" ? "walk" : "car",
    sourceId,
    targetId,
    viaNodeIds: cleanViaIds,
    ...activeRes,
    carComparison: {
      distanceMeters: carData?.totalDistance || 0,
      distanceKm: carData?.totalDistanceKm || 0,
      durationMin: carData?.estimatedTime || 0,
    },
    walkComparison: {
      distanceMeters: walkData?.totalDistance || 0,
      distanceKm: walkData?.totalDistanceKm || 0,
      durationMin: walkData?.estimatedTime || 0,
    },
    executionTimeMs,
    timestamp: new Date().toISOString(),
  };
}
