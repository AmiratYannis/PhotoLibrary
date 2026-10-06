# photolibrary

A photolibrary app that allow to create as many albums as you like, and upload, view, and manage pictures in each one.

### Development setup

## Docker

To run container for front-end and back-end by using Docker, you should first [install Docker](https://docs.docker.com/get-docker/). 

Once Docker is installed, you can run all the container at the same time by using this following command at the root of the projet: 

```sh
docker-compose up --build
```



## Node.-js

Photolibrary is developped with Node.js and Vue.js and runs with Node.js. [Install Node.js](https://nodejs.org/en/) on your environment.

Once Node.js is installed, install npm dependencies for backend (folder back) and frontend (folder front).


```sh
npm install
```


## Run locally

Install dependencies once for each folder:

```sh
cd back
npm install
```

```sh
cd front
npm install
```

Start the backend. Run this from `back/`:

```sh
cd back
npm run dev
```

It listens on http://localhost:3000.

Start the frontend in a second terminal. Run this from `front/`:

```sh
cd front
npm run dev
```

Then open http://localhost:5173.

## Build the frontend

Run this from `front/`:

```sh
cd front
npm run build
```

The output goes to `front/dist/`.