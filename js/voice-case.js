/* ==========================================================================
   SwasthAI / SWASTHAI — Voice Case Taking Controller
   Speech recognition diagnostics, quality checking, Hinglish support,
   and seamless transition to the AI Adaptive Interview engine.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const voiceRecordBtn = document.getElementById("voiceRecordBtn");
    const voiceStatus = document.getElementById("voiceStatus");
    const voiceHint = document.getElementById("voiceHint");
    const voiceCircle = document.getElementById("voiceCircle");
    const voiceTranscript = document.getElementById("voiceTranscript");
    const languageSelect = document.getElementById("languageSelect");
    const clearTranscriptBtn = document.getElementById("clearTranscriptBtn");
    const copyTranscriptBtn = document.getElementById("copyTranscriptBtn");
    const sendToCaseBtn = document.getElementById("sendToCaseBtn");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    let isRecording = false;

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    if (!SpeechService.isSupported()) {
        if (voiceRecordBtn) voiceRecordBtn.disabled = true;
        if (voiceStatus) voiceStatus.textContent = "Speech recognition not supported";
        if (voiceHint) voiceHint.textContent = "Please use Google Chrome or Microsoft Edge for voice features.";
        return;
    }

    if (voiceRecordBtn) {
        voiceRecordBtn.addEventListener("click", () => {
            if (!isRecording) {
                const lang = languageSelect ? languageSelect.value : "en-IN";
                SpeechService.startRecognition({
                    lang: lang,
                    onInterim: (interim) => {
                        if (voiceStatus) voiceStatus.textContent = "Listening...";
                        if (voiceHint) voiceHint.textContent = `Interim: "${interim.slice(-35)}..."`;
                    },
                    onFinal: (finalText, confidence) => {
                        voiceTranscript.value += (voiceTranscript.value ? " " : "") + finalText;
                        if (voiceHint) {
                            voiceHint.innerHTML = `<span class="conf-badge ${confidence >= 85 ? 'conf-high' : 'conf-medium'}">Confidence: ${confidence}%</span> Words recognized clearly.`;
                        }
                    },
                    onError: (errMsg) => {
                        isRecording = false;
                        if (voiceCircle) voiceCircle.classList.remove("recording");
                        if (voiceRecordBtn) {
                            voiceRecordBtn.classList.remove("recording");
                            voiceRecordBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Start Recording`;
                        }
                        if (voiceStatus) voiceStatus.textContent = "Audio Quality Warning";
                        if (voiceHint) voiceHint.textContent = "Some words may not have been understood correctly. Please retry or edit transcript manually.";
                    },
                    onStatusChange: (statusObj) => {
                        if (statusObj.status === "listening") {
                            isRecording = true;
                            if (voiceCircle) voiceCircle.classList.add("recording");
                            if (voiceRecordBtn) {
                                voiceRecordBtn.classList.add("recording");
                                voiceRecordBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Stop Recording`;
                            }
                            if (voiceStatus) voiceStatus.textContent = "Listening to patient...";
                            if (voiceHint) voiceHint.textContent = "Speak symptoms, duration, location and medications naturally.";
                        } else {
                            isRecording = false;
                            if (voiceCircle) voiceCircle.classList.remove("recording");
                            if (voiceRecordBtn) {
                                voiceRecordBtn.classList.remove("recording");
                                voiceRecordBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Start Recording`;
                            }
                            if (voiceStatus) voiceStatus.textContent = "Recording complete";
                        }
                    }
                });
            } else {
                SpeechService.stopRecognition();
                isRecording = false;
                if (voiceCircle) voiceCircle.classList.remove("recording");
                if (voiceRecordBtn) {
                    voiceRecordBtn.classList.remove("recording");
                    voiceRecordBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Start Recording`;
                }
            }
        });
    }

    if (clearTranscriptBtn) {
        clearTranscriptBtn.addEventListener("click", () => {
            if (voiceTranscript) voiceTranscript.value = "";
            if (voiceStatus) voiceStatus.textContent = "Ready to listen";
            if (voiceHint) voiceHint.textContent = "Click the button below and start speaking.";
        });
    }

    if (copyTranscriptBtn) {
        copyTranscriptBtn.addEventListener("click", async () => {
            if (!voiceTranscript || !voiceTranscript.value.trim()) {
                alert("No transcript available to copy.");
                return;
            }
            await navigator.clipboard.writeText(voiceTranscript.value);
            copyTranscriptBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => {
                copyTranscriptBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Text`;
            }, 1500);
        });
    }

    if (sendToCaseBtn) {
        sendToCaseBtn.addEventListener("click", () => {
            const transcript = voiceTranscript ? voiceTranscript.value.trim() : "";
            if (!transcript) {
                alert("Please record or enter case information first.");
                return;
            }

            localStorage.setItem("voiceCaseTranscript", transcript);
            ClinicalStorage.logAudit("Sent Voice Transcript to Case-Taking", "Practitioner", "Voice Note", "N/A", `Sent ${transcript.length} chars to adaptive interview.`);
            window.location.href = "case-taking.html?mode=adaptive";
        });
    }
});