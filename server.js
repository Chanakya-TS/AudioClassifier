const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the root directory
app.use(express.static('.'));

// Serve audio files with proper headers
app.use('/samples', express.static('samples', {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
        } else if (path.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
        } else if (path.endsWith('.ogg')) {
            res.setHeader('Content-Type', 'audio/ogg');
        }
        // Enable caching for audio files
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// Route for the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Audio Classifier server running on port ${PORT}`);
    console.log(`📡 Server accessible at: http://localhost:${PORT}`);
    console.log(`🔊 Sample audio files available at: /samples/`);
});