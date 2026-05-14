// Ray tracing teaching utilities for GAMES101 / Ray Tracing 1
// Plain JS to match the rest of the project style (no TypeScript here)

export const v = (x = 0, y = 0, z = 0) => ({ x, y, z })

export const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z

export const cross = (a, b) => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})

export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
export const scale = (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s })
export const length = (a) => Math.sqrt(dot(a, a))

export const normalize = (a) => {
  const l = length(a)
  if (l < 1e-8) return { x: 0, y: 0, z: 0 }
  return scale(a, 1 / l)
}

export const pointOnRay = (ray, t) => add(ray.origin, scale(ray.direction, t))

export const arr = (a) => [a.x, a.y, a.z]
export const fromArr = (a) => ({ x: a[0], y: a[1], z: a[2] })

// ---------- Ray–Triangle (Möller–Trumbore) ----------
export function intersectTriangle(ray, p0, p1, p2, eps = 1e-6) {
  const e1 = sub(p1, p0)
  const e2 = sub(p2, p0)
  const pvec = cross(ray.direction, e2)
  const det = dot(e1, pvec)
  const result = { hit: false, det, t: null, u: null, vCoord: null, w: null, point: null, reason: '' }
  if (Math.abs(det) < eps) {
    result.reason = 'parallel / degenerate'
    return result
  }
  const invDet = 1 / det
  const tvec = sub(ray.origin, p0)
  const u = dot(tvec, pvec) * invDet
  result.u = u
  if (u < 0 || u > 1) {
    result.reason = 'u outside [0,1]'
    return result
  }
  const qvec = cross(tvec, e1)
  const vC = dot(ray.direction, qvec) * invDet
  result.vCoord = vC
  if (vC < 0 || u + vC > 1) {
    result.reason = 'v outside or u+v>1'
    return result
  }
  const t = dot(e2, qvec) * invDet
  result.t = t
  result.w = 1 - u - vC
  if (t <= eps) {
    result.reason = 'behind ray (t<=0)'
    return result
  }
  result.hit = true
  result.point = pointOnRay(ray, t)
  result.reason = 'hit'
  return result
}

// ---------- Ray–AABB (Slab Method) ----------
export function intersectAABB(ray, box) {
  let tMin = -Infinity
  let tMax = Infinity
  const intervals = {}
  const axes = ['x', 'y', 'z']
  for (const a of axes) {
    const o = ray.origin[a]
    const d = ray.direction[a]
    const lo = box.min[a]
    const hi = box.max[a]
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) {
        return { hit: false, tEnter: null, tExit: null, intervals, reason: `parallel on ${a} & outside` }
      }
      intervals[a] = { t0: -Infinity, t1: Infinity, parallel: true }
      continue
    }
    let t0 = (lo - o) / d
    let t1 = (hi - o) / d
    if (t0 > t1) [t0, t1] = [t1, t0]
    intervals[a] = { t0, t1, parallel: false }
    tMin = Math.max(tMin, t0)
    tMax = Math.min(tMax, t1)
    if (tMin > tMax) return { hit: false, tEnter: tMin, tExit: tMax, intervals, reason: 'tMin > tMax' }
  }
  return { hit: tMax >= 0, tEnter: tMin, tExit: tMax, intervals, reason: tMax < 0 ? 'box behind ray' : 'hit' }
}

// ---------- Ray–Sphere ----------
export function intersectSphere(ray, center, radius) {
  const oc = sub(ray.origin, center)
  const a = dot(ray.direction, ray.direction)
  const b = 2 * dot(oc, ray.direction)
  const c = dot(oc, oc) - radius * radius
  const disc = b * b - 4 * a * c
  if (disc < 0) return { hit: false, disc, t0: null, t1: null, reason: 'no intersection' }
  const s = Math.sqrt(disc)
  const t0 = (-b - s) / (2 * a)
  const t1 = (-b + s) / (2 * a)
  const tNear = t0 > 1e-6 ? t0 : t1 > 1e-6 ? t1 : null
  return {
    hit: tNear !== null,
    disc,
    t0,
    t1,
    tNear,
    point: tNear !== null ? pointOnRay(ray, tNear) : null,
    reason: disc === 0 ? 'tangent' : tNear === null ? 'sphere behind ray' : 'hit',
  }
}

// ---------- Ray–Plane ----------
export function intersectPlane(ray, p0, normal) {
  const denom = dot(ray.direction, normal)
  if (Math.abs(denom) < 1e-8) return { hit: false, denom, t: null, point: null, reason: 'parallel to plane' }
  const t = dot(sub(p0, ray.origin), normal) / denom
  if (t <= 1e-6) return { hit: false, denom, t, point: null, reason: 'behind ray' }
  return { hit: true, denom, t, point: pointOnRay(ray, t), reason: 'hit' }
}

