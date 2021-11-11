{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {

nativeBuildInputs = [
];

buildInputs = with pkgs; [
nodejs
gnumake # build tree-sitter npm package
];

}
