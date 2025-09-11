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
    <div style="max-width: 600px; margin: 0 auto; text-align: left; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h2 style="color: #667eea; margin-bottom: 20px;">How to Use Audio Classifier</h2>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #4A5568;">1. Load Pre-trained Model</h3>
            <ul style="color: #666;">
                <li>Click "Load Model" to download a pre-trained audio classification model</li>
                <li>The model is trained on Google's AudioSet with millions of audio samples</li>
                <li>No training required - the model is ready to use immediately</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #4A5568;">2. Test Audio Classification</h3>
            <ul style="color: #666;">
                <li>Click "Record Test Audio" to record audio for classification</li>
                <li>The model can classify speech, music, sound effects, animals, and more</li>
                <li>View confidence scores for different audio categories</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #4A5568;">Supported Audio Types</h3>
            <ul style="color: #666;">
                <li>Speech and human voices</li>
                <li>Music and musical instruments</li>
                <li>Animals (dogs, cats, birds, wild animals)</li>
                <li>Human sounds (laughter, coughing, etc.)</li>
                <li>Vehicles and engines</li>
                <li>Natural sounds and sound effects</li>
            </ul>
        </div>
        
        <button onclick="closeTutorial()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px;">Got it!</button>
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