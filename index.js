var redis = require('redis');
var process = require('process');
var readline = require('readline');
var commandLineArgs = require('command-line-args');
var split = require('argv-split');
var commands = require('redis-commands');

var cli = commandLineArgs([
  { name: 'hostname', alias: 'h', type: String, defaultValue: '127.0.0.1' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 6379 },
  { name: 'password', alias: 'a', type: String },
  { name: 'tls', type: Boolean }
]);

var options = cli.parse();

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var redisOptions = {};
if (options.password) redisOptions.auth_pass = options.password;
if (options.tls) redisOptions.tls = { servername: options.hostname };

var client = redis.createClient(options.port, options.hostname, redisOptions);

rl.prompt();

rl.on('line', (line) => {
  var command = split(line);
  if (command && command.length >= 1) {
    var commandName = command[0].toUpperCase();
    if (commandName === 'HELP') {
      for (var i = 0; i < commands.list.length; i++) {
        if (command.length === 1 || commands.list[i].toUpperCase().indexOf(command[1].toUpperCase()) > -1) {
          console.log(commands.list[i].toUpperCase());
        }
      }
      rl.prompt();
    } else {
      var commandArgs = command.splice(1);
      client.send_command(commandName, commandArgs, (err, reply) => {
        if (err) console.error(err);
        if (reply) console.dir(reply);
        rl.prompt();
      });
    }
  } else {
    rl.prompt();
  }
}).on('close', () => {
  process.exit(0);
});