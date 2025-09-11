class ModelTrainer {
    constructor() {
        this.classifier = null;
        this.isLoading = false;
        this.classes = []; // This will be populated with pre-trained model's classes
        this.modelLoaded = false;
    }

    async loadModel() {
        if (this.modelLoaded) return;
        
        try {
            this.isLoading = true;
            this.updateLoadingUI(true);
            
            console.log('Loading Hugging Face audio classification model...');
            
            // Import the pipeline from Transformers.js
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js');
            
            // Load the AST model trained on AudioSet
            this.classifier = await pipeline('audio-classification', 'Xenova/ast-finetuned-audioset-10-10-0.4593');
            
            // Set standard AudioSet classes (simplified subset)
            this.classes = [
                'Speech', 'Music', 'Sound effects', 'Animals', 'Human sounds', 
                'Engine', 'Tools', 'Nature', 'Vehicles'
            ];
            
            this.modelLoaded = true;
            console.log('Model loaded successfully');
            this.enableTesting();
            
        } catch (error) {
            console.error('Model loading failed:', error);
            alert('Failed to load audio classification model: ' + error.message);
        } finally {
            this.isLoading = false;
            this.updateLoadingUI(false);
        }
    }

    // Training is no longer needed with pre-trained models
    // This method now just loads the model
    async initializeModel() {
        await this.loadModel();
    }

    // Data preparation is no longer needed with pre-trained models

    async predict(audioBuffer) {
        if (!this.classifier || !this.modelLoaded) {
            throw new Error('Model not loaded yet');
        }
        
        try {
            // Convert AudioBuffer to the format expected by Transformers.js
            const audioData = audioBuffer.getChannelData(0);
            
            // The AST model expects audio data in a specific format
            const result = await this.classifier(audioData, {
                sampling_rate: audioBuffer.sampleRate,
                top_k: 10  // Get top 10 predictions for better mapping
            });
            
            console.log('Raw model predictions:', result);
            
            // Store raw predictions for display
            this.lastRawPredictions = result;
            
            // Convert the result to match our existing prediction format
            const predictions = new Array(this.classes.length).fill(0);
            
            // Map the model's predictions to our simplified class structure
            for (const prediction of result) {
                const classIndex = this.mapLabelToClass(prediction.label);
                console.log(`Mapping "${prediction.label}" (${(prediction.score * 100).toFixed(1)}%) -> Class ${classIndex} (${this.classes[classIndex] || 'Unknown'})`);
                
                if (classIndex !== -1 && classIndex < predictions.length) {
                    // Sum up scores for the same category instead of just taking max
                    predictions[classIndex] += prediction.score;
                }
            }
            
            console.log('Final mapped predictions:', predictions.map((p, i) => `${this.classes[i]}: ${(p * 100).toFixed(1)}%`));
            
            return predictions;
            
        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    }
    
    mapLabelToClass(label) {
        const labelLower = label.toLowerCase();
        
        // Speech category
        if (labelLower.includes('speech') || labelLower.includes('human voice') || 
            labelLower.includes('conversation') || labelLower.includes('talk') ||
            labelLower.includes('speaking') || labelLower.includes('male') || 
            labelLower.includes('female') || labelLower.includes('child')) {
            return 0; // Speech
        }
        
        // Music category
        if (labelLower.includes('music') || labelLower.includes('musical') || 
            labelLower.includes('song') || labelLower.includes('singing') ||
            labelLower.includes('piano') || labelLower.includes('guitar') ||
            labelLower.includes('drum') || labelLower.includes('orchestra')) {
            return 1; // Music
        }
        
        // Sound effects category
        if (labelLower.includes('sound effect') || labelLower.includes('synthesizer') ||
            labelLower.includes('beep') || labelLower.includes('alarm') ||
            labelLower.includes('notification') || labelLower.includes('electronic')) {
            return 2; // Sound effects
        }
        
        // Animals category (combining domestic and wild)
        if (labelLower.includes('animal') || labelLower.includes('domestic') || 
            labelLower.includes('wild') || labelLower.includes('dog') || 
            labelLower.includes('cat') || labelLower.includes('pet') ||
            labelLower.includes('bark') || labelLower.includes('meow') ||
            labelLower.includes('cow') || labelLower.includes('horse') ||
            labelLower.includes('pig') || labelLower.includes('sheep') ||
            labelLower.includes('growling') || labelLower.includes('growl') ||
            labelLower.includes('roaring cats') || labelLower.includes('lions, tigers') ||
            labelLower.includes('bird') || labelLower.includes('lion') || 
            labelLower.includes('wolf') || labelLower.includes('elephant') || 
            labelLower.includes('monkey') || labelLower.includes('bear') || 
            labelLower.includes('tiger') || labelLower.includes('chirp') ||
            labelLower.includes('roar')) {
            return 3; // Animals (all animals now)
        }
        
        // Human sounds category
        if (labelLower.includes('laughter') || labelLower.includes('crying') ||
            labelLower.includes('sneeze') || labelLower.includes('cough') ||
            labelLower.includes('yell') || labelLower.includes('scream') ||
            labelLower.includes('whistle') || labelLower.includes('clap')) {
            return 4; // Human sounds (moved up due to removed wild animals)
        }
        
        // Engine category
        if (labelLower.includes('engine') || labelLower.includes('motor') ||
            labelLower.includes('machinery') || labelLower.includes('mechanical')) {
            return 5; // Engine (adjusted index)
        }
        
        // Tools category
        if (labelLower.includes('tool') || labelLower.includes('hammer') ||
            labelLower.includes('drill') || labelLower.includes('saw') ||
            labelLower.includes('construction') || labelLower.includes('work')) {
            return 6; // Tools (adjusted index)
        }
        
        // Nature category
        if (labelLower.includes('nature') || labelLower.includes('wind') || 
            labelLower.includes('rain') || labelLower.includes('water') ||
            labelLower.includes('thunder') || labelLower.includes('storm') ||
            labelLower.includes('ocean') || labelLower.includes('river')) {
            return 7; // Nature (adjusted index)
        }
        
        // Vehicles category
        if (labelLower.includes('vehicle') || labelLower.includes('car') || 
            labelLower.includes('truck') || labelLower.includes('bus') ||
            labelLower.includes('motorcycle') || labelLower.includes('traffic') ||
            labelLower.includes('train') || labelLower.includes('airplane') ||
            labelLower.includes('accelerating') || labelLower.includes('revving') ||
            labelLower.includes('vroom') || labelLower.includes('engine start') ||
            labelLower.includes('motor vehicle') || labelLower.includes('car passing') ||
            labelLower.includes('whoosh') || labelLower.includes('swoosh') ||
            labelLower.includes('swish') || labelLower.includes('rumble') ||
            (labelLower.includes('engine') && labelLower.includes('frequency'))) {
            return 8; // Vehicles (adjusted index)
        }
        
        return -1; // Unknown label
    }

    updateLoadingUI(isLoading) {
        const loadBtn = document.getElementById('loadModelBtn');
        const progressContainer = document.getElementById('loadingProgress');
        
        if (loadBtn) {
            if (isLoading) {
                loadBtn.textContent = 'Loading Model...';
                loadBtn.disabled = true;
            } else {
                loadBtn.textContent = 'Load Model';
                loadBtn.disabled = false;
                if (this.modelLoaded) {
                    loadBtn.style.display = 'none';
                }
            }
        }
        
        if (progressContainer) {
            progressContainer.style.display = isLoading ? 'block' : 'none';
        }
    }

    // Training progress is no longer needed with pre-trained models

    enableTesting() {
        const uploadBtn = document.getElementById('uploadAudioBtn');
        const fileInput = document.getElementById('audioFileInput');
        
        if (uploadBtn) {
            uploadBtn.disabled = false;
        }
        if (fileInput) {
            fileInput.disabled = false;
        }
    }

    // Model saving and code generation removed as we're using pre-trained models
}

const modelTrainer = new ModelTrainer();

async function loadModel() {
    await modelTrainer.initializeModel();
}