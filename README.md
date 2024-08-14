## Setup
To run this project, you need create file .env:

```
APP_PORT = 3000

# DB credentials
DB_TYPE = postgres
DB_USERNAME = 
DB_PASSWORD = 
DB_NAME = 
DB_HOST = 
DB_PORT = 
```

### Using Docker

```
$ docker-compose up --build
```

 ### Local using
 
 Run developer setup
```
$ npm run dev
```
  Run production setup
```
$ npm run prod
```
  Start trading
```
$ npm run trade
```
  Create DB
```
$ npm run db:create
```
  Drop DB
```
$ npm run db:drop
```