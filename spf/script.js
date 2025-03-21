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
        // closeAllCameras()
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
        fetch('https://script.google.com/macros/s/AKfycbxTwVn4airb4Lfr5b11jYn4EKx3TOa1HeVzKGD3u1vGlYNUinkigDOz5xYIgEJVnn6CHQ/exec', {
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
// Show selected module
function showModule(moduleId) {
    document.getElementById('moduleSelection').style.display = 'none';

    if (moduleId === 'receiveStation') {
        document.getElementById('receiveStationModule').style.display = 'block';
        currentModule = moduleId;
    } else if (moduleId === 'outboundHub') {
        document.getElementById('outboundHubModule').style.display = 'block';
        currentModule = moduleId;
    } else if (moduleId === 'pickingBooth') {
        document.getElementById('pickingBoothModule').style.display = 'block';
        currentModule = moduleId;
    } else if (moduleId === 'outboundBooth') {
        document.getElementById('outboundBoothModule').style.display = 'block';
        currentModule = moduleId;
    } else if (moduleId === 'quitOrder') {
        document.getElementById('quitOrderModule').style.display = 'block';
        currentModule = moduleId;
    } else if (moduleId === 'damagedOrder') {
        document.getElementById('damageModule').style.display = 'block';
        currentModule = moduleId;
    } else {
        showNotification('This module is not yet implemented', true);
        document.getElementById('moduleSelection').style.display = 'block';
        // closeAllCameras()
    }
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + (isError ? 'error' : '');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1000);
}

// function playSuccessSound() {
//     // Play success sound
//     const sound = new Audio('sounds/success.mp3');
//     sound.play();
// }

// function playSuccessSound() {
//     let video = document.querySelector('video');
    
//     if (video) {
//         video.pause(); // Dừng video để không chặn âm thanh
//         setTimeout(() => {
//             let successSound = new Audio('sounds/success.mp3');
//             successSound.currentTime = 0;
//             successSound.play().catch(error => console.warn("Playback prevented:", error));
//             video.play(); // Phát lại video sau khi phát âm thanh
//         }, 50); // Chờ 100ms trước khi phát âm thanh
//     } else {
//         successSound.currentTime = 0;
//         successSound.play().catch(error => console.warn("Playback prevented:", error));
//     }
// }

function playSuccessSound() {
    const video = document.querySelector('video');
    const sound = new Audio('sounds/success.mp3');

    if (video && !video.paused) {
        video.pause();
        setTimeout(() => {
            sound.play().catch(err => console.warn("Playback prevented:", err));
            setTimeout(() => video.play().catch(() => {}), 300); // Phát lại video sau 0.3s
        }, 50);
    } else {
        sound.play().catch(err => console.warn("Playback prevented:", err));
    }
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
        playSuccessSound()

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
        // closeAllCameras()
    });
    
});

