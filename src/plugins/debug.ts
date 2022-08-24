import { plugin } from "secret-stack-decorators";
import { Stack } from "../types";

@plugin("0.0.1")
class debug {
  constructor(api: Stack, opts: any) {
    api.web.get("/debug.json", async (req, reply) => {
      return JSON.stringify(
        {
          api: api,
          manifest: api.getManifest(),
        },
        function (key, val) {
          return typeof val === "function" ? "[function]" : val;
        },
        4
      );
    });
  }
}

module.exports = debug;
