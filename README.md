# HTTP from Scratch

A learning project to implement HTTP, SSE, and WebSockets from scratch using Node.js with minimal dependencies.

## Project Overview

This project demonstrates how to build network servers from the ground up using only Node.js core modules:

- **HTTP Server**: A basic HTTP server built directly on TCP sockets
- **Server-Sent Events (SSE)**: Real-time updates from server to client over a persistent connection
- **WebSockets**: (Coming soon) Full-duplex communication

## Getting Started

### Prerequisites

- Node.js (v14+)

### Installation

```bash
git clone <repository-url>
cd http_scratch
npm install
```

### Running the Server

```bash
# Start the server with auto-reload during development
npm run dev

# Start the server in production mode
npm start
```

## HTTP Server Usage

The server runs on port 3000 by default.

```bash
# Make a simple GET request
curl http://localhost:3000/

# With query parameters
curl http://localhost:3000/data?name=value&another=parameter
```

## Server-Sent Events (SSE)

Connect to the SSE endpoint to receive real-time updates:

```bash
# Connect to SSE stream (terminal will display updates)
curl -N http://localhost:3000/sse
```

## How It Works

### HTTP Implementation

- Uses Node.js `net` module to create a TCP server
- Manually parses HTTP request strings
- Formats proper HTTP responses with status codes and headers
- Implements query parameter parsing

### SSE Implementation

- Maintains persistent connections with clients
- Sends properly formatted SSE events
- Demonstrates real-time updates without polling

## Learning Resources

This project is designed to understand:

- HTTP protocol format and parsing
- Network connections at the TCP level
- Real-time communication patterns
- How modern web frameworks abstract these concepts

## License

ISC