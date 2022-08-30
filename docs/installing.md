# Set up environment

These are the steps needed to build yam and test it on our test network or locally.

## Installing Dependencies

The only dependency is **Node.js v16.17.0 LTS**, newer Node.js releases are not currently compatible with some libraries. The next steps will automatically download and verify the latest Monero and Tor binaries.

Window, macOS, Linux: Get the [Node.js installer](https://nodejs.org/dist/v16.17.0/node-v16.17.0-x64.msi) direct from the https://nodejs.org/ site

Alternatively:
```sh
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install git nodejs

# Using Debian, as root
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install git nodejs

# To compile and install native modules, you may also need to install build tools:
sudo apt-get install build-essential
```

### Building from the source

```sh
# Clone the repo and navigate to the root of the repository
$ git clone https://github.com/ddupont808/yam
$ cd yam

# Install the project dependencies
$ npm install

# Download and automatically verify the latest Monero binaries
$ npm run setup:monero
```

## Run the live test network

The live test network is not yet ready.

## Run a local test network

> **⚠ Tor integration has not yet been added, but the current build will still sync with the Monero stagenet network directly through IPv4. Every other connection (`monerod`, `monero-wallet-rpc`, and other `yam` nodes) is restricted to `localhost` for the time being. Until Tor integration is done, you can still [configure monerod to use Tor yourself](https://github.com/monero-project/monero#using-tor), use [TailsOS](https://tails.boum.org/), or [setup your own private Monero testnet network](https://github.com/moneroexamples/private-testnet) ⚠**

If you want to try yam, you can create a local yam network. This local network will still use the Monero stagenet for transactions, so we recommend using a [stagenet faucet](https://community.rino.io/faucet/stagenet/) to put funds in your wallet for testing.

Note development is still ongoing, expect to encounter bugs and a loss of your local yam database when major changes are made.

Starting your first yam node:

```sh
# Start the monero daemon, only if it is not already running.
$ npm run spawn:monero

# Start a yam node in development mode
# This also serves a muxrpc server and a http server with a UI
$ npm run dev
```

### Configuration

Currently the development nodes use environment variables for configuration. These can be loaded from `.env` or changed via terminal. These will be loaded by both `npm run dev` and `npm run spawn:monero`. All of these settings are optional and a full list of them can be found below:

```properties
# Configure the port of the experimental web UI
YAM_HTTP_PORT=8000
# Set the logging level, accepted values are: trace, debug, info, warn, error, fatal, silent
YAM_LOGGER_LEVEL=trace 

# Set the the monerod RPC port, default value is 38081
MONEROD_RPC_PORT=38081
# Set the hostname of your monerod instance, default value is localhost
MONEROD_RPC_HOST=localhost
# Set the RPC address of your monero-wallet-rpc instance, don't use with MONEROD_RPC_PORT or MONEROD_RPC_HOST since will override the values of both
MONEROD_RPC_ADDRESS=http://localhost:38681

# Set the the monero-wallet-rpc port, default value is 28088
MONERO_WALLET_RPC_PORT=28088
# Set the hostname of your monero-wallet-rpc instance, default value is localhost
MONERO_WALLET_RPC_HOST=localhost
# Set the RPC address of your monero-wallet-rpc instance, don't use with MONERO_WALLET_RPC_PORT or MONERO_WALLET_RPC_HOST since will override the values of both
MONERO_WALLET_RPC_ADDRESS=http://localhost:28088
```

### Running multiple nodes on the same device

To test the peer-to-peer aspect of your local network, start another yam node by running `npm run dev:tmp`

This is runs `npm run dev` in `tmp` with seperate keypairs (identities) and databases. This also ignores the environment variable `YAM_HTTP_PORT`.

When done, use `npm run clean` to delete the files created by the temp nodes.

### Using yam as a typescript module

> ⚠ Not yet implemented

Note that you will still need a `monerod` and `monero-wallet-rpc` node with RPC support to use yam.

```typescript
import yam from yam;

// start a secret-stack node with yam, you can extend the node with plugins (see docs/PLUGINS.md)
const stack = yam.node({

});

// start a fastify http server with the default ui
stack.web.listen(8080, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
```