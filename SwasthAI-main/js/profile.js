/* ==========================================================================
   SwasthAI / SWASTHAI — Profile & Audit Controller
   Manages practitioner profile, Privacy & Consent settings, and
   renders the immutable clinical audit log table.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelProfileBtn");
    const editCard = document.getElementById("editProfileCard");
    const form = document.getElementById("profileForm");

    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileEmail = document.getElementById("profileEmail");

    const detailName = document.getElementById("detailName");
    const detailEmail = document.getElementById("detailEmail");
    const detailRole = document.getElementById("detailRole");

    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editRole = document.getElementById("editRole");

    const resetDemoDataBtn = document.getElementById("resetDemoDataBtn");
    const refreshAuditBtn = document.getElementById("refreshAuditBtn");
    const auditTableBody = document.getElementById("auditTableBody");

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const logoutBtn = document.getElementById("logoutBtn");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("ayushCurrentUser");
            window.location.href = "index.html";
        });
    }

    function loadProfile() {
        const user = JSON.parse(localStorage.getItem("ayushCurrentUser")) || {
            name: "Dr. Sharma",
            email: "doctor@ayush.com",
            role: "Doctor / Practitioner"
        };

        if (profileName) profileName.textContent = user.name;
        if (profileRole) profileRole.textContent = user.role || "Doctor / Practitioner";
        if (profileEmail) profileEmail.textContent = user.email;

        if (detailName) detailName.textContent = user.name;
        if (detailEmail) detailEmail.textContent = user.email;
        if (detailRole) detailRole.textContent = user.role || "Doctor / Practitioner";

        if (editName) editName.value = user.name;
        if (editEmail) editEmail.value = user.email;
        if (editRole) editRole.value = user.role || "Doctor / Practitioner";

        renderAuditLogs();
    }

    function renderAuditLogs() {
        if (!auditTableBody) return;

        let logs = [];
        if (typeof ClinicalStorage !== "undefined") {
            logs = ClinicalStorage.getAuditLogs();
        }

        auditTableBody.innerHTML = "";

        if (logs.length === 0) {
            auditTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 18px;">No audit entries recorded yet.</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement("tr");
            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Just now";
            const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Today";

            tr.innerHTML = `
                <td style="white-space: nowrap;"><strong>${dateStr}</strong> <span style="color: #6b7280;">${timeStr}</span></td>
                <td><span style="font-weight: 700; color: #1f7a57;">${log.userRole || 'Practitioner'}</span></td>
                <td><strong>${log.action}</strong></td>
                <td><code>${log.entity || 'General'}</code></td>
                <td><small>${log.caseId || 'N/A'}</small></td>
                <td style="color: #4b5563;">${log.details}</td>
            `;
            auditTableBody.appendChild(tr);
        });
    }

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            if (editCard) editCard.style.display = "block";
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (editCard) editCard.style.display = "none";
        });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const updatedUser = {
                name: editName.value.trim(),
                email: editEmail.value.trim(),
                role: editRole.value
            };

            localStorage.setItem("ayushCurrentUser", JSON.stringify(updatedUser));
            if (typeof ClinicalStorage !== "undefined") {
                ClinicalStorage.logAudit("Updated Practitioner Profile", "Practitioner", "User Profile", "N/A", `Updated name to ${updatedUser.name}`);
            }

            loadProfile();
            if (editCard) editCard.style.display = "none";
            alert("Profile updated successfully!");
        });
    }

    if (resetDemoDataBtn) {
        resetDemoDataBtn.addEventListener("click", () => {
            if (confirm("Reset all patient records, cases, and timelines to initial SWASTHAI showcase defaults?")) {
                localStorage.removeItem("ayushPatients");
                localStorage.removeItem("ayushCases");
                localStorage.removeItem("ayushTimeline");
                localStorage.removeItem("ayushAuditLogs");
                localStorage.removeItem("ayushFollowups");
                location.reload();
            }
        });
    }

    if (refreshAuditBtn) {
        refreshAuditBtn.addEventListener("click", () => {
            renderAuditLogs();
        });
    }

    loadProfile();
});