{ pkgs }: {
    deps = [
        pkgs.toybox
        pkgs.nettools
        pkgs.exit
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs-16_x

        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}