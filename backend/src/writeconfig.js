module.exports.default = function addToApp(app) {

  app.post('/writeconfig', function(req, res) {
    // write the current system config
    // TODO make sure that the git repo in /etc/nixos is clean
    fs.writeFileSync('/etc/nixos/configuration.nix', '{...}', 'utf8');
  })

}