document.addEventListener('DOMContentLoaded', function() {
    let codeReaderPicking = null;
    let selectedDeviceIdPicking = null;
    let lastScannedResultPicking = '';
    let scanningPaused = false;

    document.getElementById('confirmPickingButton').addEventListener('click', function() {
        const stationInput = document.getElementById('stationInputPicking').value.trim().toUpperCase();
        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            document.getElementById('stationInputPicking').focus();
            return;
        }
        document.getElementById('cameraControlsPicking').style.display = 'block';
        document.getElementById('scannerContainerPicking').style.display = 'block';

        if (!codeReaderPicking) {
            initBarcodeReaderPicking();
        }
        
        startScannerPicking();
    });

    function initBarcodeReaderPicking() {
        if (codeReaderPicking) return;

        try {
            codeReaderPicking = new ZXing.BrowserMultiFormatReader();
            codeReaderPicking.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('Không tìm thấy camera', true);
                        return;
                    }
                    selectedDeviceIdPicking = videoInputDevices.find(device =>
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

    function startScannerPicking() {
        const video = document.getElementById('videoPicking');
        

        codeReaderPicking.decodeFromVideoDevice(selectedDeviceIdPicking, 'videoPicking', (result, err) => {
            if (result) {
                if (scanningPaused) return;

                scanningPaused = true;
                lastScannedResultPicking = result.getText();
                playSuccessSound();
                sendDataPicking();

                setTimeout(() => {
                    scanningPaused = false;
                }, 1000);
            }
        }).catch(err => {
            showNotification('Không thể khởi động camera', true);
        });
    }

    function sendDataPicking() {
        const stationValue = document.getElementById('stationInputPicking').value.trim().toUpperCase();
        const scannedCode = lastScannedResultPicking.toUpperCase();

        if (!scannedCode) {
            showNotification('Không có dữ liệu quét', true);
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            scannedCode: scannedCode
        };
        console.log('Picking Data to send:', data);
        showNotification('Dữ liệu đã gửi thành công');

        fetch('https://script.google.com/macros/s/AKfycbydpARQ4N-QuO5QD3ymPDfn1_Cz1jaAInT5qWEikaFEgTvQMQ4UKogABfLME4DgKxX5sA/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(() => {
            console.log('Dữ liệu đã gửi thành công');
        }).catch(() => {
            showNotification('Gửi dữ liệu thất bại', true);
        });
    }

    document.getElementById('stopButtonPicking').addEventListener('click', function() {
        if (codeReaderPicking) {
            document.getElementById("stationInputPicking").value = ''; // Reset input field
            document.getElementById("stationInputPicking").focus(); // Focus on input field
            codeReaderPicking.reset();
            document.getElementById('cameraControlsPicking').style.display = 'none';
            document.getElementById('scannerContainerPicking').style.display = 'none';
        }
    });

    document.getElementById('backButtonPicking').addEventListener('click', function() {
        document.getElementById('pickingBoothModule').style.display = 'none';
        document.getElementById('moduleSelection').style.display = 'block';
        // closeAllCameras()
    });
});

document.addEventListener('DOMContentLoaded', function() {
    let codeReaderOutboundBooth = null;
    let selectedDeviceIdOutboundBooth = null;
    let lastScannedResultOutboundBooth = '';
    let scanningPausedOutboundBooth = false;

    document.getElementById('confirmOutboundBoothButton').addEventListener('click', function() {
        const stationInput = document.getElementById('stationInputOutboundBooth').value.trim().toUpperCase();
        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            document.getElementById('stationInputOutboundBooth').focus();
            return;
        }
        document.getElementById('cameraControlsOutboundBooth').style.display = 'block';
        document.getElementById('scannerContainerOutboundBooth').style.display = 'block';

        if (!codeReaderOutboundBooth) {
            initBarcodeReaderOutboundBooth();
        }
        
        startScannerOutboundBooth();
    });

    function initBarcodeReaderOutboundBooth() {
        if (codeReaderOutboundBooth) return;

        try {
            codeReaderOutboundBooth = new ZXing.BrowserMultiFormatReader();
            codeReaderOutboundBooth.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('Không tìm thấy camera', true);
                        return;
                    }
                    selectedDeviceIdOutboundBooth = videoInputDevices.find(device =>
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

    function startScannerOutboundBooth() {
        const video = document.getElementById('videoOutboundBooth');
        

        codeReaderOutboundBooth.decodeFromVideoDevice(selectedDeviceIdOutboundBooth, 'videoOutboundBooth', (result, err) => {
            if (result) {
                if (scanningPausedOutboundBooth) return;

                scanningPausedOutboundBooth = true;
                lastScannedResultOutboundBooth = result.getText();
                sendDataOutboundBooth();

                setTimeout(() => {
                    scanningPausedOutboundBooth = false;
                }, 1000);
            }
        }).catch(err => {
            showNotification('Không thể khởi động camera', true);
        });
    }

    function sendDataOutboundBooth() {
        const stationValue = document.getElementById('stationInputOutboundBooth').value.trim().toUpperCase();
        const scannedCode = lastScannedResultOutboundBooth.toUpperCase();

        if (!scannedCode) {
            showNotification('Không có dữ liệu quét', true);
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            scannedCode: scannedCode
        };
        console.log('Outbound Booth Data to send:', data);
        showNotification('Dữ liệu đã gửi thành công');

        playSuccessSound()

        fetch('https://script.google.com/macros/s/AKfycbxgbUN8r5b6QeZKnB6wW_XXxUxpUqWiM9Jufnv8I72uE7Nf6PHhdAg1p0x0EANm5qIM/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(() => {
            console.log('Dữ liệu đã gửi thành công');
        }).catch(() => {
            showNotification('Gửi dữ liệu thất bại', true);
        });
    }

    document.getElementById('stopButtonOutboundBooth').addEventListener('click', function() {
        if (codeReaderOutboundBooth) {
            document.getElementById("stationInputOutboundBooth").value = ''; // Reset input field
            document.getElementById("stationInputOutboundBooth").focus(); // Focus on input field
            codeReaderOutboundBooth.reset();
            document.getElementById('cameraControlsOutboundBooth').style.display = 'none';
            document.getElementById('scannerContainerOutboundBooth').style.display = 'none';
        }
    });

    document.getElementById('backButtonOutboundBooth').addEventListener('click', function() {
        document.getElementById('outboundBoothModule').style.display = 'none';
        document.getElementById('moduleSelection').style.display = 'block';
        // closeAllCameras()
    });
});

