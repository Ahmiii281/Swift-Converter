// pptxtopdf.js

async function convertPptxToPdf() {
    const pptxFile = document.getElementById('pptxUpload').files[0];
    const downloadLink = document.getElementById('downloadLink');
    const pdfOutput = document.getElementById('pdfOutput');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    if (!pptxFile) {
        alert("Please upload a PPTX file first.");
        return;
    }

    // Reset previous outputs
    downloadLink.style.display = 'none';
    pdfOutput.innerText = '';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.innerText = '0%';

    // Initialize CloudConvert
    const apiKey = 'YOUR_CLOUDCONVERT_API_KEY'; // Replace with your CloudConvert API Key
    const cloudConvert = new CloudConvert(apiKey);

    try {
        // Create a new job
        const job = await cloudConvert.jobs.create({
            tasks: {
                'import-pptx': {
                    operation: 'import/upload'
                },
                'convert-pptx-to-pdf': {
                    operation: 'convert',
                    input: 'import-pptx',
                    engine: 'office',
                    input_format: 'pptx',
                    output_format: 'pdf',
                    engine_version: 'latest',
                    engine_settings: {}
                },
                'export-pdf': {
                    operation: 'export/url',
                    input: 'convert-pptx-to-pdf'
                }
            }
        });

        const importTask = job.tasks.filter(task => task.name === 'import-pptx')[0];
        const convertTask = job.tasks.filter(task => task.name === 'convert-pptx-to-pdf')[0];
        const exportTask = job.tasks.filter(task => task.name === 'export-pdf')[0];

        // Upload the file to the import task
        await cloudConvert.tasks.upload(importTask, pptxFile, (progress) => {
            const percent = Math.round(progress.percent);
            progressBar.style.width = `${percent}%`;
            progressBar.innerText = `${percent}%`;
        });

        // Wait for the conversion task to finish
        await cloudConvert.jobs.wait(job.id);

        // Get the export task result
        const exportResult = exportTask.result.files[0].url;

        // Update the download link
        downloadLink.href = exportResult;
        downloadLink.style.display = 'inline-block';
        downloadLink.innerText = 'Download PDF Document';

        // Update the progress bar to 100%
        progressBar.style.width = '100%';
        progressBar.innerText = '100%';
        progressContainer.style.display = 'none';

        // Optionally, display a success message
        pdfOutput.innerText = "Conversion complete! Click the link below to download your PDF.";
    } catch (error) {
        console.error(error);
        progressContainer.style.display = 'none';
        pdfOutput.innerText = "An error occurred during conversion. Please try again.";
    }
}
