import { spawn } from "node:child_process";
import { cp, mkdir, rename, rm } from "node:fs/promises";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

await rm("dist", { force: true, recursive: true });
await cp(".open-next", "dist", { recursive: true });
await mkdir("dist/server", { recursive: true });
await run("wrangler", [
  "deploy",
  "dist/worker.js",
  "--dry-run",
  "--assets",
  "dist/assets",
  "--outdir",
  "dist/server",
]);
await rename("dist/server/worker.js", "dist/server/index.js");
