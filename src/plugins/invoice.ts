// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import { plugin, muxrpc, local } from "secret-stack-decorators";
import { Stack } from "../types";
import pull from "pull-stream";
import filter from "pull-stream/throughs/filter";

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
class invoice {
  /**
   * 1) buyer: send invoice request (make_multisig [reqiores 1 of 3])
   * 2) escrow auto makes multisig
   * 2) seller: receive invoice request (make_multisig -> finalize_multisig)
   * 3) buyer: receive invoice request AGAIN (finalize_multisig -> send xmr)
   */
  private record: any;

  constructor(api: Stack, _opts: any) {
    const spec = {
      type: "order",
      props: {
        itemKey: Overwrite(),
        txProof: Overwrite(),
      },
    };

    this.record = new Crut(api, spec);
  }
}
