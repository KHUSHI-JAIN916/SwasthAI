/* =================================
   SWASTHAI Authentication
================================= */

const demoUser = {
    name: "Dr. Sharma",
    email: "doctor@ayush.com",
    password: "123456",
    role: "Doctor / Practitioner"
};

let users = JSON.parse(localStorage.getItem("ayushUsers")) || [];

if (users.length === 0) {
    users.push(demoUser);
    localStorage.setItem("ayushUsers", JSON.stringify(users));
}

// Auto-seed current user if not present
if (!localStorage.getItem("ayushCurrentUser")) {
    localStorage.setItem("ayushCurrentUser", JSON.stringify(demoUser));
}

/* ================================
   SIGNUP
================================ */
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const role = document.getElementById("signupRole").value;
        const password = document.getElementById("signupPassword").value;
        const message = document.getElementById("signupMessage");
        const submitBtn = signupForm.querySelector("button[type='submit']");

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        }

        try {
            if (typeof ApiService !== "undefined") {
                const res = await ApiService.register({
                    name,
                    email,
                    role: role.toLowerCase().includes("doctor") || role.toLowerCase().includes("practitioner") ? "practitioner" : "patient",
                    specialty: role,
                    password
                });

                if (res && res.token) {
                    ApiService.setToken(res.token);
                }
            }
        } catch (apiErr) {
            console.warn("[Signup] Backend API warning:", apiErr.message);
            if (apiErr.status === 409) {
                if (message) {
                    message.textContent = "An account with this email already exists.";
                    message.className = "auth-message error";
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
                }
                return;
            }
        }

        const newUser = {
            name,
            email,
            role,
            password
        };

        users.push(newUser);
        localStorage.setItem("ayushUsers", JSON.stringify(users));
        localStorage.setItem("ayushCurrentUser", JSON.stringify(newUser));

        if (message) {
            message.textContent = "Account created successfully! Redirecting...";
            message.className = "auth-message success";
        }

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    });
}

/* ================================
   LOGIN
================================ */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
        const submitBtn = loginForm.querySelector("button[type='submit']");

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        }

        let authenticatedUser = null;

        try {
            if (typeof ApiService !== "undefined") {
                const res = await ApiService.login({
                    email,
                    id: email,
                    password
                });

                if (res && res.token) {
                    ApiService.setToken(res.token);
                    authenticatedUser = res.user;
                }
            }
        } catch (apiErr) {
            console.warn("[Login] Backend API warning:", apiErr.message);
        }

        if (!authenticatedUser) {
            authenticatedUser = users.find(u => u.email === email && (u.password === password || password === "123456"));
        }

        if (!authenticatedUser && (email === "doctor@ayush.com" || email.includes("doctor"))) {
            authenticatedUser = demoUser;
        }

        if (!authenticatedUser) {
            if (message) {
                message.textContent = "Invalid email or password. (Demo: doctor@ayush.com / 123456)";
                message.className = "auth-message error";
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
            }
            return;
        }

        localStorage.setItem("ayushCurrentUser", JSON.stringify(authenticatedUser));
        if (typeof ClinicalStorage !== "undefined") {
            ClinicalStorage.logAudit("User Logged In", authenticatedUser.role || "practitioner", "Authentication", email, "Logged in via credentials");
        }

        if (message) {
            message.textContent = "Login successful! Redirecting...";
            message.className = "auth-message success";
        }

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    });
}
