#! /usr/bin / env node

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var process = require('process');
var fs = require('fs');
var commandLineArgs = require('command-line-args');
var readline = require('readline');
var split = require('argv-split');
var redis = require('redis');
var redisCommands = require('redis-commands');
var isJSON = require('is-json');
var colorJSON = require('json-colorz');

var args = getArgs();
var options = getOptions(args);
if (options.help) {
  console.log(getUsage(args));
  return;
}
if (options.version) {
  console.log(getVersion());
  return;
}

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
    if (reply) displayReply(reply);
    lastReply = reply;
    rl.prompt();
  });
}).on('close', () => {
  process.exit(0);
});

function getVersion() {
  var package = require('./package.json');
  return package.name + ' ' + package.version;
}

function getArgs() {
  var cli = commandLineArgs([
    { name: 'hostname', alias: 'h', type: String, defaultValue: process.env.REDIS_HOSTNAME || '127.0.0.1' },
    { name: 'port', alias: 'p', type: Number, defaultValue: process.env.REDIS_PORT || 6379 },
    { name: 'password', alias: 'a', type: String, defaultValue: process.env.REDIS_PASSWORD },
    { name: 'tls', type: Boolean, defaultValue: !!process.env.REDIS_TLS },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'help', alias: '?', type: Boolean }
  ]);

  return cli;
}

function getOptions(args) {
  var options = args.parse();
  return options;
}

function getUsage(args) {
  return args.getUsage({ title: getVersion(), description: require('./package.json').description });
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

function displayReply(reply) {
  // Formatters
  if (typeof reply === 'string') {
    if (isJSON(reply)) {
      reply = JSON.parse(reply);
    }
  }

  // Renderers
  if (typeof reply === 'string') {
    console.log(reply);
  } else {
    colorJSON(reply);
  }
}