import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

app.get('/api/auth', (req, res) => {
  // Simulate an authentication check
  res.send({ user: { id: 1, name: 'John Doe', email: 'ianyeh7@gmail.com' } });
});

app.get('/api/auth/me', (req, res) => {
  // Simulate fetching the authenticated user's profile
  res.send({ user: { id: 1, name: 'John Doe', email: 'ianyeh7@gmail.com' } });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);