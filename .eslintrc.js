module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ['airbnb'],
    rules: {
        semi: ['warn', 'never'],
        indent: ['warn', 4],
        'max-len': ['warn', 100],
        'no-alert': 'off',
        'no-param-reassign': 'off',
        'prefer-destructuring': 'warn',
        'no-void': 'off',
        'import/prefer-default-export': 'off',
        'no-restricted-globals': 'off',
    },
    overrides: [
        {
            files: ['backend/**.js'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
}
