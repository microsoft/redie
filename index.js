var redis = require('redis');
var process = require('process');
var readline = require('readline');
var commandLineArgs = require('command-line-args');
var split = require('argv-split');
var commands = require('redis-commands');

var options = getOptions();
var client = createRedisClient(options);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt();

rl.on('line', (line) => {
  var command = split(line);

  var commandName = command.length === 0 ? 'NOOP' : command[0].toUpperCase();
  var commandArgs = command.splice(1);
  var commandFunc;

  if (commandName === 'HELP') {
    commandFunc = helpCommand;
  } else if (commandName === 'NOOP') {
    commandFunc = noopCommand;
  } else {
    commandFunc = client.send_command.bind(client);
  }

  commandFunc(commandName, commandArgs, (err, reply) => {
    if (err) console.error(err);
    if (reply) console.dir(reply);
    rl.prompt();
  });
}).on('close', () => {
  process.exit(0);
});

function getOptions() {
  var cli = commandLineArgs([
    { name: 'hostname', alias: 'h', type: String, defaultValue: '127.0.0.1' },
    { name: 'port', alias: 'p', type: Number, defaultValue: 6379 },
    { name: 'password', alias: 'a', type: String },
    { name: 'tls', type: Boolean }
  ]);

  var options = cli.parse();
  return options;
}

function createRedisClient(options) {
  var redisOptions = {};
  if (options.password) redisOptions.auth_pass = options.password;
  if (options.tls) redisOptions.tls = { servername: options.hostname };

  var client = redis.createClient(options.port, options.hostname, redisOptions);
  return client;
}

function helpCommand(name, args, callback) {
  var matchingCommands = [];
  for (var i = 0; i < commands.list.length; i++) {
    if (args.length === 0 || commands.list[i].toUpperCase().indexOf(args[0].toUpperCase()) > -1) {
      matchingCommands.push(commands.list[i].toUpperCase());
    }
  }
  callback(null, matchingCommands);
}

function noopCommand(name, args, callback) {
  callback(null, null);
}