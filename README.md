<h1 align="center">
  <a href="https://github.com/ddupont808/yam"><img src="https://raw.githubusercontent.com/ddupont808/yam/main/docs/assets/yam_logo.png" alt="Logo" width="370"></a>
  <br>
  <span>yam</span>
  <br>
  <br>
</h1>

<h4 align="center">
an open network for secure, decentralized e-commerce

built on <a href="https://scuttlebutt.nz/">Secure Scuttlebutt (SSB)</a>, <a href="https://www.getmonero.org/">Monero</a>, and <a href="https://www.torproject.org/">Tor</a>

</h4>

<p align="center">
  <a href="https://github.com/ddupont808/yam/blob/master/LICENSE.txt">
      <img src="https://img.shields.io/badge/license-AGPLv3.0-blue.svg?style=flat" alt="License">
  </a>
  <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/nodejs-v16.17.0-blue.svg?style=flat" alt="nodejs">
  </a>
  <a href="https://www.electronjs.org/">
      <img src="https://img.shields.io/badge/electron-v20.0.3-blue.svg?style=flat" alt="electron">
  </a>
  <a href="https://github.com/ddupont808/yam/issues">
    <img src="https://img.shields.io/badge/issues-missing-red?style=flat" alt="Issues">
  </a>
  <a href="https://travis-ci.org/ddupont808/yam">
      <img src="https://img.shields.io/badge/build-missing-red?style=flat" alt="Build Status">
  </a>
  <a href="https://github.com/ddupont808/yam/pulls">
      <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="Contributing">
  </a>
</p>

---

**⚠ This implementation is NOT FINISHED YET. ⚠**

This project provides an open network for building your own distributed, peer-to-peer marketplace.

### Main Features

 - All communications and transactions are routed through **Tor** and **Monero**, to preserve your privacy

 - The network is **peer-to-peer**: orders placed are networked through people only, there is no central authority.

 - Orders are **non-custodial**: The yam platform provides arbitration in case something goes wrong during the trade, but we will never have access to your funds.

 - There is **no token**: No special token is needed to use the network. Transactions are secured by non-custodial multisignature transactions on the Monero network.

<p align="center">
<br />
<a href="#roadmap">💜 If you want to support this project, please consider donating or volunteering bandwidth 💜</a>
</p>
<br/>

# Project Status

**⚠ This implementation is NOT FINISHED YET. ⚠**

We are still working on creating a live test network that will use Monero's stagenet for testing. To help out, see [the instructions to build yam and connect to a local test network](https://github.com/ddupont808/yam/blob/main/docs/installing.md). This project is still very much in development, expect major changes in the protocol that may break compatibility with previous local test networks.

Main repositories:
 - [yam](#) - This repository, the core of yam
 - yam-ui - A proof-of-concept web ui, it will be refactored out of `src/plugins/site`

If you wish to help, take a look at the repositories above and look for open issues.

# Motivation

There were a few motivators for creating this project:

 1. Developing a project that prioritizes both **privacy** and **performance** to the greatest extent, as a deep-dive into highly scalable and secure system development.

 2. Implementing the latest research towards creating my own peer-to-peer distributed network.

 3. Investigating existing distributed networks/protocols (SSB, XMR, and Tor) and their potential for practical applications.

# Running a local yam test network

See [docs/installing.md](https://github.com/ddupont808/yam/blob/main/docs/installing.md)

# Contributing to yam

See the [developer guide](https://github.com/ddupont808/yam/blob/main/docs/developer-guide.md) to get started developing for yam.

See [docs/CONTRIBUTING.md](https://github.com/ddupont808/yam/blob/main/docs/CONTRIBUTING.md) for our styling guides.

If you are unable to contribute code, you can become a sponsor and [donate to the project](#support).

# Support

Please consider supporting us by donating to the project so we have the resources to bring yam to life. 

Once the network is ready, the best way to support it will be hosting your own node.

### Monero

`87She2WxtcKYqFcuwzqd8QdpVz45myWVHTwe68Uz7agvcGYNNHdafcGHCsUzXQy6n3aaku1T4eamN3TdYyGvmqtZRnyDsrc`

![](https://raw.githubusercontent.com/ddupont808/yam/main/docs/assets/qrcodexmr.png | width=256)

### Bitcoin

`3JVzbGzSNk4ArkjYV5wU6RtCbKWKuH8EoR`

![](https://raw.githubusercontent.com/ddupont808/yam/main/docs/assets/qrcodebtc.png | width=256)

<!-- Uncomment this once a live test or prod network is ready -->
<!-- The `yam` project does not use an existing peer-to-peer network, meaning it relies on volunteers like you to donate bandwidth and host the network. **Please consider running an instance of yam on your machine.** This will allow you to help us build a network that is:

 - fast and reliable
 - less centralized
 - more robust against attacks
 - more stable against outages
 - safer for its users

Running a `yam` node does not require running an instance of `monerod`, but if you can also spare the hard drive space, the network would be able to perform proof-of-burn checks much faster if ran people were to run full `monerod` nodes alongside `yam`. -->