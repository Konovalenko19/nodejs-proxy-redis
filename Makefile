start:
	docker-compose up -d --build

stop:
	docker-compose down -v

restart:
	docker-compose down -v
	docker-compose up -d --build

test:
	docker-compose down -v
	docker-compose up -d --build
	docker-compose down -v