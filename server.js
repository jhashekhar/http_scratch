import net from 'net';

// Create a tcp server
const server = net.createServer((socket) => {
	console.log('Client connected');

	let buffer = ''; // stote incoming data

	// Check if we have received a complete HTTP request
	// HTTP requests are terminated by a double CRLF
	socket.on('data', (data) => {
		buffer += data.toString();

		if (buffer.includes('\r\n\r\n')) {
			// We have received a complete HTTP request
			const request = parseHTTPRequest(buffer);
			console.log('Raw HTTP request:\n');
			console.log(buffer);
			console.log('Parsed HTTP request:\n');
			console.log(request);

			// Handle the request
			handleRequest(request, socket);
			buffer = ''; // Reset the buffer
		}
	});

	socket.on('end', () => {
		console.log('Client disconnected');
	});

	socket.on('error', (err) => {
		console.error('Socket error:', err);
	});
});

// Parse the HTTP request from client
// return an object with method, path, headers and body
// Example: GET /data HTTP/1.1
// Host: localhost:3000
// User-Agent: curl/7.64.1
// Accept: */*
// Accept-Encoding: gzip, deflate
// Accept-Language: en-US,en;q=0.9
// Connection: keep-alive
// Content-Length: 0
// Content-Type: application/json
// {
// 	"key": "value"
// }
function parseHTTPRequest(request) {
	const lines = request.split('\r\n');
	console.log('------------------------------------');
	console.log('lines:', lines);
	console.log('------------------------------------');
	const [method, fullPath] = lines[0].split(' ');
	const parsedUrl = new URL(fullPath, 'http://localhost');
	const path = parsedUrl.pathname;

	// Convert URLSearchParams to object
	const query = {};
	parsedUrl.searchParams.forEach((value, key) => {
		query[key] = value;
	});

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

// Handle HTTP request and send response
function handleRequest(request, socket) {
	// Example: handle a GET request to /data
	console.log('Request:\n');
	console.log(request);
	if (request.method === 'GET') {
		const data = {
			message: 'Hello from my custom HTTP server!',
			timestamp: Date.now(),
			query: request.query,
		};
		sendJsonResponse(socket, 200, data);
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
});
