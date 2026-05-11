/**
 * Geometry 02 - Curves and Surfaces utility functions
 */

// --- Vector operations ---
export function lerpScalar(a, b, t) {
  return a * (1 - t) + b * t;
}

export function lerpPoint(a, b, t) {
  return { x: a.x * (1 - t) + b.x * t, y: a.y * (1 - t) + b.y * t };
}

export function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(p, s) {
  return { x: p.x * s, y: p.y * s };
}

export function normalize(p) {
  const len = Math.sqrt(p.x * p.x + p.y * p.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: p.x / len, y: p.y / len };
}

export function length(p) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

// --- De Casteljau ---
export function deCasteljau(points, t) {
  let current = [...points];
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length - 1; i++) {
      next.push(lerpPoint(current[i], current[i + 1], t));
    }
    current = next;
  }
  return current[0];
}

export function deCasteljauLevels(points, t) {
  const levels = [points.map(p => ({ ...p }))];
  let current = [...points];
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length - 1; i++) {
      next.push(lerpPoint(current[i], current[i + 1], t));
    }
    levels.push(next.map(p => ({ ...p })));
    current = next;
  }
  return levels;
}

export function sampleBezier(points, steps = 120) {
  const result = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    result.push(deCasteljau(points, t));
  }
  return result;
}

// --- Bernstein basis ---
export function bernstein(n, i, t) {
  return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

export function bernstein3(i, t) {
  if (i === 0) return (1 - t) ** 3;
  if (i === 1) return 3 * t * (1 - t) ** 2;
  if (i === 2) return 3 * t * t * (1 - t);
  return t ** 3;
}

function binomial(n, k) {
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

// --- Bezier Surface ---
export function evaluateBezierSurface(control, u, v) {
  let p = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const w = bernstein3(i, u) * bernstein3(j, v);
      p.x += control[i][j].x * w;
      p.y += control[i][j].y * w;
      p.z += control[i][j].z * w;
    }
  }
  return p;
}

// --- Convex Hull (2D, Graham scan) ---
export function convexHull(points) {
  if (points.length < 3) return [...points];
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
