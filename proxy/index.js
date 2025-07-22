const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 9001;

// Proxy API requests to Django
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
}));

// Proxy video requests to CDN
app.use('/videos', createProxyMiddleware({
  target: 'http://localhost:9000',
  changeOrigin: true,
}));

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
