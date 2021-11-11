# nixos-config-webui

edit nixos config in a graphical webinterface

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

## similar projects

* https://github.com/nix-gui/nix-gui
