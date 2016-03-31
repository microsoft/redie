var process = require('process');
var fs = require('fs');
var commandLineArgs = require('command-line-args');
var readline = require('readline');
var split = require('argv-split');
var redis = require('redis');
var redisCommands = require('redis-commands');

var options = getOptions();
var client = createRedisClient(options);
var commands = getCommands();
var lastReply;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt(options.hostname + '> ');
rl.prompt();

rl.on('line', (line) => {
  var command = split(line);

  var commandName = command.length === 0 ? 'NOOP' : command[0].toUpperCase();
  var commandArgs = command.splice(1);
  var commandFunc = commands[commandName] || commands['NOOP'];

  commandFunc(commandName, commandArgs, (err, reply) => {
    if (err) console.error(err);
    if (reply) console.dir(reply);
    lastReply = reply;
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

function getCommands() {
  var commands = {};
  for (var i = 0; i < redisCommands.list.length; i++) {
    commands[redisCommands.list[i].toUpperCase()] = client.send_command.bind(client);
  }
  commands['HELP'] = helpCommand;
  commands['NOOP'] = noopCommand;
  commands['EXIT'] = quitCommand;
  commands['QUIT'] = quitCommand;
  commands['SAVE'] = saveCommand;
  return commands;
}

function helpCommand(name, args, callback) {
  var matchingCommands = [];
  for (var i = 0; i < redisCommands.list.length; i++) {
    if (args.length === 0 || redisCommands.list[i].toUpperCase().indexOf(args[0].toUpperCase()) > -1) {
      matchingCommands.push(redisCommands.list[i].toUpperCase());
    }
  }
  callback(null, matchingCommands);
}

function noopCommand(name, args, callback) {
  callback(null, null);
}

function quitCommand(name, args, callback) {
  if (client) client.unref();
  process.exit(0);
}

function saveCommand(name, args, callback) {
  if (args.length !== 1) return callback('SAVE filename', null);
  if (!lastReply) return callback('No reply to save', null);
  var filename = args[0];
  fs.writeFileSync(filename, JSON.stringify(lastReply));
  callback(null, 'Saved last reply to ' + filename);
}