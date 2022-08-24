// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../../../types";

@plugin("0.0.1")
class orders {
  private record: any;

  constructor(api: Stack, _opts: any) {
    const { web } = api;

    web.get("/order/:orderId", (req: any, reply: any) => {
      let id = req.params.orderId;
      api.item.read(id, (err: any, item: any) => {
        reply.view("views/order.ejs", {
          unit: "$",
          item,
        });
      });
      return reply;
    });

    web.get("/orders", function (req, reply) {
      const items = api.item.list({
        limit: 10,
        orderBy: "time",
        descending: true,
      });

      items.then((items) => {
        reply.view("views/orders.ejs", {
          user: (req as any).session.get("user"),

          unit: "$",
          items,
        });
      });

      return reply;
    });
  }
}

module.exports = orders;
