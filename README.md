<h1 align="center">
  <a href="https://github.com/ddupont808/yam"><img src="https://raw.githubusercontent.com/ddupont808/yam/main/src/assets/yam_logo.png" alt="Logo" width="370"></a>
  <br>
  <span>yam</span>
  <br>
  <br>
  <small>yet another market</small>
</h1>

<h4 align="center">a global, decentralized, and distributed e-commerce platform (built upon <a href="https://scuttlebutt.nz/">Secure Scuttlebutt</a>, <a href="https://www.getmonero.org/">Monero</a>, and <a href="https://www.torproject.org/">Tor</a>).</h4>

<p align="center">
  <a href="https://github.com/ddupont808/yam/blob/master/LICENSE.txt">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat" alt="License">
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

Welcome! `yam` is a project that aims to create a secure and decentralized marketplace. Cryptographic techniques ensure both buyer and seller protection from fraud and abuse, while keeping orders non-custodial and private. By default `yam`, will try to route all traffic through the Tor network.

`yam` can be used by developers as a [nodejs](#WIP) module, a [command line utility](#WIP), or via a [RPC](#api) interface. 

<p align="center">
<br />
<a href="#roadmap">💜 If you want to support this project, please consider donating or volunteering bandwidth 💜</a>
</p>
<br/>

---
### Table of Contents

[Usage](#usage) |
[Motivation](#motivation) |
[What does it do?](#what-does-it-do) |
[Concepts](#concepts) |
[Security](#security) | 
[Dispute Resolution](#dispute-resolution) | 
[API](#api) | 
[Support yam](#support-yam) | 
[Roadmap](#roadmap)

----
# Usage

> ⚠ For non-developers, we highly recommend using the [electron client](#WIP) over the web urls. The websites cannot provide true multisig orders nor many of security options bundled into the client. Using the client also also helps keep the `yam` network strong 💜💜💜

To start using the `yam` marketplace, we recommend [downloading the latest electron client from the from the Releases tab](https://github.com/ddupont808/yam/releases/latest).

Alternatively, we also provide a few websites and onion services that use the latest build of the client:

**Official mirrors:**
- https:// none yet . com /
- https:// still nothng . com /

**Official onion services:**
- https:// none yet but a veery longer url . onion /
- https:// none yet but an even longer url . onion /

### From Source

```BASH
# Clone the repo
$ git clone https://github.com/ddupont808/yam
$ cd yam

# Download and verify the latest monero cli binaries
$ npm run setup:monero

# Install the project dependencies
$ npm install
```

To start `yam` in development mode, run the following:
```BASH
# Start the monero daemon, only if it is not already running.
$ npm run spawn:monero

# Serve the web server in development mode at http://localhost:8000.
$ npm run dev
```

### For Developers
> ⚠ Not yet implemented
```typescript
import yam from yam;

// start ssb node with the default plugin stack
const stack = yam.node({});

// host a marketplace at http://127.0.0.1:8080
stack.web.listen(8080, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
```

# Motivation


**The project has a few purposes, mainly driven by an interest in peer-to-peer networks:**
 1. Make a fun and functional app that allows anyone to sell and purchase anything anywhere in the world. (ideally, said anythings should be legal)

 2. Challenge myself with designing autonomous, decentralized, and distributed networks that are resistant to attacks.

 3. See how far I can push the performance of nodejs web servers while only rendering HTML and CSS pages.

# What does it do?

`yam` is a global peer-to-peer network built upon the [Secure Scuttlebutt (SSB)](https://scuttlebutt.nz/) offline-first gossip protocol. Users can place orders, view feedback left by other customers, post listings to their own feed, and more (see [API](#api)).

Due to the autonomous and decentralized nature of a gossip network, mechanisms must be put in place to prove if activity is valid. This important task is currently enforced via "proof-of-burn", an efficient consensus-mechanism with minimal energy waste (see [Security](#security)).

Proof systems ensure the `yam` experience stays stable and enjoyable, while also protecting you from bot spam creating listings or leaving product reviews.

`yam` is also bundled with a user-friendly web UI and a multi-user HTTP server. The web UI is still in very early development and will likely be moved into a seperate repo.

![](https://raw.githubusercontent.com/ddupont808/yam/main/src/assets/screenshot.png)

# Concepts

The following is an intro to the core concepts of SSB which make all of this possible:

## Identities

To participate in the network, you first need an identity.

 - SSB identities are Ed25519 keypairs, which is typically generated from a cryptographic hash function upon entering your username and password.
 - Every identity is associated with a feed, and some people may even have multiple identities to have more than one feed.
 - Your keypair can also be used to sign and encrypt messages, like PGP keys.

## Feeds

Scuttlebutt uses feeds as the main method of storing data.

 - Each peer holds its own local feed, storing the messages it has written in an append-only, linked list.
 - Peers also hold feeds of peers that they care about, enabling the propogation of messages beyond your local feed.
 - When you submit a message through the client, it is stored in at the end of your local feed.
 - Each message in a feed is digitally signed and includes a link to the previous message in the feed.

This setup allows you to easily verify a message's authenticity, and makes asking for feed upates easy (e.g. "can I have any messages after message 4 for @Joe's Feed").

## Replication

Replication is about sharing updates (messages added to feeds) with other peers. With the ability to share your local feed and feeds you follow with other peers, you now have a distributed network that can persist messages.

To prevent everyone from being fed gigabytes of trash, all replication is trust-based on the `yam` client.

 - You can follow friends or interesting peers, and you will automatically receive updates from them (such as seeing new listings or reviews from your favorite users).
 - When a peer follows another, they publicly announce the feed they just followed. Your client can arrange this into a follow graph, and may want to use this to expand their local network:
![](https://soapdog.github.io/scuttlebutt-protocol-guide/img/follow_graph.png)
 - Each `yam` client also uses a consensus-mechanism to determine if a message is valid, and if so, it stores the message and then shares it. Since every peer uses the same mechanism. A valid message is guaranteed to be stored on every peer, allowing for a [Distributed Database](#distributed-database). The consensus-mechanism is explained in the [Security](#security) section.

# Security

To prevent abuse and to keep the network secure, `yam` uses a consensus-mechanism to determine if a message should be propagated. The mechanism we have chosen is called "proof-of-burn".

## Proof-Of-Burn

Each `yam` node is integrated with the [Monero network (XMR)](https://www.getmonero.org/). A node can burn a negligible amount of XMR, a process which grants limited access to global network broadcasts by giving the node a temporary and unique "proof signature". 

Since `yam` is designed with privacy and performance in mind, there are few message types that can utilize these proofs.
 1. An XMR burn is required to create a new listing, these proofs expire slowly to allow vendors to make updates to their listings.
 2. An XMR burn is also required to purchase a listing, these proofs expire faster but give customers enough time to leave feedback.

## Distributed Database

`yam` wouldn't be a global e-commerce platform without anyone being able to synchronize with the same "main database" of all the products. This is where a communication protocol known as "gossip" comes in.

Using the proof-of-burn system, any peer that recieves a message from another peer can verify that the message is valid, and if so, it stores the message and then "gossips" by broadcasting the message to all nearby peers. This technique distributes messages like a viral infection, guaranteeing that every participant will eventually being storing a copy of the message. 

When a new peer joins the network, they can request a list of all the gossip they missed, allowing their client to quickly load all the latest listings and reviews. We now end up with a platform that is globally synchronized with complete decentralization and persistence, and since you can browse offline from your local copy, no advertiser can snoop on what products you're searching for and ordering.

## Orders


The order protocol works like this:

1. The customer sends the funds to a temporary wallet generated by their `yam` client.
2. A small amount of XMR is burned to create a proof-of-burn, this proof is used to store an private feed in the distributed database that can only be decrypted by the customer and the vendor. Usually this feed will be populated with some customer notes and multi-sig info.
3. When the vendor connects to the encrypted feed, they can then accept the order by moving the remaining funds into a 2-of-3 [multisig](#multisig) address.
4. The customer waits patiently and recieves their item. They finalize the order to give the vendor their funds, and then post a review to the distributed database using their initial proof-of-burn.

> ⚠ Immediately after the seller accepts the order, an "auto-finalize" timer starts. This timer counts down from 2 weeks. When the timer hits `00:00:00`, ***the order funds are automatically and irreverisbly released to the seller***. When your order arrives, you should **Finalize Early** so the seller receives the funds in a timely fashion. If you order has yet to arrive, you can **Extend Finalize Timer** during the last 48 hours to keep your funds protected in escrow. 

If you do not believe the seller is fulfilling their side of the order, you also have the option of [Dispute Resolution](#dispute-resolution). This process allows you to use an arbitrator to resolve order disputes, but it should be done pre-finalization to be eligible for a refund.

> **Note:** Unless the vendor accepts the order during step 3, the customer will be able to cancel their order and reclaim their funds at any time during this process, no arbitrator is needed for this action.

## Multisig

> ⚠ Multisig is opt-out. Multisig provides protection for both the buyer and the seller. Only disable multisig if you understand it places your funds at risk of theft.

During an order, the funds are temporarily locked in a [2-of-3 joint account](https://monerodocs.org/multisignature/). Funds in such an account have to be cosigned by two of the three owners to be spent. The cosigners will be the buyer, the seller, and a trusted third party escrow.

All included cases and their cosigners can be seen below:

| Escalated? | Buyer | Seller | Escrow    | Funds receipient | Purpose
|-----------|-------|--------|-----------|------------------|---------
|           |       | 🔑     | 🔑        | Seller          | Order auto-finalize timer expired
|           | 🔑    |        | 🔑        | Seller          | Buyer finalized early
|           | 🔑    | 🔑     |           | Buyer           | Seller cancelled & refunded order
| ✓         | 🔑    |        | 🔑        | Buyer           | Arbitrator called, sided with buyer
| ✓         |       | 🔑     | 🔑        | Seller          | Arbitrator called, sided with seller

# Dispute Resolution

Occasionally you may run into problems during an order. At this stage you may want to initiate dispute resolution.

This occurs as a 2-step process:

1. On the order page, click **Help with Order**. A private chat will be opened with the seller where you may try to get help directly. The seller may refund the order or find some other resolution.

2. If necessary, you can escalate the dispute. The escrow service will permit an arbitrator to cosign on their behalf, and the involved parties can discuss in a new private groupchat. If another discussion doesn't resolve the dispute, the arbitrator can choose to refund the order or finalize it early.

To make sure the appropriate party recieves the funds, we utilize a cryptocurrency feature called [multisig](https://monerodocs.org/multisignature/).

# API

TODO: add qRPC and a RPC API roadmap

# Support yam

The `yam` project does not use an existing peer-to-peer network, meaning it relies on volunteers like you to donate bandwidth and host the network. **Please consider running an instance of yam on your machine.** This will allow you to help us build a network that is:

 - fast and reliable
 - less centralized
 - more robust against attacks
 - more stable against outages
 - safer for its users

Running a `yam` node does not require running an instance of `monerod`, but if you can also spare the hard drive space, the network would be able to perform proof-of-burn checks much faster if ran people were to run full `monerod` nodes alongside `yam`.

💜 Another way to support this project is to consider donating 💜
`monero:87She2WxtcKYqFcuwzqd8QdpVz45myWVHTwe68Uz7agvcGYNNHdafcGHCsUzXQy6n3aaku1T4eamN3TdYyGvmqtZRnyDsrc`
`bitcoin:3JVzbGzSNk4ArkjYV5wU6RtCbKWKuH8EoR`

# Roadmap

TODO: roadmap

1) this page should be split up

the main page 