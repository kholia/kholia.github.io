push:
	hugo build
	./typos content || true
	hugo serve
