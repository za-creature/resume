module.exports = {
    extends: 'eslint:recommended',
    env: {
        worker: true,
        browser: true,
        es2020: true
    },
    parserOptions: {
        sourceType: 'module',
    },
    globals: // tell eslint about the bindings that are exported in the worker
             Object.keys(require('./bliss.config.js').bindings)
                   .reduce((obj, key) => (obj[key] = false, obj), {}),
    rules: {
        indent: ['off'],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-cond-assign': ['off'],
        // make sure you understand the implications of turning this off
        // https://developers.google.com/closure/compiler/docs/limitations#implications-of-global-variable,-function,-and-property-renaming:
        'quote-props': ['error',  'always']
    },
    overrides: [{
        files: ['*.js'],
        excludedFiles: 'src/*.js',
        env: {
            worker: false,
            browser: false,
            node: true
        },
        rules: {
            'quote-props': ['off']
        }
    }]
} 
