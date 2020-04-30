default:
	NODE_ENV=local node build.js


production:
	NODE_ENV=production node build.js
	zopfli dist/index.html
	brotli -f dist/index.html


deps:
	brew install brotli
	brew install zopfli
	brew install optipng


serve:
	cd dist && python -m SimpleHTTPServer 8080


deploy: production
	rsync -rP dist/ $(DOMAIN):/var/www/html/$(DOMAIN)/
