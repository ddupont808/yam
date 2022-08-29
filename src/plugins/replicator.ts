import { autoUpdater } from "electron";
import pull from "pull-stream";
import { muxrpc, plugin } from "secret-stack-decorators";
import { Stack } from "../types";
// const bipf = require("bipf");

// const butt2Methods = require("ssb-ebt/formats/buttwoo");

@plugin("0.0.1")
class replicator {
  constructor(api: any, opts: any) {
    api.web.get("/p2p", async (req: any, reply: any) => {
      return JSON.stringify(
        {
          address: api.address(),
          api: api,
          manifest: api.getManifest(),
        },
        function (key, val) {
          return typeof val === "function" ? "[function]" : val;
        },
        4
      );
    });

    // api.ebt.registerFormat(butt2Methods);

    api.db.onMsgAdded((ev: any) => {
      // const msg = ev.kvt;
      // msg.value = bipf.decode(msg.value);
      api.logger.debug("Message added: %O", ev.kvt);
    });

    api.logger.info("id = %s", api.id);

    // api.connect(
    //   "net:localhost:6959~shs:rRaP8k0w3svFhicyBIYJiOHl4DgWysXeFW78cnMEbfU=",
    //   async (err: any, ssb: any) => {
    //     if (err) throw err;
    //     console.log(ssb);

    //     // console.log(await ssb.replicator.hello());
    //   }
    // );

    // api.conn.connect(
    //   "net:localhost:6959~shs:rRaP8k0w3svFhicyBIYJiOHl4DgWysXeFW78cnMEbfU=",
    //   {},
    //   async (err: any, ssb: any) => {
    //     if (err) api.logger.fatal(err);
    //     else {
    //       // console.log(ssb);

    //       console.log(
    //         await ssb.xmr.verifyBurn(
    //           "45b036a3627e05a28aa1a21f92a60683fcf114599dcf485a2bc454b0ad94624b",
    //           "f0ee3dd71f244cc91be89b592042cf0a310bc54b094741eba4aa4e270add520e"
    //         )
    //       );
    //     }
    //   }
    // );

    // pull(api.conn.peers(), pull.drain(api.logger.debug));
    // pull(api.conn.stagedPeers(), pull.drain(api.logger.info));
  }
}

module.exports = replicator;
