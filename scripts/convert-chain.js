#!/usr/bin/env node
// Convert a chain trajectory from three CSV files into one compact JSON file.
//
// Input: <prefix>_x.csv, <prefix>_y.csv, <prefix>_z.csv, where each row is an
// animation frame and each column is a vertex of the chain.
//
// Output: one JSON file
//   { "frames": F, "vertices": V,
//     "range": { "x": [min, max], "y": [min, max], "z": [min, max] },
//     "x": [[...V numbers], ...F rows], "y": [...], "z": [...] }
//
// Usage:
//   node scripts/convert-chain.js <prefix> <output.json> [--max-frames N] [--decimals D]
//
//   --max-frames N  keep at most N frames, taking every k-th one (default 300)
//   --decimals D    decimal places to keep (default: chosen from the data, see below)
//
// The source CSVs live in data/chains/ (outside src/, so they are not
// published); the JSON goes to src/assets/simulations/data/. Example:
//   node scripts/convert-chain.js data/chains/needleTrajReduced \
//     src/assets/simulations/data/needleTraj.json

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

// Default rounding: the largest step that is at most this fraction of the
// widest axis range. 0.2% is under one pixel on a plot 500 px wide.
const TOLERANCE = 0.002;
const DEFAULT_MAX_FRAMES = 300;

function usage(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error("Usage: node scripts/convert-chain.js <prefix> <output.json> [--max-frames N] [--decimals D]");
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  const opts = { maxFrames: DEFAULT_MAX_FRAMES, decimals: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--max-frames" || a === "--decimals") {
      const v = Number(argv[++i]);
      if (!Number.isInteger(v) || v < 0) usage(`${a} needs a non-negative integer`);
      if (a === "--max-frames") {
        if (v === 0) usage("--max-frames must be at least 1");
        opts.maxFrames = v;
      } else {
        opts.decimals = v;
      }
    } else if (a.startsWith("--")) {
      usage(`unknown option ${a}`);
    } else {
      positional.push(a);
    }
  }
  if (positional.length !== 2) usage();
  [opts.prefix, opts.output] = positional;
  return opts;
}

function readMatrix(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    usage(`cannot read ${path} (${err.code})`);
  }
  return text.trim().split(/\r?\n/).map((line, r) =>
    line.split(",").map((cell, c) => {
      const v = Number(cell);
      if (cell.trim() === "" || !Number.isFinite(v)) {
        usage(`${path}: row ${r + 1}, column ${c + 1} is not a number: "${cell}"`);
      }
      return v;
    })
  );
}

function range(M) {
  let min = Infinity, max = -Infinity;
  for (const row of M) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
  return [min, max];
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const axes = ["x", "y", "z"];
  const files = axes.map((a) => `${opts.prefix}_${a}.csv`);
  const [X, Y, Z] = files.map(readMatrix);

  if (X.length !== Y.length || X.length !== Z.length) {
    usage(`frame counts differ: x=${X.length}, y=${Y.length}, z=${Z.length}`);
  }
  const vertices = X[0].length;
  for (const [name, M] of [["x", X], ["y", Y], ["z", Z]]) {
    const bad = M.findIndex((row) => row.length !== vertices);
    if (bad !== -1) usage(`${name}: row ${bad + 1} has ${M[bad].length} vertices, expected ${vertices}`);
  }

  const ranges = { x: range(X), y: range(Y), z: range(Z) };
  const widest = Math.max(...Object.values(ranges).map(([lo, hi]) => hi - lo));
  const decimals = opts.decimals ?? (widest > 0 ? Math.max(0, Math.ceil(-Math.log10(widest * TOLERANCE))) : 0);
  const scale = 10 ** decimals;
  const round = (v) => Math.round(v * scale) / scale;

  // Same subsampling as chain.js: every k-th frame, k = ceil(F / maxFrames).
  const step = Math.ceil(X.length / opts.maxFrames);
  const pick = (M) => M.filter((_, f) => f % step === 0).map((row) => row.map(round));

  const out = {
    frames: Math.ceil(X.length / step),
    vertices,
    range: Object.fromEntries(axes.map((a) => [a, ranges[a].map(round)])),
    x: pick(X),
    y: pick(Y),
    z: pick(Z),
  };

  const json = JSON.stringify(out);
  writeFileSync(opts.output, json);

  const inBytes = files.reduce((s, f) => s + statSync(f).size, 0);
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`${opts.output}`);
  console.log(`  frames:   ${X.length} -> ${out.frames} (every ${step})`);
  console.log(`  vertices: ${vertices}`);
  console.log(`  decimals: ${decimals}${opts.decimals == null ? " (auto)" : ""}`);
  console.log(`  size:     ${kb(inBytes)} -> ${kb(json.length)} (${kb(gzipSync(json).length)} gzipped)`);
}

main();
