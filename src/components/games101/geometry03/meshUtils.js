/**
 * Geometry 03 - Mesh Operations utility functions
 */

// --- Vector operations ---
export function vec3(x, y, z) { return { x, y, z } }
export function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z } }
export function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z } }
export function scale(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s } }
export function length(v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) }
export function normalize(v) { const l = length(v); return l > 0 ? scale(v, 1 / l) : vec3(0, 0, 0) }
export function cross(a, b) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}
export function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z }
export function midpoint(a, b) { return scale(add(a, b), 0.5) }
export function average(points) {
  const sum = points.reduce((acc, p) => add(acc, p), vec3(0, 0, 0))
  return scale(sum, 1 / points.length)
}
export function dist(a, b) { return length(sub(a, b)) }

// --- Icosphere generation ---
export function createIcosphere(subdivisions = 0) {
  const t = (1 + Math.sqrt(5)) / 2
  let vertices = [
    vec3(-1, t, 0), vec3(1, t, 0), vec3(-1, -t, 0), vec3(1, -t, 0),
    vec3(0, -1, t), vec3(0, 1, t), vec3(0, -1, -t), vec3(0, 1, -t),
    vec3(t, 0, -1), vec3(t, 0, 1), vec3(-t, 0, -1), vec3(-t, 0, 1),
  ].map(v => normalize(v))

  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ]

  for (let i = 0; i < subdivisions; i++) {
    const midCache = {}
    const getMid = (a, b) => {
      const key = Math.min(a, b) + '_' + Math.max(a, b)
      if (midCache[key] !== undefined) return midCache[key]
      const mid = normalize(midpoint(vertices[a], vertices[b]))
      vertices.push(mid)
      midCache[key] = vertices.length - 1
      return midCache[key]
    }
    const newFaces = []
    for (const [a, b, c] of faces) {
      const ab = getMid(a, b), bc = getMid(b, c), ca = getMid(c, a)
      newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    faces = newFaces
  }
  return { vertices, faces }
}

// --- Cube mesh ---
export function createCube() {
  const vertices = [
    vec3(-1,-1,-1), vec3(1,-1,-1), vec3(1,1,-1), vec3(-1,1,-1),
    vec3(-1,-1,1), vec3(1,-1,1), vec3(1,1,1), vec3(-1,1,1),
  ]
  const faces = [
    [0,1,2],[0,2,3],[4,6,5],[4,7,6],
    [0,4,5],[0,5,1],[2,6,7],[2,7,3],
    [0,3,7],[0,7,4],[1,5,6],[1,6,2],
  ]
  return { vertices, faces }
}

// --- Quad cube for Catmull-Clark ---
export function createQuadCube() {
  const vertices = [
    vec3(-1,-1,-1), vec3(1,-1,-1), vec3(1,1,-1), vec3(-1,1,-1),
    vec3(-1,-1,1), vec3(1,-1,1), vec3(1,1,1), vec3(-1,1,1),
  ]
  const quads = [
    [0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5],
  ]
  return { vertices, quads }
}

// --- Loop Subdivision (triangle mesh) ---
export function loopSubdivide(mesh) {
  const { vertices, faces } = mesh
  const newVerts = [...vertices]
  const edgeMap = {}
  const edgeKey = (a, b) => Math.min(a, b) + '_' + Math.max(a, b)

  // Build adjacency
  const vertNeighbors = vertices.map(() => new Set())
  const edgeFaces = {}
  for (const [a, b, c] of faces) {
    vertNeighbors[a].add(b); vertNeighbors[a].add(c)
    vertNeighbors[b].add(a); vertNeighbors[b].add(c)
    vertNeighbors[c].add(a); vertNeighbors[c].add(b)
    for (const [e0, e1, opp] of [[a,b,c],[b,c,a],[c,a,b]]) {
      const k = edgeKey(e0, e1)
      if (!edgeFaces[k]) edgeFaces[k] = []
      edgeFaces[k].push(opp)
    }
  }

  // Compute new edge vertices
  for (const [a, b, c] of faces) {
    for (const [e0, e1] of [[a,b],[b,c],[c,a]]) {
      const k = edgeKey(e0, e1)
      if (edgeMap[k] !== undefined) continue
      const opposites = edgeFaces[k] || []
      let newV
      if (opposites.length === 2) {
        newV = add(scale(add(vertices[e0], vertices[e1]), 3/8), scale(add(vertices[opposites[0]], vertices[opposites[1]]), 1/8))
      } else {
        newV = midpoint(vertices[e0], vertices[e1])
      }
      newVerts.push(newV)
      edgeMap[k] = newVerts.length - 1
    }
  }

  // Update old vertices
  const updatedVerts = vertices.map((v, i) => {
    const neighbors = [...vertNeighbors[i]]
    const n = neighbors.length
    if (n === 0) return v
    const u = n === 3 ? 3/16 : 3/(8*n)
    const neighborSum = neighbors.reduce((acc, ni) => add(acc, vertices[ni]), vec3(0,0,0))
    return add(scale(v, 1 - n * u), scale(neighborSum, u))
  })

  // Replace old vertices
  for (let i = 0; i < vertices.length; i++) {
    newVerts[i] = updatedVerts[i]
  }

  // Build new faces
  const newFaces = []
  for (const [a, b, c] of faces) {
    const ab = edgeMap[edgeKey(a, b)]
    const bc = edgeMap[edgeKey(b, c)]
    const ca = edgeMap[edgeKey(c, a)]
    newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }

  return { vertices: newVerts, faces: newFaces }
}

