{
  description = "SuperDoc Test Repo";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils = {
      url = "github:numtide/flake-utils";
    };
    pyproject-nix = {
      url = "github:pyproject-nix/pyproject.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    uv2nix = {
      url = "github:pyproject-nix/uv2nix";
      inputs.pyproject-nix.follows = "pyproject-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    pyproject-build-systems = {
      url = "github:pyproject-nix/build-system-pkgs";
      inputs.pyproject-nix.follows = "pyproject-nix";
      inputs.uv2nix.follows = "uv2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };


  outputs = inputs@{ nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system: let
      workspaceRoot = ./.;
      venvName = "venv";
      python = pkgs.python312;

      pkgs = import nixpkgs {
        inherit system;
      };
      workspace = inputs.uv2nix.lib.workspace.loadWorkspace { workspaceRoot = workspaceRoot; };
      overlay = workspace.mkPyprojectOverlay {
        sourcePreference = "wheel";
      };
      baseSet = pkgs.callPackage inputs.pyproject-nix.build.packages {
        inherit python;
      };
      pythonSet = baseSet.overrideScope (
        pkgs.lib.composeManyExtensions [
          inputs.pyproject-build-systems.overlays.default
          overlay
        ]
      );
      venv = (pythonSet.mkVirtualEnv "${venvName}" workspace.deps.default).overrideAttrs( old: {
          venvIgnoreCollisions = [ "bin/fastapi" ]; # fastapi and fastapi-cli (from fastapi[default]) both write this
      });

      scriptDevServer = pkgs.writeShellScriptBin "dev-server-server" ''
        export UVICORN_HOST="0.0.0.0"
        export UVICORN_PORT="9000"
        uvicorn server:app --reload
      '';
      scriptDevClient = pkgs.writeShellScriptBin "dev-server-frontend" ''
        cd ./client
        npm run dev:client
      '';
      scriptDevServerWithClient = pkgs.writeShellScriptBin "dev-server" ''
        cd ./client
        npm run dev
      '';
      scriptServer = pkgs.writeShellScriptBin "dev-production-server" ''
        fastapi run server --host 0.0.0.0 --port 80
      '';
      scriptTest = pkgs.writeShellScriptBin "dev-test" ''
        python -m unittest discover tests
      '';
    in {
      devShells.default = pkgs.mkShell {
        packages = [
          pkgs.uv
          venv
          pkgs.nodejs_24
          scriptDevServer
          scriptDevClient
          scriptDevServerWithClient
          scriptServer
          scriptTest
        ];
        env = {
          UV_NO_SYNC = "1"; # Don't create venv using uv
          UV_PYTHON = python.interpreter; # Force uv to use nixpkgs Python interpreter
          UV_PYTHON_DOWNLOADS = "never"; # Prevent uv from downloading managed Python's
        };
        shellHook = ''
          unset PYTHONPATH # unset dependency projection from nixpkgs
        '';
      };
    }
  );
}
