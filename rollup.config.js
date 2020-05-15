import resolve from 'rollup-plugin-node-resolve'


export default [{
    'input': 'src/server.mjs',
    'output': {
        'file': '.deploy/cf_worker.js',
        'format': 'iife',
        'sourcemap': 'inline'
    },
    'plugins': [
        resolve({'mainFields': ['module']})
    ]
}]
