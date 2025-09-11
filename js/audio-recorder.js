class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.currentClassIndex = null;
        this.recordingStartTime = null;
    }

    async initialize() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            return true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Microphone access denied. Please allow microphone access to record audio.');
            return false;
        }
    }

    startRecording(classIndex) {
        if (!this.stream || this.isRecording) return;

        this.audioChunks = [];
        this.currentClassIndex = classIndex;
        this.recordingStartTime = Date.now();

        try {
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
        } catch (error) {
            this.mediaRecorder = new MediaRecorder(this.stream);
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.processRecording();
        };

        this.mediaRecorder.start(100);
        this.isRecording = true;
        
        const button = document.querySelectorAll('.record-btn')[classIndex];
        button.classList.add('recording');
        button.innerHTML = '<span class="record-icon">⏹️</span>Stop Recording';
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
        this.isRecording = false;

        const button = document.querySelectorAll('.record-btn')[this.currentClassIndex];
        button.classList.remove('recording');
        button.innerHTML = '<span class="record-icon">🎤</span>Start Recording';
    }

    processRecording() {
        const recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
        
        if (recordingDuration < 0.5) {
            alert('Recording too short. Please record for at least 0.5 seconds.');
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.convertToWav(audioBlob, (wavBlob) => {
            this.addSampleToClass(wavBlob, this.currentClassIndex, recordingDuration);
        });
    }

    async convertToWav(audioBlob, callback) {
        const reader = new FileReader();
        reader.onload = async () => {
            const arrayBuffer = reader.result;
            const audioContext = await audioContextManager.getAudioContext();
            
            audioContext.decodeAudioData(arrayBuffer)
                .then(audioBuffer => {
                    const wavBlob = this.audioBufferToWav(audioBuffer);
                    callback(wavBlob);
                })
                .catch(error => {
                    console.error('Error converting audio:', error);
                });
        };
        reader.readAsArrayBuffer(audioBlob);
    }

    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const channelData = buffer.getChannelData(0);

        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, 44100, true);
        view.setUint32(28, 44100 * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    addSampleToClass(audioBlob, classIndex, duration) {
        if (!window.audioSamples) {
            window.audioSamples = [];
        }
        
        if (!window.audioSamples[classIndex]) {
            window.audioSamples[classIndex] = [];
        }

        const sample = {
            blob: audioBlob,
            duration: duration,
            timestamp: Date.now()
        };

        window.audioSamples[classIndex].push(sample);
        this.updateSamplesDisplay(classIndex);
        this.checkTrainingRequirements();
    }

    updateSamplesDisplay(classIndex) {
        const samples = window.audioSamples[classIndex] || [];
        const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
        
        const samplesInfo = document.querySelectorAll('.samples-info')[classIndex];
        samplesInfo.innerHTML = `<span class="samples-count">${samples.length} samples (${totalDuration.toFixed(1)}s)</span>`;
        
        const samplesList = document.querySelectorAll('.samples-list')[classIndex];
        samplesList.innerHTML = '';
        
        samples.forEach((sample, index) => {
            const sampleItem = document.createElement('div');
            sampleItem.className = 'sample-item';
            sampleItem.innerHTML = `
                Sample ${index + 1} (${sample.duration.toFixed(1)}s)
                <button class="sample-play" onclick="playSample(${classIndex}, ${index})">▶️</button>
                <button class="sample-remove" onclick="removeSample(${classIndex}, ${index})">×</button>
            `;
            samplesList.appendChild(sampleItem);
        });
    }

    checkTrainingRequirements() {
        const classes = document.querySelectorAll('.class-section');
        let canTrain = classes.length >= 2;
        
        if (canTrain && window.audioSamples) {
            for (let i = 0; i < classes.length; i++) {
                const samples = window.audioSamples[i] || [];
                const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
                if (totalDuration < 8) {
                    canTrain = false;
                    break;
                }
            }
        } else {
            canTrain = false;
        }

        const trainBtn = document.getElementById('trainBtn');
        trainBtn.disabled = !canTrain;
    }

    async processUploadedFiles(files, classIndex) {
        for (let file of files) {
            if (file.type.startsWith('audio/')) {
                const arrayBuffer = await file.arrayBuffer();
                const audioContext = await audioContextManager.getAudioContext();
                
                try {
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    const wavBlob = this.audioBufferToWav(audioBuffer);
                    this.addSampleToClass(wavBlob, classIndex, audioBuffer.duration);
                } catch (error) {
                    console.error('Error processing uploaded file:', error);
                    alert(`Error processing file ${file.name}. Please make sure it's a valid audio file.`);
                }
            }
        }
    }
}

const audioRecorder = new AudioRecorder();

let recordingTimeouts = {};

function toggleRecording(button) {
    const classSection = button.closest('.class-section');
    const classIndex = Array.from(document.querySelectorAll('.class-section')).indexOf(classSection);
    
    if (!audioRecorder.isRecording) {
        audioRecorder.initialize().then(success => {
            if (success) {
                audioRecorder.startRecording(classIndex);
            }
        });
    } else {
        audioRecorder.stopRecording();
    }
}

function uploadAudio(input) {
    const classSection = input.closest('.class-section');
    const classIndex = Array.from(document.querySelectorAll('.class-section')).indexOf(classSection);
    
    if (input.files.length > 0) {
        audioRecorder.processUploadedFiles(input.files, classIndex);
        input.value = '';
    }
}

function playSample(classIndex, sampleIndex) {
    if (window.audioSamples && window.audioSamples[classIndex] && window.audioSamples[classIndex][sampleIndex]) {
        const sample = window.audioSamples[classIndex][sampleIndex];
        const audioUrl = URL.createObjectURL(sample.blob);
        const audio = new Audio(audioUrl);
        
        audio.play().then(() => {
            console.log(`Playing sample ${sampleIndex + 1} from class ${classIndex + 1}`);
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
        
        // Clean up the URL after playing
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
        });
    }
}

function removeSample(classIndex, sampleIndex) {
    if (window.audioSamples && window.audioSamples[classIndex]) {
        window.audioSamples[classIndex].splice(sampleIndex, 1);
        audioRecorder.updateSamplesDisplay(classIndex);
        audioRecorder.checkTrainingRequirements();
    }
}