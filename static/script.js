// DOM elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const fileList = document.getElementById('fileList');
const playButton = document.getElementById('playButton');
const notesTextarea = document.getElementById('notesTextarea');

// Mobile menu functionality
mobileMenuBtn.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-open');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            sidebar.classList.remove('mobile-open');
        }
    }
});

// File selection functionality
fileList.addEventListener('click', function(event) {
    if (event.target.classList.contains('file-item')) {
        // Remove active class from all items
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        event.target.classList.add('active');
        
        // Update transcript content (mock)
        const fileName = event.target.textContent;
        updateTranscript(fileName);
        
        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    }
});

// Play button functionality
playButton.addEventListener('click', function() {
    // Mock video play functionality
    this.textContent = this.textContent === '▶' ? '⏸' : '▶';
    this.style.transform = this.textContent === '⏸' ? 'scale(0.9)' : 'scale(1)';
});

// Update transcript function (mock)
function updateTranscript(fileName) {
    const transcriptContent = document.querySelector('.transcript-content');
    transcriptContent.innerHTML = `
        <p><strong>Transcript for: ${fileName}</strong></p>
        <p>This is a mock transcript for the selected video file. In a real application, this would be loaded from your backend API or generated using speech-to-text services.</p>
        <p>The transcript would contain the actual spoken content from the video, with timestamps and speaker identification if available.</p>
        <p>Features that could be added:</p>
        <ul>
            <li>Timestamp navigation</li>
            <li>Search within transcript</li>
            <li>Highlight current speaking section</li>
            <li>Export transcript as text/PDF</li>
        </ul>
    `;
}

// Auto-save notes functionality
let notesTimeout;
notesTextarea.addEventListener('input', function() {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(() => {
        // Mock save functionality
        console.log('Notes auto-saved:', this.value);
        // In a real app, you would send this to your backend
        showNotification('Notes saved automatically');
    }, 1000);
});

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('mobile-open');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Space bar to play/pause
    if (event.code === 'Space' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        playButton.click();
    }
    
    // Escape to close mobile menu
    if (event.code === 'Escape') {
        sidebar.classList.remove('mobile-open');
    }
    
    // Ctrl+S to save notes
    if (event.ctrlKey && event.code === 'KeyS') {
        event.preventDefault();
        showNotification('Notes saved manually');
    }
});

// Load files from API (mock)
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();
        
        // Update file list (this would replace the static HTML list)
        // For now, we're using the static list as the API returns the same data
        console.log('Files loaded:', data.files);
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load files
    loadFiles();
    
    // Select first file by default
    const firstFile = document.querySelector('.file-item');
    if (firstFile) {
        firstFile.click();
    }
    
    // Focus on notes textarea for immediate use
    notesTextarea.focus();
});

// Accessibility improvements
document.addEventListener('keydown', function(event) {
    // Tab navigation for file list
    if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
        const fileItems = document.querySelectorAll('.file-item');
        const activeItem = document.querySelector('.file-item.active');
        
        if (activeItem && document.activeElement === activeItem) {
            event.preventDefault();
            const currentIndex = Array.from(fileItems).indexOf(activeItem);
            let nextIndex;
            
            if (event.code === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % fileItems.length;
            } else {
                nextIndex = (currentIndex - 1 + fileItems.length) % fileItems.length;
            }
            
            fileItems[nextIndex].click();
            fileItems[nextIndex].focus();
        }
    }
});

// Make file items focusable
document.querySelectorAll('.file-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function(event) {
        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            this.click();
        }
    });
});
