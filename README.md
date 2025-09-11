# 🎵 Audio Classifier

An AI-powered web application that classifies audio using pre-trained Hugging Face models. Features both file upload and preset sample sounds for testing.

## Features

- 🤖 **AI-Powered Classification** - Uses Hugging Face Transformers.js with AudioSet-trained models
- 📁 **File Upload** - Support for WAV, MP3, M4A, OGG, FLAC, AAC formats
- 🎵 **Sample Sounds** - Built-in preset audio samples for quick testing
- 🎨 **Modern UI** - Clean, responsive interface with loading states
- ⚡ **Fast Processing** - Client-side inference, no server-side ML processing needed

## Preset Samples

- 🐕 Dog Barking - Large and small dog sounds
- 🚗 Car Engine - Vehicle engine sound
- 🎷 Jazz Saxophone - Smooth jazz music
- 💧 Water Splash - Water sound effect

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Deploy to Railway

### Method 1: GitHub Integration (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/audio-classifier.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect Node.js and deploy

### Method 2: Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   railway init
   railway up
   ```

### Method 3: Direct Upload

1. **Create a zip file** containing all project files (excluding node_modules)
2. **Go to Railway dashboard**
3. **Create new project** → "Deploy from local directory"
4. **Upload your zip file**

## Environment Variables

Railway will automatically set:
- `PORT` - Server port (Railway provides this)
- `NODE_ENV` - Set to "production"

## Deployment Configuration

The project includes:
- `package.json` - Dependencies and start scripts
- `server.js` - Express server with static file serving
- `railway.json` - Railway-specific configuration
- `nixpacks.toml` - Build configuration
- `.gitignore` - Files to exclude from version control

## How It Works

1. **Model Loading** - Downloads Hugging Face Transformers.js model on first use
2. **Audio Processing** - Uses Web Audio API to decode and process audio files
3. **Classification** - Runs inference client-side using the loaded model
4. **Results Display** - Shows predictions with confidence scores

## Technical Details

- **Frontend**: Vanilla JavaScript, Web Audio API, CSS Grid
- **Backend**: Express.js for serving static files
- **ML**: Hugging Face Transformers.js (AST model trained on AudioSet)
- **Deployment**: Railway with Nixpacks

## File Structure

```
├── index.html              # Main application page
├── server.js              # Express server
├── package.json           # Node.js dependencies
├── railway.json           # Railway configuration
├── css/
│   └── styles-modern.css  # Application styles
├── js/
│   ├── app.js            # Main application logic
│   ├── live-inference.js # Audio processing & classification
│   ├── model-trainer.js  # Model loading & prediction
│   └── audio-context-manager.js # Web Audio API management
└── samples/              # Preset audio files
    ├── barking-large-and-small-dog-290711.mp3
    ├── car-engine-372477.mp3
    ├── sax-jazz-77053.mp3
    └── water-splash-02-352021.mp3
```

## Browser Compatibility

- Chrome 66+ (recommended)
- Firefox 60+
- Safari 11.1+
- Edge 79+

Requires modern browser support for Web Audio API and ES6 modules.

## Performance Notes

- Initial model download: ~50MB (cached after first load)
- Client-side processing: No server load for ML inference
- Audio files: Cached with long expiry headers
- CDN delivery: Hugging Face models served from CDN