document.addEventListener('DOMContentLoaded', () => {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });


    // Load initial announcements
    loadAnnouncements();

    // Show attendance section by default
    showSection('attendance');
});

// On page load, set the class dropdown to the student's class
window.onload = function() { 
    const studentName = sessionStorage.getItem('studentName');
    const studentClass = sessionStorage.getItem('studentClass');
    
    if (studentName) {
        document.querySelector('.user-name').textContent = studentName;
    }
    
    if (studentClass) {
        // Set the class dropdown to the student's class and disable it
        const classDropdown = document.getElementById('class');
        classDropdown.innerHTML = `<option value="${studentClass}">${studentClass}</option>`;
        classDropdown.value = studentClass;

        // Fetch resources
    const fetchResourcesBtn = document.getElementById('fetchResourcesBtn');
    fetchResourcesBtn.addEventListener('click', () => fetchResources(studentClass));
        
    }

       // Ensure attendance section is shown
       showSection('attendance');
};

// Logout logic: Clear session storage and redirect to login page
document.getElementById('logout-btn').addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to logout?'); // Show confirmation dialog
    if (confirmLogout) {
        sessionStorage.removeItem('studentName'); // Clear the faculty name from storage
        window.location.href = '../index.html'; // Redirect to login page
    }else {
        // If the user clicks "Cancel", no action is taken, and they remain on the same page.
    }
    
});

// Fetch resources for the student's class
function fetchResources(studentClass) {
    if (!studentClass) {
        alert('Unable to retrieve student class. Please login again.');
        return;
    }

    const resourcesList = document.getElementById('resources-list');
    resourcesList.innerHTML = 'Loading resources...'; //provide loading feedback

    fetch(`/api/resourcess/${studentClass}`)
        .then(response => response.json())
        .then(resources => {
            resourcesList.innerHTML = ''; // Clear previous resources

            if (resources.length > 0) {
                resources.forEach(resource => {
                    const resourceItem = document.createElement('div');
                    resourceItem.classList.add('resource-item');
                    resourceItem.innerHTML = `
                        <a href="/download-resource?filename=${encodeURIComponent(resource.file_name)}" download>
                            ${resource.file_name}
                        </a>
                    `;
                    resourcesList.appendChild(resourceItem);
                });
            } else {
                resourcesList.innerHTML = 'No resources available for your class.';
            }
        })
        .catch(error => {
            console.error('Error fetching resources:', error);
            resourcesList.innerHTML = 'Failed to fetch resources. Please try again.';
        });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

function fetchAttendance() {
    const classSelected = document.getElementById('classSelect').value;
    const attendanceDate = document.getElementById('attendanceDate').value;
    const studentId = sessionStorage.getItem('studentId');

    if (!classSelected || !attendanceDate) {
        alert('Please select both class and date.');
        return;
    }

    // Make API call to fetch attendance
    fetch(`/api/student-attendance?studentId=${studentId}&date=${attendanceDate}&class=${classSelected}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); 
            const attendanceTable = document.querySelector('#attendanceTable tbody');
            attendanceTable.innerHTML = ''; // Clear previous entries

            const formattedDate = new Date(data.date).toLocaleDateString('en-GB');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate || 'No date available'}</td>
                <td>${data.status || 'Not marked'}</td>
            `;
            attendanceTable.appendChild(row);
        })
        .catch(error => {
            console.error('Error fetching attendance:', error);
            alert('Failed to fetch attendance. Please try again.');
        });
}

function loadAnnouncements() {
    // Mock API call - replace with actual API call
    setTimeout(() => {
        const announcementFeed = document.getElementById('announcementFeed');
        const announcements = [
            { title: 'Exam Schedule', content: 'Midterm exams will start from October 1st.' },
            { title: 'Project Submission', content: 'Final project submissions are due by September 30th.' }
        ];

        announcements.forEach(announcement => {
            const div = document.createElement('div');
            div.className = 'announcement';
            div.innerHTML = `
                <h3>${announcement.title}</h3>
                <p>${announcement.content}</p>
            `;
            announcementFeed.appendChild(div);
        });
    }, 500);
}