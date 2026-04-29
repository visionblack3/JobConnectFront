const API_URL = "http://localhost:8080";

// --- 1. AUTH GUARD ---
(function checkAuth() {
    if (window.location.pathname.includes("dashboard.html")) {
        const user = localStorage.getItem('username');
        if (!user) window.location.replace("index.html");
    }
})();

// --- 2. UI PROTECTION (Crucial for Role-Based View) ---
function setupDashboardUI() {
    // Trim and convert to uppercase to prevent small typos from breaking it
    const role = (localStorage.getItem('userRole') || "").toUpperCase();
    console.log(role);
    const addJobBtn = document.getElementById('btn-add-job');

    if (addJobBtn) {
        addJobBtn.style.display = 'none'; // Default hide

        // Check for both common formats
        if (role === 'ROLE_RECRUITER' || role === 'RECRUITER') {
            addJobBtn.style.display = 'inline-block';
            console.log("SUCCESS: Button displayed for Recruiter");
        }
    }
}
// --- 3. FETCH JOBS (Fixed URL and Error Handling) ---
async function fetchJobs() {
    const jobContainer = document.getElementById('job-container');
    if (!jobContainer) return;

    try {
        // Using /jobs to match your Spring Boot permitAll configuration
        const response = await fetch(`${API_URL}/jobs`);

        if (!response.ok) {
            console.error("Fetch failed with status:", response.status);
            throw new Error("Forbidden or Not Found");
        }

        const jobs = await response.json();
        jobContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.profile}</h3>
                <p>${job.description}</p>
                <p><strong>Exp:</strong> ${job.exp} years</p>
                <button class="btn-apply">Apply Now</button>
            </div>
        `).join('');
    } catch (err) {
        console.error("Job Fetch Error:", err);
        jobContainer.innerHTML = `<p style="color: grey;">Login to see available jobs or check backend connection.</p>`;
    }
}

// --- 4. LOGIN LOGIC ---
// Replace your Section 4 Login Logic with this:
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById('error-message');
        if (errorDiv) errorDiv.style.display = 'none'; // Hide old errors on new click

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
                const data = await response.json();
                localStorage.setItem('username', data.username);
                localStorage.setItem('userRole', data.role);
                window.location.replace("dashboard.html");
            } else {
                // This triggers the box to appear on top of the names
                if (errorDiv) {
                    errorDiv.innerText = "Invalid Username or Password";
                    errorDiv.style.display = 'block';
                }
            }
        } catch (err) {
            if (errorDiv) {
                errorDiv.innerText = "Backend Offline. Please start IntelliJ.";
                errorDiv.style.display = 'block';
            }
        }
    });
}
function logout() {
    localStorage.clear();
    window.location.replace("index.html");
}

// --- 5. INITIALIZE (Run UI Setup First) ---
if (window.location.pathname.includes("dashboard.html")) {
    document.addEventListener('DOMContentLoaded', () => {
        // UI Setup must run FIRST so the button hides before the network call starts
        setupDashboardUI();
        fetchJobs();
    });
}
