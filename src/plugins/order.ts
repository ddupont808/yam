import { muxrpc, plugin } from "secret-stack-decorators";
import { Stack } from "../types";

export interface OrderDetails {
  item: string;
  multisigInfo: string;
}

@plugin("0.0.1")
class order {
  constructor(api: Stack, opts: any) {
    api.web.get("/xmr.json", async (req, reply) => {
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

  @muxrpc("async")
  public prepare_order(details: OrderDetails, callback: Function) {}
}

module.exports = order;