// ---------- Barycentric ----------
export function barycentric2D(p, a, b, c) {
  const v0x = b.x - a.x, v0y = b.y - a.y
  const v1x = c.x - a.x, v1y = c.y - a.y
  const v2x = p.x - a.x, v2y = p.y - a.y
  const den = v0x * v1y - v1x * v0y
  if (Math.abs(den) < 1e-9) return { u: 0, vCoord: 0, w: 1, inside: false }
  const vCoord = (v2x * v1y - v1x * v2y) / den
  const u = (v0x * v2y - v2x * v0y) / den
  const w = 1 - u - vCoord
  return { u, vCoord, w, inside: u >= 0 && vCoord >= 0 && w >= 0 }
}

// ---------- AABB helpers ----------
export const aabbFromPoints = (pts) => {
  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const p of pts) {
    min.x = Math.min(min.x, p.x); min.y = Math.min(min.y, p.y); min.z = Math.min(min.z, p.z)
    max.x = Math.max(max.x, p.x); max.y = Math.max(max.y, p.y); max.z = Math.max(max.z, p.z)
  }
  return { min, max }
}

export const aabbCenter = (b) => ({
  x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2,
})

export const aabbExtent = (b) => ({
  x: b.max.x - b.min.x, y: b.max.y - b.min.y, z: b.max.z - b.min.z,
})

export const aabbLongestAxis = (b) => {
  const e = aabbExtent(b)
  if (e.x >= e.y && e.x >= e.z) return 'x'
  if (e.y >= e.z) return 'y'
  return 'z'
}

// ---------- BVH (teaching simulation) ----------
export function buildBVH(objects, maxLeaf = 2, maxDepth = 8, depth = 0) {
  // each object: { id, center: Vec3, bbox: AABB }
  const bbox = mergeBBoxes(objects.map((o) => o.bbox))
  const node = { id: Math.random().toString(36).slice(2, 8), depth, bbox, objects: [], left: null, right: null, axis: null, isLeaf: false }
  if (objects.length <= maxLeaf || depth >= maxDepth) {
    node.isLeaf = true
    node.objects = objects
    return node
  }
  const axis = aabbLongestAxis(bbox)
  const sorted = [...objects].sort((a, b) => a.center[axis] - b.center[axis])
  const mid = Math.floor(sorted.length / 2)
  node.axis = axis
  node.left = buildBVH(sorted.slice(0, mid), maxLeaf, maxDepth, depth + 1)
  node.right = buildBVH(sorted.slice(mid), maxLeaf, maxDepth, depth + 1)
  return node
}

export function mergeBBoxes(boxes) {
  const out = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } }
  for (const b of boxes) {
    out.min.x = Math.min(out.min.x, b.min.x); out.min.y = Math.min(out.min.y, b.min.y); out.min.z = Math.min(out.min.z, b.min.z)
    out.max.x = Math.max(out.max.x, b.max.x); out.max.y = Math.max(out.max.y, b.max.y); out.max.z = Math.max(out.max.z, b.max.z)
  }
  return out
}

// Traverse BVH and record steps
export function traverseBVH(ray, node, log = []) {
  const test = intersectAABB(ray, node.bbox)
  log.push({ nodeId: node.id, depth: node.depth, hit: test.hit, isLeaf: node.isLeaf, tEnter: test.tEnter, tExit: test.tExit })
  if (!test.hit) return { closestT: Infinity, hitObj: null }
  if (node.isLeaf) {
    let best = Infinity, hitObj = null
    for (const o of node.objects) {
      const r = intersectAABB(ray, o.bbox) // proxy: test object bbox
      log.push({ nodeId: node.id, leafTest: o.id, hit: r.hit, tEnter: r.tEnter })
      if (r.hit && r.tEnter > 1e-4 && r.tEnter < best) { best = r.tEnter; hitObj = o }
    }
    return { closestT: best, hitObj }
  }
  const left = traverseBVH(ray, node.left, log)
  const right = traverseBVH(ray, node.right, log)
  return left.closestT < right.closestT ? left : right
}

// ---------- 2D helpers ----------
export const v2 = (x = 0, y = 0) => ({ x, y })
export const dot2 = (a, b) => a.x * b.x + a.y * b.y
export const sub2 = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
export const len2 = (a) => Math.hypot(a.x, a.y)
