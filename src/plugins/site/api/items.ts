// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../../../types";
import { ItemDetails } from "../../item";

const fs = require("fs");
const util = require("util");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);

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

    web.post("/sell", async (req: any, reply: any) => {
      const parts = req.parts();
      const fields: Record<string, string> = {};
      for await (const part of parts) {
        if (part.file) {
          await pump(part.file, fs.createWriteStream("tmp/" + part.filename));
        } else {
          api.logger.debug("%s = %s", part.fieldname, part.value);
          fields[part.fieldname] = part.value;

          // console.log(part);
        }
      }

      const item: ItemDetails = {
        title: fields["title"],
        description: fields["desc"],
        paymentMethods: [fields["payment[]"]],
        category: fields["category"],
        unit: fields["unit"],
        currency: fields["currency"],
        quantity: [
          {
            name: fields["quantity[]"],
            price: parseFloat(fields["total[]"]),
          },
        ],
        shipping: [
          {
            name: fields["shipping_name"],
            price: parseFloat(fields["shipping_cost"]),
          },
        ],
        stock: parseInt(fields["stock"]) || -1,
        origin: fields["origin"],
        destination: fields["destination"],
        images: [
          "https://i.etsystatic.com/26903548/r/il/56a6e4/2763703080/il_340x270.2763703080_92xy.jpg",
        ],
      };

      api.item.create(item, (err: any, data: any) => {
        if (err) api.logger.error(err);
        else {
          // api.logger.debug(data);
        }
      });

      reply.send();
    });
  }
}

module.exports = items;
