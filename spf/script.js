document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const scanButton = document.getElementById('scanButton');
    const stopButton = document.getElementById('stopButton');
    const resultElement = document.getElementById('result');
    const scannerOverlay = document.getElementById('scannerOverlay');
    const successNotification = document.getElementById('scanSuccess');
    const successSound = document.getElementById('successSound');
    const beepSound = document.getElementById('beepSound');
    
    let codeReader;
    let selectedDeviceId;
    let lastResult = '';
    let lastScanTime = 0;
    
    // Initialize the ZXing barcode reader
    function initBarcodeReader() {
        codeReader = new ZXing.BrowserMultiFormatReader();
        
        codeReader.listVideoInputDevices()
            .then((videoInputDevices) => {
                if (videoInputDevices.length > 0) {
                    // Select the rear camera if available (usually for mobile devices)
                    selectedDeviceId = videoInputDevices.find(device => 
                        /(back|rear)/i.test(device.label)
                    )?.deviceId || videoInputDevices[0].deviceId;
                }
            })
            .catch((err) => {
                console.error('Error listing video devices:', err);
                resultElement.textContent = 'Error listing video devices: ' + err;
            });
    }
    
    // Start scanning
    function startScanning() {
        if (!codeReader) {
            initBarcodeReader();
        }

        video.style.display = 'block';
        scannerOverlay.style.display = 'block';
        scanButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
        resultElement.textContent = 'Scanning...';
        
        // Add scanning animation class
        scannerOverlay.classList.add('scanning');
        
        // Play a beep sound to indicate scanning started
        beepSound.play();
        
        // Decode continuously from video
        codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
            if (result) {
                // Check if this is a new scan (avoid multiple detections of same code)
                const now = Date.now();
                if (lastResult !== result.text || now - lastScanTime > 2000) {
                    lastResult = result.text;
                    lastScanTime = now;
                    
                    // Successfully detected a barcode
                    console.log('Barcode found:', result.text);
                    resultElement.textContent = result.text;
                    
                    // Play success sound
                    successSound.play();
                    
                    // Show success animation
                    showSuccessNotification();
                    
                    // Highlight the result with a success animation
                    resultElement.style.backgroundColor = '#d4edda';
                    resultElement.style.color = '#155724';
                    resultElement.style.transition = 'background-color 0.5s';
                    
                    // Return to normal style after a delay
                    setTimeout(() => {
                        resultElement.style.backgroundColor = '';
                        resultElement.style.color = '';
                    }, 1000);
                }
            }
            
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error('Scan error:', err);
            }
        });
    }
    
    // Stop scanning
    function stopScanning() {
        if (codeReader) {
            codeReader.reset();
            video.style.display = 'none';
            scannerOverlay.style.display = 'none';
            scanButton.style.display = 'inline-block';
            stopButton.style.display = 'none';
            
            // Remove scanning animation class
            scannerOverlay.classList.remove('scanning');
            
            if (resultElement.textContent === 'Scanning...') {
                resultElement.textContent = 'No data scanned yet';
            }
        }
    }
    
    // Show success notification
    function showSuccessNotification() {
        successNotification.classList.add('show');
        
        // Vibrate if supported (mobile devices)
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        
        setTimeout(() => {
            successNotification.classList.remove('show');
        }, 2000);
    }
    
    // Event listeners
    scanButton.addEventListener('click', startScanning);
    stopButton.addEventListener('click', stopScanning);
    
    // Check for camera permissions when page loads
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        initBarcodeReader();
    } else {
        resultElement.textContent = 'Camera access is not supported by your browser';
        scanButton.disabled = true;
    }
});
