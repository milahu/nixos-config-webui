# nixos-config-webui

web editor for nix files

edit nixos configuration in a graphical webinterface

## concept

* use `nix repl` to discover the nixos config schema
  * latency is much better than with `nix-instantiate`
* thin client: request only a minimum amount of data to render the current view
* introspection: auto-generate the editor interface, based on the nixos config schema
  * related topic: [json-schema-form](https://github.com/topics/json-schema-form)
  * similar project: [graphql api viewer](https://github.com/Brbb/graphql-rover)
* graphics and text
  * graphical interface
    * [click-node-to-select in cytoscapejs](http://manual.cytoscape.org/en/stable/Navigation_and_Layout.html#select)
    * [click-node-to-zoom in cytoscapejs](https://stackoverflow.com/questions/52255932/how-to-zoom-in-a-selected-node-in-cytoscape)
  * text interface
    * [treeview widget in solidjs](https://milahu.github.io/solidjs-treeview-component/)

## related

this project is based on

* [lezer-parser-nix](https://github.com/milahu/lezer-parser-nix) - pure javascript parser for nix code
* [monaco-lezer-parser](https://github.com/milahu/monaco-lezer-parser) - integration for monaco-editor and monaco-lezer-parser

## similar projects

* https://github.com/nix-gui/nix-gui
* https://nixos.wiki/wiki/NixOS_configuration_editors
