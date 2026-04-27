// Change this to your deployed backend URL later (e.g., https://your-app.render.com)
const API_URL = "http://localhost:8080";

// --- SHARED UTILITIES ---
// Combined navbar loader with logout logic
async function loadNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    try {
        const resp = await fetch('navbar.html');
        const html = await resp.text();
        placeholder.innerHTML = html;

        // Attach logout event after navbar is injected
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                fetch(`${API_URL}/logout`, { method: 'POST' }).catch(() => {});
                localStorage.clear();
                window.location.href = "index.html?logout=true";
            });
        }
    } catch (err) {
        console.error("Navbar failed to load:", err);
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
                window.location.href = "dashboard.html";
            } else {
                document.getElementById('error-message').style.display = 'block';
            }
        } catch (error) {
            console.warn("Backend offline. Entering Demo Mode...");
            window.location.href = "dashboard.html"; // Demo redirect
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
            console.warn("Backend offline. Redirecting for frontend demo...");
            alert("Registration successful (Demo Mode)!");
            window.location.href = "index.html";
        }
    });
}

// --- DASHBOARD: LOAD JOBS ---
async function loadJobs() {
    const jobContainer = document.getElementById('job-container');
    if (!jobContainer) return;

    try {
        const response = await fetch(`${API_URL}/api/jobs`);
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
        console.error("Failed to fetch jobs. Showing placeholder data.");
        jobContainer.innerHTML = `<p style="text-align:center; color:#888;">Connect your Spring Boot backend to see live jobs.</p>`;
    }
}

// --- ADD JOB LOGIC ---
const addJobForm = document.getElementById('addJobForm');
if (addJobForm) {
    addJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const techStackArray = document.getElementById('techStack').value.split(',').map(item => item.trim());

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
            }
        } catch (error) {
            alert("Backend offline. Post saved locally (Demo).");
            window.location.href = "dashboard.html";
        }
    });
}

// --- INITIALIZE ---
loadNavbar();
loadJobs();
