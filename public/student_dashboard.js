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

    // Fetch resources
    const fetchResourcesBtn = document.getElementById('fetchResourcesBtn');
    fetchResourcesBtn.addEventListener('click', fetchResources);

    // Load initial announcements
    loadAnnouncements();
});

// On page load, display the student's name and set the class in the profile section
window.onload = function() { 
    const studentName = sessionStorage.getItem('studentName');
    const studentClass = sessionStorage.getItem('studentClass');
    if (studentName) {
        document.querySelector('.user-name').textContent = studentName;
    }
    if (studentClass) {
        document.getElementById('classSelect').value = studentClass;
    }
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


function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
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

function fetchResources() {
    const classSelected = document.getElementById('resourceClassSelect').value;

    // Mock API call - replace with actual API call
    setTimeout(() => {
        const resourcesList = document.getElementById('resourcesList');
        resourcesList.innerHTML = ''; // Clear previous entries

        const resources = [
            { name: 'Lecture 1: Introduction', link: '#' },
            { name: 'Lecture 2: Advanced Topics', link: '#' },
            { name: 'Assignment 1', link: '#' }
        ];

        resources.forEach(resource => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${resource.link}" target="_blank">${resource.name}</a>`;
            resourcesList.appendChild(li);
        });
    }, 500);
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