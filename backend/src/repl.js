
const pseudoTerminal = require('node-pty');



module.exports = function addToApp(app) {

  const port = app.settings.port;

  // start nix repl

  const nixReplProcess = pseudoTerminal.spawn('nix', ['repl', '<nixpkgs/nixos>'], {
    name: 'xterm-color',
    cols: 80,
    rows: 40,
    //cwd: process.env.HOME,
    //env: process.env
  });

  nixReplProcess.onExit((code, signal) => {
    console.log(`nixReplProcess: exit code ${code} signal ${signal}`);
  });

  nixReplProcess.on("error", (error) => {
    console.log(`nixReplProcess: error ${error}`);
  });



  // init nix repl

  let initStage = 0;
  let initDone = false;

  function handleInit(data) {

    if (data.endsWith('nix-repl> ')) {
      // prompt is ready
      if (initStage == 0) {
        process.stdout.write(`loading the config object to cache for faster access ... `)
        nixReplProcess.write('builtins.attrNames config\r');
        initStage = 1;
      }
      else
      if (initStage == 1) {
        // received response from initStage 0
        //console.log(`initStage ${initStage}`)
        //nixReplProcess.write('builtins.attrNames config\r');
        initStage = 2;
        initDone = true;
        //console.log('repl init done');
        console.log('done')
        console.log();
        console.log(`try this:\ncurl http://localhost:${port}/repl --get --data-urlencode 'q=builtins.toJSON (builtins.attrNames options)'\n`)
        //nixReplProcess.removeListener("data", replResponseHandler); // not working
        //nixReplProcess.onData(replDefaultHandler);
      }
    }
  }



  // handle response from repl

  let replResponseBuffer = [];
  const queryStack = [];

  nixReplProcess.onData(function replResponseHandler(data) {

    //console.dir({replResponseHandler: { data }});

    if (initDone) {

      replResponseBuffer.push(data);

      if (data.endsWith('nix-repl> ')) {
        // end of response
        // TODO better. avoid false matches

        if (queryStack.length == 0) {
          console.log(`no response handler -> ignore repl response`);
          replResponseBuffer = [];
          return;
        }

        const replResponse = replResponseBuffer.join('');
        replResponseBuffer = [];
        const query = queryStack.shift();
        //console.log(`send response to api client`);
        //replResponse.startsWith(`${query.clientQuery}\r\r\n`)
        const startToken = '\x1B[35;1m';
        const endToken = '\x1B[0m\r\n';
        const bodyStart = replResponse.indexOf(startToken) + startToken.length;
        const bodyEnd = replResponse.lastIndexOf(endToken)
        // TODO avoid the double-encoding of json as nix string -> get "raw output" of nix repl?
        const bodyJsonJson = replResponse.slice(bodyStart, bodyEnd);
        const bodyJson = JSON.parse(bodyJsonJson);
        const bodyJsonStart = bodyJson.length < 80 ? bodyJson : `${bodyJson.slice(0, 76)} ...`;
        console.log(`> ${query.clientQuery}`)
        console.log(bodyJsonStart)
        console.log();
        //console.dir({ bodyJson });
        query.sendResponse(bodyJson);
        // TODO better? remove the onData listener
        //nixReplProcess.removeListener("data", replResponseHandler);
        //nixReplProcess.onData(replDefaultHandler);
      }
    }
    else {
      handleInit(data);
    }
  });



  app.get('/repl', async function(req, res) {

    const clientQuery = req.query.q;
    //console.dir({ clientQuery });
    if (!clientQuery) {
      res.send("");
      return;
    }

    // TODO limit query to one line (debounce, rate limit)

    queryStack.push({
      clientQuery,
      sendResponse: function sendResponse(data) {
        res.send(data);
      },
    });

    nixReplProcess.write(`${clientQuery}\r`);
  });
}
