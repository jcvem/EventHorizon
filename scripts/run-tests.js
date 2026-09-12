#!/usr/bin/env node
import { spawn } from "node:child_process";

// Adapt arguments: filter out Jest-specific flags like --runInBand for Vitest
const rawArgs = process.argv.slice(2);
const filteredArgs = rawArgs.filter((arg) => arg !== "--runInBand");

// If --runInBand was supplied, add Vitest's equivalent: --no-file-parallelism
if (rawArgs.includes("--runInBand")) {
  filteredArgs.push("--no-file-parallelism");
}

const child = spawn("npx", ["vitest", "run", ...filteredArgs], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
