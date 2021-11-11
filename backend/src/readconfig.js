

const fs = require('fs');
const child_process = require('child_process');

const TreeSitter = require('tree-sitter');
const TreeSitterNix = require('tree-sitter-nix');

const nixParser = new TreeSitter();
nixParser.setLanguage(TreeSitterNix);

function filterNode(syntaxNode) {
  const children = [];
  for (let i = 0; i < syntaxNode.children.length; i++) {
    children.push(filterNode(syntaxNode.children[i]));
  }
  return {
    type: syntaxNode.type,
    text: syntaxNode.text,
    children,
  };
}



module.exports = function addToApp(app) {

  app.get('/readconfig', function(req, res) {
    // read the current system config
    // ignore imported files in configuration.nix
    const configText = fs.readFileSync('/etc/nixos/configuration.nix', 'utf8');
    const configTree = nixParser.parse(configText);
    res.json(filterNode(configTree.rootNode));
  });

}
