

const fs = require('fs');
const child_process = require('child_process');

// https://github.com/tree-sitter/node-tree-sitter
// interface SyntaxNode
// https://github.com/tree-sitter/node-tree-sitter/blob/master/tree-sitter.d.ts#L52
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
    typeId: syntaxNode.typeId,
    //text: syntaxNode.text,
    children,
    startIndex: syntaxNode.startIndex,
    endIndex: syntaxNode.endIndex,
    isNamed: syntaxNode.isNamed,
    name: syntaxNode.name, // ?
  };
}



module.exports = function addToApp(app) {

  // separate api endpoint for configText to avoid json overhead
  app.get('/readconfig', function(req, res) {
    // read the current system config
    // ignore imported files in configuration.nix
    const configText = fs.readFileSync('/etc/nixos/configuration.nix', 'utf8');
    res.send(configText);
  });

  app.get('/parseconfig', function(req, res) {
    // read the current system config
    // ignore imported files in configuration.nix
    const configText = fs.readFileSync('/etc/nixos/configuration.nix', 'utf8');
    const configTree = nixParser.parse(configText);
    res.json(filterNode(configTree.rootNode));
  });

}
