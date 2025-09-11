class AudioContextManager {
    constructor() {
        this.audioContext = null;
        this.targetSampleRate = 44100;
    }

    async getAudioContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        }
        
        return this.audioContext;
    }

    getSampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : this.targetSampleRate;
    }

    async closeContext() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Create a singleton instance
const audioContextManager = new AudioContextManager();