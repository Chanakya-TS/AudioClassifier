class AudioUploader {
    constructor() {
        this.testAudioBlob = null;
        this.testDuration = 0;
        this.fileName = '';
        this.audioBuffer = null;
    }

    async handleFileUpload(file) {
        if (!modelTrainer.modelLoaded) {
            alert('Please load the model first');
            return;
        }

        if (!file) return;

        try {
            // Validate file type
            const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/aac'];
            if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
                alert('Please upload a valid audio file (WAV, MP3, M4A, OGG, FLAC, AAC)');
                return;
            }

            // Store file info
            this.fileName = file.name;
            this.testAudioBlob = file;
            
            console.log(`Processing audio file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            
            // Process the audio file
            await this.processAudioFile();
            
        } catch (error) {
            console.error('Error handling file upload:', error);
            alert('Failed to process audio file: ' + error.message);
        }
    }

    async processAudioFile() {
        try {
            // Show initial processing state
            this.showProcessingState();
            
            const arrayBuffer = await this.testAudioBlob.arrayBuffer();
            const audioContext = await audioContextManager.getAudioContext();
            
            // Decode the audio file
            this.audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            this.testDuration = this.audioBuffer.duration;
            
            console.log(`Audio file processed: ${this.testDuration.toFixed(2)}s, ${this.audioBuffer.sampleRate}Hz`);
            
            // Update UI
            this.updateTestAudioInfo();
            
            // Perform prediction (this will show its own loading state)
            await this.performPrediction();
            
        } catch (error) {
            console.error('Error processing audio file:', error);
            this.hideProcessingState();
            alert('Failed to decode audio file. Please try a different format.');
        }
    }
    
    showProcessingState() {
        const predictionsContainer = document.getElementById('predictions');
        predictionsContainer.innerHTML = `
            <div class="loading-indicator" style="display: block;">
                <div class="spinner"></div>
                <p>📁 Processing audio file...</p>
                <p style="font-size: 0.9em; color: #8d99ae; margin-top: 10px;">Decoding audio data</p>
            </div>
        `;
        
        // Disable upload button during processing
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        if (uploadBtn) uploadBtn.disabled = true;
        if (fileInput) fileInput.disabled = true;
        
        this.addLoadingStyles();
    }
    
    hideProcessingState() {
        const predictionsContainer = document.getElementById('predictions');
        if (predictionsContainer.innerHTML.includes('Processing audio file')) {
            predictionsContainer.innerHTML = '<p>Upload an audio file to see classification results</p>';
        }
        
        // Re-enable buttons
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        if (uploadBtn) uploadBtn.disabled = false;
        if (fileInput) fileInput.disabled = false;
    }

    async performPrediction() {
        if (!this.audioBuffer) return;
        
        try {
            console.log('Running audio classification...');
            
            // Show loading state
            this.showLoadingState();
            
            // Use the decoded audio buffer for prediction
            const predictions = await modelTrainer.predict(this.audioBuffer);
            
            // Hide loading and show results
            this.hideLoadingState();
            this.displayPredictions(predictions, modelTrainer.lastRawPredictions);
            
        } catch (error) {
            console.error('Prediction error:', error);
            this.hideLoadingState();
            alert('Failed to classify audio: ' + error.message);
        }
    }
    
    showLoadingState() {
        const predictionsContainer = document.getElementById('predictions');
        predictionsContainer.innerHTML = `
            <div class="loading-indicator" style="display: block;">
                <div class="spinner"></div>
                <p>🤖 Analyzing audio with AI model...</p>
                <p style="font-size: 0.9em; color: #8d99ae; margin-top: 10px;">This may take a few seconds</p>
            </div>
        `;
        
        // Keep buttons disabled during inference
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        if (uploadBtn) uploadBtn.disabled = true;
        if (fileInput) fileInput.disabled = true;
        
        // Add loading styles if not already present
        this.addLoadingStyles();
    }
    
    hideLoadingState() {
        // Loading will be replaced by displayPredictions
    }
    
    addLoadingStyles() {
        if (document.getElementById('loading-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'loading-styles';
        styles.textContent = `
            .loading-indicator {
                text-align: center;
                padding: 2rem;
                background: #f8f9ff;
                border-radius: 12px;
                border: 1px solid #e8ecf0;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                margin: 0 auto 1rem;
                border: 3px solid #edf2f4;
                border-top: 3px solid #ef233c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-indicator p {
                color: #2b2d42;
                font-weight: 500;
                margin: 0.5rem 0;
            }
            
            .loading-indicator p:last-child {
                font-size: 0.9em;
                color: #8d99ae;
                font-weight: 400;
            }
        `;
        
        document.head.appendChild(styles);
    }

    displayPredictions(predictions, rawPredictions = null) {
        const predictionsContainer = document.getElementById('predictions');
        predictionsContainer.innerHTML = '';
        
        // Re-enable upload button
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        if (uploadBtn) uploadBtn.disabled = false;
        if (fileInput) fileInput.disabled = false;
        
        // Show only raw predictions
        if (rawPredictions && rawPredictions.length > 0) {
            this.displayRawPredictions(rawPredictions, predictionsContainer);
        } else {
            predictionsContainer.innerHTML = '<p>No predictions available</p>';
        }
    }
    
    displayRawPredictions(rawPredictions, container) {
        // Add raw predictions header
        const rawHeader = document.createElement('h4');
        rawHeader.textContent = '🤖 Model Predictions (AudioSet Labels)';
        rawHeader.style.cssText = 'color: #2b2d42; margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 600;';
        container.appendChild(rawHeader);
        
        // Create raw predictions container
        const rawContainer = document.createElement('div');
        rawContainer.style.cssText = `
            background: #f8f9ff;
            border: 1px solid #e8ecf0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 1rem;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        // Sort predictions by confidence (highest first)
        const sortedPredictions = [...rawPredictions].sort((a, b) => b.score - a.score);
        
        sortedPredictions.forEach((prediction, index) => {
            const percentage = (prediction.score * 100).toFixed(1);
            
            const predictionItem = document.createElement('div');
            predictionItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: ${index < sortedPredictions.length - 1 ? '1px solid rgba(237, 242, 244, 0.8)' : 'none'};
                transition: background-color 0.2s ease;
            `;
            
            const labelSpan = document.createElement('span');
            labelSpan.textContent = prediction.label;
            labelSpan.style.cssText = 'color: #2b2d42; font-weight: 500; flex: 1; font-size: 0.95rem;';
            
            const scoreSpan = document.createElement('span');
            scoreSpan.textContent = `${percentage}%`;
            scoreSpan.style.cssText = `
                color: ${prediction.score > 0.2 ? '#27ae60' : prediction.score > 0.05 ? '#f39c12' : '#8d99ae'};
                font-weight: 600;
                min-width: 50px;
                text-align: right;
                font-size: 0.9rem;
            `;
            
            predictionItem.addEventListener('mouseenter', () => {
                predictionItem.style.backgroundColor = 'rgba(237, 242, 244, 0.5)';
                predictionItem.style.borderRadius = '6px';
            });
            
            predictionItem.addEventListener('mouseleave', () => {
                predictionItem.style.backgroundColor = 'transparent';
                predictionItem.style.borderRadius = '0';
            });
            
            predictionItem.appendChild(labelSpan);
            predictionItem.appendChild(scoreSpan);
            rawContainer.appendChild(predictionItem);
        });
        
        // Add explanation
        const explanation = document.createElement('p');
        explanation.textContent = 'These are the specific labels detected by the Hugging Face model, trained on Google\'s AudioSet dataset.';
        explanation.style.cssText = 'font-size: 0.85rem; color: #8d99ae; margin-top: 1rem; font-style: italic;';
        rawContainer.appendChild(explanation);
        
        container.appendChild(rawContainer);
    }

    updateTestAudioInfo() {
        const testAudioInfo = document.getElementById('testAudioInfo');
        const testDuration = document.getElementById('testDuration');
        const fileName = document.getElementById('fileName');
        
        fileName.textContent = this.fileName;
        testDuration.textContent = `${this.testDuration.toFixed(1)}s`;
        testAudioInfo.style.display = 'flex';
    }

    playTestAudio() {
        if (!this.testAudioBlob) return;
        
        const audioUrl = URL.createObjectURL(this.testAudioBlob);
        const audio = new Audio(audioUrl);
        
        audio.play().then(() => {
            console.log('Playing uploaded audio file');
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
        
        // Clean up the URL after playing
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
        });
    }

    clearPredictions() {
        const predictionsContainer = document.getElementById('predictions');
        predictionsContainer.innerHTML = '<p>Upload an audio file to see classification results</p>';
    }
}

const audioUploader = new AudioUploader();

function handleAudioUpload(input) {
    const file = input.files[0];
    if (file) {
        audioUploader.handleFileUpload(file);
    }
}

function playTestAudio() {
    audioUploader.playTestAudio();
}

function switchTab(tabName) {
    const uploadSection = document.getElementById('upload-section');
    const presetsSection = document.getElementById('presets-section');
    const uploadTab = document.querySelector('.tab-btn[onclick="switchTab(\'upload\')"]');
    const presetsTab = document.querySelector('.tab-btn[onclick="switchTab(\'presets\')"]');
    
    if (tabName === 'upload') {
        uploadSection.style.display = 'flex';
        presetsSection.style.display = 'none';
        uploadTab.classList.add('active');
        presetsTab.classList.remove('active');
    } else if (tabName === 'presets') {
        uploadSection.style.display = 'none';
        presetsSection.style.display = 'flex';
        uploadTab.classList.remove('active');
        presetsTab.classList.add('active');
    }
}

function previewPresetAudio(filename) {
    const audioUrl = `samples/${filename}`;
    const audio = new Audio(audioUrl);
    
    audio.play().then(() => {
        console.log(`Previewing preset audio: ${filename}`);
    }).catch(error => {
        console.error('Error playing preset audio:', error);
        alert('Failed to play audio file');
    });
}

async function selectPresetAudio(filename, displayName) {
    if (!modelTrainer.modelLoaded) {
        alert('Please load the model first');
        return;
    }
    
    try {
        console.log(`Starting to load preset audio: ${displayName} (${filename})`);
        
        // Clear previous selections and mark current as selected
        clearPresetSelections();
        const selectedItem = document.querySelector(`[onclick*="${filename}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Show loading state immediately
        audioUploader.showProcessingState();
        
        const audioUrl = `samples/${filename}`;
        console.log(`Fetching audio from: ${audioUrl}`);
        
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('Audio file fetched successfully, processing...');
        
        // Get the proper MIME type based on file extension
        let mimeType = 'audio/mpeg';
        if (filename.endsWith('.mp3')) {
            mimeType = 'audio/mpeg';
        } else if (filename.endsWith('.wav')) {
            mimeType = 'audio/wav';
        } else if (filename.endsWith('.ogg')) {
            mimeType = 'audio/ogg';
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Audio buffer size: ${arrayBuffer.byteLength} bytes`);
        
        // Create a proper File object instead of just a Blob
        const audioFile = new File([arrayBuffer], filename, { type: mimeType });
        
        // Process the file using the existing handleFileUpload method
        await audioUploader.handleFileUpload(audioFile);
        
        console.log('Preset audio loaded and processed successfully');
        
    } catch (error) {
        console.error('Error loading preset audio:', error);
        audioUploader.hideProcessingState();
        alert('Failed to load preset audio: ' + error.message);
        clearPresetSelections();
        
        // Re-enable upload button
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        if (uploadBtn) uploadBtn.disabled = false;
        if (fileInput) fileInput.disabled = false;
    }
}

function clearPresetSelections() {
    document.querySelectorAll('.preset-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Debug function to test audio loading
async function debugPresetAudio(filename) {
    console.log('=== DEBUG: Testing preset audio ===');
    console.log('Model loaded:', modelTrainer.modelLoaded);
    console.log('Filename:', filename);
    
    try {
        const audioUrl = `samples/${filename}`;
        console.log('Fetching:', audioUrl);
        
        const response = await fetch(audioUrl);
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            console.log('Audio buffer size:', arrayBuffer.byteLength, 'bytes');
            console.log('Audio buffer type:', typeof arrayBuffer);
            
            // Test audio context creation
            const audioContext = await audioContextManager.getAudioContext();
            console.log('Audio context state:', audioContext.state);
            console.log('Audio context sample rate:', audioContext.sampleRate);
            
            // Test decoding
            const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            console.log('Decoded audio duration:', decoded.duration);
            console.log('Decoded audio channels:', decoded.numberOfChannels);
            console.log('Decoded audio sample rate:', decoded.sampleRate);
            
            console.log('=== DEBUG: All tests passed ===');
            return true;
        } else {
            console.error('Failed to fetch audio:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('DEBUG Error:', error);
        return false;
    }
}