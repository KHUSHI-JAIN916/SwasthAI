/* ==========================================================================
   SwasthAI / SWASTHAI — SWASTHAI Platform Showcase Demo Engine
   Powers the 1-Click Judge Presentation Flow.
   ========================================================================== */

const DemoService = (() => {

    const DEMO_PATIENT_ID = "AYU-2026-DEMO";
    const DEMO_CASE_ID = "CASE-DEMO-2026";

    /**
     * Initializes demo data and redirects to the requested stage of the demo.
     */
    function launchDemo(stage = "review") {
        if (typeof ClinicalStorage === "undefined") {
            console.error("ClinicalStorage not loaded");
            return;
        }

        // Ensure current role is practitioner
        ClinicalStorage.setActiveRole("practitioner");

        ClinicalStorage.logAudit(
            "Launched SWASTHAI Demo Mode",
            "Practitioner",
            "Demo Engine",
            DEMO_CASE_ID,
            "Judges presentation showcase initialized for patient Rajesh Patel."
        );

        if (stage === "interview") {
            // Take judge to adaptive interview
            sessionStorage.setItem("swasthai_demo_active", "true");
            window.location.href = "case-taking.html?patientId=" + DEMO_PATIENT_ID + "&mode=adaptive&demo=1";
        } else if (stage === "review") {
            // Take judge directly to Practitioner Review Workspace
            sessionStorage.setItem("swasthai_demo_active", "true");
            window.location.href = "practitioner-review.html?caseId=" + DEMO_CASE_ID;
        } else {
            // Default to dashboard with demo highlighted
            sessionStorage.setItem("swasthai_demo_active", "true");
            window.location.href = "dashboard.html?demo=1";
        }
    }

    /**
     * Renders a sticky Demo Guide Banner on pages during demo mode.
     */
    function renderDemoBannerIfActive() {
        const isDemo = sessionStorage.getItem("swasthai_demo_active") === "true" || new URLSearchParams(window.location.search).get("demo") === "1";
        if (!isDemo) return;

        const existing = document.getElementById("sihDemoBanner");
        if (existing) return;

        const banner = document.createElement("div");
        banner.id = "sihDemoBanner";
        banner.className = "platform-demo-banner";
        banner.innerHTML = `
            <div class="platform-demo-content">
                <span class="platform-badge"><i class="fa-solid fa-award"></i> PLATFORM DEMO MODE</span>
                <span class="sih-text">Showcasing patient <strong>Rajesh Patel (58y/M)</strong> — Acute Abdominal Pain with Penicillin Allergy & Red Flag detection.</span>
            </div>
            <div class="platform-demo-actions">
                <a href="case-taking.html?patientId=AYU-2026-DEMO&mode=adaptive" class="sih-btn">Adaptive Interview</a>
                <a href="practitioner-review.html?caseId=CASE-DEMO-2026" class="sih-btn primary">Review Workspace</a>
                <a href="dashboard.html" class="sih-btn">Dashboard</a>
                <button onclick="DemoService.exitDemo()" class="sih-close-btn" title="Exit Demo"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;

        document.body.prepend(banner);
    }

    function exitDemo() {
        sessionStorage.removeItem("swasthai_demo_active");
        const banner = document.getElementById("sihDemoBanner");
        if (banner) banner.remove();
    }

    return {
        DEMO_PATIENT_ID,
        DEMO_CASE_ID,
        launchDemo,
        renderDemoBannerIfActive,
        exitDemo
    };

})();

// Auto-run banner check when DOM is ready
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        DemoService.renderDemoBannerIfActive();
    });
}
