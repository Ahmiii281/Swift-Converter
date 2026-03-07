// QR Generator using qr-code-styling (https://github.com/kozakdenys/qr-code-styling)
(function () {
  const input = document.getElementById('qr-input');
  const sizeInput = document.getElementById('qr-size');
  const sizeLabel = document.getElementById('qr-size-label');
  const colorInput = document.getElementById('qr-color');
  const dotsInput = document.getElementById('qr-dots');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const qrcodeContainer = document.getElementById('qrcode');

  let qrCode = null;

  function updateSizeLabel() {
    sizeLabel.textContent = sizeInput.value;
  }

  function initQR() {
    const size = parseInt(sizeInput.value, 10) || 300;
    const text = (input.value || '').trim() || 'https://swift-converter.com';
    const color = colorInput.value || '#000000';
    const dotType = dotsInput.value || 'square';

    // Clear the container
    qrcodeContainer.innerHTML = '';

    // Initialize qr-code-styling
    qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: text,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H"
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5
      },
      dotsOptions: {
        type: dotType,
        color: color
      },
      backgroundOptions: {
        color: "#ffffff"
      },
      cornersSquareOptions: {
        type: dotType === "dots" || dotType === "rounded" || dotType === "extra-rounded" ? "extra-rounded" : "square",
        color: color
      },
      cornersDotOptions: {
        type: dotType === "dots" ? "dot" : "square",
        color: color
      }
    });

    qrCode.append(qrcodeContainer);
    downloadBtn.disabled = false;
  }

  function generate() {
    const text = (input.value || '').trim();
    if (!text) {
      alert('Please enter text or a URL to generate a QR code.');
      input.focus();
      return;
    }
    initQR();
  }

  function downloadPNG() {
    if (!qrCode) return;
    qrCode.download({ name: "swift-converter-qr", extension: "png" });
  }

  // Event listeners
  if (sizeInput) {
    sizeInput.addEventListener('input', updateSizeLabel);
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPNG);

  // Real-time update on options change
  [sizeInput, colorInput, dotsInput].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        if (input.value.trim()) {
          generate();
        } else {
          initQR(); // default qr
        }
      });
    }
  });

  // Init with default placeholder
  updateSizeLabel();
  initQR();
})();
