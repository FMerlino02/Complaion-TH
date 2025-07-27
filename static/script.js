document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const fileList = document.getElementById('fileList');
    const playButton = document.getElementById('playButton');
    const notesTextarea = document.getElementById('notesTextarea');
    const transcriptPanel = document.getElementById('transcriptPanel');
    const videoTitleElement = document.getElementById('videoTitle');

    // --- Initial Data Fetching ---
    fetchAndDisplayMeetings();

    // --- Event Listeners ---

    // Mobile menu functionality
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // File selection functionality
    fileList.addEventListener('click', (event) => {
        const fileItem = event.target.closest('.file-item');
        if (fileItem) {
            const meetingId = fileItem.dataset.id;
            
            // Remove active class from all items
            document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item
            fileItem.classList.add('active');
            
            // Fetch and display details for the selected meeting
            fetchMeetingDetails(meetingId);
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Play/Pause button functionality
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    playButton.addEventListener('click', function() {
        const isPaused = !pauseIcon.classList.contains('hidden');
        if (isPaused) {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            playButton.style.transform = 'scale(1)';
        } else {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            playButton.style.transform = 'scale(0.9)';
        }
        // TODO: Integrate real video play/pause logic
    });

    // Auto-save notes functionality
    let notesTimeout;
    notesTextarea.addEventListener('input', function() {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(() => {
            // In a real app, you would send this to your backend to save
            console.log('Notes auto-saved:', this.value);
            showNotification('Notes saved automatically');
        }, 1500);
    });

    // --- Core Functions ---

    /**
     * Fetches the list of meetings from the API and populates the sidebar.
     */
    async function fetchAndDisplayMeetings() {
        try {
            const response = await fetch('/api/riunioni');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const meetings = await response.json();

            fileList.innerHTML = ''; // Clear existing list
            if (meetings.length > 0) {
                meetings.forEach(meeting => {
                    const li = document.createElement('li');
                    li.className = 'file-item p-2 rounded-md cursor-pointer hover:bg-green-100 transition-colors';
                    li.textContent = meeting.titolo_chiamata;
                    li.dataset.id = meeting.id_chiamata; // Store ID for later
                    li.dataset.videoFile = meeting.video_riunione; // Store video filename
                    fileList.appendChild(li);
                });
                // Automatically select and load the first meeting
                const firstItem = fileList.querySelector('.file-item');
                if (firstItem) {
                    firstItem.classList.add('active');
                    fetchMeetingDetails(firstItem.dataset.id);
                }
            } else {
                fileList.innerHTML = '<li class="text-gray-500">No meetings found.</li>';
            }
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
            fileList.innerHTML = '<li class="text-red-500">Error loading files.</li>';
        }
    }

    /**
     * Fetches the full details for a specific meeting and updates the UI.
     * @param {string} meetingId - The ID of the meeting to fetch.
     */
    async function fetchMeetingDetails(meetingId) {
        try {
            const response = await fetch(`/api/riunioni/${meetingId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const details = await response.json();

            // Update notes
            notesTextarea.value = details.note_riunione || 'No notes for this meeting.';

            // Update video title
            if (videoTitleElement) {
                videoTitleElement.textContent = details.titolo_chiamata;
            }

            // Update transcript panel
            updateTranscriptPanel(details.trascrizione);

        } catch (error) {
            console.error(`Failed to fetch details for meeting ${meetingId}:`, error);
            // Optionally show an error in the UI
        }
    }

    /**
     * Renders the transcript data into the transcript panel.
     * @param {object} trascrizione - The transcript object from the API.
     */
    function updateTranscriptPanel(trascrizione) {
        // Clear previous content
        transcriptPanel.innerHTML = '<h2 class="text-xl font-semibold text-gray-800 mb-4">Transcript</h2>';

        if (trascrizione && trascrizione.testo_completo) {
            const container = document.createElement('div');
            container.className = 'space-y-4 text-sm';

            // Full text section
            const fullTextSection = document.createElement('div');
            fullTextSection.innerHTML = `
                <h3 class="font-semibold text-gray-700 mb-2">Full Text</h3>
                <p class="text-gray-600 leading-relaxed">${trascrizione.testo_completo}</p>
            `;
            container.appendChild(fullTextSection);

            // Segments section
            if (trascrizione.segmenti && trascrizione.segmenti.length > 0) {
                const segmentsSection = document.createElement('div');
                segmentsSection.innerHTML = `<h3 class="font-semibold text-gray-700 mb-2 mt-4">Segments</h3>`;
                const segmentsList = document.createElement('ul');
                segmentsList.className = 'space-y-2';
                trascrizione.segmenti.forEach(segment => {
                    const segmentItem = document.createElement('li');
                    segmentItem.className = 'flex items-start gap-2';
                    segmentItem.innerHTML = `
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">${segment.start_time}s - ${segment.end_time}s</span>
                        <p class="text-gray-700 flex-1">${segment.testo}</p>
                    `;
                    segmentsList.appendChild(segmentItem);
                });
                segmentsSection.appendChild(segmentsList);
                container.appendChild(segmentsSection);
            }
            transcriptPanel.appendChild(container);
        } else {
            transcriptPanel.innerHTML += '<p class="text-gray-500">No transcript available for this meeting.</p>';
        }
    }

    /**
     * Shows a temporary notification message on the screen.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'fixed top-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }
});
