const API_URL = "http://localhost:8080";

// --- 1. AUTH GUARD ---
// Immediate check to ensure no one accesses dashboard without logging in
(function checkAuth() {
    if (window.location.pathname.includes("dashboard.html")) {
        const user = localStorage.getItem('username');
        if (!user) {
            window.location.replace("index.html");
        }
    }
})();

// --- 2. UI PROTECTION (Horizontal Alignment Fix) ---
function setupDashboardUI() {
    const role = localStorage.getItem('userRole');
    const addJobBtn = document.getElementById('btn-add-job');

    console.log("DEBUG: Current Role in Storage ->", role);

    if (addJobBtn) {
        // Start by hiding it
        addJobBtn.style.display = 'none';

        // Only show if the role matches exactly
        if (role === 'ROLE_RECRUITER') {
            // Using inline-block ensures it sits NEXT to Logout, not above it
            addJobBtn.style.display = 'inline-block';
            console.log("RESULT: Recruiter detected. Showing Post Button horizontally.");
        } else {
            console.log("RESULT: User detected. Keeping Post Button hidden.");
        }
    }
}

// --- 3. FETCH JOBS (With Detailed Error Logs) ---
async function fetchJobs() {
    const jobContainer = document.getElementById('job-container');
    if (!jobContainer) return;

    try {
        const response = await fetch(`${API_URL}/jobs`);

        if (!response.ok) {
            console.error("Server Error Status:", response.status);
            throw new Error(`Server returned ${response.status}`);
        }

        const jobs = await response.json();
        
        if (jobs.length === 0) {
            jobContainer.innerHTML = `<p style="text-align:center; color:#888;">No jobs available yet.</p>`;
            return;
        }

        jobContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.profile}</h3>
                <p>${job.description}</p>
                <p><strong>Exp:</strong> ${job.exp} years</p>
                <button class="btn-apply" onclick="alert('Application Sent!')">Apply Now</button>
            </div>
        `).join('');

    } catch (err) {
        console.error("Fetch failed:", err);
        // This replaces the placeholder text if the backend connection fails
        jobContainer.innerHTML = `<p style="text-align:center; color:#dc3545;">
            Unable to load jobs. (Error: ${err.message})<br>
            Please ensure your Spring Boot Backend is running at ${API_URL}
        </p>`;
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
                
                // Store session data correctly
                localStorage.setItem('username', data.username);
                localStorage.setItem('userRole', data.role);

                // Move to dashboard and prevent "back" button to login
                window.location.replace("dashboard.html");
            } else {
                alert("Invalid Credentials. Please check username and password.");
            }
        } catch (error) {
            console.error("Login Connection Error:", error);
            alert("Backend Connection Failed. Is IntelliJ running?");
        }
    });
}

// --- 5. LOGOUT LOGIC ---
function logout() {
    localStorage.clear();
    window.location.replace("index.html");
}

// --- 6. INITIALIZATION ---
if (window.location.pathname.includes("dashboard.html")) {
    document.addEventListener('DOMContentLoaded', () => {
        // UI Setup runs first to handle button visibility
        setupDashboardUI();
        // Then fetch data from the server
        fetchJobs();
    });
}
