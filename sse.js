import net from 'net';

const sseClients = new Set();

const server = net.createServer((socket) => {
	console.log('Client connected');

	let buffer = ''; // Store incoming data
	let isSSEConnection = false;

	socket.on('data', (data) => {
		buffer += data.toString();

		if (buffer.includes('\r\n\r\n') && !isSSEConnection) {
			// We have received a complete HTTP request
			const request = parseHTTPRequest(buffer);

			// Handle SSE endpoint
			if (request.method === 'GET' && request.path === '/sse') {
				console.log('SSE connection established');
				handleSSERequest(socket);
				isSSEConnection = true;
				sseClients.add(socket);
				buffer = ''; // Reset the buffer
				return;
			}
		}
	});

	socket.on('end', () => {
		if (isSSEConnection) {
			sseClients.delete(socket);
		}
		console.log('Client disconnected');
	});

	socket.on('error', (err) => {
		if (isSSEConnection) {
			sseClients.delete(socket);
		}
		console.error('Socket error:', err);
	});
});

// Parse the HTTP request from client
function parseHTTPRequest(request) {
	const lines = request.split('\r\n');
	const [method, fullPath] = lines[0].split(' ');

	let path,
		query = {};
	try {
		const parsedUrl = new URL(fullPath, 'http://localhost');
		path = parsedUrl.pathname;

		// Convert URLSearchParams to object
		parsedUrl.searchParams.forEach((value, key) => {
			query[key] = value;
		});
	} catch (error) {
		// Fallback if URL parsing fails
		path = fullPath.split('?')[0];
	}

	// Parse headers
	const headers = {};
	let i = 1;
	while (i < lines.length && lines[i] !== '') {
		const [headerKey, headerValue] = lines[i].split(': ');
		headers[headerKey.toLowerCase()] = headerValue;
		i++;
	}

	// Get the body if present
	const body = lines.slice(i + 1).join('\r\n');
	return {
		method,
		path,
		query,
		headers,
		body,
	};
}

// Handle SSE request
function handleSSERequest(socket) {
	socket.write(
		'HTTP/1.1 200 OK\r\n' +
			'Content-Type: text/event-stream\r\n' +
			'Cache-Control: no-cache\r\n' +
			'Connection: keep-alive\r\n' +
			'\r\n'
	);

	// Send initial connection message
	sendSSEEvent(socket, 'connected', { message: 'Connected to news feed' });

	// Start sending simulated news updates
	startNewsSimulation(socket);
}

// Send an SSE event to a specific client
function sendSSEEvent(socket, event, data) {
	socket.write(`event: ${event}\n`);
	socket.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Broadcast an SSE event to all connected clients
function broadcastSSEEvent(event, data) {
	console.log(`Broadcasting '${event}' to ${sseClients.size} clients`);
	sseClients.forEach((client) => {
		sendSSEEvent(client, event, data);
	});
}

// Simulate news updates
function startNewsSimulation(socket) {
	// This simulates fetching news from Reuters
	const headlines = [
		'Global markets rally on economic recovery hopes',
		'Tech stocks surge as earnings beat expectations',
		'Central bank announces new policy measures',
		'Oil prices drop amid oversupply concerns',
		'Retail sales show unexpected growth in Q2',
		'Vaccine developments boost healthcare sector',
		'Currency fluctuations impact international trade',
		'Housing market shows signs of cooling after record highs',
	];

	// Send a random headline every few seconds
	const interval = setInterval(() => {
		if (!sseClients.has(socket)) {
			clearInterval(interval);
			return;
		}

		const randomHeadline =
			headlines[Math.floor(Math.random() * headlines.length)];
		const news = {
			headline: randomHeadline,
			source: 'Reuters',
			timestamp: new Date().toISOString(),
		};

		sendSSEEvent(socket, 'news', news);
		console.log(`Sent news: ${randomHeadline}`);
	}, 3000);
}

// Handle HTTP request and send response
function handleRequest(request, socket) {
	if (request.method === 'GET' && request.path === '/') {
		// Send instructions for connecting via curl
		const instructions = `
HTTP SSE Server

To connect to the SSE stream, run:
curl -N http://localhost:${PORT}/sse

This will display news updates in your terminal.
`;
		sendTextResponse(socket, 200, instructions);
	} else {
		// Handle 404 Not Found
		sendTextResponse(socket, 404, 'Not Found');
	}
}

// Send JSON HTTP response
function sendJsonResponse(socket, statusCode, data) {
	const body = JSON.stringify(data);
	const headers = [
		'HTTP/1.1 ' + statusCode + ' ' + getStatusText(statusCode),
		'Content-Type: application/json',
		'Content-Length: ' + Buffer.byteLength(body),
		'Connection: close',
	];

	socket.write(headers.join('\r\n') + '\r\n\r\n' + body);
	socket.end();
}

// Send text HTTP response
function sendTextResponse(socket, statusCode, text) {
	const headers = [
		'HTTP/1.1 ' + statusCode + ' ' + getStatusText(statusCode),
		'Content-Type: text/plain',
		'Content-Length: ' + Buffer.byteLength(text),
		'Connection: close',
	];

	socket.write(headers.join('\r\n') + '\r\n\r\n' + text);
	socket.end();
}

// Get status text for status code
function getStatusText(statusCode) {
	const statusTexts = {
		200: 'OK',
		404: 'Not Found',
		500: 'Internal Server Error',
	};
	return statusTexts[statusCode] || 'Unknown';
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
	console.log(`HTTP server listening on port ${PORT}`);
	console.log(
		`To connect to the SSE stream, run: curl -N http://localhost:${PORT}/sse`
	);
});
