import {spawnSync} from 'child_process'
import {randomFillSync} from 'crypto'
import {unlinkSync, writeFileSync} from 'fs'
import gccj from 'google-closure-compiler-java'
import {tmpdir} from 'os'
import pugRuntime from 'pug-runtime'
import resolve from '@rollup/plugin-node-resolve'
import pug from 'rollup-plugin-pug'


const PROD = process.env.NODE_ENV == 'production'
const DST = '.deploy/'

const WORKER_SRC = `${DST}/cf_worker.js`
const WORKER_MAP = `${DST}/cf_worker.js.map`
const WORKER_SRC_PROD = `${DST}/cf_worker.min.js`
const WORKER_MAP_PROD = `${DST}/cf_worker.min.js.map`


// generate a list of globals available in the worker environment; the closure
// compiler needs this to produce correct code
const EXTERNS = [].concat(
    require('bliss-router/externs'), // bliss externs
    Object.keys(require('./bliss.config.js')['bindings']), // script bindings
    [ // custom externs
        'require'  // pug-runtime references this conditionally, and while the
                   // condition is always false, google-closure can't statically
                   // infer that so it complains about an undefined reference
    ]
)

export default [{
    input: 'src/server.mjs',
    output: {
        file: WORKER_SRC,
        format: 'cjs', // iife induces an extra file in the sourcemap
        sourcemap: WORKER_MAP,
        sourcemapExcludeSources: true
    },
    plugins: [
        resolve({'mainFields': ['main']}),
        pug({
            pugRuntime,
            self: true,
            compileDebug: false,
            filters: {
                css(input) { return execSync('node_modules/.bin/postcss', {input})},
                js(input) { return !PROD ? input :
                    execSync('java', ['-jar', gccj,
                                      '--compilation_level=ADVANCED',
                                      '--language_in=ECMASCRIPT5',
                                      '--language_out=ECMASCRIPT3'],
                             {input}).replace(/\n/g, '')}
            }
        }),
        ...(process.env.NODE_ENV == 'production' ? [{
            name: 'closure-compiler',
            writeBundle: () => {
                let externs_file = [
                    tmpdir(),
                    randomFillSync(Buffer.alloc(16)).toString('hex')
                ].join('/')
                writeFileSync(externs_file, `var ${EXTERNS.join(',')};`)
                try {
                    execSync('java', ['-jar', gccj,
                                      '--compilation_level=ADVANCED',
                                      '--js', WORKER_SRC,
                                      '--js_output_file', WORKER_SRC_PROD,
                                      '--create_source_map', WORKER_MAP_PROD,
                                      '--isolation_mode=iife',
                                      '--externs', externs_file,
                                      '--language_out=NO_TRANSPILE',
                                      '--charset=utf-8'])
                } finally {
                    unlinkSync(externs_file)
                }
            }
        }] : [])
    ]
}]

function execSync() {
    let result = spawnSync.apply(null, arguments)
    if(result.status)
        throw new Error(`Non-zero exit code: ${result.status}\n\n` +
                        `${result.stderr.toString()}`)
    else
        return result.stdout.toString()
}
