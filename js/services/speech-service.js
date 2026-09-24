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
     * Checks if current environment allows microphone access.
     */
    function checkEnvironment() {
        if (window.location.protocol === "file:") {
            return {
                isRestricted: true,
                message: "Browsers disable microphone access on direct file:// paths. Please open via http://localhost:5000/voice-case.html or use Simulate Voice."
            };
        }
        return { isRestricted: false };
    }

    /**
     * Starts voice recognition with callbacks for interim, final, quality, and errors.
     */
    async function startRecognition({
        lang = "en-IN",
        onInterim = () => {},
        onFinal = () => {},
        onError = () => {},
        onStatusChange = () => {}
    }) {
        const env = checkEnvironment();
        if (env.isRestricted) {
            console.warn("[SpeechService]", env.message);
        }

        if (!SpeechRecognition) {
            onError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
            return;
        }

        if (isListening && recognition) {
            try { recognition.stop(); } catch (_) {}
        }

        // Proactively request mic permission if getUserMedia is available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Release audio stream right away since SpeechRecognition manages its own stream
                stream.getTracks().forEach(track => track.stop());
            } catch (permErr) {
                console.warn("[SpeechService] Microphone permission check warning:", permErr.name);
                if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
                    onError("Microphone permission was denied. Please click the lock or settings icon in your browser URL bar to allow microphone access, or click 'Simulate Patient Voice'.", "not-allowed");
                    return;
                }
            }
        }

        try {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;
            recognition.lang = lang;

            recognition.onstart = () => {
                isListening = true;
                onStatusChange({ status: "listening", message: "Listening... speak clearly" });
            };

            recognition.onresult = (event) => {
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    const confidence = Math.round((event.results[i][0].confidence || 0.88) * 100);

                    if (event.results[i].isFinal) {
                        onFinal(transcript.trim(), confidence);
                    } else {
                        interimTranscript += transcript;
                        onInterim(interimTranscript);
                    }
                }
            };

            recognition.onerror = (event) => {
                let userFriendlyError = "Voice recognition error. Please try again.";
                const errType = event.error;

                if (errType === "not-allowed" || errType === "service-not-allowed") {
                    userFriendlyError = window.location.protocol === "file:"
                        ? "Microphone access blocked on file:// path. Please run the app on http://localhost:5000/voice-case.html, or use 'Simulate Patient Voice'."
                        : "Microphone access denied. Please click the site icon in your address bar and allow Microphone.";
                } else if (errType === "network") {
                    userFriendlyError = "Speech recognition network connection failed. Check your internet connection or use 'Simulate Patient Voice'.";
                } else if (errType === "audio-capture") {
                    userFriendlyError = "No microphone detected or microphone is in use by another app.";
                } else if (errType === "no-speech") {
                    userFriendlyError = "No speech detected. Please speak closer to the microphone.";
                }

                onStatusChange({ status: "error", message: userFriendlyError });
                onError(userFriendlyError, errType);
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

    /**
     * Simulates natural clinical voice case dictation (for demos or offline environments).
     */
    function simulateVoiceInput({
        lang = "en-IN",
        onInterim = () => {},
        onFinal = () => {},
        onStatusChange = () => {},
        onComplete = () => {}
    }) {
        isListening = true;
        onStatusChange({ status: "listening", message: "Simulating patient voice dictation..." });

        const isHindi = lang.startsWith("hi");
        const sentences = isHindi
            ? [
                "नमस्ते डॉक्टर साहब, मुझे पिछले 6 महीने से पेट में बहुत जलन और खट्टी डकार आ रही है।",
                "विशेषकर दोपहर में भोजन के तुरंत बाद सीने में भारीपन और तीखा दर्द महसूस होता है।",
                "मुझे 2021 से उच्च रक्तचाप यानी ब्लड प्रेशर की शिकायत है और मैं एमलोडिपिन 5mg गोली रोज लेता हूँ।",
                "डॉक्टर साहब मुझे पेनिसिलिन दवाई से बहुत तेज एलर्जी है, पहले चेहरे पर सूजन और लाल चकत्ते आ गए थे।",
                "नींद ठीक से नहीं आती और काम का काफी तनाव रहता है।"
            ]
            : [
                "Hello Doctor, I have been experiencing severe acid reflux, epigastric burning, and sour belching for the last 6 months.",
                "The pain significantly aggravates about 30 minutes after heavy or spicy meals.",
                "I was diagnosed with Essential Hypertension in 2021 and currently take Amlodipine 5mg once daily in the morning.",
                "Please note that I have a documented severe allergy to Penicillin, which previously caused acute urticaria and facial angioedema.",
                "My digestion feels sluggish, bowel movements are irregular, and I am under high work stress."
            ];

        let sIndex = 0;
        const interval = setInterval(() => {
            if (sIndex < sentences.length) {
                const text = sentences[sIndex];
                onInterim(text.slice(0, Math.floor(text.length / 2)) + "...");
                setTimeout(() => {
                    onFinal(text, 96);
                }, 350);
                sIndex++;
            } else {
                clearInterval(interval);
                isListening = false;
                onStatusChange({ status: "stopped", message: "Dictation simulation complete." });
                onComplete();
            }
        }, 1200);

        return {
            stop: () => {
                clearInterval(interval);
                isListening = false;
                onStatusChange({ status: "stopped", message: "Simulation stopped." });
            }
        };
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
        simulateVoiceInput,
        speakText,
        repeatLastSpoken,
        stopSpeaking
    };
})();
