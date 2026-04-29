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
    const role = localStorage.getItem('userRole');
    const addJobBtn = document.getElementById('btn-add-job');

    console.log("DEBUG: Current Role in Storage ->", role);

    if (addJobBtn) {
        // Start by hiding it
        addJobBtn.style.display = 'none';

        // Strict check: Only show if the string matches exactly
        if (role === 'ROLE_RECRUITER') {
            addJobBtn.style.display = 'block';
            console.log("RESULT: Recruiter detected. Showing Post Button.");
        } else {
            console.log("RESULT: User detected. Keeping Post Button hidden.");
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
                const data = await response.json();
                // Save exactly what comes from Java
                localStorage.setItem('username', data.username);
                localStorage.setItem('userRole', data.role);
                window.location.replace("dashboard.html");
            } else {
                alert("Invalid Username or Password");
            }
        } catch (err) {
            console.error("Connection Error:", err);
            alert("Cannot connect to backend.");
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
