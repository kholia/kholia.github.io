push:
	# ./hugo-linux build
	typos content || true
	rsync -avz --delete -e ssh public/ user@192.168.1.54:/www
	#rsync -avz --delete -e ssh public/ user@100.105.123.63:/www
