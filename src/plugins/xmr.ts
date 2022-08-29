import { local, muxrpc, plugin } from "secret-stack-decorators";
import { Callback, FeedObject, Stack } from "../types";
import fetch from "node-fetch";
import path from "path";
import { promisify } from "util";
import crypto, { sign } from "crypto";
import { debug } from "console";
import assert from "assert";
const bipf = require("bipf");
const ssbKeys = require("ssb-keys");

export interface BurnMessage {
  type: "xmr/burn";
  height: number;
  data: string;
}

export interface BurnPayload {
  integratedAddress: string;
  paymentId: string;
  height: {
    count: number;
    status: string;
    untrusted: boolean;
  };
  keys: any;
  msg: any;
}

const monerojs = require("monero-javascript");
const { MoneroTxPriority } = monerojs;

const burnerAddress =
  "57yLi45TdSbKiJsASfx15NRSEizy4KjAVKgaSAZx4obd7US3R4FFtin16taVGMLvGtRXTygJY7EsMKULqneBDaF9HULNaMV";
const feeAmount = BigInt("30000000000"); // 0.03 / 1e-12;

const monerodAddress =
  process.env.MONEROD_RPC_ADDRESS ||
  `http://${process.env.MONEROD_RPC_HOST || "localhost"}:${
    process.env.MONEROD_RPC_PORT || "38081"
  }`;

const walletRpcAddress =
  process.env.MONERO_WALLET_RPC_ADDRESS ||
  `http://${process.env.MONERO_WALLET_RPC_HOST || "localhost"}:${
    process.env.MONERO_WALLET_RPC_PORT || "28088"
  }`;

@plugin("0.0.1")
class xmr {
  private readonly ssb: any;

  constructor(api: Stack, opts: any) {
    this.ssb = api;

    api.logger.info("Establishing connection to monero-wallet-rpc");

    // this.initializeWallet().then(async () => {
    //   // console.log(await this.getFeeAddress());
    //   // this.provePayment(
    //   //   "45b036a3627e05a28aa1a21f92a60683fcf114599dcf485a2bc454b0ad94624b",
    //   //   "f0ee3dd71f244cc91be89b592042cf0a310bc54b094741eba4aa4e270add520e"
    //   // );
    // });
  }

  @muxrpc("async", { anonymous: "allow" })
  public verifyBurn = async (
    txId: string,
    dataPayload: { height: number; data: string },
    signature: string,
    cb?: Callback<any>
  ) => {
    console.log("peer called verifyBurn");

    try {
      const message: BurnMessage = { type: "xmr/burn", ...dataPayload };
      const txProof = await this.check_tx_proof(txId, message, signature);

      console.log(txProof);

      assert(txProof.good, "burn not yet spendable");
      assert(BigInt(txProof.received) >= feeAmount, "burned amount too low");

      const txInfo = (await this.get_transactions([txId])).txs.find(
        (tx) => tx.tx_hash === txId
      );

      console.log(txInfo);

      cb?.(null, true);
    } catch (ex: any) {
      cb?.(ex.msg, null);
    }
  };

  @local()
  public generateBurnPayload = async () => {
    const keys = ssbKeys.generate(null, null, "buttwoo-v1");

    const height = await this.getHeight();
    const content: BurnMessage = {
      type: "xmr/burn",
      height: height.count,
      data: keys.id,
    };

    const address = await this.deriveIntegratedAddress(content);

    // buttwoo-v1
    const msg: any = await promisify(this.ssb.db.create)({
      feedFormat: "buttwoo-v1",
      content,
      keys,
      tag: 0,
      // encoding: "bipf",
    });

    // msg.value = bipf.decode(msg.value);

    const result: BurnPayload = {
      integratedAddress: address.integrated_address,
      paymentId: address.payment_id,
      height,
      keys,
      msg,
    };

    return result;
  };

  async deriveIntegratedAddress(
    burnContent: BurnMessage
  ): Promise<{ integrated_address: string; payment_id: string }> {
    const paymentId = this.derivePaymentId(burnContent);
    const response = await fetch(path.join(walletRpcAddress, "json_rpc"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "make_integrated_address",
        params: {
          standard_address: burnerAddress,
          payment_id: paymentId,
        },
      }),
    });

    return (await response.json()).result;
  }

  derivePaymentId(burnContent: BurnMessage) {
    const heightBuffer = Buffer.alloc(8);
    heightBuffer.writeBigUInt64LE(BigInt(burnContent.height));

    const paymentId = crypto
      .createHash("sha512")
      .update(heightBuffer)
      .update(burnContent.data)
      .digest("hex")
      .substring(0, 16);

    return paymentId;
  }

  async initializeWallet() {
    await (
      await fetch(path.join(walletRpcAddress, "json_rpc"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "0",
          method: "close_wallet",
        }),
      })
    ).json();

    return await (
      await fetch(path.join(walletRpcAddress, "json_rpc"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "0",
          method: "open_wallet",
          params: {
            filename: "sample_stagenet_wallet_rpc_viewonly",
          },
        }),
      })
    ).json();
  }

  async check_tx_proof(
    txId: string,
    data: BurnMessage,
    signature: string
  ): Promise<{
    confirmations: number;
    good: boolean;
    in_pool: boolean;
    received: number;
  }> {
    const address = this.deriveIntegratedAddress(data);

    const response = await fetch(path.join(walletRpcAddress, "json_rpc"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "check_tx_proof",
        params: {
          txid: txId,
          address,
          message: data.data,
          signature,
        },
      }),
    });

    return (await response.json()).result;
  }

  async get_tx_proof(txId: string, data: BurnMessage): Promise<string> {
    const address = this.deriveIntegratedAddress(data);

    const response = await fetch(path.join(walletRpcAddress, "json_rpc"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "get_tx_proof",
        params: {
          txid: txId,
          address,
          message: data.data,
        },
      }),
    });

    return (await response.json()).result.signature;
  }

  async check_tx_key(txId: string, txKey: string) {
    const response = await fetch(path.join(walletRpcAddress, "json_rpc"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "check_tx_key",
        params: {
          txid: txId,
          tx_key: txKey,
          address: burnerAddress,
        },
      }),
    });

    return await response.json();
  }

  async get_transactions(
    txs_hashes: string[],
    decode_as_json?: boolean,
    prune?: boolean
  ): Promise<{
    missed_tx?: string[];
    status: string;
    top_hash: string;
    txs: {
      as_hex: string;
      as_json: string;
      block_height: number;
      block_timestamp: number;
      double_spend_seen: boolean;
      in_pool: boolean;
      output_indices: number[];
      prunable_as_hex: string;
      prunable_hash: string;
      pruned_as_hex: string;
      tx_hash: string;
    }[];
    txs_as_hex: string[];
    [x: string]: any;
  }> {
    const response = await fetch(
      path.join(monerodAddress, "get_transactions"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txs_hashes,
          decode_as_json,
          prune,
        }),
      }
    );

    return response.json();
  }

  async getHeight(): Promise<{
    count: number;
    status: string;
    untrusted: boolean;
  }> {
    const response = await fetch(path.join(monerodAddress, "json_rpc"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "get_block_count",
      }),
    });

    const json = await response.json();
    return json.result;
  }
}

module.exports = xmr;
