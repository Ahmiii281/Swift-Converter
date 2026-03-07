// PPTX to PDF Converter - Advanced Version using JSZip and jsPDF
class PptxToPdfConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupFileValidation();
    }

    initializeElements() {
        this.pptxUpload = document.getElementById('pptxUpload');
        this.convertButton = document.getElementById('convertPptxButton');
        this.downloadLink = document.getElementById('downloadLink');
        this.pdfOutput = document.getElementById('pdfOutput');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.statusMessage = document.getElementById('statusMessage');
    }

    setupEventListeners() {
        this.pptxUpload.addEventListener('change', (e) => this.handleFileSelection(e));
        this.convertButton.addEventListener('click', () => this.convertPptxToPdf());
    }

    setupFileValidation() {
        this.pptxUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.validateFile(file);
            }
        });
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pptx')) {
            this.showError('Please select a valid PPTX file.');
            this.resetForm();
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File size must be less than 50MB.');
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

    async convertPptxToPdf() {
        const pptxFile = this.pptxUpload.files[0];

        if (!pptxFile) {
            this.showError('Please select a PPTX file first.');
            return;
        }

        try {
            this.setLoadingState(true);
            this.showProgress(10, 'Reading PPTX file...');

            await this.performConversion(pptxFile);

        } catch (error) {
            this.handleError(error);
        }
    }

    async performConversion(file) {
        try {
            if (!window.JSZip || !window.jspdf || !window.jspdf.jsPDF) {
                throw new Error("Required libraries (JSZip or jsPDF) failed to load.");
            }

            this.showProgress(20, 'Extracting presentation data...');

            const zip = new JSZip();
            const contents = await zip.loadAsync(file);

            // Find all slide XML files
            const slideFiles = Object.keys(contents.files)
                .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
                .sort((a, b) => {
                    const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
                    const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
                    return numA - numB;
                });

            if (slideFiles.length === 0) {
                throw new Error("No slides found in this presentation.");
            }

            this.showProgress(40, `Found ${slideFiles.length} slides. Processing text...`);

            const doc = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: [960, 540] // typical 16:9 slide size
            });

            for (let i = 0; i < slideFiles.length; i++) {
                this.showProgress(40 + (i / slideFiles.length) * 40, `Rendering slide ${i + 1} of ${slideFiles.length}...`);

                if (i > 0) doc.addPage();

                const slideXmlStr = await contents.files[slideFiles[i]].async("string");
                const parser = new DOMParser();
                const slideDoc = parser.parseFromString(slideXmlStr, "text/xml");

                // Extract text tags <a:t>
                const textNodes = slideDoc.getElementsByTagName("a:t");

                let currentY = 50;
                doc.setFontSize(16);
                doc.setTextColor(50, 50, 50);

                doc.text(`Slide ${i + 1}`, 20, 30);

                let slideTextContent = [];
                for (let j = 0; j < textNodes.length; j++) {
                    const text = textNodes[j].textContent.trim();
                    if (text) {
                        slideTextContent.push(text);
                    }
                }

                // Print collected text onto JS PDF (basic top-down layout)
                doc.setFontSize(22);
                doc.setTextColor(20, 20, 20);

                let yPos = 80;
                slideTextContent.forEach((txt) => {
                    // Split text if it's too long
                    const lines = doc.splitTextToSize(txt, 900);
                    doc.text(lines, 30, yPos);
                    yPos += (lines.length * 30) + 10;
                    if (yPos > 500) {
                        return; // avoid running off slide
                    }
                });
            }

            this.showProgress(90, 'Finalizing document layout...');

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);

            this.downloadLink.href = url;
            this.downloadLink.style.display = 'inline-block';
            this.downloadLink.classList.remove('download-hidden');
            this.downloadLink.download = `presentation-${new Date().toISOString().split('T')[0]}.pdf`;

            // Clean up old listeners
            const oldLink = this.downloadLink;
            const newLink = oldLink.cloneNode(true);
            oldLink.replaceWith(newLink);
            this.downloadLink = document.getElementById('downloadLink');

            this.downloadLink.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            this.showProgress(100, 'Conversion complete!');
            this.displayResults(slideFiles.length);

        } catch (error) {
            throw new Error('PPTX extraction failed: ' + error.message);
        }
    }

    displayResults(slideCount) {
        this.hideProgress();
        this.setLoadingState(false);

        this.pdfOutput.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle text-success" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Successfully Converted!</h3>
                <p>We've created a PDF document containing the text content from ${slideCount} slides.</p>
                <div class="mt-4">
                    <small class="text-muted">
                        Click the download button below to get your PDF.
                    </small>
                </div>
            </div>
        `;

        this.downloadLink.style.display = 'inline-block';
        this.downloadLink.classList.remove('download-hidden');
        this.showSuccess('PPTX converted to PDF successfully!');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        this.pptxUpload.disabled = loading;

        if (loading) {
            this.convertButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Processing...';
            this.convertButton.classList.add('loading');
        } else {
            this.convertButton.innerHTML = '<i class="fas fa-file-pdf" aria-hidden="true"></i> Convert to PDF';
            this.convertButton.classList.remove('loading');
        }
    }

    showSuccess(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-success';
    }

    showInfo(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-info';
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
        console.error('PPTX to PDF Conversion Error:', error);
        this.hideProgress();
        this.setLoadingState(false);
        this.showError(`Error: ${error.message}`);

        this.pdfOutput.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-circle text-error" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Conversion Failed</h3>
                <p>An error occurred during the conversion process. Please verify the file is a valid PPTX and try again.</p>
            </div>
        `;
    }

    resetForm() {
        this.pptxUpload.value = '';
        this.convertButton.disabled = true;
        this.downloadLink.style.display = 'none';
        this.downloadLink.classList.add('download-hidden');
        this.pdfOutput.innerHTML = '<p class="text-center text-muted">Upload a PPTX file to start the conversion process.</p>';
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PptxToPdfConverter();
});