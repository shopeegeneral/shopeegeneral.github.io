document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let codeReader = null;
    let selectedDeviceId = null;
    let lastScannedResult = '';
    let currentModule = '';
    
    // Initialize
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    setupEventListeners();
    
    // Update current time display
    function updateCurrentTime() {
        const now = new Date();
        const formattedTime = now.toLocaleString();
        document.getElementById('currentTime').textContent = formattedTime;
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Module buttons
        const moduleButtons = document.querySelectorAll('.module-button');
        moduleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const moduleId = this.dataset.module;
                showModule(moduleId);
            });
        });
        
        // Back button
        document.getElementById('backButton').addEventListener('click', goBack);
        
        // Scanner buttons
        document.getElementById('scanButton').addEventListener('click', startScanner);
        document.getElementById('stopButton').addEventListener('click', stopScanner);
        
        // Order number confirm button
        document.getElementById('confirmButton').addEventListener('click', saveData);
        document.getElementById('cancelButton').addEventListener('click', cancel);
        
        // Enter key on order input field
        document.getElementById('orderNumberInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveData();
            }
        });
    }
    
    // Show selected module
    function showModule(moduleId) {
        document.getElementById('moduleSelection').style.display = 'none';
    
        if (moduleId === 'receiveStation') {
            document.getElementById('receiveStationModule').style.display = 'block';
            currentModule = moduleId;
        } else if (moduleId === 'outboundHub') {
            document.getElementById('outboundHubModule').style.display = 'block';
            currentModule = moduleId;
        } else {
            showNotification('This module is not yet implemented', true);
            document.getElementById('moduleSelection').style.display = 'block';
        }
    }
    

    
    // Go back to module selection
    function goBack() {
        // Reset and hide all modules
        document.getElementById('receiveStationModule').style.display = 'none';
        
        // Stop scanner if it's running
        if (codeReader) {
            stopScanner();
        }
        
        // Reset scanned result
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('scanResult').textContent = 'No data scanned yet';
        lastScannedResult = '';
        
        // Show module selection
        document.getElementById('moduleSelection').style.display = 'block';
        currentModule = '';
    }
    
    // Initialize barcode reader
    function initBarcodeReader() {
        if (codeReader) {
            return; // Already initialized
        }
        
        try {
            codeReader = new ZXing.BrowserMultiFormatReader();
            
            codeReader.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('No camera found on this device', true);
                        return;
                    }
                    
                    // Select rear camera if available
                    // Select rear camera if available
                    selectedDeviceId = videoInputDevices.find(device => 
                        /(back|rear)/i.test(device.label)
                    )?.deviceId || videoInputDevices[0].deviceId;
                })
                .catch(err => {
                    showNotification('Error accessing camera', true);
                });
        } catch (err) {
            showNotification('Failed to initialize barcode scanner', true);
        }
    }
    
    // Start camera scanner
    function startScanner() {
        const stationInput = document.getElementById('stationInput');
        const stationValue = stationInput.value.trim();
        
        // Verify station is entered
        if (!stationValue) {
            showNotification('Please enter a Station ID first', true);
            stationInput.focus();
            return;
        }
        
        // Initialize barcode reader if needed
        if (!codeReader) {
            initBarcodeReader();
        }
        
        const video = document.getElementById('video');
        const scannerPlaceholder = document.getElementById('scannerPlaceholder');
        const scannerOverlay = document.getElementById('scannerOverlay');
        const scanButton = document.getElementById('scanButton');
        const stopButton = document.getElementById('stopButton');
        
        // Start video stream
        codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
            // Hide placeholder and show video with overlay
            scannerPlaceholder.style.display = 'none';
            video.style.display = 'block';
            scannerOverlay.style.display = 'block';
            
            // Toggle buttons
            scanButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            
            // Handle successful scan
            if (result) {
                playBipSound();
                
                // Get scanned text
                const scannedText = result.getText();
                
                // Avoid duplicate scans
                if (scannedText !== lastScannedResult) {
                    lastScannedResult = scannedText;
                    
                    // Display the result
                    const resultContainer = document.getElementById('resultContainer');
                    const scanResult = document.getElementById('scanResult');
                    
                    scanResult.textContent = scannedText;
                    resultContainer.style.display = 'block';
                    
                    // Focus on order number input
                    document.getElementById('orderNumberInput').value = '';
                    document.getElementById('orderNumberInput').focus();
                    
                    // Vibrate if supported
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                    
                    showNotification('Code scanned successfully');
                    
                    // Highlight the result briefly
                    scanResult.style.backgroundColor = '#d4edda';
                    setTimeout(() => {
                        scanResult.style.backgroundColor = '';
                    }, 1000);
                }
            }
        })
        .catch(err => {
            showNotification('Failed to start camera', true);
            
            // Reset UI
            scanButton.style.display = 'inline-block';
            stopButton.style.display = 'none';
            video.style.display = 'none';
            scannerPlaceholder.style.display = 'flex';
            scannerOverlay.style.display = 'none';
        });
    }
    
    // Stop camera scanner
    function stopScanner() {
        if (codeReader) {
            codeReader.reset();
            
            // Update UI
            document.getElementById('scanButton').style.display = 'inline-block';
            document.getElementById('stopButton').style.display = 'none';
            document.getElementById('video').style.display = 'none';
            document.getElementById('scannerPlaceholder').style.display = 'flex';
            document.getElementById('scannerOverlay').style.display = 'none';
        }
    }

    // cancel
    function cancel() {
        // Reset the order input field and scan result for next scan
        orderNumberInput.value = '';
        lastScannedResult = '';
        scanResult.textContent = 'No data scanned yet';
        document.getElementById('resultContainer').style.display = 'none';
       
    }
    
    // Save scanned data
    function saveData() {
        const stationInput = document.getElementById('stationInput');
        const scanResult = document.getElementById('scanResult');
        const orderNumberInput = document.getElementById('orderNumberInput');
        
        const stationValue = stationInput.value.trim().toUpperCase();
        const scannedCode = scanResult.textContent.toUpperCase();
        const orderNumber = orderNumberInput.value.trim().toUpperCase();
        
        // Validate inputs
        if (!stationValue) {
            showNotification('Please enter a Station ID', true);
            stationInput.focus();
            return;
        }
        
        if (scannedCode === 'No data scanned yet') {
            showNotification('Please scan a barcode first', true);
            return;
        }
        
        if (!orderNumber || orderNumber.length !== 5) {
            showNotification('Please enter valid 5 digits of order number', true);
            orderNumberInput.focus();
            return;
        }
        
        // Prepare data to send
        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            scannedCode: scannedCode,
            orderNumber: orderNumber
        };

        console.log('Data to send:', data);
        showNotification('Data saved successfully');
                
        // Reset the order input field and scan result for next scan
        orderNumberInput.value = '';
        lastScannedResult = '';
        scanResult.textContent = 'No data scanned yet';
        document.getElementById('resultContainer').style.display = 'none';
        playSuccessSound();
        
        // Send data to server using fetch API
        fetch('https://script.google.com/macros/s/AKfycbws1RScLCJ1NkCP8g4B_35eDE5cNsbpxXL9a3e9iimxHSzJXXmWZCO9s2r2-w8hHpoi/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                showNotification('Data saved successfully');
                
                // Reset the order input field and scan result for next scan
                orderNumberInput.value = '';
                lastScannedResult = '';
                scanResult.textContent = 'No data scanned yet';
                document.getElementById('resultContainer').style.display = 'none';
            } else {
                throw new Error(result.message || 'Unknown error');
            }
        })
        .catch(error => {
            
            console.log('Data saved successfully');
        });
    }
});

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + (isError ? 'error' : '');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function playSuccessSound() {
    // Play success sound
    const sound = new Audio('sounds/success.mp3');
    sound.play();
}

