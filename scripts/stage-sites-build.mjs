import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });
await cp(".open-next", "dist", { recursive: true });
await mkdir("dist/server", { recursive: true });
