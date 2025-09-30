// QR Generator wiring using qrcodejs (https://davidshimjs.github.io/qrcodejs/)
(function () {
  const input = document.getElementById('qr-input');
  const sizeInput = document.getElementById('qr-size');
  const sizeLabel = document.getElementById('qr-size-label');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const qrcodeContainer = document.getElementById('qrcode');
  let qr;

  function updateSizeLabel() {
    sizeLabel.textContent = sizeInput.value;
  }

  function clearQRCode() {
    qrcodeContainer.innerHTML = '';
    downloadBtn.disabled = true;
  }

  function generate() {
    const text = (input.value || '').trim();
    if (!text) {
      alert('Please enter text or a URL to generate a QR code.');
      return;
    }

    clearQRCode();
    const size = parseInt(sizeInput.value, 10) || 256;

    // Create QRCode (qrcodejs creates an <img> or a table inside the container)
    qr = new QRCode(qrcodeContainer, {
      text: text,
      width: size,
      height: size,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    // If the library hasn't created an <img> yet (some browsers), wait a tick
    setTimeout(() => {
      const img = qrcodeContainer.querySelector('img');
      const canvas = qrcodeContainer.querySelector('canvas');
      if (img || canvas) {
        downloadBtn.disabled = false;
      }
    }, 100);
  }

  function downloadPNG() {
    const img = qrcodeContainer.querySelector('img');
    const canvas = qrcodeContainer.querySelector('canvas');
    let dataUrl;

    if (img && img.src) {
      dataUrl = img.src;
    } else if (canvas) {
      dataUrl = canvas.toDataURL('image/png');
    }

    if (!dataUrl) {
      alert('No QR code available to download. Please generate one first.');
      return;
    }

    // Create a link to trigger download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'swift-converter-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Event listeners
  if (sizeInput) {
    sizeInput.addEventListener('input', updateSizeLabel);
    updateSizeLabel();
  }
  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPNG);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    input.value = '';
    clearQRCode();
  });
})();
