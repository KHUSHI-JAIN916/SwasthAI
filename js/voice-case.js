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

    const simulateVoiceBtn = document.getElementById("simulateVoiceBtn");
    const fileProtocolWarning = document.getElementById("fileProtocolWarning");

    let isRecording = false;
    let activeSimulator = null;

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    // Show warning banner if running on direct file:// protocol
    if (window.location.protocol === "file:" && fileProtocolWarning) {
        fileProtocolWarning.style.display = "block";
    }

    if (!SpeechService.isSupported()) {
        if (voiceRecordBtn) {
            voiceRecordBtn.style.opacity = "0.7";
            voiceRecordBtn.title = "Speech recognition API not supported in this browser. Please use Chrome/Edge or use Simulate Voice.";
        }
        if (voiceStatus) voiceStatus.textContent = "Speech Recognition Notice";
        if (voiceHint) voiceHint.textContent = "Your browser does not support the Web Speech API directly. You can use 'Simulate Patient Voice' to test case taking.";
    }

    function resetButtons() {
        isRecording = false;
        if (voiceCircle) voiceCircle.classList.remove("recording");
        if (voiceRecordBtn) {
            voiceRecordBtn.classList.remove("recording");
            voiceRecordBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Start Recording`;
        }
        if (simulateVoiceBtn) {
            simulateVoiceBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Simulate Patient Voice`;
        }
    }

    if (voiceRecordBtn) {
        voiceRecordBtn.addEventListener("click", async () => {
            if (activeSimulator) {
                activeSimulator.stop();
                activeSimulator = null;
                resetButtons();
                return;
            }

            if (!isRecording) {
                const lang = languageSelect ? languageSelect.value : "en-IN";
                if (voiceStatus) voiceStatus.textContent = "Requesting microphone access...";
                if (voiceHint) voiceHint.textContent = "Please allow microphone access in your browser prompt.";

                await SpeechService.startRecognition({
                    lang: lang,
                    onInterim: (interim) => {
                        if (voiceStatus) voiceStatus.textContent = "Listening to patient...";
                        if (voiceHint) voiceHint.textContent = `Speaking: "${interim.slice(-40)}..."`;
                    },
                    onFinal: (finalText, confidence) => {
                        voiceTranscript.value += (voiceTranscript.value ? " " : "") + finalText;
                        if (voiceHint) {
                            voiceHint.innerHTML = `<span class="conf-badge ${confidence >= 85 ? 'conf-high' : 'conf-medium'}">Confidence: ${confidence}%</span> Speech recognized clearly.`;
                        }
                    },
                    onError: (errMsg, errType) => {
                        resetButtons();
                        if (voiceStatus) voiceStatus.textContent = "Microphone / Voice Notice";
                        if (voiceHint) {
                            voiceHint.innerHTML = `<span style="color:#b91c1c;">${errMsg}</span> <br><span style="font-size:12px; color:#6b7280;">Tip: Click 'Simulate Patient Voice' below to test clinical case dictation instantly.</span>`;
                        }
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
                            if (voiceHint) voiceHint.textContent = "Speak symptoms, duration, pain location and medications clearly.";
                        } else {
                            resetButtons();
                            if (voiceStatus) voiceStatus.textContent = statusObj.message || "Recording stopped";
                        }
                    }
                });
            } else {
                SpeechService.stopRecognition();
                resetButtons();
            }
        });
    }

    // Simulated Voice Dictation (1-Click demonstration)
    if (simulateVoiceBtn) {
        simulateVoiceBtn.addEventListener("click", () => {
            if (isRecording) {
                SpeechService.stopRecognition();
            }

            if (activeSimulator) {
                activeSimulator.stop();
                activeSimulator = null;
                resetButtons();
                if (voiceStatus) voiceStatus.textContent = "Simulation paused";
                return;
            }

            const lang = languageSelect ? languageSelect.value : "en-IN";
            isRecording = true;
            if (voiceCircle) voiceCircle.classList.add("recording");
            simulateVoiceBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Stop Simulation`;
            if (voiceStatus) voiceStatus.textContent = "Simulating patient voice dictation...";
            if (voiceHint) voiceHint.textContent = "Transcribing spoken clinical symptoms in real time...";

            activeSimulator = SpeechService.simulateVoiceInput({
                lang,
                onInterim: (interim) => {
                    if (voiceHint) voiceHint.textContent = `Speaking: "${interim}"`;
                },
                onFinal: (finalText, confidence) => {
                    voiceTranscript.value += (voiceTranscript.value ? "\n" : "") + finalText;
                    if (voiceHint) {
                        voiceHint.innerHTML = `<span class="conf-badge conf-high">Recognized (${confidence}%)</span> ${finalText.slice(0, 45)}...`;
                    }
                },
                onStatusChange: (statusObj) => {
                    if (voiceStatus) voiceStatus.textContent = statusObj.message;
                },
                onComplete: () => {
                    activeSimulator = null;
                    resetButtons();
                    if (voiceStatus) voiceStatus.textContent = "Voice transcription complete (100%)";
                    if (voiceHint) voiceHint.textContent = "Review your voice transcript below and click 'Send to Case Examination'.";
                }
            });
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