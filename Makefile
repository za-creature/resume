.EXPORT_ALL_VARIABLES:
include .env


default:
	/usr/local/bin/screen -c.screenrc


clean:
	rm -Rf .deploy/*
	mkdir -p .deploy


build: clean
	npx rollup -c


local: build
	npx bliss-router


deploy:
	NODE_ENV=production npx rollup -c
	NODE_ENV=production npx bliss-router -dw


deps:
	npm i
