/** @type { import("eslint").Linter.Config } */
module.exports = {
    ignorePatterns: [
        'node_modules',
        'build',
        '.svelte-kit',
        '.env',
        '.env.*',
        '!.env.example',
        'pnpm-lock.yaml',
        'package-lock.json',
        'yarn.lock'
    ]
};
