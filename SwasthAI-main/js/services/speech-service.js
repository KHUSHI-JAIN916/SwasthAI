/* ==========================================================================
   SwasthAI / SWASTHAI — Speech & Accessibility Service
   Web Speech API STT/TTS with Elderly-Friendly Voice Controls
   ========================================================================== */

const SpeechService = (() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    let recognition = null;
    let isListening = false;
    let lastSpokenText = "";

    function isSupported() {
        return !!SpeechRecognition;
    }

    function isTtsSupported() {
        return !!synth;
    }

    /**
     * Starts voice recognition with callbacks for interim, final, quality, and errors.
     */
    function startRecognition({
        lang = "en-IN",
        onInterim = () => {},
        onFinal = () => {},
        onError = () => {},
        onStatusChange = () => {}
    }) {
        if (!SpeechRecognition) {
            onError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isListening && recognition) {
            recognition.stop();
        }

        try {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = lang;

            recognition.onstart = () => {
                isListening = true;
                onStatusChange({ status: "listening", message: "Listening... speak clearly" });
            };

            recognition.onresult = (event) => {
                let interimTranscript = "";
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    const confidence = Math.round((event.results[i][0].confidence || 0.85) * 100);

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + " ";
                        onFinal(transcript.trim(), confidence);
                    } else {
                        interimTranscript += transcript;
                        onInterim(interimTranscript);
                    }
                }
            };

            recognition.onerror = (event) => {
                let userFriendlyError = "Voice recognition error. Please try again.";
                if (event.error === "not-allowed") {
                    userFriendlyError = "Microphone access denied. Please allow microphone permission.";
                } else if (event.error === "no-speech") {
                    userFriendlyError = "No speech detected. Please speak closer to the microphone.";
                }
                onStatusChange({ status: "error", message: userFriendlyError });
                onError(userFriendlyError, event.error);
            };

            recognition.onend = () => {
                isListening = false;
                onStatusChange({ status: "stopped", message: "Recording stopped" });
            };

            recognition.start();
        } catch (e) {
            onError("Could not initialize voice recording: " + e.message);
        }
    }

    function stopRecognition() {
        if (recognition && isListening) {
            recognition.stop();
            isListening = false;
        }
    }

    /**
     * Text-To-Speech for Elderly-Friendly Mode (Req 11).
     */
    function speakText(text, { lang = "hi-IN", rate = 0.85, pitch = 1.0, onEnd = () => {} } = {}) {
        if (!synth) {
            console.warn("SpeechSynthesis not supported.");
            return;
        }

        synth.cancel(); // Stop any ongoing utterance
        lastSpokenText = text;

        const cleanText = text.replace(/[*_#`]/g, ""); // Strip markdown
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang === "hi" || lang === "hi-IN" || lang === "hinglish" ? "hi-IN" : "en-IN";
        utterance.rate = rate; // 0.85 default; 0.7 for slow speech
        utterance.pitch = pitch;

        utterance.onend = () => onEnd();
        utterance.onerror = (e) => console.warn("TTS error", e);

        synth.speak(utterance);
    }

    function repeatLastSpoken({ rate = 0.85 } = {}) {
        if (lastSpokenText) {
            speakText(lastSpokenText, { rate });
        }
    }

    function stopSpeaking() {
        if (synth) {
            synth.cancel();
        }
    }

    return {
        isSupported,
        isTtsSupported,
        startRecognition,
        stopRecognition,
        speakText,
        repeatLastSpoken,
        stopSpeaking
    };
})();
