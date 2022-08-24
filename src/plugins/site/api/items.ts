// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../../../types";

@plugin("0.0.1")
class items {
  private record: any;

  constructor(api: Stack, _opts: any) {
    const { web } = api;

    web.get("/checkout/:itemId", async (req: any, reply: any) => {
      let id = req.params.itemId;
      api.item.read(id, (err: any, item: any) => {
        reply.embed("components/checkout.ejs", {
          unit: "$",
          i: id,
          item,
        });
      });
      return reply;
    });

    web.get("/item/:itemId", (req: any, reply: any) => {
      let id = req.params.itemId;
      api.item.read(id, (err: any, item: any) => {
        reply.view("views/item.ejs", {
          unit: "$",
          item,
        });
      });
      return reply;
    });
  }
}

module.exports = items;
