import pino from "pino";
import { lstatSync } from "fs";
import { lstat, readdir } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";

const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

const xmrBinariesPath = join(__dirname, "../../src/assets/monero");
const walletPath = join(__dirname, "../../.usr/xmr_wallets");

const getVersion = (folder: string) => {
  const match = folder.match(/-v(\d*(.([\d]+))*)/);
  return match ? match[1] : "0";
};

const getName = (file: string) => file.replace(/(\.\w+)+$/, "");

function compareVersions(a: string, b: string): number {
  const a_major = parseInt(a.split(".")[0] || "0");
  const b_major = parseInt(b.split(".")[0] || "0");
  if (a_major === b_major)
    return !a.includes(".")
      ? 0
      : compareVersions(
          a.split(".").slice(1).join("."),
          b.split(".").slice(1).join(".")
        );
  return b_major - a_major;
}

readdir(xmrBinariesPath).then(async (folders) => {
  const directories = folders
    .filter((file) => lstatSync(join(xmrBinariesPath, file)).isDirectory())
    .sort((a, b) => compareVersions(getVersion(a), getVersion(b)));

  if (directories.length == 0) {
    logger.fatal(
      "failed to start monerod, unable to locate latest cli folder in %s",
      xmrBinariesPath
    );
    process.exit(0);
  }

  const latest = directories[0];
  const dir = join(xmrBinariesPath, latest);

  logger.debug("found installation in %s", dir);
  logger.info("starting monerod v%s", getVersion(latest));

  const files = await readdir(dir);
  const monerod = files.find((f) => getName(f) === "monerod");
  const moneroWallet = files.find((f) => getName(f) === "monero-wallet-rpc");

  if (!monerod || !moneroWallet) {
    logger.fatal(
      "monerod or monero-wallet-rpc executable missing from %s",
      dir
    );
    process.exit(0);
  }

  const monerodAddress =
    process.env.MONEROD_RPC_ADDRESS ||
    `http://${process.env.MONEROD_RPC_HOST || "localhost"}:${
      process.env.MONEROD_RPC_PORT || "38081"
    }`;

  const moneroWalletAddress =
    process.env.MONERO_WALLET_RPC_ADDRESS ||
    `http://${process.env.MONERO_WALLET_RPC_HOST || "localhost"}:${
      process.env.MONERO_WALLET_RPC_PORT || "28088"
    }`;

  const monerodPort = new URL(monerodAddress).port || "38081";
  const moneroWalletPort = new URL(moneroWalletAddress).port || "28088";

  const monerodArgs = [
    "--stagenet",
    "--rpc-bind-port",
    monerodPort,
    "--allow-local-ip",
  ];
  const monerodProc = spawn(join(dir, monerod), monerodArgs, {
    stdio: "inherit",
  });

  logger.debug("spawn %s %s", monerod, monerodArgs.join(" "));

  const moneroWalletArgs = [
    "--stagenet",
    "--rpc-bind-port",
    moneroWalletPort,
    "--wallet-dir",
    walletPath,
    "--disable-rpc-login",
    "--trusted-daemon",
    "--daemon-port",
    monerodPort,
  ];
  const moneroWalletProc = spawn(join(dir, moneroWallet), moneroWalletArgs, {
    stdio: "inherit",
  });

  logger.debug("spawn %s %s", moneroWallet, moneroWalletArgs.join(" "));
});
