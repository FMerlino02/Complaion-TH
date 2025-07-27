document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const fileList = document.getElementById('fileList');
    const notesTextarea = document.getElementById('notesTextarea');
    const transcriptPanel = document.getElementById('transcriptPanel');
    const videoTitleElement = document.getElementById('videoTitle');

    const API_BASE = '/api/riunioni';

    function debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    fetchAndDisplayMeetings();
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }

    
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    fileList.addEventListener('click', (event) => {
        const fileItem = event.target.closest('.file-item');
        if (fileItem) {
            const meetingId = fileItem.dataset.id;
             
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
                item.classList.remove('font-semibold');
            });
            
            fileItem.classList.add('active');
            fileItem.classList.add('font-semibold');

            currentMeetingId = meetingId;
            fetchMeetingDetails(meetingId);
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
    

    let notesTimeout;
    notesTextarea.addEventListener('input', debounce(function() {
        showNotification('Notes saved automatically');
        // update notes on server
        if (currentMeetingId) {
            fetch(`${API_BASE}/${currentMeetingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note_riunione: notesTextarea.value })
            }).catch(err => console.error('Failed to save notes', err));
        }
    }, 1500));


    
    async function fetchAndDisplayMeetings() {
        try {
            const response = await fetch('/api/riunioni');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const meetings = await response.json();

            fileList.innerHTML = '';
            if (meetings.length > 0) {
                meetings.forEach(meeting => {
                    const li = document.createElement('li');
                    li.className = 'file-item p-2 rounded-md cursor-pointer hover:bg-green-100 transition-colors group relative';
                    li.dataset.id = meeting.id_chiamata;
                    li.dataset.videoFile = meeting.video_riunione;
                    li.innerHTML = `
                        <span class="flex justify-between items-center">
                            <span>${meeting.titolo_chiamata}</span>
                            <button class="delete-btn text-red-500 hover:text-red-700 hidden group-hover:block" title="Delete Meeting">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    `;
                    fileList.appendChild(li);


                    li.querySelector('.delete-btn').addEventListener('click', async (e) => {
                        e.stopPropagation();
                        pendingDelete = { li, meetingId: meeting.id_chiamata };
                        deleteModal.classList.remove('hidden');
                    });
                });
                const firstItem = fileList.querySelector('.file-item');
                if (firstItem) {
                    firstItem.classList.add('active');
                    firstItem.classList.add('font-semibold');
                    currentMeetingId = firstItem.dataset.id;
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

    
    async function fetchMeetingDetails(meetingId) {
        try {
            const response = await fetch(`/api/riunioni/${meetingId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const details = await response.json();

            notesTextarea.value = details.note_riunione || 'No notes for this meeting.';

            if (videoTitleElement) {
                videoTitleElement.textContent = details.titolo_chiamata;
            }

            const videoContainer = document.getElementById('videoContainer');
            if (videoContainer) {
                const url = details.video_riunione;
                let embedHtml = '';
                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
                if (ytMatch) {
                    const videoId = ytMatch[1];
                    embedHtml = `
                        <iframe width="100%" height="100%"
                                src="https://www.youtube.com/embed/${videoId}"
                                title="${details.titolo_chiamata}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                                class="rounded-md">
                        </iframe>
                    `;
                } else {
                    embedHtml = `
                        <video controls class="w-full h-full object-cover rounded-md bg-black">
                            <source src="${url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                }
                videoContainer.innerHTML = embedHtml;
            }

            updateTranscriptPanel(details.trascrizione);

        } catch (error) {
            console.error(`Failed to fetch details for meeting ${meetingId}:`, error);
        }
    }

    
    function updateTranscriptPanel(trascrizione) {
        transcriptPanel.innerHTML = '<h2 class="text-xl font-semibold text-gray-800 mb-4">Transcript</h2>';

        if (trascrizione && trascrizione.testo_completo) {
            const container = document.createElement('div');
            container.className = 'space-y-4 text-sm';

            const fullTextSection = document.createElement('div');
            fullTextSection.innerHTML = `
                <h3 class="font-semibold text-gray-700 mb-2">Full Text</h3>
                <p class="text-gray-600 leading-relaxed">${trascrizione.testo_completo}</p>
            `;
            container.appendChild(fullTextSection);

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

    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }

    const addMeetingBtn = document.getElementById('addMeetingBtn');
    const meetingModal = document.getElementById('meetingModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const newTitle = document.getElementById('newTitle');
    const newURL = document.getElementById('newURL');
    const newNotes = document.getElementById('newNotes');

    if (addMeetingBtn) {
        addMeetingBtn.addEventListener('click', () => {
            meetingModal.classList.remove('hidden');
            meetingModal.classList.add('flex');
        });
    }
    cancelBtn.addEventListener('click', () => {
        meetingModal.classList.add('hidden');
    });
    saveBtn.addEventListener('click', async () => {
        const title = newTitle.value.trim();
        const url = newURL.value.trim();
        const notes = newNotes.value.trim();
        if (!title || !url) {
            showNotification('Title and URL are required.');
            return;
        }
        try {
            const resp = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titolo_chiamata: title, video_riunione: url, note_riunione: notes })
            });
            if (!resp.ok) throw new Error('Error adding meeting');
            const result = await resp.json();
            const newId = result.id_chiamata;

            meetingModal.classList.add('hidden');
            newTitle.value = '';
            newURL.value = '';
            newNotes.value = '';

            showNotification('Generating transcript...');
            setTimeout(async () => {
                const fakeTranscript = {
                    testo_completo: `It demonstrates an example of the video summary with multiple segments.`,
                    segmenti: [
                        { start_time: 0, end_time: 10, testo: "Introduction and overview of the video content." },
                        { start_time: 10, end_time: 25, testo: "Detailed explanation of the main topic with examples." },
                        { start_time: 25, end_time: 40, testo: "Additional insights and best practices discussed." },
                        { start_time: 40, end_time: 60, testo: "Closing remarks and next steps for the viewer." }
                    ]
                };
                try {
                    await fetch(`${API_BASE}/${newId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ trascrizione: fakeTranscript })
                    });
                    showNotification('Transcript generated');
                    fetchAndDisplayMeetings();
                    fetchMeetingDetails(newId);
                } catch (e) {
                    console.error('Failed to update transcript', e);
                    showNotification('Failed to generate transcript');
                }
            }, 2000);
        } catch (err) {
            console.error(err);
            showNotification('Failed to add meeting');
        }
    });



    const deleteModal = document.getElementById('deleteModal');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    let pendingDelete = null;

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', () => {
            deleteModal.classList.add('hidden');
            pendingDelete = null;
        });
    }
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', async () => {
            if (!pendingDelete) return;
            const { li, meetingId } = pendingDelete;
            try {
                const res = await fetch(`${API_BASE}/${meetingId}`, { method: 'DELETE' });
                if (res.ok) {
                    li.remove();
                    if (li.classList.contains('active')) {
                        document.getElementById('videoContainer').innerHTML = '';
                        notesTextarea.value = '';
                        transcriptPanel.innerHTML = '<h2 class="text-xl font-semibold text-gray-800 mb-4">Transcript</h2><p class="text-gray-500">Transcript will appear here when you select a meeting.</p>';
                    }
                    showNotification('Meeting deleted');
                } else {
                    showNotification('Failed to delete meeting');
                }
            } catch (err) {
                console.error('Delete failed', err);
                showNotification('Failed to delete meeting');
            }
            deleteModal.classList.add('hidden');
            pendingDelete = null;
        });
    }
});
