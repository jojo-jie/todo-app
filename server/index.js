import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const DATA_FILE = path.join(__dirname, '../data/todos.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ todos: [] }));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { todos: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }

  if (url === '/api/todos' && method === 'GET') {
    const data = readData();
    res.writeHead(200);
    res.end(JSON.stringify(data));
  } else if (url === '/api/todos' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const newTodo = JSON.parse(body);
      const data = readData();
      data.todos.push(newTodo);
      writeData(data);
      res.writeHead(201);
      res.end(JSON.stringify(newTodo));
    });
  } else if (url === '/api/todos' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const updatedTodo = JSON.parse(body);
      const data = readData();
      const index = data.todos.findIndex(t => t.id === updatedTodo.id);
      if (index !== -1) {
        data.todos[index] = updatedTodo;
        writeData(data);
      }
      res.writeHead(200);
      res.end(JSON.stringify(updatedTodo));
    });
  } else if (url.startsWith('/api/todos/') && method === 'DELETE') {
    const id = url.split('/').pop();
    const data = readData();
    data.todos = data.todos.filter(t => t.id !== id);
    writeData(data);
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
  } else if (url === '/api/todos/bulk' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { todos } = JSON.parse(body);
      const data = readData();
      data.todos = todos;
      writeData(data);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