// --- Catmull-Clark Subdivision (quad mesh) ---
export function catmullClarkSubdivide(mesh) {
  const { vertices, quads } = mesh
  const newVerts = [...vertices]

  // Face points
  const facePoints = []
  for (const quad of quads) {
    const fp = average(quad.map(i => vertices[i]))
    newVerts.push(fp)
    facePoints.push(newVerts.length - 1)
  }

  // Edge points
  const edgeMap = {}
  const edgeKey = (a, b) => Math.min(a, b) + '_' + Math.max(a, b)
  for (let fi = 0; fi < quads.length; fi++) {
    const quad = quads[fi]
    for (let i = 0; i < 4; i++) {
      const a = quad[i], b = quad[(i + 1) % 4]
      const k = edgeKey(a, b)
      if (!edgeMap[k]) edgeMap[k] = { verts: [a, b], faces: [] }
      edgeMap[k].faces.push(fi)
    }
  }

  const edgePointIndices = {}
  for (const [k, info] of Object.entries(edgeMap)) {
    const { verts, faces: adjFaces } = info
    let ep
    if (adjFaces.length === 2) {
      ep = average([vertices[verts[0]], vertices[verts[1]], newVerts[facePoints[adjFaces[0]]], newVerts[facePoints[adjFaces[1]]]])
    } else {
      ep = midpoint(vertices[verts[0]], vertices[verts[1]])
    }
    newVerts.push(ep)
    edgePointIndices[k] = newVerts.length - 1
  }

  // Vertex updates
  const vertFaces = vertices.map(() => [])
  const vertEdges = vertices.map(() => [])
  for (let fi = 0; fi < quads.length; fi++) {
    for (const vi of quads[fi]) vertFaces[vi].push(fi)
  }
  for (const [k, info] of Object.entries(edgeMap)) {
    for (const vi of info.verts) vertEdges[vi].push(k)
  }

  const updatedOldVerts = vertices.map((v, i) => {
    const n = vertFaces[i].length
    if (n === 0) return v
    const F = average(vertFaces[i].map(fi => newVerts[facePoints[fi]]))
    const edgeMids = [...new Set(vertEdges[i])].map(k => {
      const info = edgeMap[k]
      return midpoint(vertices[info.verts[0]], vertices[info.verts[1]])
    })
    const E = edgeMids.length > 0 ? average(edgeMids) : v
    return scale(add(add(F, scale(E, 2)), scale(v, n - 3)), 1 / n)
  })

  for (let i = 0; i < vertices.length; i++) newVerts[i] = updatedOldVerts[i]

  // Build new quads
  const newQuads = []
  for (let fi = 0; fi < quads.length; fi++) {
    const quad = quads[fi]
    const fp = facePoints[fi]
    for (let i = 0; i < 4; i++) {
      const v = quad[i]
      const e1 = edgePointIndices[edgeKey(quad[(i + 3) % 4], v)]
      const e2 = edgePointIndices[edgeKey(v, quad[(i + 1) % 4])]
      newQuads.push([v, e2, fp, e1])
    }
  }

  return { vertices: newVerts, quads: newQuads }
}

// --- Simple mesh simplification (greedy edge collapse) ---
export function simplifyMesh(mesh, targetRatio = 0.5) {
  let { vertices, faces } = mesh
  vertices = [...vertices]
  faces = faces.map(f => [...f])
  const targetFaces = Math.max(4, Math.floor(faces.length * targetRatio))

  while (faces.length > targetFaces) {
    // Find shortest edge
    let minLen = Infinity, minEdge = null
    for (const face of faces) {
      for (let i = 0; i < 3; i++) {
        const a = face[i], b = face[(i + 1) % 3]
        const d = dist(vertices[a], vertices[b])
        if (d < minLen) { minLen = d; minEdge = [a, b] }
      }
    }
    if (!minEdge) break
    const [va, vb] = minEdge
    // Collapse vb into va
    vertices[va] = midpoint(vertices[va], vertices[vb])
    // Replace all references to vb with va
    for (let i = faces.length - 1; i >= 0; i--) {
      faces[i] = faces[i].map(v => v === vb ? va : v)
      // Remove degenerate faces
      if (faces[i][0] === faces[i][1] || faces[i][1] === faces[i][2] || faces[i][0] === faces[i][2]) {
        faces.splice(i, 1)
      }
    }
  }
  return { vertices, faces }
}

// --- Compute face normal ---
export function faceNormal(v0, v1, v2) {
  return normalize(cross(sub(v1, v0), sub(v2, v0)))
}

// --- Compute vertex normals ---
export function computeVertexNormals(vertices, faces) {
  const normals = vertices.map(() => vec3(0, 0, 0))
  for (const [a, b, c] of faces) {
    const n = faceNormal(vertices[a], vertices[b], vertices[c])
    normals[a] = add(normals[a], n)
    normals[b] = add(normals[b], n)
    normals[c] = add(normals[c], n)
  }
  return normals.map(normalize)
}
