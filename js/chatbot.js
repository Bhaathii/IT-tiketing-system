// IT Support Chatbot Widget - Rule-Based (No API Required)
class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadChatHistory();
    }

    createWidget() {
        // Create container
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.innerHTML = `
            <!-- Chatbot Widget -->
            <div id="chatbot-widget" class="chatbot-widget">
                <!-- Chat Header -->
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <span class="chatbot-icon">🤖</span>
                        <span>IT Support</span>
                    </div>
                    <div class="chatbot-header-buttons">
                        <button id="chatbot-minimize" class="chatbot-header-btn" title="Minimize">
                            <span>_</span>
                        </button>
                        <button id="chatbot-close" class="chatbot-header-btn" title="Close">
                            <span>×</span>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div id="chatbot-messages" class="chatbot-messages">
                    <div class="chatbot-message bot-message">
                        <p>👋 Hello! I'm your IT Support Assistant. How can I help you today?</p>
                        <small>Common topics: Password Reset • Submit Ticket • Printer Issues • WiFi • Software • VPN</small>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        class="chatbot-input" 
                        placeholder="Type your question..." 
                        autocomplete="off"
                    />
                    <button id="chatbot-send" class="chatbot-send-btn">
                        <span>📤</span>
                    </button>
                </div>
            </div>

            <!-- Floating Toggle Button (when minimized) -->
            <button id="chatbot-toggle" class="chatbot-toggle-btn">
                <span class="chatbot-toggle-icon">💬</span>
                <span class="chatbot-toggle-text">Chat</span>
            </button>
        `;

        document.body.appendChild(container);
    }

    attachEventListeners() {
        // Wait for elements to be in DOM, then attach listeners
        setTimeout(() => {
            const toggleBtn = document.getElementById('chatbot-toggle');
            const minimizeBtn = document.getElementById('chatbot-minimize');
            const closeBtn = document.getElementById('chatbot-close');
            const sendBtn = document.getElementById('chatbot-send');
            const input = document.getElementById('chatbot-input');

            if (toggleBtn) toggleBtn.addEventListener('click', () => this.openChat());
            if (minimizeBtn) minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeChat();
            });
            if (closeBtn) closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeChat();
            });
            if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
            if (input) input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isLoading) {
                    this.sendMessage();
                }
            });
        }, 0);
    }

    openChat() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = document.getElementById('chatbot-toggle');

        this.isOpen = true;
        widget.classList.add('open');
        toggle.classList.add('hidden');
        document.getElementById('chatbot-input').focus();
        
        // Show suggestions on first open if no messages
        if (this.chatHistory.length === 0) {
            this.showSuggestions();
        }
    }

    showSuggestions() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.id = 'chatbot-suggestions';
        suggestionsDiv.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px;
            background: rgba(14, 165, 233, 0.05);
            border-radius: 8px;
            margin: 8px 0;
        `;
        
        const suggestions = [
            'Password reset',
            'How to submit ticket',
            'Printer issues',
            'WiFi problems',
            'Computer slow',
            'Software installation',
            'Contact support'
        ];
        
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                padding: 6px 12px;
                background: rgba(14, 165, 233, 0.2);
                border: 1px solid rgba(14, 165, 233, 0.4);
                color: #0ea5e9;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            btn.textContent = suggestion;
            btn.onmouseover = () => {
                btn.style.background = 'rgba(14, 165, 233, 0.3)';
                btn.style.borderColor = 'rgba(14, 165, 233, 0.6)';
            };
            btn.onmouseout = () => {
                btn.style.background = 'rgba(14, 165, 233, 0.2)';
                btn.style.borderColor = 'rgba(14, 165, 233, 0.4)';
            };
            btn.onclick = () => {
                document.getElementById('chatbot-input').value = suggestion;
                this.sendMessage();
            };
            suggestionsDiv.appendChild(btn);
        });
        
        messagesContainer.appendChild(suggestionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    minimizeChat() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = document.getElementById('chatbot-toggle');

        this.isOpen = false;
        widget.classList.remove('open');
        toggle.classList.remove('hidden');
    }

    closeChat() {
        this.minimizeChat();
    }

    toggleChat() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = document.getElementById('chatbot-toggle');

        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            widget.classList.add('open');
            toggle.classList.add('hidden');
            document.getElementById('chatbot-input').focus();
        } else {
            widget.classList.remove('open');
            toggle.classList.remove('hidden');
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const userMessage = input.value.trim();

        if (!userMessage || this.isLoading) return;

        // Add user message to chat
        this.addMessage(userMessage, 'user');
        input.value = '';
        this.saveChatHistory();

        // Show loading state (simulated delay for better UX)
        this.isLoading = true;
        this.showLoadingIndicator();

        // Simulate thinking time
        setTimeout(() => {
            this.isLoading = false;
            this.removeLoadingIndicator();

            // Get rule-based response
            const response = this.getResponse(userMessage);
            this.addMessage(response, 'bot');
            this.saveChatHistory();
        }, 800);
    }

    getResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();

        // Enhanced Knowledge Base with Categories
        const responses = {
            // ACCOUNT & PASSWORD
            'password|reset password|forgot password|reset my password|change password': 'To reset your password:\n1. Click "Forgot Password" on the login screen\n2. Enter your email\n3. Check your email for reset link\n4. Click the link and create a new password\n5. Use new password to log in\n\n⏱️ Reset link expires in 1 hour. If expired, request a new one.\n\nStill stuck? Submit a ticket!',
            'account|my account|account issue|account problem|locked|locked out': 'Account issues we can help with:\n• Password reset → See "password reset" help\n• Account locked → Submit a ticket immediately\n• Can\'t log in → Try resetting password first\n• Username/email issues → Contact IT via ticket\n\n🔒 For security, we verify requests via ticket system.',
            'login|can\'t login|cant login|login issue|login problem|login not working': 'Login troubleshooting:\n1. ✓ Check CAPS LOCK is OFF\n2. ✓ Try resetting your password\n3. ✓ Clear browser cache & cookies\n4. ✓ Try a different browser\n5. ✓ Restart your computer\n6. Still stuck? → Submit urgent ticket\n\nDon\'t try repeatedly - it may lock your account!',
            'new account|create account|sign up|register': 'To create a new account:\n1. Click "Create Account" tab\n2. Enter your full name\n3. Enter your company email\n4. Create a password (6+ characters)\n5. Click "Create Account"\n\n✅ You\'re all set! Use your credentials to log in.\nIf registration fails, submit a ticket with your email.',

            // TICKETS & SUPPORT SYSTEM
            'ticket|submit ticket|submit a ticket|create ticket|new ticket|open ticket': 'How to submit a support ticket:\n📝 Steps:\n1. Click "Submit Ticket" button on this page\n2. Fill in your information (name, email, dept.)\n3. Select equipment type (Desktop, Laptop, Printer, Phone, Other)\n4. Choose priority:\n   🔴 HIGH = Down now, critical work\n   🟡 MEDIUM = Limited functionality\n   🟢 LOW = Minor issue, can wait\n5. Describe your issue clearly\n6. Click Submit\n\n✅ Instant confirmation + IT team notified!\n⏱️ Response: High=30min, Medium=2hrs, Low=24hrs',
            'track ticket|check ticket|my tickets|ticket status|see my tickets': 'To track your tickets:\n1. Click "My Tickets" button\n2. See all your submitted tickets\n3. Click any ticket to see:\n   • Current status (New/In Progress/Resolved)\n   • Assigned IT tech\n   • Notes & updates\n   • Last update time\n\n📊 Status meanings:\n🔵 NEW = Just received\n🟠 IN PROGRESS = Being worked on\n🟢 RESOLVED = Fixed!\n\nNo ticket visible? Might be pending.',
            'priority|urgent|high priority|set priority': 'How to set priority:\nChoose when submitting ticket:\n\n🔴 HIGH PRIORITY\n• Can\'t work at all (blocked)\n• Critical system down\n• Urgent deadline\n• Major productivity loss\n• Response: ~30 min\n\n🟡 MEDIUM PRIORITY\n• Limited functionality\n• Workaround exists\n• Affects some tasks\n• Response: ~2 hours\n\n🟢 LOW PRIORITY\n• Minor inconvenience\n• No immediate impact\n• Can wait a day\n• Response: ~24 hours',

            // HARDWARE & DEVICES
            'slow|computer slow|slow computer|running slow|sluggish|lag': 'Computer running slow?\n⚡ Quick fixes:\n1. Close unnecessary programs (check Task Manager)\n2. Restart your computer (clears memory)\n3. Check disk space (low space = slow computer)\n4. Run Windows Update\n5. Disable startup programs\n\n🔧 If still slow:\n1. Right-click C: drive → Properties\n2. Check "Disk Usage" - if >90%, clean up files\n3. Run antivirus scan (might have malware)\n\n❓ Not fixed? Submit ticket with:\n   • Computer model\n   • When it\'s slowest\n   • What programs you use',
            'freeze|frozen|not responding|freezing|hang|crash|crashes': 'Program freezing or crashing?\n🛑 Immediate action:\n1. Press Ctrl + Alt + Delete\n2. Find frozen program in Task Manager\n3. Click it → Click "End Task"\n\n🔧 If keeps happening:\n1. Restart the program\n2. Update the program (might have bugs)\n3. Restart your computer\n4. Check for Windows updates\n5. Clear temporary files\n\n⚠️ If crashes on startup:\n• Try "Safe Mode"\n• Uninstall & reinstall program\n• Submit ticket if won\'t work\n\nSubmit ticket with: Program name, when it crashes, error message',
            'blue screen|bsod|crash to desktop|kernel panic': '⚠️ CRITICAL - Blue Screen Error:\n\n🆘 IMMEDIATE:\n1. Note the error code/message if visible\n2. Restart computer\n3. Try startup repair (usually automatic)\n\n🔧 If keeps happening:\n1. Boot in Safe Mode\n2. Uninstall recent updates\n3. Check RAM (might be failing)\n4. Scan for viruses\n\n❌ Don\'t ignore - hardware might be failing!\n✅ Submit HIGH priority ticket NOW with:\n   • Error message/code\n   • When it started\n   • What you were doing',
            'keyboard|mouse|monitor|not working|device not working': 'Hardware not working?\n🔧 Quick checks:\n1. ✓ Device is plugged in/charged\n2. ✓ Check cable connection (loose?)\n3. ✓ Try different USB port\n4. ✓ Restart computer\n5. ✓ Check Device Manager for errors\n\n🖥️ For peripherals:\n• Keyboard/mouse = Try USB hub or different port\n• Monitor = Check video cable + power\n• Printer = Try network reset\n\n❌ If still broken:\n   Submit ticket with device type & issue',
            'hard drive|storage|disk space|full|no space': 'Running out of disk space?\n📊 Check space:\n1. Right-click C: drive → Properties\n2. See used vs total space\n\n🧹 Free up space:\n1. Delete old downloads\n2. Empty Recycle Bin\n3. Clear browser cache\n4. Move files to shared drive\n5. Uninstall old programs\n\n⚠️ When <10% space: Slow performance!\n✅ Keep >20% space free\n\n❌ If disk still full:\n• Contact IT about cloud storage\n• Check if files are backed up\n• Submit ticket for storage options',

            // PRINTER ISSUES
            'printer|print|printing|print job|not printing': 'Can\'t print?\n🖨️ Quick fixes:\n1. ✓ Printer is ON & online\n2. ✓ Connected to correct network\n3. ✓ Check for paper jams\n4. ✓ Check if out of toner/ink\n5. ✓ Restart printer (unplug 30s)\n\n💻 Computer side:\n1. Check printer in Print Settings\n2. Clear print queue (if stuck)\n3. Restart Print Spooler service\n4. Update printer driver\n\n🔧 For network printer:\n• Disconnect & reconnect\n• Check printer settings on network\n• Restart router/WiFi\n\n❌ Still not working?\n   Submit ticket with printer model',
            'jam|paper jam|jammed|stuck paper': 'Paper jam in printer?\n⚠️ STOP - Don\'t force it!\n\n🧹 Steps to clear:\n1. Turn OFF printer immediately\n2. Open all access panels\n3. GENTLY remove stuck paper\n4. Check for torn pieces inside\n5. Remove any debris\n6. Close all panels\n7. Turn ON and try\n\n⚡ Pro tip:\n• Use smooth motions (don\'t yank)\n• Stuck paper? Use flashlight to see\n• Take photo if paper tears\n\n🆘 If still jammed:\n   Submit ticket with photo if possible',
            'toner|ink|refill|empty': 'Printer out of toner/ink?\n🎯 Check level:\n1. Check printer status page\n2. Look for warning lights\n3. Print test page to see quality\n\n🔄 Toner/ink:\n• Submit ticket with printer model\n• IT team orders & installs\n• Usually arrives within 2-3 days\n• Don\'t buy yourself - use IT supply\n\n💡 Extend cartridge life:\n• Turn off printer when not in use\n• Keep paper quality good\n• Clean print heads periodically',

            // NETWORK & CONNECTIVITY
            'wifi|wireless|not connecting|can\'t connect|connection': 'WiFi connection issues?\n📡 Quick fixes:\n1. ✓ WiFi is enabled on your device\n2. ✓ You see the network in list\n3. ✓ Correct password entered\n4. ✓ Restart computer\n5. ✓ "Forget" network & reconnect\n\n🔧 Router level:\n1. Restart WiFi router (unplug 30s)\n2. Move closer to router\n3. Check if other devices connect\n4. Check router lights (should be green)\n\n⚠️ Can\'t find network?\n   • Check if WiFi is broadcasting\n   • Look for network name (SSID)\n   • Might be on 5GHz instead of 2.4GHz\n\n❌ Still stuck? Submit ticket',
            'internet|slow internet|network slow|connection slow|lag': 'Internet slow or laggy?\n⚡ Quick fixes:\n1. Restart computer\n2. Restart WiFi router (unplug 30s)\n3. Close bandwidth-heavy apps (video streaming)\n4. Check other devices (is it just you?)\n5. Move closer to router\n\n🔧 Check connection:\n1. Run speed test (speedtest.net)\n2. Compare to expected speed\n3. Check if downloads slow\n4. Monitor usage (Task Manager)\n\n📊 Normal speeds:\n• Download: 25-100 Mbps\n• Upload: 5-20 Mbps\n• If much lower → issue\n\n❌ Consistently slow?\n   Submit ticket with speed test results',
            'no internet|network down|internet down|offline': '❌ NO INTERNET/NETWORK DOWN?\n\n🆘 IMMEDIATE:\n1. Check if other devices have internet\n2. If YES → Your device issue\n3. If NO → Network outage\n\n📱 Your device only:\n1. Restart computer\n2. Forget & reconnect WiFi\n3. Disconnect & reconnect network cable\n4. Check Network Settings\n5. Restart modem/router\n\n🌐 Network outage:\n1. Submit HIGH priority ticket\n2. Call IT emergency line: ext. 5555\n3. Wait for IT to resolve\n4. Check status: [IT updates ticket]\n\n⏱️ Typical outage: 15-60 minutes',
            'vpn|remote|remote access|work from home': 'VPN/Remote access issues?\n🔐 VPN Not Connecting:\n1. ✓ VPN software installed?\n2. ✓ Internet connected first\n3. ✓ Correct credentials\n4. Try disconnecting & reconnecting\n5. Restart VPN app\n\n🔧 Troubleshooting:\n1. Check if VPN icon in taskbar\n2. See error message? Note it\n3. Try different VPN location\n4. Update VPN software\n\n🆘 Remote work not set up?\n   Email IT: itsupport@company.com\n   Request: VPN setup for remote access\n   They\'ll send instructions\n\n❌ Still can\'t connect?\n   Submit HIGH priority ticket',

            // SOFTWARE & PROGRAMS
            'software|program|application|app|install|install software': 'Need software installed?\n📦 How to request:\n1. Submit ticket (click above)\n2. Tell us: Software name & version\n3. Explain: What you need it for\n4. Include: Department & usage\n\n🔍 IT will:\n• Check license availability\n• Verify compatibility\n• Check security\n• Install for you\n• Notify when ready\n\n⏱️ Timeline:\n• Standard software: 1-2 days\n• Licensed software: 2-5 days\n• Enterprise: Request IT\n\n⚠️ Don\'t install yourself - security risk!\n✅ Always request via ticket',
            'update|patch|windows update|security update': 'Software/Windows updates?\n🔄 Auto updates:\n• Windows Updates: Run nightly\n• Programs: Check monthly\n• Drivers: Check quarterly\n\n📥 Install updates:\n1. Click notification (Windows Update)\n2. Review updates\n3. Click "Install"\n4. Restart computer\n5. Done!\n\n⚠️ Don\'t skip updates:\n• Security patches = protect from viruses\n• Performance improvements\n• Bug fixes\n\n🚫 If updates fail:\n   Submit ticket with error message',
            'uninstall|remove|delete program|remove software': 'How to uninstall programs:\n1. Control Panel → Programs → Uninstall\n2. Find program in list\n3. Click it → Uninstall\n4. Follow prompts\n5. Restart if needed\n\n🔧 Stubborn programs:\n• Restart computer in Safe Mode\n• Try uninstaller from Start menu\n• Use third-party uninstaller tool\n\n⚠️ Before uninstalling:\n• Check if others use it\n• Backup any files/settings\n• Note license info\n\n❓ Need it again? Submit new ticket',
            'error|error message|not working|program crash': 'Program error or crash?\n📋 Troubleshooting:\n1. ✓ Restart the program\n2. ✓ Restart your computer\n3. ✓ Check for program updates\n4. ✓ Reinstall if needed\n5. ✓ Try alternative program\n\n📸 When submitting ticket:\n• Screenshot of error message\n• Exact error code/text\n• When it happens\n• What you\'re doing when error occurs\n• Have you tried restarting?\n\n🔍 Common fixes:\n• Clear cache/temporary files\n• Update program\n• Update Windows\n• Check disk space',

            // SUPPORT & CONTACT
            'contact|support|help|urgent|emergency': 'How to get IT support?\n\n📞 URGENT (Now):\n   ext. 5555 (IT Support Line)\n   Monday-Friday 8am-6pm\n\n📧 Email:\n   itsupport@company.com\n   Response: Within 24 hours\n\n🎫 Best way (Tracked):\n   Submit Ticket (button above)\n   • Tracked in system\n   • Guaranteed response\n   • Full history saved\n\n🕐 Support hours:\n   Monday - Friday\n   8:00 AM - 6:00 PM\n   (Closed weekends/holidays)\n\n⚠️ After hours emergency?\n   Leave voicemail at ext. 5555',
            'hours|open|support hours': 'IT Support hours:\n\n🕐 OPEN:\n   Monday - Friday\n   8:00 AM - 6:00 PM\n\n🚫 CLOSED:\n   • Weekends (Sat-Sun)\n   • Company holidays\n   • After 6:00 PM\n\n📞 During hours:\n   ext. 5555 (direct line)\n\n📧 After hours:\n   Email: itsupport@company.com\n   We\'ll respond first thing next business day\n\n🆘 Real emergency?\n   Call facilities: ext. 1111 (24/7)',

            // CASUAL RESPONSES
            'hello|hi|hey|greetings': '👋 Hello! Welcome to IT Support!\n\nI can help with:\n✓ Password resets\n✓ Submitting tickets\n✓ Printer problems\n✓ WiFi/Network issues\n✓ Software installation\n✓ Device troubleshooting\n✓ And much more!\n\nJust ask your question!',
            'thanks|thank you|thx|appreciate|appreciate it': '😊 You\'re welcome! Happy to help!\n\nNeed anything else? Just ask!\nOr submit a ticket for complex issues.',
            'bye|goodbye|exit|quit|close': '👋 Goodbye! Feel free to come back anytime!\n\nHope I could help. Have a great day! 🙂',
            'yes|yep|yeah|ok|okay': '✅ Great! What can I help with?\n\nJust ask your question or submit a ticket!',
            'no|nope|not really': '👍 No problem! Let me know if you need help later.\n\nHave a great day!',
            'help|what can you do|what do you help with': 'Here\'s what I can help with:\n\n🔐 ACCOUNTS:\n• Password resets\n• Login issues\n• Account problems\n\n🎫 TICKETS:\n• How to submit\n• Track status\n• Urgent issues\n\n🖥️ DEVICES:\n• Slow computer\n• Freezing/crashing\n• Hardware not working\n\n🖨️ PERIPHERALS:\n• Printer issues\n• Jams & toner\n• Print problems\n\n📡 NETWORK:\n• WiFi connection\n• Internet issues\n• VPN/Remote access\n\n💾 SOFTWARE:\n• Installing programs\n• Updates\n• Error messages\n\n📞 CONTACT:\n• Support hours\n• Emergency line\n• Submit ticket\n\nWhat do you need help with?',
        };

        // Smart keyword matching with scoring
        let bestMatch = null;
        let bestScore = 0;

        for (const [keywords, response] of Object.entries(responses)) {
            const keywordList = keywords.split('|');
            
            for (const keyword of keywordList) {
                let score = 0;
                
                // Exact phrase match (highest score)
                if (message === keyword) score = 100;
                // Contains exact phrase
                else if (message.includes(keyword)) score = 50;
                // Word match (order independent)
                else {
                    const messageWords = message.split(' ');
                    const keywordWords = keyword.split(' ');
                    const matchedWords = messageWords.filter(w => keywordWords.includes(w)).length;
                    if (matchedWords > 0) score = (matchedWords / keywordWords.length) * 40;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = response;
                }
            }
        }

        // Return best match if found, otherwise default
        if (bestMatch && bestScore >= 20) {
            return bestMatch;
        }

        // Smart fallback based on message length
        if (message.length < 5) {
            return 'I didn\'t quite understand. Try asking about:\n• Password reset\n• Submit ticket\n• Printer issues\n• WiFi problems\n• Computer slow\n• Software installation\n\nOr type "help" for full list!';
        }

        return '🤔 I\'m not sure about that specific question.\n\nHere are common topics I can help with:\n\n🔐 Accounts & Passwords\n🎫 Submitting & tracking tickets\n🖨️ Printer & hardware issues\n📡 WiFi & network problems\n💾 Software & updates\n🖥️ Computer troubleshooting\n\n📞 For other issues:\n• Call: ext. 5555\n• Email: itsupport@company.com\n• Submit ticket (button above)\n\nOr try rephrasing your question!';
    }

    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;

        // Format bot messages with better styling
        if (sender === 'bot') {
            messageDiv.innerHTML = `<p>${this.formatMessage(message)}</p>`;
        } else {
            messageDiv.textContent = message;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(text) {
        // Format bot messages with line breaks and bold
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    showLoadingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chatbot-loading';
        loadingDiv.className = 'chatbot-message bot-message loading';
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeLoadingIndicator() {
        const loading = document.getElementById('chatbot-loading');
        if (loading) {
            loading.remove();
        }
    }

    saveChatHistory() {
        // Store last 10 messages to localStorage
        localStorage.setItem(
            'chatbot_history',
            JSON.stringify(this.chatHistory.slice(-10))
        );
    }

    loadChatHistory() {
        // Load previous chat history
        const saved = localStorage.getItem('chatbot_history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
        }
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatbotWidget();
    });
} else {
    new ChatbotWidget();
}

