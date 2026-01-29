const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'up', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Route principale
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to HomeStock API',
    version: '1.0.0'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
