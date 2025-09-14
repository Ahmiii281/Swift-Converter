// Image to Text Converter - Enhanced Version
class ImageToTextConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupFileValidation();
    }

    initializeElements() {
        this.imageUpload = document.getElementById('imageUpload');
        this.convertButton = document.getElementById('convertImageButton');
        this.outputElement = document.getElementById('output');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.statusMessage = document.getElementById('statusMessage');
        this.copyButton = document.getElementById('copyButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.extractedText = '';
    }

    setupEventListeners() {
        this.imageUpload.addEventListener('change', (e) => this.handleFileSelection(e));
        this.convertButton.addEventListener('click', () => this.convertImage());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        this.downloadButton.addEventListener('click', () => this.downloadText());
    }

    setupFileValidation() {
        this.imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.validateFile(file);
            }
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please select a valid image file (JPG, PNG, GIF, BMP, TIFF).');
            this.resetForm();
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File size must be less than 10MB.');
            this.resetForm();
            return false;
        }

        this.convertButton.disabled = false;
        this.showSuccess(`Selected: ${file.name} (${this.formatFileSize(file.size)})`);
        return true;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async convertImage() {
        const imageFile = this.imageUpload.files[0];
        
        if (!imageFile) {
            this.showError('Please select an image file first.');
            return;
        }

        try {
            this.setLoadingState(true);
            this.showProgress(0, 'Initializing OCR engine...');
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await this.performOCR(e.target.result);
                } catch (error) {
                    this.handleError(error);
                }
            };
            
            reader.onerror = () => {
                this.handleError(new Error('Failed to read the image file.'));
            };
            
            reader.readAsDataURL(imageFile);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    async performOCR(imageDataUrl) {
        try {
            const { data: { text } } = await Tesseract.recognize(
                imageDataUrl,
                'eng',
                {
                    logger: (progress) => {
                        if (progress.status === 'recognizing text') {
                            const percent = Math.round(progress.progress * 100);
                            this.showProgress(percent, `Recognizing text: ${percent}% complete`);
                        } else if (progress.status === 'loading tesseract core') {
                            this.showProgress(10, 'Loading OCR engine...');
                        } else if (progress.status === 'initializing tesseract') {
                            this.showProgress(20, 'Initializing OCR...');
                        } else if (progress.status === 'loading language traineddata') {
                            this.showProgress(30, 'Loading language data...');
                        }
                    },
                    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.2/dist/worker.min.js',
                    langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-data@5.0.0/',
                }
            );

            this.extractedText = text.trim();
            this.displayResults();
            
        } catch (error) {
            throw new Error('OCR processing failed: ' + error.message);
        }
    }

    displayResults() {
        this.hideProgress();
        this.setLoadingState(false);
        
        if (this.extractedText) {
            this.outputElement.innerHTML = `<pre>${this.escapeHtml(this.extractedText)}</pre>`;
            this.showSuccess('Text extraction completed successfully!');
            this.copyButton.disabled = false;
            this.downloadButton.disabled = false;
        } else {
            this.outputElement.innerHTML = '<p class="text-center text-muted">No text found in the image. Please try with a clearer image or different format.</p>';
            this.showWarning('No text detected in the image.');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async copyToClipboard() {
        if (!this.extractedText) {
            this.showError('No text to copy.');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.extractedText);
            this.showSuccess('Text copied to clipboard!');
            
            // Visual feedback
            this.copyButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
            setTimeout(() => {
                this.copyButton.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copy Text';
            }, 2000);
            
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard();
        }
    }

    fallbackCopyToClipboard() {
        const textArea = document.createElement('textarea');
        textArea.value = this.extractedText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Text copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy text. Please try again.');
        }
        
        document.body.removeChild(textArea);
    }

    downloadText() {
        if (!this.extractedText) {
            this.showError('No text to download.');
            return;
        }

        const blob = new Blob([this.extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted-text-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Text file downloaded successfully!');
    }

    showProgress(percent, message) {
        this.progressContainer.style.display = 'block';
        this.progressBar.style.width = `${percent}%`;
        this.progressBar.setAttribute('aria-valuenow', percent);
        this.statusMessage.textContent = message;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    setLoadingState(loading) {
        this.convertButton.disabled = loading;
        this.imageUpload.disabled = loading;
        
        if (loading) {
            this.convertButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Processing...';
            this.convertButton.classList.add('loading');
        } else {
            this.convertButton.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i> Extract Text';
            this.convertButton.classList.remove('loading');
        }
    }

    showSuccess(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-success';
    }

    showWarning(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-warning';
    }

    showError(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-error';
    }

    handleError(error) {
        console.error('Image to Text Conversion Error:', error);
        this.hideProgress();
        this.setLoadingState(false);
        this.showError(`Error: ${error.message}`);
    }

    resetForm() {
        this.imageUpload.value = '';
        this.convertButton.disabled = true;
        this.copyButton.disabled = true;
        this.downloadButton.disabled = true;
        this.outputElement.innerHTML = '<p class="text-center text-muted">Upload an image to see the extracted text here.</p>';
        this.extractedText = '';
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageToTextConverter();
});

// Legacy function for backward compatibility
function convertImage() {
    // This function is kept for backward compatibility
    // The new class-based approach handles everything
    console.warn('convertImage() is deprecated. Use the ImageToTextConverter class instead.');
}

function copyToClipboard() {
    // This function is kept for backward compatibility
    console.warn('copyToClipboard() is deprecated. Use the ImageToTextConverter class instead.');
}

function downloadText() {
    // This function is kept for backward compatibility
    console.warn('downloadText() is deprecated. Use the ImageToTextConverter class instead.');
}