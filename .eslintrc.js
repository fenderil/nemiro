module.exports = {
    extends: ['airbnb'],
    rules: {
        semi: ['warn', 'never'],
        indent: ['warn', 4],
        'no-undef': 'off',
        'no-restricted-globals': 'off',
        'no-unused-vars': 'off',
        'max-len': ['warn', 100],
        'prefer-const': 'off',
        'no-alert': 'off',
        'no-param-reassign': 'off',
        'prefer-destructuring': 'warn',
        'no-void': 'off',
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
