export default {
  port: 9999,
  local: false,
  logging: {
    level: "info",
  },
  /* crypto.randomBytes(32).toString('base64') */
  appKey: "1Q6TiTCRYn9dv1bOkLs9yvnQ76DBMk4I5M2H+VvGdW0=",
  caps: {
    shs: "8S6QZ+Q0m/vDk+HtOx4/8x8V9WhiOrHkRhB9bmOkq/4=",
    sign: "UzcwbmopyowLDYMAgqa90uahO3cVRf7WDJ0dxFOqwOk=",
    invite: "CU7u4rV7d0NveYEeqoxzh36PPvccb6WfO4yPk1giTd4=",
  },
  path: "./.usr",
  plugins: [
    // "ssb-master",
    "ssb-onion",

    "ssb-db",
    "ssb-db2",
    "ssb-db2/compat/db",
    "ssb-db2/compat/history-stream",
    "ssb-db2/compat/feedstate",
    "ssb-db2/compat/ebt",

    require("./plugins/identities"),

    require("./plugins/item"),

    require("./plugins/web"),

    require("./plugins/site"),
    require("./plugins/site/api/items"),
    require("./plugins/site/api/orders"),

    require("./plugins/debug"),

    // "ssb-db2/full-mentions",

    require("./plugins/xmr"),

    "ssb-blobs",
    "ssb-friends",
    "ssb-threads",
    "ssb-ebt",
    "ssb-replication-scheduler",
    "ssb-conn",
  ],
  master: [
    /**
     * Pubkeys of users who, if they connect to the ssb-server instance, are
     * allowed to command the primary user with full rights. Useful for remotely
     * operating a pub.
     */
  ],
  blobs: {
    /**
     * Enabling stingy mode will make your pub pretend it does not have blobs unless
     * it wants to push those blobs to the network. (because you have uploaded that file)
     */
    stingy: false,

    /**
     * When a peer asks for a blob, if you do not have it, then out of sympathy you'll ask
     * for it from your other peers. The value for sympathy determines how many hops away
     * from you that peer may be. Note that this depends on hops on the current network topology
     * Set this to 0 to never request a blob that someone else has asked for, unless you want it too.
     */
    sympathy: 3,

    /**
     * When you publish a blob, tell everyone about it, until at least this many peers have taken it.
     * Peer must have sympathy > 0
     */
    pushy: 3,

    legacy: false,
    max: 5242880, // 5 * 1024 * 1024 = 5MB
  },
  conn: {
    /**
     * Whether the CONN scheduler should start automatically as soon as the
     * SSB app is initialized. Default is `true`.
     */
    autostart: true,

    /**
     * Whether the CONN scheduler should look into the SSB database looking for
     * messages of type 'pub' and add them to CONN. Default is `true`.
     */
    populatePubs: false,
  },
  replicationScheduler: {
    /**
     * Whether the replication scheduler should start automatically as soon as
     * the SSB app is initialized. When `false`, you have to call
     * `ssb.replicationScheduler.start()` manually. Default is `true`.
     */
    autostart: true,

    /**
     * If `partialReplication` is an object, it tells the replication scheduler
     * to perform partial replication, whenever remote feeds support it. If
     * `partialReplication` is `null` (which it is, by default), then all
     * friendly feeds will be requested in full.
     *
     * Read more at https://github.com/ssb-ngi-pointer/ssb-replication-scheduler#configuring-partial-replication
     */
    partialReplication: null,
  },
  box2: {
    /*
        This variable is only for DMs. Group messages are always using box2.
        For DMs, the problem is figuring out if the other side supports 
        box2 or not. We expect to be able to use metafeeds to determine this
        in the future. For now you can use this variable to use box2 for all
        DMs, otherwise box1 will be used for all.
      */
    alwaysbox2: true,
  },
};
