// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { promisify } from "util";
import { Stack } from "../types";
import { BurnPayload } from "./xmr";

const {
  where,
  and,
  type,
  key,
  author,
  toCallback,
} = require("ssb-db2/operators");

export interface ItemDetails {
  title: string;
  description: string;
  category: string;
  unit: string;
  currency: string;
  quantity: {
    name: string;
    price: number;
  }[];
  shipping: {
    name: string;
    price: number;
  }[];
  stock?: number;
  origin: string;
  destination: string;
  images: string[];
  paymentMethods: string[];
}

@plugin("0.0.1")
class item {
  private readonly ssb: any;

  constructor(api: Stack, _opts: any) {
    this.ssb = api;
  }

  @local()
  list = async (opts: {
    limit?: number;
    filter?: (item: any) => boolean;
    orderBy?: String;
    descending?: boolean;
    startsFrom?: string;
    tombstoned?: boolean;
    read?: (msg: any, cb: any) => any;
  }) => {
    return new Promise((resolve, reject) => {
      this.ssb.db.query(
        where(type("item")),
        toCallback((err: any, items: any[]) => {
          resolve(
            items.map((i) => {
              return {
                key: i.key,
                ...(i.value.content as object),
              };
            })
          );
        })
      );
    });
  };

  @muxrpc("async")
  read = (id: any, callback: any) =>
    this.ssb.db.query(
      where(and(type("item"), key(id))),
      toCallback((err: any, items: any[]) => {
        if (items.length === 0) callback("item not found", {});
        else callback(null, { key: id, ...items[0].value.content.details });
      })
    );

  @muxrpc("async")
  create = async (details: ItemDetails, callback: Function) => {
    const burnPayload: BurnPayload = await this.ssb.xmr.generateBurnPayload();
    const { keys, integratedAddress, msg } = burnPayload;

    const itemMessage: any = await promisify(this.ssb.db.create)({
      feedFormat: "buttwoo-v1",
      content: {
        type: "item",
        details,
      },
      parent: msg.key,
      keys,
      tag: 0,
    });

    console.log(itemMessage);

    this.ssb.logger.info("New listing pending");
    this.ssb.logger.debug(
      "integratedAddress = %s, keys = %O",
      integratedAddress,
      keys
    );

    callback(null, burnPayload);
  };
}

module.exports = item;

// const Crut = require("ssb-crut");
// const Overwrite = require("@tangle/overwrite");
// const SimpleSet = require("@tangle/simple-set");

// const seperator = "\u200b";

// let record: any;

// function dummyFillItem(item: any) {
//   return Object.assign(item, {
//     author: "squidcode",
//     installs: "1.2k",
//     rating: "4.5",
//     reviews: "1,234",
//     unit: "item",
//     key: "error",
//     quantity: [
//       {
//         name: "10",
//         price: "10.00",
//       },
//       {
//         name: "20",
//         price: "15.00",
//       },
//       {
//         name: "30",
//         price: "20.00",
//       },
//     ],
//     shipping: [
//       {
//         name: "USPS Priority",
//         price: "5.00",
//       },
//       {
//         name: "USPS First Class",
//         price: "10.00",
//       },
//       {
//         name: "USPS Firstest Class",
//         price: "50.00",
//       },
//     ],
//     image:
//       "https://i.etsystatic.com/26903548/r/il/56a6e4/2763703080/il_340x270.2763703080_92xy.jpg",
//   });
// }

// @plugin("0.0.1")
// class item {
//   constructor(api: Stack, _opts: any) {
//     const spec = {
//       type: "item",
//       props: {
//         title: Overwrite(),
//         description: Overwrite(),
//         unit: Overwrite(),
//       },
//     };

//     console.log("item initialized");
//     record = new Crut(api, spec);
//   }

//   @local()
//   async list(opts: {
//     limit?: number;
//     filter?: (item: any) => boolean;
//     orderBy?: String;
//     descending?: boolean;
//     startsFrom?: string;
//     tombstoned?: boolean;
//     read?: (msg: any, cb: any) => any;
//   }) {
//     return new Promise((resolve, reject) => {
//       record.list(opts, (err: any, items: any) => {
//         resolve(items.map((item: any) => dummyFillItem(item))); // verify this
//       });
//     });
//   }

//   @muxrpc("async")
//   create = (details: ItemDetails, callback: any) =>
//     record.create(details, callback);

//   @muxrpc("async")
//   read = (id: any, callback: any) => {
//     return record.read(id, (err: any, item: any) => {
//       if (err) {
//         console.log("failed to fetch id " + id);
//         return callback(err, dummyFillItem({}));
//       }
//       return callback(null, dummyFillItem(item));
//     });
//   };

//   @muxrpc("async")
//   update = (id: any, details: ItemDetails, callback: any) =>
//     record.update(id, details, callback);

//   @muxrpc("async")
//   delete = (id: any, callback: any) => record.delete(id, callback);
// }

// module.exports = item;
