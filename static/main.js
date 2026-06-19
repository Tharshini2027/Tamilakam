document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const menuButton = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            const isOpen = !mobileMenu.classList.toggle("hidden");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    setupUploadPreview();
    setupCopyButton();
    setupDownloadButton();
});

function setupUploadPreview() {
    const input = document.getElementById("imageInput");
    const dropZone = document.getElementById("dropZone");
    const previewPanel = document.getElementById("previewPanel");
    const preview = document.getElementById("imagePreview");
    const fileName = document.getElementById("fileName");
    const convertButton = document.getElementById("convertButton");
    const textInput = document.getElementById("tanglishText");
    const form = document.getElementById("uploadForm");

    if (!input || !dropZone) {
        return;
    }

    const updateButtonState = () => {
        const hasFile = input.files && input.files.length > 0;
        const hasText = textInput && textInput.value.trim().length > 0;
        convertButton.disabled = !(hasFile || hasText);
    };

    const showFile = (file) => {
        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            preview.src = event.target.result;
            fileName.textContent = file.name;
            previewPanel.classList.remove("hidden");
            previewPanel.classList.add("grid");
            updateButtonState();
        };
        reader.readAsDataURL(file);
    };

    input.addEventListener("change", () => {
        showFile(input.files[0]);
        updateButtonState();
    });

    if (textInput) {
        textInput.addEventListener("input", updateButtonState);
    }

    ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.add("drag-active");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.remove("drag-active");
        });
    });

    dropZone.addEventListener("drop", (event) => {
        const file = event.dataTransfer.files[0];
        if (file) {
            input.files = event.dataTransfer.files;
            showFile(file);
        }
    });

    if (form) {
        form.addEventListener("submit", () => {
            const label = form.querySelector(".button-label");
            const loading = form.querySelector(".button-loading");
            if (label && loading) {
                label.classList.add("hidden");
                loading.classList.remove("hidden");
                loading.classList.add("flex");
            }
        });
    }

    updateButtonState();
}

function setupCopyButton() {
    const copyButton = document.querySelector("[data-copy-target]");
    if (!copyButton) {
        return;
    }

    copyButton.addEventListener("click", async () => {
        const target = document.getElementById(copyButton.dataset.copyTarget);
        if (!target) {
            return;
        }

        await navigator.clipboard.writeText(target.textContent.trim());
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i data-lucide="check" class="h-5 w-5"></i> நகலெடுக்கப்பட்டது';
        window.lucide.createIcons();

        setTimeout(() => {
            copyButton.innerHTML = originalText;
            window.lucide.createIcons();
        }, 1400);
    });
}

function setupDownloadButton() {
    const downloadButton = document.getElementById("downloadText");
    const output = document.getElementById("tamilOutput");

    if (!downloadButton || !output) {
        return;
    }

    downloadButton.addEventListener("click", () => {
        const blob = new Blob([output.textContent.trim()], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tamilaakkam-tamil-output.txt";
        link.click();
        URL.revokeObjectURL(url);
    });
}
