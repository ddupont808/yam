import { writeFileSync } from "fs";
import { join, resolve } from "path";
import node from "./src/stack";
import config from "./src/config";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
const ssbKeys = require("ssb-keys");

const ssbPath = process.env.USE_TMP
  ? join(__dirname, "tmp", `.usr-${randomBytes(8).toString("hex")}`)
  : resolve(config.path);

if (process.env.USE_TMP) {
  process.env.YAM_HTTP_PORT = (
    32768 + Math.floor(Math.random() * 32768)
  ).toString();
}

const keys = ssbKeys.loadOrCreateSync(join(ssbPath, "secret"));
const stack = node({ keys, path: ssbPath });

stack.logger.info("Node started in %s", ssbPath);
stack.logger.debug("address = %s", stack.address());

const manifest = stack.getManifest();
writeFileSync(
  join(ssbPath, "manifest.json"),
  JSON.stringify(manifest, undefined, "\t")
);

export default { node };
