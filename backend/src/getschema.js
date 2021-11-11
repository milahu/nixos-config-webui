module.exports = function addToApp(app) {

  app.get('/getschema', function(req, res) {
    // get schema of all valid config options
    // based on nix-gui/nixui/options/nix_eval.py
    const name = 'get_all_nixos_options';
    const expr = `(import ./src/lib.nix).${name}`;
    console.log(expr)

    const proc = child_process.spawnSync(
      "nix-instantiate", [
        '--eval',
        '--expr', expr,
        '--json',
        '--strict', // fix: error: cannot convert a function application to JSON
      ], {
        encoding: 'utf8',
        maxBuffer: 1/0,
      }
    );
    res.send(proc.stdout + proc.stderr);
  });
}
