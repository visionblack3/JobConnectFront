// Change this to your deployed backend URL later (e.g., https://your-app.render.com)
const API_URL = "http://localhost:8080";

// --- SHARED UTILITIES ---
// This function handles the navbar since we removed Thymeleaf's th:replace
async function loadNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        try {
            const response = await fetch('navbar.html');
            const html = await response.text();
            navbarPlaceholder.innerHTML = html;
        } catch (err) {
            console.error("Could not load navbar:", err);
        }
    }
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credentials = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                // On success, redirect to dashboard
                window.location.href = "dashboard.html";
            } else {
                // Show the error div we created in the HTML
                document.getElementById('error-message').style.display = 'block';
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    });
}

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('role').value,
            phoneNumber: document.getElementById('reg-phone').value
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert("Registration successful! Redirecting to login...");
                window.location.href = "index.html";
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration Error:", error);
        }
    });
}

// --- NAVBAR & LOGOUT LOGIC ---
async function loadNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    try {
        const resp = await fetch('navbar.html');
        const html = await resp.text();
        placeholder.innerHTML = html;

        // After the navbar is loaded into the HTML, attach the logout event
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // 1. Tell the backend to end the session
                fetch(`${API_URL}/logout`, { method: 'POST' });

                // 2. Clear local storage (if you store tokens/user info)
                localStorage.clear();

                // 3. Redirect to login
                window.location.href = "index.html?logout=true";
            });
        }
    } catch (err) {
        console.error("Navbar failed to load:", err);
    }
}
// --- ADD JOB LOGIC ---
const addJobForm = document.getElementById('addJobForm');

if (addJobForm) {
    addJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Convert the comma-separated tech stack into an array
        const techStackString = document.getElementById('techStack').value;
        const techStackArray = techStackString.split(',').map(item => item.trim());

        const jobData = {
            profile: document.getElementById('profile').value,
            description: document.getElementById('description').value,
            exp: parseInt(document.getElementById('exp').value),
            techStack: techStackArray
        };

        try {
            const response = await fetch(`${API_URL}/saveJob`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                alert("Job posted successfully!");
                window.location.href = "dashboard.html";
            } else {
                alert("Failed to post job. Please check your connection.");
            }
        } catch (error) {
            console.error("Error posting job:", error);
        }
    });
}
async function loadJobs() {
    const jobContainer = document.getElementById('job-container');
    if (!jobContainer) return;

    try {
        const response = await fetch(`${API_URL}/api/jobs`); // Ensure this matches your Spring controller
        const jobs = await response.json();

        jobContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h2>${job.profile}</h2>
                <p>${job.description}</p>
                <p><strong>Experience:</strong> ${job.exp} years</p>
                <div>
                    ${job.techStack.map(tech => `<span class="tech-pill">${tech}</span>`).join('')}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load jobs:", err);
    }
}
loadJobs();
// Initialize global components
loadNavbar();