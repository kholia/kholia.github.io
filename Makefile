push:
	hugo build
	typos content || true
	hugo serve


deps:
	brew install typos-cli
