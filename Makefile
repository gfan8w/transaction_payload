
.PHONY: test build clean

build:build-geth build-truffle

build-geth:
	@echo "  >  \033[32mBuilding geth...\033[0m "
	cd geth && chmod +x docker-build.sh && ./docker-build.sh

build-truffle:
	@echo "  >  \033[32mBuilding client test case...\033[0m "
	docker build -t tranx_playload_truffle .

clean:
	@echo "  >  \033[32mBuilding client test case...\033[0m "
	docker rm -f tranx_playload_truffle
	docker rm -f tranx_playload_geth

test:
	@echo "  >  \033[32mRunning tests...\033[0m "
	docker run --rm -ti --network host --name tranx_playload_truffle tranx_playload_truffle

