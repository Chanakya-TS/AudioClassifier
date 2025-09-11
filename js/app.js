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
    <div style="max-width: 500px; max-height: 80vh; margin: 0 auto; text-align: left; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); overflow-y: auto;">
        <div style="position: sticky; top: 0; background: white; padding-bottom: 15px; border-bottom: 1px solid #eee; margin-bottom: 20px;">
            <h2 style="color: #ef233c; margin: 0; text-align: center; font-size: 1.4em;">🎵 How to Use Audio Classifier</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #2b2d42; font-size: 1.1em; margin-bottom: 10px;">🤖 1. Load AI Model</h3>
            <ul style="color: #666; line-height: 1.5; font-size: 0.9em; margin: 0; padding-left: 20px;">
                <li>Click <strong>"Load Model"</strong> (~50MB download)</li>
                <li>Runs entirely in your browser</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #2b2d42; font-size: 1.1em; margin-bottom: 10px;">🎯 2. Choose Audio Source</h3>
            <ul style="color: #666; line-height: 1.5; font-size: 0.9em; margin: 0; padding-left: 20px;">
                <li><strong>📁 Upload File:</strong> WAV, MP3, M4A, OGG, FLAC, AAC</li>
                <li><strong>🎵 Sample Sounds:</strong> Try preset examples</li>
                <li>Click ▶️ to preview, click card to classify</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #2b2d42; font-size: 1.1em; margin-bottom: 10px;">🔍 3. View Results</h3>
            <ul style="color: #666; line-height: 1.5; font-size: 0.9em; margin: 0; padding-left: 20px;">
                <li>See confidence scores for each category</li>
                <li>Higher percentages = stronger predictions</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 20px; padding: 12px; background: #f8f9ff; border-radius: 8px; border-left: 3px solid #ef233c;">
            <h4 style="color: #2b2d42; margin: 0 0 8px 0; font-size: 1em;">🎨 AI Can Identify:</h4>
            <div style="color: #666; font-size: 0.85em; line-height: 1.4;">
                Speech, Music, Animals, Vehicles, Nature sounds, Human sounds & more
            </div>
        </div>
        
        <div style="position: sticky; bottom: 0; background: white; padding-top: 15px; border-top: 1px solid #eee;">
            <button onclick="closeTutorial()" style="background: #ef233c; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 1em; font-weight: 600;">🚀 Got it!</button>
        </div>
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