function playBipSound() {
    // Play bip sound
    const sound = new Audio('sounds/bip.mp3');
    sound.play();
}

// Outbound Hub
document.addEventListener('DOMContentLoaded', function() {
    let codeReaderOutbound = null;
    let selectedDeviceIdOutbound = null;
    let lastScannedResultOutbound = '';
    
    document.getElementById('startOutboundButton').addEventListener('click', function() {
        const stationInput = document.getElementById('stationInputOutbound').value.trim();
        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            document.getElementById('stationInputOutbound').focus();
            return;
        }
        document.getElementById('inputContainerOutbound').style.display = 'block';
        document.getElementById('outboundInput').focus();
    });

    document.getElementById('confirmOutboundButton').addEventListener('click', function() {
        startOutboundScanning();
    });

    document.getElementById('outboundInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            startOutboundScanning();
        }
    });

    function startOutboundScanning() {
        const stationInput = document.getElementById('stationInputOutbound').value.trim();
        const outboundInput = document.getElementById('outboundInput').value.trim();

        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            return;
        }

        if (!outboundInput) {
            showNotification('Vui lòng nhập dữ liệu', true);
            return;
        }

        document.getElementById('cameraControlsOutbound').style.display = 'block';
        document.getElementById('scannerContainerOutbound').style.display = 'block';

        if (!codeReaderOutbound) {
            initBarcodeReaderOutbound();
        }
        
        startScannerOutbound();
    }

    function initBarcodeReaderOutbound() {
        if (codeReaderOutbound) return;

        try {
            codeReaderOutbound = new ZXing.BrowserMultiFormatReader();
            codeReaderOutbound.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('Không tìm thấy camera', true);
                        return;
                    }
                    selectedDeviceIdOutbound = videoInputDevices.find(device =>
                        /(back|rear)/i.test(device.label)
                    )?.deviceId || videoInputDevices[0].deviceId;
                })
                .catch(err => {
                    showNotification('Lỗi khi truy cập camera', true);
                });
        } catch (err) {
            showNotification('Không thể khởi tạo scanner', true);
        }
    }

    function startScannerOutbound() {
        const video = document.getElementById('videoOutbound');
        let scanningPaused = false; // Biến kiểm soát việc quét liên tục
    
        codeReaderOutbound.decodeFromVideoDevice(selectedDeviceIdOutbound, 'videoOutbound', (result, err) => {
            if (result) {
                if (scanningPaused) return; // Nếu đang tạm dừng, bỏ qua lần quét này
    
                scanningPaused = true; // Chặn quét ngay khi có kết quả
                
                lastScannedResultOutbound = result.getText();
                sendDataOutbound();
    
                // Nghỉ 0.5 giây trước khi cho phép quét tiếp
                setTimeout(() => {
                    scanningPaused = false;
                }, 1000);
            }
        }).catch(err => {
            showNotification('Không thể khởi động camera', true);
        });
    }
    

    function sendDataOutbound() {
        const stationValue = document.getElementById('stationInputOutbound').value.trim();
        const outboundInput = document.getElementById('outboundInput').value.trim();
        const scannedCode = lastScannedResultOutbound.toUpperCase();

        if (!scannedCode) {
            showNotification('Không có dữ liệu quét', true);
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            inputData: outboundInput,
            scannedCode: scannedCode
        };
        console.log('Outbound Data to send:', data);
        showNotification('Dữ liệu đã gửi thành công');
        // playSuccessSound();
        const sound = new Audio('sounds/success.mp3');
        sound.play();

        fetch('https://script.google.com/macros/s/AKfycbwae6BoQKqIqioTJpUQsEUOxLcidRMnUc4O7gLgXXku4h_c1sJiEdeg9QkxiyK0pSDV/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(() => {
            // showNotification('Dữ liệu đã gửi thành công');
            console.log('Dữ liệu đã gửi thành công');
        }).catch(() => {
            showNotification('Gửi dữ liệu thất bại', true);
        });
    }

    document.getElementById('stopButtonOutbound').addEventListener('click', function() {
        if (codeReaderOutbound) {
            codeReaderOutbound.reset();
            document.getElementById('cameraControlsOutbound').style.display = 'none';
            document.getElementById('scannerContainerOutbound').style.display = 'none';
            document.getElementById("outboundInput").value = ''; // Reset input field
            document.getElementById('inputContainerOutbound').style.display = 'none';
        }
    });

    document.getElementById('backButtonOutboundHub').addEventListener('click', function() {
        document.getElementById('outboundHubModule').style.display = 'none';
        document.getElementById('moduleSelection').style.display = 'block';
    });
    
});
