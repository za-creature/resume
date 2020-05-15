/* global process:false */
import config from './src/config'

import {spawnSync} from 'child_process'
import fs from 'fs'

import google from 'google-closure-compiler-java'
import pug from 'pug'


function execSync() {
    let result = spawnSync(...arguments)
    if(result.status)
        throw new Error(`Non-zero exit code: ${result.status}\n\n` +
                        `${result.stderr.toString()}`)
    else
        return result.stdout
}

fs.writeFileSync('assets/index.html', pug.renderFile('src/index.pug', Object.assign({'filters': {
    css(text) {
        if(process.env['NODE_ENV'] == 'local')
            return text
        return execSync('node_modules/.bin/postcss', [
            '--use=cssnano',
            '--no-map'
        ], {'input': text}).toString()
    },
    js(text) {
        if(process.env['NODE_ENV'] == 'local')
            return text
        return execSync('java', [
            '-jar',
            google,
            '-W', 'quiet',
            '-O', 'ADVANCED',
            '--language_in=ECMASCRIPT5',
            '--language_out=ECMASCRIPT3'
        ], {'input': text}).toString().replace(/\n/g, '')
    }
}}, config)))
//execSync('zopfli', ['assets/index.html'])
//execSync('brotli', ['-f', 'assets/index.html'])
