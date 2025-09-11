class AudioClassificationApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('Audio Classifier initialized successfully');
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkHuggingFaceSupport();
        });
    }

    checkHuggingFaceSupport() {
        console.log('Audio Classifier ready with Hugging Face Transformers.js support');
    }
}

function showTutorial() {
    const tutorial = `
    <div style="max-width: 650px; margin: 0 auto; text-align: left; padding: 25px; background: white; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.15);">
        <h2 style="color: #ef233c; margin-bottom: 25px; text-align: center;">🎵 How to Use Audio Classifier</h2>
        
        <div style="margin-bottom: 25px;">
            <h3 style="color: #2b2d42; display: flex; align-items: center; gap: 10px;">🤖 1. Load AI Model</h3>
            <ul style="color: #666; line-height: 1.6;">
                <li>Click <strong>"Load Model"</strong> to download the Hugging Face audio classification model (~50MB)</li>
                <li>Uses AST (Audio Spectrogram Transformer) trained on Google's AudioSet</li>
                <li>Model loads once and runs entirely in your browser - no server processing needed</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 25px;">
            <h3 style="color: #2b2d42; display: flex; align-items: center; gap: 10px;">🎯 2. Choose Your Audio Source</h3>
            <ul style="color: #666; line-height: 1.6;">
                <li><strong>📁 Upload File:</strong> Drag & drop or select WAV, MP3, M4A, OGG, FLAC, AAC files</li>
                <li><strong>🎵 Sample Sounds:</strong> Try pre-loaded examples (dog barking, car engine, jazz saxophone, water splash)</li>
                <li>Click ▶️ to preview samples before classifying</li>
                <li>All processing happens locally - your audio files stay private</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 25px;">
            <h3 style="color: #2b2d42; display: flex; align-items: center; gap: 10px;">🔍 3. View AI Predictions</h3>
            <ul style="color: #666; line-height: 1.6;">
                <li>See detailed predictions with confidence scores for each audio category</li>
                <li>Results show specific AudioSet labels (e.g., "Domestic animals, pets", "Motor vehicle")</li>
                <li>Higher percentages indicate stronger confidence in that classification</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; background: #f8f9ff; border-radius: 10px; border-left: 4px solid #ef233c;">
            <h4 style="color: #2b2d42; margin-bottom: 10px;">🎨 What the AI Can Identify:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #666; font-size: 0.95em;">
                <div>• Speech & human voices</div>
                <div>• Music & instruments</div>
                <div>• Animal sounds (pets & wild)</div>
                <div>• Vehicle & engine noises</div>
                <div>• Natural sounds (water, wind)</div>
                <div>• Human sounds (laughter, coughing)</div>
            </div>
        </div>
        
        <button onclick="closeTutorial()" style="background: #ef233c; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin-top: 20px; width: 100%; font-size: 1.1em; font-weight: 600;">🚀 Let's Get Started!</button>
    </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;';
    overlay.innerHTML = tutorial;
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
    
    document.body.appendChild(overlay);
    
    window.closeTutorial = () => {
        document.body.removeChild(overlay);
        delete window.closeTutorial;
    };
}

const app = new AudioClassificationApp();

window.addEventListener('load', () => {
    setTimeout(() => {
        if (localStorage.getItem('audioClassifierTutorialShown') !== 'true') {
            showTutorial();
            localStorage.setItem('audioClassifierTutorialShown', 'true');
        }
    }, 1000);
});

window.addEventListener('beforeunload', (e) => {
    if (audioContextManager) {
        audioContextManager.closeContext();
    }
});

console.log('Audio Classifier - Pre-trained Audio Classification');
console.log('Built with Hugging Face Transformers.js and Web Audio API');
console.log('Ready to classify audio with state-of-the-art models!');