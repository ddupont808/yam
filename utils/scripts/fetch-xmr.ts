import pino from "pino";
import fetch from "node-fetch";
import yauzl, { ZipFile } from "yauzl";
import crypto from "crypto";
import * as openpgp from "openpgp";
import { existsSync, createWriteStream } from "fs";
import { mkdir, writeFile, readFile, readdir, access } from "fs/promises";
import { sep, join, PlatformPath } from "path";
import { platform, arch } from "process";
import { release, tmpdir } from "os";
import { promisify } from "util";
import { dir } from "console";

const logger = pino({
  level: "debug",
});

const xmrBinariesPath = join(__dirname, "../../src/assets/monero");
const xmrKeyPath = join(__dirname, "../gpg_keys/");
const xmrHashUri = "https://web.getmonero.org/downloads/hashes.txt";
const xmrDownloadsUri = "https://downloads.getmonero.org/cli/";

const logHelpAndExit = () => {
  console.log(
    "\n\nThe latest Monero CLI release can be manually downloaded from https://www.getmonero.org/downloads/#cli, we strongly advise you verify their SHA256 hashes via the GPG-signed list at https://web.getmonero.org/downloads/hashes.txt"
  );
  console.log(
    "Alternatively, compile Monero from source: https://github.com/monero-project/monero#compiling-monero-from-source\n"
  );

  console.log(
    "To manually install the latest release, extract the archive and place the contained folder directly into %s",
    xmrBinariesPath
  );
  console.log(
    "If done correctly, the path to your monerod executable should look similar to the following: %s",
    join(xmrBinariesPath, "/monero-x86_64-[os]-mingw32-v[version]/monerod\n\n")
  );

  process.exit(0);
};

const downloadAndVerify = async (
  url: string,
  fileName: string,
  hash: string
) => {
  logger.info("Downloading %s...", url);
  const response = await fetch(url);
  const buffer = await response.buffer();

  const hashSum = crypto.createHash("sha256").update(buffer).digest("hex");
  logger.info("Download complete (computed hash = %s)", hashSum);

  if (hash !== hashSum) {
    logger.fatal("Hash mismatch! Aborting...");
    logger.fatal("hashes.txt   : %s", hash);
    logger.fatal("download hash: %s", hashSum);

    logHelpAndExit();
  } else {
    logger.debug("Computed hash matches signed hash");
  }

  return { fileName, hashSum, buffer };
};

