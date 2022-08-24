// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../types";

const { where, and, type, key, toCallback } = require("ssb-db2/operators");

export interface ItemDetails {
  title: string;
  description: string;
  unit: string;
}

const Crut = require("ssb-crut");
const Overwrite = require("@tangle/overwrite");
const SimpleSet = require("@tangle/simple-set");

const seperator = "\u200b";

let record: any;

function dummyFillItem(item: any) {
  return {
    author: "squidcode",
    installs: "1.2k",
    rating: "4.5",
    reviews: "1,234",
    unit: "item",
    key: "error",
    quantity: [
      {
        name: "10",
        price: "10.00",
      },
      {
        name: "20",
        price: "15.00",
      },
      {
        name: "30",
        price: "20.00",
      },
    ],
    shipping: [
      {
        name: "USPS Priority",
        price: "5.00",
      },
      {
        name: "USPS First Class",
        price: "10.00",
      },
      {
        name: "USPS Firstest Class",
        price: "50.00",
      },
    ],
    image:
      "https://i.etsystatic.com/26903548/r/il/56a6e4/2763703080/il_340x270.2763703080_92xy.jpg",
    ...item,
  };
}

@plugin("0.0.1")
class item {
  constructor(api: Stack, _opts: any) {
    const spec = {
      type: "item",
      props: {
        title: Overwrite(),
        description: Overwrite(),
        unit: Overwrite(),
      },
    };

    console.log("item initialized");
    record = new Crut(api, spec);
  }

  @local()
  async list(opts: {
    limit?: number;
    filter?: (item: any) => boolean;
    orderBy?: String;
    descending?: boolean;
    startsFrom?: string;
    tombstoned?: boolean;
    read?: (msg: any, cb: any) => any;
  }) {
    return new Promise((resolve, reject) => {
      record.list(opts, (err: any, items: any) => {
        resolve(items.map((item: any) => dummyFillItem(item))); // verify this
      });
    });
  }

  @muxrpc("async")
  create = (details: ItemDetails, callback: any) =>
    record.create(details, callback);

  @muxrpc("async")
  read = (id: any, callback: any) => {
    return record.read(id, (err: any, item: any) => {
      if (err) {
        console.log("failed to fetch id " + id);
        return callback(err, dummyFillItem({}));
      }
      return callback(null, dummyFillItem(item));
    });
  };

  @muxrpc("async")
  update = (id: any, details: ItemDetails, callback: any) =>
    record.update(id, details, callback);

  @muxrpc("async")
  delete = (id: any, callback: any) => record.delete(id, callback);
}

module.exports = item;