document.addEventListener('DOMContentLoaded', function() {
    let codeReaderQuitOrder = null;
    let selectedDeviceIdQuitOrder = null;
    let lastScannedResultQuitOrder = '';
    let scanningPausedQuitOrder = false;

    document.getElementById('confirmQuitOrderButton').addEventListener('click', function() {
        const stationInput = document.getElementById('stationInputQuitOrder').value.trim().toUpperCase();
        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            document.getElementById('stationInputQuitOrder').focus();
            return;
        }
        document.getElementById('cameraControlsQuitOrder').style.display = 'block';
        document.getElementById('scannerContainerQuitOrder').style.display = 'block';

        if (!codeReaderQuitOrder) {
            initBarcodeReaderQuitOrder();
        }
        
        startScannerQuitOrder();
    });

    function initBarcodeReaderQuitOrder() {
        if (codeReaderQuitOrder) return;

        try {
            codeReaderQuitOrder = new ZXing.BrowserMultiFormatReader();
            codeReaderQuitOrder.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('Không tìm thấy camera', true);
                        return;
                    }
                    selectedDeviceIdQuitOrder = videoInputDevices.find(device =>
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

    function startScannerQuitOrder() {
        const video = document.getElementById('videoQuitOrder');
        

        codeReaderQuitOrder.decodeFromVideoDevice(selectedDeviceIdQuitOrder, 'videoQuitOrder', (result, err) => {
            if (result) {
                if (scanningPausedQuitOrder) return;

                scanningPausedQuitOrder = true;
                lastScannedResultQuitOrder = result.getText();
                sendDataQuitOrder();

                setTimeout(() => {
                    scanningPausedQuitOrder = false;
                }, 1000);
            }
        }).catch(err => {
            showNotification('Không thể khởi động camera', true);
        });
    }

    function sendDataQuitOrder() {
        const stationValue = document.getElementById('stationInputQuitOrder').value.trim().toUpperCase();
        const scannedCode = lastScannedResultQuitOrder.toUpperCase();

        if (!scannedCode) {
            showNotification('Không có dữ liệu quét', true);
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            scannedCode: scannedCode
        };
        console.log('Quit Order Data to send:', data);
        showNotification('Dữ liệu đã gửi thành công');

        playSuccessSound()

        fetch('https://script.google.com/macros/s/AKfycbxabvc1W-3PdxfYfpPXbUPo32H-jUgLN7vo6E6z8IPIbHkXHayeSDaAaPfG-iyW-_UJhQ/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(() => {
            console.log('Dữ liệu đã gửi thành công');
        }).catch(() => {
            showNotification('Gửi dữ liệu thất bại', true);
        });
    }

    document.getElementById('stopButtonQuitOrder').addEventListener('click', function() {
        if (codeReaderQuitOrder) {
            document.getElementById("stationInputQuitOrder").value = ''; // Reset input field
            document.getElementById("stationInputQuitOrder").focus(); // Focus on input field
            codeReaderQuitOrder.reset();
            document.getElementById('cameraControlsQuitOrder').style.display = 'none';
            document.getElementById('scannerContainerQuitOrder').style.display = 'none';
        }
    });

    document.getElementById('backButtonQuitOrder').addEventListener('click', function() {
        document.getElementById('quitOrderModule').style.display = 'none';
        document.getElementById('moduleSelection').style.display = 'block';
        // closeAllCameras()
    });
});

