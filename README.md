![Version](https://img.shields.io/npm/v/redie.svg)
![License](https://img.shields.io/github/license/Microsoft/redie.svg)
![Downloads](https://img.shields.io/npm/dt/redie.svg)

# Redie
Redis client focused on providing a delightful user experience.

![Redie Screenshot](screenshot.png)

# Usage
Connect to your Redis server by passing the following command-line arguments 
(or by using an `env.json` [painless-config](https://www.npmjs.com/package/painless-config) file, or setting their environment variable equivalents):
```
  -h      Hostname to connect to (defaults to 127.0.0.1 or REDIS_HOSTNAME environment variable)
  -p      Port to connect to (defaults to 6379 (non-TLS), 6380 (TLS), or REDIS_PORT environment variable)
  -a      Password to use to connect (defaults to REDIS_PASSWORD environment variable)
  --tls   Use TLS to connect (defaults to on if REDIS_TLS environment variable is set)
```

Once connected you'll be placed in a "Redie shell" where you can execute commands against the Redis server you connected to:
```
hostname>
```

### Using npx to start the Redie shell

```
npx redie -h <hostname> -a <password> --tls
```

# Commands
Redie supports the full set of Redis commands with the exception of:
* `BATCH`, `MULTI`
* `SUBSCRIBE`, `UNSUBSCRIBE`, `PSUBSCRIBE`, `PUNSUBSCRIBE`

Redie also adds the following commands:
* `HELP [pattern]` lists the Redis commands matching the specified pattern (wildcards supported)
* `SAVE filename` saves the output of the last command to the specified filename overwriting it if it already exists
* `QUIT` exits the Redie shell

# Roadmap
* Support for subscriptions
* Support for BATCH and MULTI
* Formatting for more types (e.g. HTML)
* Extensible formatting
* Command-line arguments to run a command (and optionally exit)
* Run commands from a file (both from the command-line and the shell)

# Contributing

You must have the following installed on your system:

* Redis Server (for local testing)
* NodeJS+npm

To start working, run ```npm install``` in the repository folder to install the required dependencies.

Then run ```nodejs index.js``` to get the redie command line

Pull requests will gladly be considered!

This project has adopted the [Microsoft Open Source Code of
Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct
FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com)
with any additional questions or comments.
