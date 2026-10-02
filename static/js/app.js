/* ==========================================================================
   AI Medical Lab Reports Assistant - Interactive Frontend Engine (v2.0)
   With Multi-Language Support, AI Recommendations, & Interactive Medical Chat
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const languageSelect = document.getElementById("languageSelect");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const filePreviewBar = document.getElementById("filePreviewBar");
    const fileNameEl = document.getElementById("fileName");
    const fileSizeEl = document.getElementById("fileSize");
    const fileTypeIcon = document.getElementById("fileTypeIcon");
    const removeFileBtn = document.getElementById("removeFileBtn");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const loadingState = document.getElementById("loadingState");
    const uploadCard = document.getElementById("uploadCard");
    const resultsDashboard = document.getElementById("resultsDashboard");
    const sampleButtons = document.querySelectorAll(".sample-btn");
    const printReportBtn = document.getElementById("printReportBtn");
    const newReportBtn = document.getElementById("newReportBtn");
    const rawTextToggle = document.getElementById("rawTextToggle");
    const rawTextContent = document.getElementById("rawTextContent");
    const rawTextCode = document.getElementById("rawTextCode");

    // Chat Elements
    const openChatBtn = document.getElementById("openChatBtn");
    const floatingChatBtn = document.getElementById("floatingChatBtn");
    const closeChatBtn = document.getElementById("closeChatBtn");
    const chatBackdrop = document.getElementById("chatBackdrop");
    const chatDrawer = document.getElementById("chatDrawer");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendChatBtn = document.getElementById("sendChatBtn");
    const chatChips = document.querySelectorAll(".chat-chip");

    let currentSelectedFile = null;
    let currentAnalysisData = null;
    let chatHistory = [];

    // --- Language Management ---
    const savedLang = localStorage.getItem("medassist_lang") || "en";
    languageSelect.value = savedLang;
    applyLanguageClass(savedLang);

    languageSelect.addEventListener("change", () => {
        const selectedLang = languageSelect.value;
        localStorage.setItem("medassist_lang", selectedLang);
        applyLanguageClass(selectedLang);

        // If a report is already analyzed, re-analyze or update prompt language
        if (currentSelectedFile) {
            const formData = new FormData();
            formData.append("file", currentSelectedFile);
            formData.append("language", selectedLang);
            runAnalysis(formData, currentSelectedFile.name, selectedLang);
        } else if (currentAnalysisData && currentAnalysisData.raw_extracted_text) {
            runAnalysis({ text: currentAnalysisData.raw_extracted_text, language: selectedLang }, "Current Report", selectedLang);
        }
    });

    function applyLanguageClass(lang) {
        if (lang === "ur") {
            document.body.classList.add("lang-ur");
        } else {
            document.body.classList.remove("lang-ur");
        }
    }

    // --- Theme Management ---
    const savedTheme = localStorage.getItem("medassist_theme") || "theme-light";
    document.body.className = savedTheme + (savedLang === "ur" ? " lang-ur" : "");
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.contains("theme-dark");
        const newTheme = isDark ? "theme-light" : "theme-dark";
        document.body.className = newTheme + (languageSelect.value === "ur" ? " lang-ur" : "");
        localStorage.setItem("medassist_theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector("i");
        if (theme === "theme-dark") {
            icon.className = "fa-solid fa-sun";
        } else {
            icon.className = "fa-solid fa-moon";
        }
    }

    // --- File Drag & Drop Handling ---
    browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener("click", () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadCard.classList.add("dragover");
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadCard.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleSelectedFile(files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    function handleSelectedFile(file) {
        currentSelectedFile = file;
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatBytes(file.size);

        if (file.name.toLowerCase().endsWith(".pdf")) {
            fileTypeIcon.className = "fa-solid fa-file-pdf file-type-icon text-red";
        } else {
            fileTypeIcon.className = "fa-solid fa-file-image file-type-icon text-blue";
        }

        dropZone.style.display = "none";
        filePreviewBar.style.display = "flex";
    }

    removeFileBtn.addEventListener("click", () => {
        currentSelectedFile = null;
        fileInput.value = "";
        dropZone.style.display = "block";
        filePreviewBar.style.display = "none";
    });

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // --- 1-Click Sample Reports Handler ---
    sampleButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const sampleId = btn.getAttribute("data-sample");
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;

            try {
                const res = await fetch(`/api/sample/${sampleId}`);
                const data = await res.json();
                if (data.success) {
                    const currentLang = languageSelect.value;
                    runAnalysis({ text: data.sample.text, language: currentLang }, data.sample.title, currentLang);
                } else {
                    alert("Could not load sample: " + data.error);
                }
            } catch (err) {
                alert("Error fetching sample report: " + err.message);
            } finally {
                btn.disabled = false;
                resetSampleButtonLabels();
            }
        });
    });

    function resetSampleButtonLabels() {
        sampleButtons.forEach(btn => {
            const id = btn.getAttribute("data-sample");
            if (id === "cbc") btn.innerHTML = `<i class="fa-solid fa-droplet text-red"></i> Anemia Panel (CBC)`;
            if (id === "lipid") btn.innerHTML = `<i class="fa-solid fa-heart text-amber"></i> Lipid & Metabolic`;
            if (id === "liver_thyroid") btn.innerHTML = `<i class="fa-solid fa-dna text-blue"></i> Thyroid & Liver (LFT)`;
        });
    }

    // --- Analyze Button Click ---
    analyzeBtn.addEventListener("click", () => {
        if (!currentSelectedFile) return;
        const currentLang = languageSelect.value;
        const formData = new FormData();
        formData.append("file", currentSelectedFile);
        formData.append("language", currentLang);
        runAnalysis(formData, currentSelectedFile.name, currentLang);
    });

    // --- Main Analysis Dispatcher ---
    async function runAnalysis(payload, reportSourceTitle, lang = "en") {
        uploadCard.style.display = "none";
        document.querySelector(".sample-bar").style.display = "none";
        loadingState.style.display = "block";
        resultsDashboard.style.display = "none";
        floatingChatBtn.style.display = "none";

        animateSteps();

        try {
            let options = {};
            let url = `/api/analyze?lang=${lang}`;

            if (payload instanceof FormData) {
                options = {
                    method: "POST",
                    body: payload
                };
            } else {
                options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                };
            }

            const response = await fetch(url, options);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Analysis failed.");
            }

            currentAnalysisData = result.data;
            renderResults(result.data, reportSourceTitle, lang);

        } catch (error) {
            alert("Error during report analysis: " + error.message);
            uploadCard.style.display = "block";
            document.querySelector(".sample-bar").style.display = "flex";
            loadingState.style.display = "none";
        }
    }

    function animateSteps() {
        const s1 = document.getElementById("step1");
        const s2 = document.getElementById("step2");
        const s3 = document.getElementById("step3");

        s1.className = "step-item active";
        s2.className = "step-item";
        s3.className = "step-item";

        setTimeout(() => {
            s2.className = "step-item active";
        }, 1200);

        setTimeout(() => {
            s3.className = "step-item active";
        }, 2400);
    }

    // --- Render Analysis Results ---
    function renderResults(data, sourceTitle, lang = "en") {
        loadingState.style.display = "none";
        resultsDashboard.style.display = "flex";
        floatingChatBtn.style.display = "flex";

        // Date & Timestamp
        document.getElementById("reportGeneratedAt").textContent = "Analyzed on: " + new Date().toLocaleString();

        // Patient Metadata
        const pInfo = data.patient_info || {};
        document.getElementById("patientName").textContent = pInfo.name || "Anonymous Patient";
        document.getElementById("patientDemographics").textContent = `${pInfo.age || "N/A"} / ${pInfo.gender || "N/A"}`;
        document.getElementById("reportDate").textContent = pInfo.date || new Date().toISOString().split('T')[0];
        document.getElementById("labName").textContent = pInfo.lab_name || "Diagnostic Pathology Services";

        // Overall Summary & Risk
        document.getElementById("overallSummaryText").textContent = data.overall_summary || "No summary provided.";
        
        const riskBadge = document.getElementById("riskBadge");
        const riskLevel = (data.risk_level || "Low").toLowerCase();
        riskBadge.textContent = (data.risk_level || "Low") + " Risk";
        riskBadge.className = "risk-badge " + (riskLevel === "critical" || riskLevel === "high" ? "high" : (riskLevel === "moderate" ? "moderate" : "low"));

        // FEATURE 1: Render Personalized Clinical Recommendations
        renderRecommendations(data.recommendations);

        // Metrics Counters
        const tests = data.structured_tests || [];
        const normalCount = tests.filter(t => (t.status || '').toLowerCase() === 'normal').length;
        const abnormalCount = tests.filter(t => (t.status || '').toLowerCase() === 'abnormal').length;
        const criticalCount = tests.filter(t => (t.status || '').toLowerCase() === 'critical').length;

        document.getElementById("totalTestsCount").textContent = tests.length;
        document.getElementById("normalTestsCount").textContent = normalCount;
        document.getElementById("abnormalTestsCount").textContent = abnormalCount;
        document.getElementById("criticalTestsCount").textContent = criticalCount;

        document.getElementById("tabAllCount").textContent = tests.length;
        document.getElementById("tabAbnormalCount").textContent = abnormalCount + criticalCount;
        document.getElementById("tabNormalCount").textContent = normalCount;

        // Render Table Rows
        renderTableRows(tests);

        // Render Accordion Explanations
        renderExplanationsAccordion(tests);

        // Raw Text Content
        rawTextCode.textContent = data.raw_extracted_text || "No raw text was generated.";

        // Medical Disclaimer
        if (data.disclaimer) {
            document.getElementById("disclaimerText").innerHTML = `<strong>Medical Disclaimer:</strong> ${data.disclaimer}`;
        }

        // Reset Chat History for New Report
        chatHistory = [];
        chatMessages.innerHTML = `
            <div class="chat-bubble ai-bubble">
                <div class="bubble-avatar"><i class="fa-solid fa-user-doctor"></i></div>
                <div class="bubble-content">
                    <p>${lang === 'ur' ? 'سلام! میں آپ کا میڈیکل اسسٹنٹ ہوں۔ میں نے آپ کی لیب رپورٹ پڑھ لی ہے۔ آپ اس رپورٹ سے متعلق کوئی بھی سوال پوچھ سکتے ہیں۔' : (lang === 'roman_ur' ? 'Salam! Main aapka AI Medical Assistant hoon. Maine aapki lab report review kar li hai. Aap is report ke baare mein koi bhi sawaal pooch sakte hain.' : 'Hello! I am your AI Medical Assistant. I have reviewed your lab report. What would you like to know about your health results?')}</p>
                </div>
            </div>
        `;

        // Scroll to results
        resultsDashboard.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Render Recommendation Cards ---
    function renderRecommendations(rec) {
        const dietList = document.getElementById("recDietList");
        const docList = document.getElementById("recDoctorList");
        const followupList = document.getElementById("recFollowupList");
        const warningList = document.getElementById("recWarningList");

        rec = rec || {};
        populateList(dietList, rec.diet_and_nutrition, "Follow a balanced diet with proper hydration.");
        populateList(docList, rec.specialist_consultation, "Consult your General Physician for a regular health checkup.");
        populateList(followupList, rec.follow_up_tests, "Repeat routine lab checkup in 6 to 12 months.");
        populateList(warningList, rec.warning_precautions, "Seek prompt clinical attention if experiencing acute fatigue or discomfort.");
    }

    function populateList(el, items, fallback) {
        el.innerHTML = "";
        if (items && items.length > 0) {
            items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                el.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = fallback;
            el.appendChild(li);
        }
    }

    // --- Table Rendering with Filtering ---
    function renderTableRows(tests, filter = "all") {
        const tbody = document.getElementById("testsTableBody");
        tbody.innerHTML = "";

        const filtered = tests.filter(test => {
            const status = (test.status || "normal").toLowerCase();
            if (filter === "all") return true;
            if (filter === "abnormal") return status === "abnormal" || status === "critical";
            if (filter === "normal") return status === "normal";
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No tests match this filter.</td></tr>`;
            return;
        }

        filtered.forEach(test => {
            const tr = document.createElement("tr");
            const status = (test.status || "normal").toLowerCase();
            let badgeClass = "status-badge normal";
            let badgeIcon = `<i class="fa-solid fa-circle-check"></i>`;

            if (status === "abnormal") {
                badgeClass = "status-badge abnormal";
                badgeIcon = `<i class="fa-solid fa-triangle-exclamation"></i>`;
            } else if (status === "critical") {
                badgeClass = "status-badge critical";
                badgeIcon = `<i class="fa-solid fa-radiation"></i>`;
            }

            tr.innerHTML = `
                <td><strong>${escapeHtml(test.test_name)}</strong></td>
                <td><span style="font-weight:700;">${escapeHtml(test.measured_value)}</span> ${escapeHtml(test.unit || '')}</td>
                <td><span style="color:var(--text-secondary);">${escapeHtml(test.normal_range || 'N/A')}</span></td>
                <td><span class="${badgeClass}">${badgeIcon} ${escapeHtml(test.status || 'Normal')}</span></td>
                <td style="font-size:0.88rem; color:var(--text-secondary);">${escapeHtml(test.explanation || '')}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- Filter Tabs Interaction ---
    const filterTabs = document.querySelectorAll(".filter-tab");
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const filter = tab.getAttribute("data-filter");
            if (currentAnalysisData && currentAnalysisData.structured_tests) {
                renderTableRows(currentAnalysisData.structured_tests, filter);
            }
        });
    });

    // --- Explanations Accordion ---
    function renderExplanationsAccordion(tests) {
        const container = document.getElementById("explanationsAccordion");
        container.innerHTML = "";

        tests.forEach((test, idx) => {
            const item = document.createElement("div");
            item.className = "accordion-item" + (idx === 0 ? " open" : "");

            const status = (test.status || "normal").toLowerCase();
            let statusIcon = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>`;
            if (status === "abnormal") {
                statusIcon = `<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>`;
            } else if (status === "critical") {
                statusIcon = `<i class="fa-solid fa-circle-exclamation" style="color: #ef4444;"></i>`;
            }

            item.innerHTML = `
                <button class="accordion-header" type="button">
                    <div class="accordion-header-left">
                        ${statusIcon}
                        <span>${escapeHtml(test.test_name)}: <strong>${escapeHtml(test.measured_value)} ${escapeHtml(test.unit || '')}</strong> (Ref: ${escapeHtml(test.normal_range || 'N/A')})</span>
                    </div>
                    <i class="fa-solid fa-chevron-down accordion-icon"></i>
                </button>
                <div class="accordion-body" style="${idx === 0 ? 'display:block;' : 'display:none;'}">
                    <p>${escapeHtml(test.explanation)}</p>
                </div>
            `;

            const headerBtn = item.querySelector(".accordion-header");
            const body = item.querySelector(".accordion-body");

            headerBtn.addEventListener("click", () => {
                const isOpen = item.classList.contains("open");
                if (isOpen) {
                    item.classList.remove("open");
                    body.style.display = "none";
                } else {
                    item.classList.add("open");
                    body.style.display = "block";
                }
            });

            container.appendChild(item);
        });
    }

    // --- FEATURE 3: Interactive Chat Engine ---
    function openChat() {
        chatDrawer.style.display = "flex";
        chatBackdrop.style.display = "block";
        chatInput.focus();
    }

    function closeChat() {
        chatDrawer.style.display = "none";
        chatBackdrop.style.display = "none";
    }

    openChatBtn.addEventListener("click", openChat);
    floatingChatBtn.addEventListener("click", openChat);
    closeChatBtn.addEventListener("click", closeChat);
    chatBackdrop.addEventListener("click", closeChat);

    chatChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const question = chip.getAttribute("data-question");
            chatInput.value = question;
            sendMessage();
        });
    });

    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Append User Message
        appendMessage("user", text);
        chatInput.value = "";

        // Typing Indicator
        const typingEl = appendTypingIndicator();

        try {
            const currentLang = languageSelect.value;
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    report_context: currentAnalysisData || {},
                    chat_history: chatHistory,
                    language: currentLang
                })
            });

            const data = await res.json();
            typingEl.remove();

            if (data.success) {
                appendMessage("ai", data.reply);
            } else {
                appendMessage("ai", "Sorry, I encountered an error: " + (data.error || "Please try again."));
            }
        } catch (err) {
            typingEl.remove();
            appendMessage("ai", "Network error. Please try again.");
        }
    }

    function formatChatMessage(text) {
        if (!text) return "";
        let formatted = escapeHtml(text);

        // Replace dividers (--- or ***)
        formatted = formatted.replace(/^---+$|^\*\*\*+$/gm, '<hr class="chat-divider">');

        // Replace Markdown headers (### Header, ## Header, # Header)
        formatted = formatted.replace(/^###\s*(.*$)/gm, '<h4 class="chat-heading">$1</h4>');
        formatted = formatted.replace(/^##\s*(.*$)/gm, '<h3 class="chat-heading">$1</h3>');
        formatted = formatted.replace(/^#\s*(.*$)/gm, '<h3 class="chat-heading">$1</h3>');

        // Replace Bold + Italic (***text***)
        formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');

        // Replace Bold (**text**)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Replace Italic (*text*)
        formatted = formatted.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

        // Convert bullet points (* item or - item or • item) into clean list items
        const lines = formatted.split('\n');
        let inList = false;
        let newLines = [];

        for (let line of lines) {
            let trimmed = line.trim();
            let bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
            let numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

            if (bulletMatch) {
                if (!inList) {
                    newLines.push('<ul class="chat-list">');
                    inList = 'ul';
                }
                newLines.push(`<li>${bulletMatch[1]}</li>`);
            } else if (numMatch) {
                if (!inList) {
                    newLines.push('<ol class="chat-list">');
                    inList = 'ol';
                }
                newLines.push(`<li>${numMatch[2]}</li>`);
            } else {
                if (inList) {
                    newLines.push(inList === 'ul' ? '</ul>' : '</ol>');
                    inList = false;
                }
                newLines.push(line);
            }
        }
        if (inList) {
            newLines.push(inList === 'ul' ? '</ul>' : '</ol>');
        }

        formatted = newLines.join('\n');

        // Replace newlines with <br> where not inside block tags
        formatted = formatted.replace(/\n{2,}/g, '<br>');
        formatted = formatted.replace(/(?<!<\/h[34]>|<\/ul>|<\/ol>|<\/li>|<hr[^>]*>)\n/g, '<br>');

        // Clean up any remaining stray symbols
        formatted = formatted.replace(/^#+\s*/gm, '');

        return formatted;
    }

    function appendMessage(sender, text) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;
        
        const avatar = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-user-doctor"></i>';
        
        const formattedContent = sender === 'user' ? `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>` : `<div class="formatted-ai-text">${formatChatMessage(text)}</div>`;

        bubble.innerHTML = `
            <div class="bubble-avatar">${avatar}</div>
            <div class="bubble-content">${formattedContent}</div>
        `;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatHistory.push({ sender, text });
    }

    function appendTypingIndicator() {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble ai-bubble";
        bubble.innerHTML = `
            <div class="bubble-avatar"><i class="fa-solid fa-user-doctor"></i></div>
            <div class="bubble-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
    }

    // --- Raw Text Collapsible ---
    rawTextToggle.addEventListener("click", () => {
        const isHidden = rawTextContent.style.display === "none";
        rawTextContent.style.display = isHidden ? "block" : "none";
        const arrow = rawTextToggle.querySelector(".toggle-arrow");
        arrow.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    });

    // --- Print / Download PDF Summary ---
    printReportBtn.addEventListener("click", () => {
        window.print();
    });

    // --- Analyze Another Report (Reset) ---
    newReportBtn.addEventListener("click", () => {
        currentSelectedFile = null;
        currentAnalysisData = null;
        chatHistory = [];
        fileInput.value = "";
        dropZone.style.display = "block";
        filePreviewBar.style.display = "none";
        uploadCard.style.display = "block";
        document.querySelector(".sample-bar").style.display = "flex";
        resultsDashboard.style.display = "none";
        floatingChatBtn.style.display = "none";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // HTML escape utility
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
