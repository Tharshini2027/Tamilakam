document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const scannerLaser = document.getElementById('scannerLaser');
    
    const fileDetails = document.getElementById('fileDetails');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeBtn = document.getElementById('removeBtn');
    
    const extractBtn = document.getElementById('extractBtn');
    
    const extractedText = document.getElementById('extractedText');
    const emptyState = document.getElementById('emptyState');
    const outputStats = document.getElementById('outputStats');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    
    const copyBtn = document.getElementById('copyBtn');
    const transliterateBtn = document.getElementById('transliterateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const toastContainer = document.getElementById('toastContainer');

    let selectedFile = null;

    // Radio cards click handlers to manage the active visual state
    const radioInputs = document.querySelectorAll('input[name="ocrMode"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-card').forEach(card => {
                card.classList.remove('active');
            });
            const selectedLabel = e.target.closest('.radio-card');
            if (selectedLabel) {
                selectedLabel.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // Event Listeners for File Selection & Drag & Drop
    // ==========================================================================

    // Click on drop zone to browse files
    dropZone.addEventListener('click', (e) => {
        // Prevent trigger if clicking on the preview controls
        if (e.target.id !== 'removeBtn' && !e.target.closest('#removeBtn')) {
            imageInput.click();
        }
    });

    // File input change
    imageInput.addEventListener('change', () => {
        handleFileSelect(imageInput.files);
    });

    // Drag & Drop event handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFileSelect(files);
    });

    // ==========================================================================
    // File Handler Logic
    // ==========================================================================

    function handleFileSelect(files) {
        if (files.length === 0) return;

        const file = files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        if (!allowedTypes.includes(file.type)) {
            showToast('Only PNG, JPG, and JPEG images are supported.', 'error');
            resetUploadState();
            return;
        }

        // Limit local check to 10MB
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size exceeds the 10MB limit.', 'error');
            resetUploadState();
            return;
        }

        selectedFile = file;

        // Display File Metadata
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        fileDetails.classList.remove('hidden');

        // Render Image Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadPrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Enable Extract Button
        extractBtn.disabled = false;
    }

    // Reset Upload Component
    function resetUploadState() {
        selectedFile = null;
        imageInput.value = '';
        imagePreview.src = '';
        
        uploadPrompt.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        fileDetails.classList.add('hidden');
        
        extractBtn.disabled = true;
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering dropzone click
        resetUploadState();
    });

    // ==========================================================================
    // OCR API Extraction Execution
    // ==========================================================================

    extractBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // Set Loading/Scanning States
        setLoadingState(true);

        const activeMode = document.querySelector('input[name="ocrMode"]:checked').value;
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('mode', activeMode);

        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const extractedTextContent = result.text;
                
                extractedText.value = extractedTextContent;
                extractedText.readOnly = false; // Allow users to edit
                
                // Toggle output placeholders & stats
                emptyState.classList.add('hidden');
                outputStats.classList.remove('hidden');
                
                updateTextStats(extractedTextContent);
                toggleOutputActions(true);
                
                showToast('OCR Text extraction completed successfully!', 'success');
            } else {
                showToast(result.message || 'An error occurred during text extraction.', 'error');
            }
        } catch (error) {
            console.error('OCR API Error:', error);
            showToast('Unable to connect to the backend OCR server.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            scannerLaser.classList.remove('hidden');
            extractBtn.disabled = true;
            extractBtn.innerHTML = `<span>Processing Image...</span> <i class="bx bx-loader-alt bx-spin"></i>`;
            removeBtn.disabled = true;
            dropZone.style.pointerEvents = 'none';
            document.querySelectorAll('input[name="ocrMode"]').forEach(input => input.disabled = true);
        } else {
            scannerLaser.classList.add('hidden');
            extractBtn.disabled = false;
            extractBtn.innerHTML = `<span>Extract Text</span> <i class="bx bx-right-arrow-alt"></i>`;
            removeBtn.disabled = false;
            dropZone.style.pointerEvents = 'auto';
            document.querySelectorAll('input[name="ocrMode"]').forEach(input => input.disabled = false);
        }
    }

    // ==========================================================================
    // Output Text Interaction (Copy, Clear, Stats, Editing)
    // ==========================================================================

    // Dynamic text changes update stats
    extractedText.addEventListener('input', () => {
        updateTextStats(extractedText.value);
    });

    function updateTextStats(text) {
        const charLen = text.length;
        // Simple word match
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        charCount.textContent = `${charLen} char${charLen !== 1 ? 's' : ''}`;
        wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    }

    function toggleOutputActions(enable) {
        copyBtn.disabled = !enable;
        transliterateBtn.disabled = !enable;
        clearBtn.disabled = !enable;
    }

    // Copy Text to Clipboard
    copyBtn.addEventListener('click', async () => {
        const text = extractedText.value;
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            
            // Visual Button Feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i class="bx bx-check"></i> <span>Copied!</span>`;
            copyBtn.style.borderColor = 'var(--success-color)';
            copyBtn.style.color = 'var(--success-color)';
            
            showToast('Text copied to clipboard.', 'success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.removeAttribute('style');
            }, 2000);
        } catch (err) {
            showToast('Failed to copy text. Please select and copy manually.', 'error');
        }
    });

    // Transliterate Text to Tamil manually
    transliterateBtn.addEventListener('click', async () => {
        const text = extractedText.value;
        if (!text.trim()) return;

        const originalHTML = transliterateBtn.innerHTML;
        transliterateBtn.disabled = true;
        transliterateBtn.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> <span>Converting...</span>`;

        try {
            const response = await fetch('/api/transliterate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                extractedText.value = result.text;
                updateTextStats(result.text);
                showToast('Text transliterated to Tamil successfully!', 'success');
            } else {
                showToast(result.message || 'Transliteration failed.', 'error');
            }
        } catch (error) {
            console.error('Transliteration Error:', error);
            showToast('Unable to connect to the transliteration server.', 'error');
        } finally {
            transliterateBtn.innerHTML = originalHTML;
            transliterateBtn.disabled = false;
        }
    });

    // Clear Text Output
    clearBtn.addEventListener('click', () => {
        extractedText.value = '';
        extractedText.readOnly = true;
        
        emptyState.classList.remove('hidden');
        outputStats.classList.add('hidden');
        
        toggleOutputActions(false);
        showToast('Extracted workspace cleared.', 'success');
    });

    // ==========================================================================
    // Utility functions (Toasts, Formatting)
    // ==========================================================================

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'bx bx-check-circle toast-icon' : 'bx bx-error-circle toast-icon';
        
        const text = document.createElement('span');
        text.className = 'toast-message';
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);
        toastContainer.appendChild(toast);

        // Auto remove toast after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.9)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }
});
