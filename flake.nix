{
  description = "awesome-openspec: a curated list of OpenSpec and Spec-Driven Development resources";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f (build system));

      build = system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          node = pkgs.nodejs_22;

          # Only the manifests, so editing README.md does not rebuild node_modules.
          manifest = pkgs.runCommand "awesome-openspec-manifest" { } ''
            mkdir -p $out
            cp ${./package.json} $out/package.json
            cp ${./package-lock.json} $out/package-lock.json
          '';

          # Update this hash after changing package-lock.json:
          #   nix run nixpkgs#prefetch-npm-deps -- package-lock.json
          nodeModules = pkgs.buildNpmPackage {
            pname = "awesome-openspec-node-modules";
            version = "0.0.0";
            src = manifest;
            npmDepsHash = "sha256-LIMpDsDJhPfBjHRRSB22KV18XmQG9d6FdgV+cK0UJ8Y=";
            nodejs = node;
            dontNpmBuild = true;
            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -r node_modules $out/node_modules
              runHook postInstall
            '';
          };

          # The README, the lint rules, the scripts and their tests. Excludes
          # site/, openspec/ and .beans/ so that proposals and bean edits do not
          # invalidate the lint and test derivations.
          projectSrc = pkgs.lib.cleanSourceWith {
            name = "awesome-openspec-src";
            src = ./.;
            filter = path: type:
              !(builtins.elem (baseNameOf (toString path)) [
                "node_modules" "dist" ".astro" ".beans" "openspec" "site" "result"
              ]);
          };

          # A writable checkout with node_modules in place.
          workspace = ''
            cp -r ${projectSrc} work
            chmod -R u+w work
            cd work
            ln -s ${nodeModules}/node_modules node_modules
            export HOME="$TMPDIR"
          '';

          # Update this hash after changing site/package-lock.json:
          #   nix run nixpkgs#prefetch-npm-deps -- site/package-lock.json
          site = pkgs.buildNpmPackage {
            pname = "awesome-openspec-site";
            version = "0.0.0";
            src = ./site;
            npmDepsHash = "sha256-SKYuIgldwj3PxqJ6LrMUnhlFNBePcqu07e8QthyDqEo=";
            nodejs = node;
            # No /data/entries.json in a sandboxed build, so sync-data falls back
            # to src/data/entries.fixture.json and the build stays hermetic.
            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -r dist/. $out/
              runHook postInstall
            '';
          };

          lint = pkgs.runCommand "awesome-openspec-lint"
            { nativeBuildInputs = [ node ]; } ''
            ${workspace}
            echo "==> remark README.md"
            ./node_modules/.bin/remark README.md --quiet
            touch $out
          '';

          tests = pkgs.runCommand "awesome-openspec-tests"
            { nativeBuildInputs = [ node ]; } ''
            ${workspace}
            mkdir -p coverage

            if [ ! -d test ]; then
              echo "gate: there is no test/ directory yet, so coverage is 0%." >&2
              echo "gate: see milestone 04 Test coverage for the ship gate." >&2
            fi

            echo "==> node --test"
            set +e
            node --test \
              --experimental-test-coverage \
              --test-reporter=spec --test-reporter-destination=stdout \
              --test-reporter=lcov --test-reporter-destination=coverage/lcov.info
            testStatus=$?

            [ -f coverage/lcov.info ] || : > coverage/lcov.info

            node scripts/coverage-gate.mjs coverage/lcov.info
            gateStatus=$?
            set -e

            if [ "$testStatus" -ne 0 ]; then
              echo "gate: the test run failed." >&2
              exit 1
            fi
            if [ "$gateStatus" -ne 0 ]; then
              echo "gate: coverage is below the threshold." >&2
              exit 1
            fi

            touch $out
          '';
        in
        {
          inherit pkgs node site lint tests;

          devShell = pkgs.mkShell {
            packages = [ node pkgs.git pkgs.jujutsu ];
            shellHook = ''
              echo "awesome-openspec"
              echo "  npm run lint                 lint README.md"
              echo "  npm --prefix site run dev    serve the site"
              echo "  nix flake check              the ship gate"
            '';
          };
        };
    in
    {
      packages = forAllSystems (b: {
        site = b.site;
        default = b.site;
      });

      devShells = forAllSystems (b: { default = b.devShell; });

      checks = forAllSystems (b: {
        lint = b.lint;
        tests = b.tests;
        site = b.site;
      });

      formatter = forAllSystems (b: b.pkgs.nixpkgs-fmt);
    };
}
