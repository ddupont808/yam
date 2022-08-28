import { muxrpc, plugin } from "secret-stack-decorators";
import { Stack } from "../types";

const fetch = require("node-fetch");
const monerojs = require("monero-javascript");
const { MoneroTxPriority } = monerojs;

const burnerAddress =
  "57yLi45TdSbKiJsASfx15NRSEizy4KjAVKgaSAZx4obd7US3R4FFtin16taVGMLvGtRXTygJY7EsMKULqneBDaF9HULNaMV";
const feeAmount = monerojs.BigInteger("30000000000"); // 0.03 / 1e-12;

@plugin("0.0.1")
class xmr {
  walletRpc: any;

  constructor(api: Stack, opts: any) {
    (async () => {
      console.log(api);
      api.logger.info("Establishing connection to monero-wallet-rpc");

      /** https://github.com/monero-ecosystem/monero-javascript#sample-code */

      this.walletRpc = await monerojs.connectToWalletRpc(
        process.env.XMR_WALLET_RPC || "http://localhost:28088"
      );

      if (!(await this.walletRpc.isClosed())) await this.walletRpc.close();

      api.logger.info("Opening wallet");

      await this.walletRpc.openWallet(
        "sample_stagenet_wallet_rpc",
        "supersecretpassword123"
      );

      api.logger.info("Fetching address...");
      let address = await this.walletRpc.getPrimaryAddress(); // 555zgduFhmKd2o8rPUz...
      api.logger.info("Fetching balance...");
      let balance = await this.walletRpc.getBalance(); // 533648366742
      api.logger.info("Fetching txs...");
      let txs = await this.walletRpc.getTxs(); // get transactions containing transfers to/from the wallet

      api.logger.info(`fee address = ${address}, balance = ${balance}`);
      api.logger.info(txs);

      api.logger.info("wallet opened...");

      const ex =
        "5Hg1irtxEi7KiJsASfx15NRSEizy4KjAVKgaSAZx4obd7US3R4FFtin16taVGMLvGtRXTygJY7EsMKULqneBDaF9RQvUb3GHFybHmXZx7A";
      api.logger.info(
        (await this.walletRpc.decodeIntegratedAddress(ex)).toJson()
      );

      const integratedAddress = await this.walletRpc.getIntegratedAddress(
        burnerAddress
      );

      api.logger.info(integratedAddress.toJson());
    })();
  }

  getFeeAddress(): string {
    return burnerAddress;
  }

  async payFeeTest() {
    /** view only to main address? */
    /** one for fb, one for chnl   */

    /** Array< https://moneroecosystem.org/monero-javascript/MoneroTxWallet.html > */
    // consider doing a sweep_all instead?
    const txs: any[] = await this.walletRpc.createTxs({
      accountIndex: 0, // source account to send funds from
      destinations: [
        {
          address:
            "5Hg1irtxEi7KiJsASfx15NRSEizy4KjAVKgaSAZx4obd7US3R4FFtin16taVGMLvGtRXTygJY7EsMKULqneBDaF9RQvUb3GHFybHmXZx7A",
          amount: feeAmount,
        },
      ],
      priority: MoneroTxPriority.IMPORTANT,
      relay: true, // relay the transaction to the network
    });

    for (const tx of txs) {
      api.logger.info(tx.toJson());

      /** check_tx_key */
      const txId = tx.getHash();

      const proof = await this.getTxProof(txId);

      api.logger.info(`get_tx_proof = ${proof}`);

      const isValid = this.checkTxProof(txId, proof);
      api.logger.info(`check_tx_proof`);
    }
  }

  /**
   *
   * @param txHash Hash of a XMR burning transaction
   * @returns Proof string to pass to checkTxProof
   */
  async getTxProof(txHash: string): Promise<string> {
    return await this.walletRpc.getTxProof(txHash, this.getFeeAddress());
  }

  /**
   * @returns https://moneroecosystem.org/monero-javascript/MoneroCheckTx.html
   */
  async checkTxProof(txHash: string, signature: string): Promise<boolean> {
    const txProof = await this.walletRpc.checkTxProof(
      txHash,
      this.getFeeAddress(),
      undefined,
      signature
    );

    api.logger.info("Received fee proof!");
    api.logger.info(txProof.toJson());

    // https://github.com/monero-ecosystem/monero-javascript/blob/04a1df09247ac72eae7b5597dbfd616e24953227/src/main/js/common/biginteger.js#L762
    if (
      txProof.isGood() &&
      monerojs.BigInteger(txProof.getReceivedAmount()).compare(feeAmount) === 1
    ) {
      return true;
    }
    return false;
  }

  /*{
    

    api.web.get("/xmr.json", (req, reply) => {
      (async () => {
        const body = {
          jsonrpc: "2.0",
          id: "0",
          method: "get_payments",
          params: { payment_id: "60900e5603bf96e3" },
        };

        try {
          const response = await fetch("http://127.0.0.1:28088/json_rpc", {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          });
          api.logger.info(await response.text());
          const data = await response.json();

          api.logger.info(data);

          return reply.send(JSON.stringify(data, null, 5));
        } catch (ex: any) {
          reply.send(ex.toString());
        }
      })();

      return reply;
    });

  }*/
}

module.exports = xmr;
