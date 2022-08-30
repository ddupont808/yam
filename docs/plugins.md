# Plugins

The core of yam is built upon [secret-stack](https://github.com/ssbc/secret-stack), providing a framework that uses [muxrpc](https://github.com/ssbc/muxrpc) to provide an RPC interface for peers, and [multiserver](https://github.com/ssbc/multiserver) so peers can authenticate and call rpc functions over multiple protocols.

Nearly all core code of yam is implemented via a plugin stack that allows you to
 - add new protocols to multiserver 
 - add muxrpc methods
 - use [ssb-db2](https://github.com/ssbc/ssb-db2) to persist state
 - use [ssb-conn](https://github.com/ssbc/ssb-conn) to manage peer connections
 - write code that uses local functions or call muxrpc methods on your own node or others
 - hook lifecycle or other events to add any extra functionality you want

New plugins should be added to `src/plugins`, and should be written as [decorated](https://gitlab.com/staltz/secret-stack-decorators) classes.

For more information on creating plugins, refer to [secret-stack/PLUGINS.md](https://github.com/ssbc/secret-stack/blob/main/PLUGINS.md) and [secret-stack-decorators/readme.md](https://gitlab.com/staltz/secret-stack-decorators/-/blob/master/readme.md)

**Note that since yam is still under heavy development, a new plugin system may be adopted with a focus on Typescript.**