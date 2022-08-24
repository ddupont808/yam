// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../../types";
import pull from "pull-stream";
import filter from "pull-stream/throughs/filter";
import { promisify } from "util";

const { where, and, type, key, toCallback } = require("ssb-db2/operators");

export interface InvoiceDetails {
  from: string;
  defaultDetails: string;
}

const Crut = require("ssb-crut");
const Overwrite = require("@tangle/overwrite");
const SimpleSet = require("@tangle/simple-set");

const seperator = "\u200b";

@plugin("0.0.1")
class site {
  private record: any;

  constructor(api: Stack, _opts: any) {
    const { web } = api;

    web.get("/sell", function (req, reply) {
      reply.view("views/sell.ejs");
    });

    web.get("/login", function (req, reply) {
      reply.view("views/login.ejs");
    });

    web.get("/", function (req, reply) {
      const items = api.item.list({
        limit: 10,
        orderBy: "time",
        descending: true,
      });

      items.then((items) => {
        reply.view("views/items.ejs", {
          user: (req as any).session.get("user"),

          unit: "$",
          categories: [
            "All",
            "Food",
            "Clothes",
            "Software",
            "Entertainment",
            "Other",
          ],
          items,
        });
      });

      return reply;
    });
  }
}

module.exports = site;
