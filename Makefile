include .env
default:
	node --experimental-modules build.mjs


deps:
	#brew install brotli
	#brew install zopfli
	brew install optipng


local: default
	node ../cf-emu/cli.js -M metadata.mjs


production: default
	mkdir -p .deploy
	node_modules/.bin/rollup -c
	node_modules/.bin/google-closure-compiler \
		-O ADVANCED \
		--js=.deploy/cf_worker.js \
		--js_output_file=.deploy/cf_worker.min.js \
		--externs=externs.js \
		--language_out=NO_TRANSPILE


.EXPORT_ALL_VARIABLES:
deploy: production
	node --experimental-modules metadata.mjs .deploy/cf_worker.min.js
