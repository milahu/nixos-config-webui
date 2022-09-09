{ stdenv, nodejs, nodePackages }:

stdenv.mkDerivation {

  pname = "nixos-config-webui-backend";
  version = "0.0.1";

  src = ./.;

  #buildInputs = [ nodejs nodePackages.express ];
# error: attribute 'express' missing

  buildInputs = [ nodejs ];

}
