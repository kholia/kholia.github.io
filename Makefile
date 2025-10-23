push:
	hugo build
	./typos content || true