document.addEventListener('DOMContentLoaded', function() {
    let codeReaderDamage = null;
    let selectedDeviceIdDamage = null;
    let lastScannedResultDamage = '';
    let scanningPausedDamage = false;

    document.getElementById('confirmDamageButton').addEventListener('click', function() {
        const stationInput = document.getElementById('stationInputDamage').value.trim().toUpperCase();
        if (!stationInput) {
            showNotification('Vui lòng nhập Station ID', true);
            document.getElementById('stationInputDamage').focus();
            return;
        }
        document.getElementById('cameraControlsDamage').style.display = 'block';
        document.getElementById('scannerContainerDamage').style.display = 'block';

        if (!codeReaderDamage) {
            initBarcodeReaderDamage();
        }
        
        startScannerDamage();
    });

    function initBarcodeReaderDamage() {
        if (codeReaderDamage) return;

        try {
            codeReaderDamage = new ZXing.BrowserMultiFormatReader();
            codeReaderDamage.listVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length === 0) {
                        showNotification('Không tìm thấy camera', true);
                        return;
                    }
                    selectedDeviceIdDamage = videoInputDevices.find(device =>
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

    function startScannerDamage() {
        const video = document.getElementById('videoDamage');
        

        codeReaderDamage.decodeFromVideoDevice(selectedDeviceIdDamage, 'videoDamage', (result, err) => {
            if (result) {
                if (scanningPausedDamage) return;

                scanningPausedDamage = true;
                lastScannedResultDamage = result.getText();
                sendDataDamage();

                setTimeout(() => {
                    scanningPausedDamage = false;
                }, 1000);
            }
        }).catch(err => {
            showNotification('Không thể khởi động camera', true);
        });
    }

    function sendDataDamage() {
        const stationValue = document.getElementById('stationInputDamage').value.trim().toUpperCase();
        const scannedCode = lastScannedResultDamage.toUpperCase();

        if (!scannedCode) {
            showNotification('Không có dữ liệu quét', true);
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            station: stationValue,
            scannedCode: scannedCode
        };
        console.log('Damage Data to send:', data);
        showNotification('Dữ liệu đã gửi thành công');

        playSuccessSound()

        fetch('https://script.google.com/macros/s/AKfycbyHG3HaBBUxoiE2YCpqV9o_gHspj_MvhnBDw1dbD6S7M8xUupgdJspAIAXLxo9bQP4/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(() => {
            console.log('Dữ liệu đã gửi thành công');
        }).catch(() => {
            showNotification('Gửi dữ liệu thất bại', true);
        });
    }

    document.getElementById('stopButtonDamage').addEventListener('click', function() {
        if (codeReaderDamage) {
            document.getElementById("stationInputDamage").value = ''; // Reset input field
            document.getElementById("stationInputDamage").focus(); // Focus on input field
            codeReaderDamage.reset();
            document.getElementById('cameraControlsDamage').style.display = 'none';
            document.getElementById('scannerContainerDamage').style.display = 'none';
        }
    });

    document.getElementById('backButtonDamage').addEventListener('click', function() {
        document.getElementById('damageModule').style.display = 'none';
        document.getElementById('moduleSelection').style.display = 'block';
        // closeAllCameras()
    });
});
