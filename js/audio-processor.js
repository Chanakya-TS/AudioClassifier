class AudioProcessor {
    constructor() {
        this.segmentDuration = 1.0; // 1 second segments
        this.fftSize = 1024;
        this.hopSize = 512;
        this.melBins = 128;
    }

    getSampleRate() {
        return audioContextManager.getSampleRate();
    }

    async processAudioSamples(audioSamples) {
        const processedData = [];
        const labels = [];
        
        for (let classIndex = 0; classIndex < audioSamples.length; classIndex++) {
            if (!audioSamples[classIndex]) continue;
            
            const className = document.querySelectorAll('.class-name')[classIndex].value || `Class ${classIndex + 1}`;
            
            for (let sample of audioSamples[classIndex]) {
                try {
                    const audioBuffer = await this.blobToAudioBuffer(sample.blob);
                    const segments = this.segmentAudio(audioBuffer);
                    
                    for (let segment of segments) {
                        const spectrogram = this.computeSpectrogram(segment);
                        processedData.push(spectrogram);
                        labels.push(classIndex);
                    }
                } catch (error) {
                    console.error('Error processing audio sample:', error);
                }
            }
        }
        
        return { data: processedData, labels: labels };
    }

    async blobToAudioBuffer(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = await audioContextManager.getAudioContext();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    segmentAudio(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const segmentLength = Math.floor(this.getSampleRate() * this.segmentDuration);
        const segments = [];
        
        for (let i = 0; i + segmentLength <= channelData.length; i += segmentLength / 2) {
            const segment = new Float32Array(segmentLength);
            for (let j = 0; j < segmentLength; j++) {
                segment[j] = channelData[i + j] || 0;
            }
            segments.push(segment);
        }
        
        return segments;
    }

    computeSpectrogram(audioSegment) {
        const spectrograms = [];
        const windowSize = this.fftSize;
        const hopSize = this.hopSize;
        
        for (let i = 0; i + windowSize <= audioSegment.length; i += hopSize) {
            const windowedSegment = new Float32Array(windowSize);
            
            for (let j = 0; j < windowSize; j++) {
                const hannWindow = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / (windowSize - 1));
                windowedSegment[j] = audioSegment[i + j] * hannWindow;
            }
            
            const fftResult = this.fft(windowedSegment);
            const magnitude = this.computeMagnitude(fftResult);
            const melFiltered = this.applyMelFilterBank(magnitude);
            spectrograms.push(melFiltered);
        }
        
        return this.normalizeSpectrogram(spectrograms);
    }

    fft(signal) {
        const N = signal.length;
        if (N <= 1) return [{ real: signal[0] || 0, imag: 0 }];
        
        if (N % 2 !== 0) {
            throw new Error('FFT size must be power of 2');
        }
        
        const even = new Float32Array(N / 2);
        const odd = new Float32Array(N / 2);
        
        for (let i = 0; i < N / 2; i++) {
            even[i] = signal[2 * i];
            odd[i] = signal[2 * i + 1];
        }
        
        const evenFFT = this.fft(even);
        const oddFFT = this.fft(odd);
        
        const result = new Array(N);
        
        for (let i = 0; i < N / 2; i++) {
            const angle = -2 * Math.PI * i / N;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const tReal = cos * oddFFT[i].real - sin * oddFFT[i].imag;
            const tImag = sin * oddFFT[i].real + cos * oddFFT[i].imag;
            
            result[i] = {
                real: evenFFT[i].real + tReal,
                imag: evenFFT[i].imag + tImag
            };
            
            result[i + N / 2] = {
                real: evenFFT[i].real - tReal,
                imag: evenFFT[i].imag - tImag
            };
        }
        
        return result;
    }

    computeMagnitude(fftResult) {
        return fftResult.map(complex => 
            Math.sqrt(complex.real * complex.real + complex.imag * complex.imag)
        );
    }

    applyMelFilterBank(magnitude) {
        const numFilters = this.melBins;
        const fftBins = magnitude.length;
        const melFilters = this.createMelFilterBank(numFilters, fftBins, this.getSampleRate());
        
        const melSpectrum = new Array(numFilters).fill(0);
        
        for (let i = 0; i < numFilters; i++) {
            for (let j = 0; j < fftBins; j++) {
                melSpectrum[i] += magnitude[j] * melFilters[i][j];
            }
            melSpectrum[i] = Math.log(Math.max(melSpectrum[i], 1e-10));
        }
        
        return melSpectrum;
    }

    createMelFilterBank(numFilters, fftBins, sampleRate) {
        const melFilters = [];
        const minMel = this.hzToMel(0);
        const maxMel = this.hzToMel(sampleRate / 2);
        
        const melPoints = [];
        for (let i = 0; i <= numFilters + 1; i++) {
            melPoints.push(minMel + (maxMel - minMel) * i / (numFilters + 1));
        }
        
        const hzPoints = melPoints.map(mel => this.melToHz(mel));
        const binPoints = hzPoints.map(hz => Math.floor((fftBins + 1) * hz / (sampleRate / 2)));
        
        for (let i = 1; i <= numFilters; i++) {
            const filter = new Array(fftBins).fill(0);
            
            for (let j = binPoints[i - 1]; j < binPoints[i]; j++) {
                if (j < fftBins) {
                    filter[j] = (j - binPoints[i - 1]) / (binPoints[i] - binPoints[i - 1]);
                }
            }
            
            for (let j = binPoints[i]; j < binPoints[i + 1]; j++) {
                if (j < fftBins) {
                    filter[j] = (binPoints[i + 1] - j) / (binPoints[i + 1] - binPoints[i]);
                }
            }
            
            melFilters.push(filter);
        }
        
        return melFilters;
    }

    hzToMel(hz) {
        return 2595 * Math.log10(1 + hz / 700);
    }

    melToHz(mel) {
        return 700 * (Math.pow(10, mel / 2595) - 1);
    }

    normalizeSpectrogram(spectrogram) {
        if (spectrogram.length === 0) return [];
        
        const flattened = spectrogram.flat();
        const mean = flattened.reduce((sum, val) => sum + val, 0) / flattened.length;
        const variance = flattened.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flattened.length;
        const std = Math.sqrt(variance);
        
        return spectrogram.map(frame => 
            frame.map(val => (val - mean) / (std + 1e-8))
        );
    }

    async processLiveAudio(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const segmentLength = Math.floor(this.getSampleRate() * this.segmentDuration);
        
        if (channelData.length < segmentLength) {
            const paddedData = new Float32Array(segmentLength);
            paddedData.set(channelData);
            return this.computeSpectrogram(paddedData);
        }
        
        const lastSegment = channelData.slice(-segmentLength);
        return this.computeSpectrogram(lastSegment);
    }

    visualizeAudio(audioBuffer, canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const channelData = audioBuffer.getChannelData(0);
        const step = Math.ceil(channelData.length / width);
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < width; i++) {
            const sample = channelData[i * step] || 0;
            const y = (1 + sample) * height / 2;
            
            if (i === 0) {
                ctx.moveTo(i, y);
            } else {
                ctx.lineTo(i, y);
            }
        }
        
        ctx.stroke();
    }
}

const audioProcessor = new AudioProcessor();