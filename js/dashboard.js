document.addEventListener("DOMContentLoaded", () => {
    // Global Logout Handler for sidebars and topbars
    const logoutBtns = document.querySelectorAll(".logout, .nav-item.logout, #logoutBtn");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof ClinicalStorage !== "undefined") {
                ClinicalStorage.logoutUser();
            } else {
                localStorage.removeItem("ayushCurrentUser");
                localStorage.removeItem("swasthai_active_patient_id");
                window.location.href = "index.html";
            }
        });
    });

    // Dynamic Time-Based Greeting
    function updateGreeting() {
        const greetingEl = document.getElementById("dashboardGreeting") || document.querySelector(".topbar-left h1");
        if (!greetingEl) return;
        const hour = new Date().getHours();
        let greeting = "Good Morning, Doctor 👋";
        if (hour >= 12 && hour < 17) {
            greeting = "Good Afternoon, Doctor 👋";
        } else if (hour >= 17 || hour < 4) {
            greeting = "Good Evening, Doctor 👋";
        }
        if (typeof I18nService !== "undefined" && typeof I18nService.translateText === "function") {
            const currentLang = (typeof I18nService.getLanguage === "function") ? I18nService.getLanguage() : "en";
            greetingEl.textContent = I18nService.translateText(greeting, currentLang);
        } else {
            greetingEl.textContent = greeting;
        }
    }
    updateGreeting();

    // Sidebar toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    // Role Switcher
    const roleSelector = document.getElementById("roleSelector");
    const doctorAvatar = document.getElementById("currentDoctorAvatar");
    const doctorName = document.getElementById("currentDoctorName");
    const doctorRole = document.getElementById("currentDoctorRole");

    if (roleSelector) {
        const activeRole = ClinicalStorage.getActiveRole();
        roleSelector.value = activeRole;
        updateRoleUI(activeRole);

        roleSelector.addEventListener("change", (e) => {
            const newRole = e.target.value;
            ClinicalStorage.setActiveRole(newRole);
            updateRoleUI(newRole);
        });
    }

    function updateRoleUI(role) {
        if (role === "patient") {
            if (doctorAvatar) doctorAvatar.textContent = "RP";
            if (doctorName) doctorName.textContent = "Rajesh Patel";
            if (doctorRole) doctorRole.textContent = "Patient / Caregiver";
        } else if (role === "admin") {
            if (doctorAvatar) doctorAvatar.textContent = "AD";
            if (doctorName) doctorName.textContent = "System Admin";
            if (doctorRole) doctorRole.textContent = "Clinical Administrator";
        } else {
            const currentDoc = JSON.parse(localStorage.getItem("ayushCurrentUser")) || {};
            const hospName = localStorage.getItem("swasthai_current_hospital") || "AIIMS Partner Hospital";
            const docNameStr = currentDoc.name || "Dr. Sharma";
            const initials = docNameStr.replace("Dr.", "").trim().split(" ").map(n => n[0]).join("").toUpperCase() || "DS";

            if (doctorAvatar) doctorAvatar.textContent = initials;
            if (doctorName) doctorName.textContent = docNameStr;
            if (doctorRole) doctorRole.textContent = hospName;
        }
    }

    // Demo Mode Launcher
    const launchDemoBtn = document.getElementById("launchSihDemoBtn");
    if (launchDemoBtn) {
        launchDemoBtn.addEventListener("click", () => {
            DemoService.launchDemo("review");
        });
    }

    // Offline / Connectivity Detection (Req 28)
    function updateConnectivityStatus() {
        const isOffline = !navigator.onLine;
        let offlineBanner = document.getElementById("dashboardOfflineBanner");

        if (isOffline) {
            if (!offlineBanner) {
                offlineBanner = document.createElement("div");
                offlineBanner.id = "dashboardOfflineBanner";
                offlineBanner.className = "alert-banner-warning";
                offlineBanner.style.cssText = "margin: 16px 24px 0 24px;";
                offlineBanner.innerHTML = `
                    <div class="alert-icon"><i class="fa-solid fa-wifi-slash"></i></div>
                    <div>
                        <h4>Offline Mode Active</h4>
                        <p>No internet connection detected. Case-taking, patient files, and offline drafts are securely saved locally. Data will synchronize automatically once reconnected.</p>
                    </div>
                `;
                const container = document.querySelector(".dashboard-container");
                if (container) container.prepend(offlineBanner);
            }
        } else if (offlineBanner) {
            offlineBanner.remove();
        }
    }

    window.addEventListener("online", updateConnectivityStatus);
    window.addEventListener("offline", updateConnectivityStatus);
    updateConnectivityStatus();

    // Load Live Metrics
    loadMetrics();

    // Render Practitioner Attention Queue
    renderAttentionQueue();

    // AI Suggestion Buttons
    const suggestionButtons = document.querySelectorAll(".suggestion-btn");
    suggestionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const text = btn.innerText.toLowerCase();
            if (text.includes("voice")) {
                window.location.href = "voice-case.html";
            } else if (text.includes("summary")) {
                window.location.href = "practitioner-review.html";
            } else if (text.includes("question")) {
                window.location.href = "ai-assistant.html";
            }
        });
    });

    function loadMetrics() {
        const metrics = ClinicalStorage.getDashboardMetrics();

        setNumberWithAnimation("patientCount", metrics.totalPatients);
        setNumberWithAnimation("casesTodayCount", metrics.casesToday);
        setNumberWithAnimation("pendingReviewCount", metrics.pendingReview);
        setNumberWithAnimation("completedCasesCount", metrics.completed);
        setNumberWithAnimation("redFlagCount", metrics.redFlagCount);
        setNumberWithAnimation("attentionCount", metrics.requiringAttention);
        setNumberWithAnimation("followupsDueCount", metrics.followupsDue);
    }

    function setNumberWithAnimation(elementId, targetValue) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = targetValue.toLocaleString();
    }

    function renderAttentionQueue() {
        const container = document.getElementById("attentionQueueContainer");
        if (!container) return;

        const queue = ClinicalStorage.getAttentionQueue();
        const allItems = [...queue.urgent, ...queue.needsVerification, ...queue.incomplete, ...queue.ready];

        container.innerHTML = "";

        if (allItems.length === 0) {
            container.innerHTML = `<p style="color: #6b7280; font-size: 14px;">No cases requiring attention in queue.</p>`;
            return;
        }

        allItems.slice(0, 4).forEach(item => {
            const card = document.createElement("div");
            card.className = `queue-card ${item.type}`;
            card.innerHTML = `
                <div>
                    <div class="queue-header">
                        <span class="queue-badge">${item.badge}</span>
                        <span style="font-size: 11px; color: #6b7280;">ID: ${item.case.id}</span>
                    </div>
                    <div class="queue-body">
                        <h4>${item.case.patientName}</h4>
                        <p>${item.reason}</p>
                        ${item.trigger ? `<div style="font-size: 11px; color: #6b7280; background: #f9fafb; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px;"><strong>Trigger:</strong> "${item.trigger.slice(0, 60)}..."</div>` : ''}
                    </div>
                </div>
                <div class="queue-footer">
                    <span style="font-size: 12px; color: #6b7280;"><i class="fa-solid fa-clock"></i> Pending review</span>
                    <a href="practitioner-review.html?caseId=${item.case.id}" class="sih-btn primary" style="padding: 4px 10px; font-size: 11px;">
                        Review Now <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Language switch listener
    window.addEventListener("languageChanged", () => {
        updateGreeting();
        loadMetrics();
        renderAttentionQueue();
        if (typeof I18nService !== "undefined") {
            I18nService.translatePage();
        }
    });
});