(async () => {
  logger.info(`Loading local gpg_keys copy from %s`, xmrKeyPath);
  logger.warn(
    "The gpg_keys directory was cloned to this repo at 8/28/2022 from the original Monero repo: https://github.com/monero-project/monero/tree/master/utils/gpg_keys"
  );
  logger.warn(
    "The keys are used to verify the Monero binaries fetched by this script have a valid PGP signature from a trusted member of the Monero project. Do not add any keys to gpg_keys that did not come from the Monero source repo."
  );

  const gpg_keys = await readdir(xmrKeyPath);
  const verificationKeys: openpgp.Key[] = [];
  const keyOwners: Record<string, string> = {};
  for (const keyFile of gpg_keys) {
    const key = await openpgp.readKey({
      armoredKey: await readFile(join(xmrKeyPath, keyFile), {
        encoding: "utf-8",
      }),
    });

    keyOwners[key.getKeyID().toHex()] = keyFile;
    verificationKeys.push(key);
  }

  logger.info(
    `%d keys loaded, fetching latest %s`,
    gpg_keys.length,
    xmrHashUri
  );
  const xmrHashes = await (await fetch(xmrHashUri)).text();

  const signedMessage = await openpgp.readCleartextMessage({
    cleartextMessage: xmrHashes,
  });

  logger.info(
    "SHA256 sums of Monero binaries downloaded, attempting to verify the PGP signature against gpg_keys/*"
  );

  const verifyResults = await signedMessage.verify(verificationKeys);

  let verified = false;
  for (const result of verifyResults) {
    try {
      await result.verified; // throws on invalid signature
      const signer = result.keyID.toHex();
      logger.info(
        "%s successfully verified. A valid signature by GPG public key gpg_keys/%s (%s) was verified using OpenPGP.js",
        xmrHashUri.split("/").pop(),
        keyOwners[signer],
        signer
      );
      verified = true;
    } catch (e: any) {
      logger.error("Signature could not be verified: " + e.message);
    }
  }

  if (!verified) {
    logger.fatal(
      "Failed to verify the Monero releases, no valid signature could be found. Make sure your gpg_keys folder is up-to-date with the original Monero source repo. Aborting..."
    );
    logHelpAndExit();
  }

  const text = signedMessage.getText();
  const hashMatch = text.match(/## CLI\s+([^]*?)\s+#/);

  if (hashMatch) {
    const files = Object.fromEntries(
      hashMatch[1].split("\n").map((line) => [
        line.split("  ")[1].match(/monero-([^]*?)-v/)![1],
        {
          hash: line.split("  ")[0].trim(),
          file: line.split("  ")[1].trim(),
          version: line.match(/-(v[\d.]*?)\.[\D]/)![1],
        },
      ])
    );

    // const platform = process.platform; // 'aix', 'darwin', 'freebsd','linux','openbsd', 'sunos', and 'win32'
    // const arch = process.arch; // 'arm', 'arm64', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', and 'x64'
    const is64Bit = ["arm64", "ppc64", "x64", "s390x"].includes(arch);
    const isArm = ["arm", "arm64"].includes(arch);

    logger.debug(
      "os.platform = %s, os.arch = %s, is64Bit = %s, isArm = %s",
      platform,
      arch,
      is64Bit,
      isArm
    );

    const platformMap: Record<string, string> = {
      win32: "win",
      darwin: "mac",
      freebsd: "freebsd",
      linux: "linux",
      android: "android",
    };

    let moneroBinary = `${platformMap[platform]}-${
      isArm ? (is64Bit ? "armv8" : "armv7") : is64Bit ? "x64" : "x86"
    }`;

    if (Object.keys(files).includes(moneroBinary)) {
      const binary = files[moneroBinary];
      logger.info(
        "Fetching release binary %s (signed hash = %s)",
        binary.file,
        binary.hash
      );

      const releaseUri = xmrDownloadsUri + binary.file;
      const { fileName, buffer } = await downloadAndVerify(
        releaseUri,
        binary.file,
        binary.hash
      );

      logger.info("Extracting...");

      const archive = await promisify(
        (buffer: Buffer, cb: (err: Error | null, res: yauzl.ZipFile) => void) =>
          yauzl.fromBuffer(buffer, { lazyEntries: true }, cb)
      )(buffer);

      logger.info(
        "Decompressing %d bytes (%d entries)...",
        archive.fileSize,
        archive.entryCount
      );
      const openReadStream = promisify(archive.openReadStream.bind(archive));

      archive.readEntry();

      let topmostDirectory = xmrBinariesPath;

      let bytesWritten = 0;
      let directoriesCreated = 0;
      let filesCreated = 0;

      let filesSkipped = 0;

      archive.on("entry", async (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // directory file names end with '/'
          const directory = join(xmrBinariesPath, entry.fileName);
          if (join(directory, "..") == xmrBinariesPath)
            topmostDirectory = directory;

          logger.debug("Extracting %s", directory);
          if (existsSync(directory)) {
            if (topmostDirectory == directory) {
              logger.error(
                "An existing installation was already found at %s! Did you already install the latest release of Monero?",
                directory
              );
              logger.error(
                "Detected files will not be overwritten. To reinstall Monero, delete the existing folder and restart this script"
              );
              logger.error(
                "You may ignore this error if you are trying to fetch missing files."
              );
            }
            // logger.debug("Directory already exists (%s)", directory);
          } else {
            await mkdir(directory);
            directoriesCreated++;
          }

          archive.readEntry();
        } else {
          const file = join(xmrBinariesPath, entry.fileName);
          // logger.debug("Extracting file %s", file);

          if (existsSync(file)) {
            logger.warn("Skipping %s (file already exists)", entry.fileName);
            filesSkipped++;
            archive.readEntry();
          } else {
            const zipStream = await openReadStream(entry);
            const outStream = createWriteStream(file);
            outStream.on("close", () => {
              logger.info("Wrote %d bytes to %s", outStream.bytesWritten, file);
              bytesWritten += outStream.bytesWritten;
              filesCreated++;
              archive.readEntry();
            });
            zipStream.pipe(outStream);
          }
        }
      });

      archive.on("end", () => {
        logger.debug(
          "Extracted %d files and %d directories, %d total bytes written",
          filesCreated,
          directoriesCreated,
          bytesWritten
        );
        if (filesSkipped > 0)
          logger.debug("%d existing files were skipped", filesSkipped);

        logger.info(
          "Monero %s successfully installed at %s",
          binary.version,
          topmostDirectory
        );

        process.exit(1);
      });
    } else {
      logger.fatal(
        "Could not automatically find the binaries for your current OS! Aborting..."
      );
      logger.debug(files);

      logHelpAndExit();
    }
  }
})();
