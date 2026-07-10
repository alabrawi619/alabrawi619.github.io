---
layout: post
title: "Building a Minimal HTTP Server in Python"
date: 2024-05-20 14:00:00 +0000
categories: [programming, web]
tags: [python, networking, http, sockets]
excerpt: "Walking through a minimal HTTP/1.1 server built from raw sockets in Python — no frameworks, no magic, just TCP and text."
---

## BINDING SOCKET ON PORT 8080…

Modern web frameworks are excellent tools. But building one from scratch, even a toy version, illuminates everything they do for you. This post walks through a minimal HTTP/1.1 server using Python's `socket` module — no `http.server`, no Flask, no abstractions.

## THE SIMPLEST POSSIBLE SERVER

```python
import socket

HOST = "127.0.0.1"
PORT = 8080

def handle_request(conn):
    data = conn.recv(4096).decode("utf-8", errors="replace")
    if not data:
        return

    # Parse the request line
    request_line = data.split("\r\n")[0]
    method, path, version = request_line.split(" ", 2)

    print(f"[REQ] {method} {path} {version}")

    # Build a minimal response
    body = f"<html><body><h1>Hello from raw sockets!</h1><p>Path: {path}</p></body></html>"
    response = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/html; charset=utf-8\r\n"
        f"Content-Length: {len(body.encode())}\r\n"
        "Connection: close\r\n"
        "\r\n"
        + body
    )
    conn.sendall(response.encode("utf-8"))

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(5)
    print(f"[*] Listening on {HOST}:{PORT}")

    while True:
        conn, addr = server.accept()
        with conn:
            print(f"[*] Connection from {addr}")
            handle_request(conn)
```

## ADDING ROUTING

```python
ROUTES = {}

def route(path):
    """Decorator to register a route handler."""
    def decorator(fn):
        ROUTES[path] = fn
        return fn
    return decorator

@route("/")
def index(path):
    return 200, "text/html", "<h1>Home</h1>"

@route("/about")
def about(path):
    return 200, "text/html", "<h1>About</h1>"

def dispatch(path):
    handler = ROUTES.get(path)
    if handler:
        return handler(path)
    return 404, "text/plain", "Not Found"
```

## HTTP STATUS CODES WE CARE ABOUT

| Code | Meaning              |
|------|----------------------|
| 200  | OK                   |
| 301  | Moved Permanently    |
| 302  | Found (Redirect)     |
| 400  | Bad Request          |
| 404  | Not Found            |
| 500  | Internal Server Error|

## SERVING STATIC FILES

```python
import os
import mimetypes

STATIC_DIR = "./static"

def serve_file(path):
    filepath = os.path.normpath(os.path.join(STATIC_DIR, path.lstrip("/")))

    # Security: prevent path traversal
    if not filepath.startswith(os.path.abspath(STATIC_DIR)):
        return 403, "text/plain", "Forbidden"

    if not os.path.isfile(filepath):
        return 404, "text/plain", "Not Found"

    mime, _ = mimetypes.guess_type(filepath)
    mime = mime or "application/octet-stream"

    with open(filepath, "rb") as f:
        content = f.read()

    return 200, mime, content
```

> **Security note:** Always normalize and validate file paths before serving. Path traversal (`../../../etc/passwd`) is a classic vulnerability in naive file servers.

## MAKING IT CONCURRENT

The single-threaded server handles one request at a time. A quick upgrade with `threading`:

```python
import threading

while True:
    conn, addr = server.accept()
    thread = threading.Thread(target=handle_request, args=(conn,), daemon=True)
    thread.start()
```

For production use, look into `asyncio` + `selectors` for non-blocking I/O, or use a proper ASGI/WSGI server. But for learning? Raw threads are perfectly illustrative.

## CLOSING TRANSMISSION

```
$ curl -i http://127.0.0.1:8080/

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 54
Connection: close

<html><body><h1>Hello from raw sockets!</h1></body></html>

[*] Request processed.
> _
```

Every web framework you have ever used is built on top of exactly this. The abstraction is just a more complete, battle-tested version of the code above.
