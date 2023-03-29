# Watchtower

Simple website that provides local machine cpu and memory usage.

## Getting Started

Once the project is cloned, you can use poetry to start the server.

```sh
poetry install

poetry shell

uvicorn --factory watchtower.api:create_app
```

The API provides 2 endpoints :
- Static website at `http://localhost:8080/monitoring`.
- Websocket that stream data at `wss://localhost:8000/ws`.