// Declare gtag variable
const gtag = window.gtag || (() => {})

// ===== CONFIGURATION AND CONSTANTS =====
const CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 100,
  CHATBOT_DELAY: 1000,
  LOADING_DURATION: 1000,
  DEBOUNCE_DELAY: 100,
  AI: {
    provider: "auto", // auto | ollama
    systemPrompt:
      "You are Fashion Finesse, a friendly and concise fashion shopping assistant. Answer helpfully about products, sizing, styling, shipping, and returns. Keep responses brief and skimmable.",
    ollama: {
      baseUrl: "http://localhost:11434",
      model: "llama3.1",
      temperature: 0.7,
      top_p: 0.9,
    },
    requestTimeoutMs: 20000,
  },
}

const SELECTORS = {
  loadingScreen: "#loading-screen",
  header: "#main-header",
  navToggle: "#nav-toggle",
  navMenu: "#nav-menu",
  navLinks: ".nav-link",
  backToTop: "#back-to-top",
  chatbotToggle: "#chatbot-toggle",
  chatbotWindow: "#chatbot-window",
  chatbotClose: "#chatbot-close",
  chatbotForm: "#chatbot-form",
  chatInput: "#chat-input",
  chatMessages: "#chatbot-messages",
  contactForm: "#contact-form",
  newsletterForm: "#newsletter-form",
  sections: ".section",
}

// ===== UTILITY FUNCTIONS =====
const Utils = {
  /**
   * Debounce function to limit function calls
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  /**
   * Throttle function to limit function calls
   */
  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  /**
   * Smooth scroll to element
   */
  smoothScrollTo(element) {
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  },

  /**
   * Add class with animation support
   */
  addClass(element, className) {
    if (element && !element.classList.contains(className)) {
      element.classList.add(className)
    }
  },

  /**
   * Remove class with animation support
   */
  removeClass(element, className) {
    if (element && element.classList.contains(className)) {
      element.classList.remove(className)
    }
  },

  /**
   * Toggle class
   */
  toggleClass(element, className) {
    if (element) {
      element.classList.toggle(className)
    }
  },
}

// ===== LOADING SCREEN MODULE =====
const LoadingScreen = {
  init() {
    this.loadingElement = document.querySelector(SELECTORS.loadingScreen)
    this.hide()
  },

  hide() {
    setTimeout(() => {
      if (this.loadingElement) {
        Utils.addClass(this.loadingElement, "hidden")
        // Remove from DOM after animation
        setTimeout(() => {
          if (this.loadingElement.parentNode) {
            this.loadingElement.parentNode.removeChild(this.loadingElement)
          }
        }, 500)
      }
    }, CONFIG.LOADING_DURATION)
  },
}

// ===== NAVIGATION MODULE =====
const Navigation = {
  init() {
    this.header = document.querySelector(SELECTORS.header)
    this.navToggle = document.querySelector(SELECTORS.navToggle)
    this.navMenu = document.querySelector(SELECTORS.navMenu)
    this.navLinks = document.querySelectorAll(SELECTORS.navLinks)

    this.bindEvents()
    this.handleScroll()
  },

  bindEvents() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener("click", (e) => {
        e.preventDefault()
        this.toggleMobileMenu()
      })
    }

    // Navigation links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        this.handleNavClick(e.target)
      })
    })

    // Scroll event with throttling
    window.addEventListener(
      "scroll",
      Utils.throttle(() => {
        this.handleScroll()
      }, CONFIG.DEBOUNCE_DELAY),
    )

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeMobileMenu()
      }
    })
  },

  toggleMobileMenu() {
    const isActive = this.navMenu.classList.contains("active")

    if (isActive) {
      this.closeMobileMenu()
    } else {
      this.openMobileMenu()
    }
  },

  openMobileMenu() {
    Utils.addClass(this.navMenu, "active")
    Utils.addClass(this.navToggle, "active")
    this.navToggle.setAttribute("aria-expanded", "true")
    document.body.style.overflow = "hidden"
  },

  closeMobileMenu() {
    Utils.removeClass(this.navMenu, "active")
    Utils.removeClass(this.navToggle, "active")
    this.navToggle.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  },

  handleNavClick(link) {
    const href = link.getAttribute("href")

    if (href.startsWith("#")) {
      const targetElement = document.querySelector(href)
      if (targetElement) {
        Utils.smoothScrollTo(targetElement)
        this.closeMobileMenu()
      }
    }
  },

  handleScroll() {
    const scrollY = window.scrollY

    if (scrollY > CONFIG.SCROLL_THRESHOLD) {
      Utils.addClass(this.header, "scrolled")
    } else {
      Utils.removeClass(this.header, "scrolled")
    }
  },
}

// ===== SCROLL EFFECTS MODULE =====
const ScrollEffects = {
  init() {
    this.sections = document.querySelectorAll(SELECTORS.sections)
    this.backToTopBtn = document.querySelector(SELECTORS.backToTop)

    this.setupIntersectionObserver()
    this.bindEvents()
  },

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Utils.addClass(entry.target, "visible")
        }
      })
    }, options)

    this.sections.forEach((section) => {
      this.observer.observe(section)
    })
  },

  bindEvents() {
    // Back to top button
    if (this.backToTopBtn) {
      this.backToTopBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.scrollToTop()
      })
    }

    // Show/hide back to top button on scroll
    window.addEventListener(
      "scroll",
      Utils.throttle(() => {
        this.handleBackToTopVisibility()
      }, CONFIG.DEBOUNCE_DELAY),
    )
  },

  handleBackToTopVisibility() {
    const scrollY = window.scrollY

    if (scrollY > CONFIG.SCROLL_THRESHOLD * 3) {
      this.backToTopBtn.style.display = "flex"
      Utils.addClass(this.backToTopBtn, "visible")
    } else {
      Utils.removeClass(this.backToTopBtn, "visible")
      setTimeout(() => {
        if (!this.backToTopBtn.classList.contains("visible")) {
          this.backToTopBtn.style.display = "none"
        }
      }, CONFIG.ANIMATION_DURATION)
    }
  },

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  },
}

// ===== ENHANCED CHATBOT MODULE =====
const Chatbot = {
  init() {
    this.toggle = document.querySelector(SELECTORS.chatbotToggle)
    this.window = document.querySelector(SELECTORS.chatbotWindow)
    this.closeBtn = document.querySelector(SELECTORS.chatbotClose)
    this.form = document.querySelector(SELECTORS.chatbotForm)
    this.input = document.querySelector(SELECTORS.chatInput)
    this.messages = document.querySelector(SELECTORS.chatMessages)
    this.statusEl = document.getElementById("chatbot-status")

    // Enhanced chatbot state
    this.conversationHistory = []
    this.userPreferences = {}
    this.currentContext = "general"
    this.isTyping = false
    this.userName = null
    this.sessionStartTime = Date.now()

    // Initialize AI service
    this.chatService = ChatService.create(CONFIG.AI)
    this.updateStatus("checking")
    this.checkProvider()

    // Enhanced responses with context awareness
    this.responses = {
      greetings: {
        patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        responses: [
          "Hello! Welcome to Fashion Finesse! 👋 I'm your personal style assistant. What's your name?",
          "Hi there! I'm excited to help you discover your perfect style today! 😊",
          "Hey! Welcome to Fashion Finesse! I'm here to help you find amazing fashion pieces. How can I assist you?",
        ],
      },
      name_collection: {
        patterns: ["my name is", "i'm", "call me", "i am"],
        responses: [
          "Nice to meet you, {name}! I'm thrilled to help you explore our fashion collections. What style are you looking for today?",
          "Hello {name}! Welcome to Fashion Finesse. Are you shopping for a special occasion or just updating your wardrobe?",
        ],
      },
      help: {
        patterns: ["help", "what can you do", "assist", "support"],
        responses: [
          "I'm your personal fashion assistant! I can help you with:\n\n🛍️ **Product Recommendations**\n📏 **Size & Fit Guidance**\n💡 **Styling Tips**\n🚚 **Shipping & Returns**\n💳 **Payment Options**\n📍 **Store Locations**\n\nWhat would you like to know more about?",
        ],
      },
      collections: {
        patterns: ["collections", "products", "what do you sell", "categories", "items"],
        responses: [
          "We have amazing collections for every style! ✨\n\n👗 **Elegant Dresses** - From $199\n👕 **Casual Wear** - From $89\n👜 **Accessories** - From $49\n👔 **Formal Attire** - From $299\n🏃‍♀️ **Activewear** - From $79\n🌟 **Seasonal Specials** - From $149\n\nWhich collection interests you most?",
        ],
      },
      sizing: {
        patterns: ["size", "fit", "measurements", "sizing guide", "what size"],
        responses: [
          "I'd love to help you find the perfect fit! 📏\n\n**Our Size Range:** XS to 3XL\n**Size Guide:** Available on each product page\n**Fit Tips:** Most customers find our sizes true to fit\n\n**Need specific help?** Tell me:\n• What item you're interested in\n• Your usual size in other brands\n• Any fit preferences (loose, fitted, etc.)",
        ],
      },
      shipping: {
        patterns: ["shipping", "delivery", "how long", "when will it arrive", "shipping cost"],
        responses: [
          "Here's everything about our shipping! 🚚\n\n**FREE SHIPPING** on orders over $100! 🎉\n**Standard Shipping:** 3-5 business days ($8.99)\n**Express Shipping:** 1-2 business days ($19.99)\n**Same-Day Delivery:** Available in select cities ($29.99)\n\n**International Shipping:** Available to 50+ countries\n\nWhere are you located? I can give you more specific delivery info!",
        ],
      },
      returns: {
        patterns: ["return", "exchange", "refund", "return policy"],
        responses: [
          "Our return policy is super flexible! 🔄\n\n**30-Day Returns** - No questions asked!\n**Free Return Shipping** - We provide the label\n**Easy Process:** Just print the return label from your email\n\n**Requirements:**\n• Items must be unworn with tags\n• Original packaging preferred\n• Receipt or order number\n\n**Exchanges:** Available for different sizes/colors\n\nNeed to start a return? I can guide you through it!",
        ],
      },
      styling: {
        patterns: ["style", "outfit", "what goes with", "how to wear", "fashion advice", "styling tips"],
        responses: [
          "I love helping with styling! 💫 Let me be your personal stylist!\n\n**Tell me about:**\n• The occasion (work, date, casual, formal)\n• Your style preference (classic, trendy, bohemian, minimalist)\n• Colors you love or want to avoid\n• Your body type or fit preferences\n\n**Popular Styling Tips:**\n• Mix textures for visual interest\n• Add a statement accessory to simple outfits\n• Layer pieces for versatility\n\nWhat specific styling help do you need?",
        ],
      },
      prices: {
        patterns: ["price", "cost", "how much", "expensive", "budget", "cheap", "affordable"],
        responses: [
          "Great question about pricing! 💰\n\n**Our Price Ranges:**\n• Accessories: $49 - $199\n• Casual Wear: $89 - $249\n• Dresses: $199 - $399\n• Formal Attire: $299 - $599\n• Activewear: $79 - $189\n\n**Money-Saving Tips:**\n🏷️ Sign up for our newsletter (10% off first order)\n🎯 Check our Sale section (up to 50% off)\n💳 Free shipping on orders over $100\n\nWhat's your budget range? I can recommend perfect pieces!",
        ],
      },
      occasions: {
        patterns: ["wedding", "work", "date", "party", "formal", "casual", "vacation", "interview"],
        responses: [
          "Perfect! I love helping you dress for special occasions! ✨\n\n**Tell me more about your event:**\n• What's the occasion?\n• Time of day/season?\n• Dress code (if any)?\n• Your style comfort zone?\n\n**Popular Occasion Looks:**\n👔 **Work:** Blazers, tailored pants, elegant blouses\n💃 **Date Night:** Flowy dresses, statement accessories\n🎉 **Party:** Bold colors, fun textures, eye-catching pieces\n👰 **Wedding Guest:** Midi dresses, sophisticated separates\n\nWhat event are you shopping for?",
        ],
      },
      contact: {
        patterns: ["contact", "phone", "email", "store", "location", "address"],
        responses: [
          "Here's how to reach us! 📞\n\n**Customer Service:**\n📧 hello@fashionfinesse.com\n📞 +1 (555) 123-4567\n💬 Live Chat (that's me!)\n\n**Store Location:**\n📍 123 Fashion Street, Style City, SC 12345\n🕒 Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-5PM\n\n**Social Media:**\n📸 @FashionFinesse on Instagram\n📘 Fashion Finesse on Facebook\n\nPrefer to talk to a human? Our customer service team is amazing!",
        ],
      },
      compliments: {
        patterns: ["thank you", "thanks", "you're great", "helpful", "amazing", "awesome"],
        responses: [
          "Aww, thank you so much! 🥰 That totally made my day! I'm here whenever you need fashion advice!",
          "You're so sweet! 💕 I love helping fashion lovers like you find their perfect style!",
          "Thank you! 😊 Your kind words mean everything! Happy to help you look and feel amazing!",
        ],
      },
      goodbye: {
        patterns: ["bye", "goodbye", "see you", "talk later", "thanks bye"],
        responses: [
          "Goodbye {name}! Thanks for chatting with me! Come back anytime for more fashion fun! 👋✨",
          "See you later! Don't forget to check out our new arrivals! Happy shopping! 🛍️💕",
          "Bye for now! Remember, I'm always here when you need styling advice! 😊",
        ],
      },
      default: {
        responses: [
          "That's a great question! 🤔 I want to make sure I give you the best answer. Could you tell me a bit more about what you're looking for?",
          "Hmm, I'm not sure I understood that perfectly. Could you rephrase it? I'm here to help with anything fashion-related! 💫",
          "Interesting! 😊 I'd love to help you with that. Can you give me a few more details so I can assist you better?",
        ],
      },
    }

    // Quick reply suggestions
    this.quickReplies = {
      initial: ["👗 Show me dresses", "👕 Casual wear", "💼 Work outfits", "📏 Size guide", "🚚 Shipping info"],
      collections: ["👗 Elegant dresses", "👕 Casual wear", "👜 Accessories", "👔 Formal attire", "🏃‍♀️ Activewear"],
      sizing: ["📏 Size chart", "👗 Dress sizes", "👕 Top sizes", "👖 Bottom sizes", "🔄 Exchange policy"],
      styling: ["💼 Work outfits", "💃 Date night", "🎉 Party looks", "☀️ Summer styles", "❄️ Winter fashion"],
    }

    this.bindEvents()
    this.initializeChat()
  },

  bindEvents() {
    // Toggle chatbot
    if (this.toggle) {
      this.toggle.addEventListener("click", (e) => {
        e.preventDefault()
        this.toggleWindow()
      })
    }

    // Close chatbot
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.closeWindow()
      })
    }

    // Form submission
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.sendMessage()
      })
    }

    // Input events for typing indicator
    if (this.input) {
      this.input.addEventListener("input", () => {
        this.handleTyping()
      })

      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          this.sendMessage()
        }
      })
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".chatbot-widget")) {
        this.closeWindow()
      }
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isWindowOpen()) {
        this.closeWindow()
      }
    })
  },

  initializeChat() {
    // Clear existing messages except the initial one
    const initialMessage = this.messages.querySelector(".bot-message")
    if (initialMessage) {
      initialMessage.remove()
    }

    // Add enhanced welcome message
    setTimeout(() => {
      this.addBotMessage(
        "Hello! Welcome to Fashion Finesse! 👋✨\n\nI'm your personal style assistant, and I'm here to help you find the perfect fashion pieces!\n\nWhat's your name? I'd love to personalize our conversation! 😊",
      )
      this.showQuickReplies("initial")
    }, 500)
  },

  toggleWindow() {
    if (this.isWindowOpen()) {
      this.closeWindow()
    } else {
      this.openWindow()
    }
  },

  openWindow() {
    this.window.setAttribute("aria-hidden", "false")
    this.window.style.display = "flex"
    const toggleBtn = this.toggle
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true")
    if (this.input) {
      this.input.focus()
    }

    // Track chat opened
    this.trackEvent("chat_opened")
  },

  async checkProvider() {
    try {
      if (this.chatService && this.chatService.health) {
        const ok = await this.chatService.health()
        this.updateStatus(ok ? "online" : "offline")
      } else if (this.chatService) {
        // Try a cheap no-op stream to detect availability
        const iter = this.chatService.stream({ messages: [{ role: "user", content: "Hello" }] })
        const { value } = await iter.next()
        this.updateStatus(value !== undefined ? "online" : "offline")
      } else {
        this.updateStatus("offline")
      }
    } catch (_) {
      this.updateStatus("offline")
    }
  },

  updateStatus(state) {
    if (!this.statusEl) return
    const map = {
      checking: { text: "AI: Checking…", className: "status checking" },
      online: { text: "AI: Online", className: "status online" },
      offline: { text: "AI: Fallback", className: "status offline" },
    }
    const cfg = map[state] || map.offline
    this.statusEl.textContent = cfg.text
    this.statusEl.className = `chatbot-status ${cfg.className}`
  },

  closeWindow() {
    this.window.setAttribute("aria-hidden", "true")
    this.window.style.display = "none"
    const toggleBtn = this.toggle
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false")

    // Track chat closed
    this.trackEvent("chat_closed")
  },

  isWindowOpen() {
    return this.window.getAttribute("aria-hidden") === "false"
  },

  handleTyping() {
    // Show typing indicator when user is typing
    clearTimeout(this.typingTimeout)

    this.typingTimeout = setTimeout(() => {
      // User stopped typing
    }, 1000)
  },

  sendMessage() {
    const message = this.input.value.trim()

    if (!message) return

    // Add user message
    this.addUserMessage(message)

    // Store in conversation history
    this.conversationHistory.push({
      type: "user",
      message: message,
      timestamp: Date.now(),
    })

    // Clear input
    this.input.value = ""

    // Remove quick replies
    this.removeQuickReplies()

    // Show typing indicator
    this.showTypingIndicator()

    // Generate bot response (stream if available)
    this.generateResponse(message)
  },

  addUserMessage(text) {
    const messageElement = document.createElement("div")
    messageElement.className = "message user-message"
    messageElement.innerHTML = this.formatMessage(text)

    this.messages.appendChild(messageElement)
    this.scrollToBottom()
  },

  addBotMessage(text) {
    const messageElement = document.createElement("div")
    messageElement.className = "message bot-message"
    messageElement.innerHTML = this.formatMessage(text)

    this.messages.appendChild(messageElement)
    this.scrollToBottom()

    // Announce to screen readers
    if (typeof Accessibility !== "undefined") {
      Accessibility.announceToScreenReader(text)
    }
  },

  formatMessage(text) {
    // Replace name placeholder
    if (this.userName) {
      text = text.replace(/{name}/g, this.userName)
    }

    // Format text with basic markdown-like formatting
    text = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/\n/g, "<br>") // Line breaks
      .replace(/•/g, "&bull;") // Bullet points

    return text
  },

  showTypingIndicator() {
    if (this.messages.querySelector(".typing-indicator")) return

    const typingElement = document.createElement("div")
    typingElement.className = "message bot-message typing-indicator"
    typingElement.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span class="typing-text">Fashion Assistant is typing...</span>
        `

    this.messages.appendChild(typingElement)
    this.scrollToBottom()
  },

  hideTypingIndicator() {
    const typingIndicator = this.messages.querySelector(".typing-indicator")
    if (typingIndicator) {
      typingIndicator.remove()
    }
  },

  showQuickReplies(category) {
    this.removeQuickReplies()

    const quickRepliesContainer = document.createElement("div")
    quickRepliesContainer.className = "quick-replies"

    const replies = this.quickReplies[category] || this.quickReplies.initial

    replies.forEach((reply) => {
      const button = document.createElement("button")
      button.className = "quick-reply-btn"
      button.textContent = reply
      button.addEventListener("click", () => {
        this.handleQuickReply(reply)
      })
      quickRepliesContainer.appendChild(button)
    })

    this.messages.appendChild(quickRepliesContainer)
    this.scrollToBottom()
  },

  removeQuickReplies() {
    const existingReplies = this.messages.querySelector(".quick-replies")
    if (existingReplies) {
      existingReplies.remove()
    }
  },

  handleQuickReply(reply) {
    // Remove emoji from reply for processing
    const cleanReply = reply.replace(/[^\w\s]/gi, "").trim()

    // Add as user message
    this.addUserMessage(reply)

    // Process as regular message
    this.conversationHistory.push({
      type: "user",
      message: cleanReply,
      timestamp: Date.now(),
    })

    this.removeQuickReplies()
    this.showTypingIndicator()

    this.generateResponse(cleanReply)
  },

  async generateResponse(rawMessage) {
    const message = rawMessage.trim()

    // If provider available, use it; otherwise fallback to local patterns
    try {
      if (this.chatService) {
        // Prepare history limited to last 10 exchanges
        const history = this.conversationHistory.slice(-20).map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.message,
        }))

        // Create a streaming bot message container
        const streamingEl = document.createElement("div")
        streamingEl.className = "message bot-message"
        streamingEl.innerHTML = ""
        this.messages.appendChild(streamingEl)
        this.scrollToBottom()

        let accumulated = ""
        for await (const chunk of this.chatService.stream({
          messages: [
            { role: "system", content: this.chatService.systemPrompt },
            ...history,
            { role: "user", content: message },
          ],
        })) {
          accumulated += chunk
          streamingEl.innerHTML = this.formatMessage(accumulated)
          this.scrollToBottom()
        }

      this.hideTypingIndicator()

        // Save final assistant message
        this.conversationHistory.push({ type: "bot", message: accumulated, timestamp: Date.now() })

        // Heuristic quick replies based on content
        const qr = this.getRelevantQuickReplies(this.determineContext(message.toLowerCase()))
        if (qr) this.showQuickReplies(qr)
        return
      }
    } catch (err) {
      console.warn("AI provider failed, falling back to local responses:", err)
    }

    // Fallback: local intent-based reply
    this.hideTypingIndicator()
    const response = this.generateIntelligentResponse(message.toLowerCase())
    this.addBotMessage(response.text)
    if (response.quickReplies) this.showQuickReplies(response.quickReplies)
    this.conversationHistory.push({ type: "bot", message: response.text, timestamp: Date.now() })
  },

  generateIntelligentResponse(message) {
    // Extract user name if mentioned
    if (!this.userName) {
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i)
      if (nameMatch) {
        this.userName = nameMatch[1]
        this.userPreferences.name = this.userName
        return {
          text: `Nice to meet you, ${this.userName}! 😊 I'm so excited to help you find amazing fashion pieces today!\n\nWhat brings you to Fashion Finesse? Are you:\n• Looking for something specific?\n• Shopping for a special occasion?\n• Just browsing for inspiration?\n• Updating your wardrobe?`,
          quickReplies: "collections",
        }
      }
    }

    // Context-aware responses based on conversation history
    const context = this.determineContext(message)

    // Find matching response category
    for (const [category, data] of Object.entries(this.responses)) {
      if (category === "default") continue

      for (const pattern of data.patterns) {
        if (message.includes(pattern)) {
          const responses = data.responses
          const selectedResponse = responses[Math.floor(Math.random() * responses.length)]

          return {
            text: selectedResponse,
            quickReplies: this.getRelevantQuickReplies(category),
          }
        }
      }
    }

    // Contextual default responses
    const contextualDefaults = [
      `I'd love to help you with that${this.userName ? ", " + this.userName : ""}! 😊 Could you tell me more about what you're looking for?`,
      `That sounds interesting! Can you give me a bit more detail so I can help you find exactly what you need?`,
      `I want to make sure I give you the perfect recommendation! What specific fashion item or advice are you looking for?`,
    ]

    return {
      text: contextualDefaults[Math.floor(Math.random() * contextualDefaults.length)],
      quickReplies: "initial",
    }
  },

  determineContext(message) {
    // Analyze recent conversation to determine context
    const recentMessages = this.conversationHistory.slice(-5)

    // Simple context detection based on keywords
    if (message.includes("dress") || message.includes("gown")) return "dresses"
    if (message.includes("work") || message.includes("office")) return "work"
    if (message.includes("casual") || message.includes("everyday")) return "casual"
    if (message.includes("size") || message.includes("fit")) return "sizing"
    if (message.includes("price") || message.includes("cost")) return "pricing"

    return "general"
  },

  getRelevantQuickReplies(category) {
    const mapping = {
      collections: "collections",
      sizing: "sizing",
      styling: "styling",
      occasions: "styling",
    }

    return mapping[category] || "initial"
  },

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight
  },

  trackEvent(eventName, data = {}) {
    // Enhanced analytics tracking
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime,
      messageCount: this.conversationHistory.length,
      userName: this.userName,
      ...data,
    }

    console.log("Chatbot Event:", eventData)

    // Send to analytics if available
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        custom_parameter: JSON.stringify(eventData),
      })
    }
  },

  // Export conversation for customer service
  exportConversation() {
    return {
      sessionId: this.sessionStartTime,
      userName: this.userName,
      userPreferences: this.userPreferences,
      conversationHistory: this.conversationHistory,
      sessionDuration: Date.now() - this.sessionStartTime,
    }
  },
}

// ===== FORMS MODULE =====
const Forms = {
  init() {
    this.contactForm = document.querySelector(SELECTORS.contactForm)
    this.newsletterForm = document.querySelector(SELECTORS.newsletterForm)

    this.bindEvents()
  },

  bindEvents() {
    // Contact form
    if (this.contactForm) {
      this.contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleContactSubmission(e.target)
      })
    }

    // Newsletter form
    if (this.newsletterForm) {
      this.newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleNewsletterSubmission(e.target)
      })
    }
  },

  handleContactSubmission(form) {
    const formData = new FormData(form)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    }

    // Validate form
    if (this.validateContactForm(data)) {
      // Simulate form submission
      this.showSuccessMessage(
        `Thank you, ${data.name}! Your message has been sent. We'll get back to you at ${data.email} soon!`,
      )
      form.reset()
      this.clearErrors()
    }
  },

  handleNewsletterSubmission(form) {
    const formData = new FormData(form)
    const email = formData.get("email")

    if (this.validateEmail(email)) {
      this.showSuccessMessage(`Thank you for subscribing! Welcome to Fashion Finesse, ${email}!`)
      form.reset()
    } else {
      this.showErrorMessage("Please enter a valid email address.")
    }
  },

  validateContactForm(data) {
    let isValid = true
    this.clearErrors()

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      this.showFieldError("name-error", "Please enter a valid name (at least 2 characters).")
      isValid = false
    }

    // Email validation
    if (!this.validateEmail(data.email)) {
      this.showFieldError("email-error", "Please enter a valid email address.")
      isValid = false
    }

    // Message validation
    if (!data.message || data.message.trim().length < 10) {
      this.showFieldError("message-error", "Please enter a message (at least 10 characters).")
      isValid = false
    }

    return isValid
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId)
    if (errorElement) {
      errorElement.textContent = message
      errorElement.style.display = "block"
    }
  },

  clearErrors() {
    const errorElements = document.querySelectorAll(".error-message")
    errorElements.forEach((element) => {
      element.textContent = ""
      element.style.display = "none"
    })
  },

  showSuccessMessage(message) {
    // Create and show success notification
    const notification = document.createElement("div")
    notification.className = "notification success"
    notification.textContent = message
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `

    document.body.appendChild(notification)

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 5000)
  },

  showErrorMessage(message) {
    // Create and show error notification
    const notification = document.createElement("div")
    notification.className = "notification error"
    notification.textContent = message
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `

    document.body.appendChild(notification)

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 5000)
  },
}

// ===== PURCHASE HANDLER =====
const PurchaseHandler = {
  handlePurchase(itemName) {
    // Show confirmation dialog
    const userConfirmed = confirm(
      `Add ${itemName} to your cart?\n\nThis will redirect you to our secure checkout page.`,
    )

    if (userConfirmed) {
      // Simulate purchase process
      this.showPurchaseNotification(itemName)

      // Track purchase event
      this.trackPurchaseEvent(itemName)

      // Simulate redirect delay
      setTimeout(() => {
        alert(
          "Thank you for choosing Fashion Finesse!\n\nIn a real store, you would now be redirected to our secure payment page.",
        )
      }, 1500)
    }
  },

  showPurchaseNotification(itemName) {
    const notification = document.createElement("div")
    notification.className = "notification purchase"
    notification.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span>${itemName} added to cart! 🛍️</span>
        `
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #f06292, #e91e63);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  },

  trackPurchaseEvent(itemName) {
    // Analytics tracking (placeholder)
    if (typeof gtag !== "undefined") {
      gtag("event", "add_to_cart", {
        currency: "USD",
        value: 0,
        items: [
          {
            item_name: itemName,
            item_category: "Fashion",
            quantity: 1,
          },
        ],
      })
    }

    console.log(`Purchase event tracked: ${itemName}`)
  },
}

// ===== PERFORMANCE MONITOR =====
const PerformanceMonitor = {
  init() {
    this.measurePageLoad()
    this.setupErrorHandling()
  },

  measurePageLoad() {
    window.addEventListener("load", () => {
      if ("performance" in window) {
        const perfData = performance.getEntriesByType("navigation")[0]
        console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`)
      }
    })
  },

  setupErrorHandling() {
    window.addEventListener("error", (e) => {
      console.error("JavaScript Error:", {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error,
      })
    })

    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled Promise Rejection:", e.reason)
    })
  },
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
const Accessibility = {
  init() {
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupAriaLiveRegions()
  },

  setupKeyboardNavigation() {
    // Tab trap for modal dialogs
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const chatbotWindow = document.querySelector(SELECTORS.chatbotWindow)
        if (chatbotWindow && chatbotWindow.getAttribute("aria-hidden") === "false") {
          this.trapFocus(e, chatbotWindow)
        }
      }
    })
  },

  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  },

  setupFocusManagement() {
    // Manage focus for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains("message")) {
              // Announce new chat messages to screen readers
              this.announceToScreenReader(node.textContent)
            }
          })
        }
      })
    })

    const chatMessages = document.querySelector(SELECTORS.chatMessages)
    if (chatMessages) {
      observer.observe(chatMessages, { childList: true })
    }
  },

  setupAriaLiveRegions() {
    // Create aria-live region for announcements
    const liveRegion = document.createElement("div")
    liveRegion.setAttribute("aria-live", "polite")
    liveRegion.setAttribute("aria-atomic", "true")
    liveRegion.className = "sr-only"
    liveRegion.id = "aria-live-region"
    document.body.appendChild(liveRegion)
  },

  announceToScreenReader(message) {
    const liveRegion = document.getElementById("aria-live-region")
    if (liveRegion) {
      liveRegion.textContent = message
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = ""
      }, 1000)
    }
  },
}

// ===== MAIN APPLICATION =====
const App = {
  init() {
    // Check if DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start())
    } else {
      this.start()
    }
  },

  start() {
    try {
      // Initialize all modules
      LoadingScreen.init()
      Navigation.init()
      ScrollEffects.init()
      Chatbot.init()
      Forms.init()
      PerformanceMonitor.init()
      Accessibility.init()

      // Show welcome message for first-time visitors
      this.showWelcomeMessage()

      console.log("Fashion Finesse website initialized successfully")
    } catch (error) {
      console.error("Error initializing application:", error)
    }
  },

  showWelcomeMessage() {
    setTimeout(() => {
      if (!sessionStorage.getItem("welcomed")) {
        const welcomeMessage =
          "Welcome to Fashion Finesse! 🌟\n\nExplore our collections and don't forget to try our chat assistant for personalized help!"

        // Use notification instead of alert for better UX
        const notification = document.createElement("div")
        notification.className = "notification welcome"
        notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>🌟</span>
                        <div>
                            <strong>Welcome to Fashion Finesse!</strong><br>
                            <small>Explore our collections and try our chat assistant!</small>
                        </div>
                    </div>
                `
        notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #f06292, #e91e63);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                `

        document.body.appendChild(notification)

        setTimeout(() => {
          notification.style.animation = "slideOutRight 0.3s ease"
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification)
            }
          }, 300)
        }, 6000)

        sessionStorage.setItem("welcomed", "true")
      }
    }, 2000)
  },
}

// ===== GLOBAL FUNCTIONS =====
// Make handlePurchase globally available for onclick handlers
window.handlePurchase = (itemName) => {
  PurchaseHandler.handlePurchase(itemName)
}

// ===== CHAT SERVICE (AI PROVIDERS) =====
const ChatService = {
  create(config) {
    const provider = (config && config.provider) || "auto"
    const systemPrompt = (config && config.systemPrompt) || "You are a helpful assistant."

    // Try Ollama if chosen or on auto fallback
    if (provider === "ollama" || provider === "auto") {
      const baseUrl = (config && config.ollama && config.ollama.baseUrl) || "http://localhost:11434"
      const model = (config && config.ollama && config.ollama.model) || "llama3.1"
      const temperature = (config && config.ollama && config.ollama.temperature) || 0.7
      const top_p = (config && config.ollama && config.ollama.top_p) || 0.9

      return {
        systemPrompt,
        async health() {
          try {
            const res = await fetch(`${baseUrl}/api/tags`)
            return res.ok
          } catch (_) {
            return false
          }
        },
        async *stream({ messages }) {
          // If Ollama not reachable, fail fast so caller can fallback
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), (CONFIG.AI && CONFIG.AI.requestTimeoutMs) || 20000)

          const body = {
            model,
            stream: true,
            options: { temperature, top_p },
            messages,
          }

          let response
          try {
            response = await fetch(`${baseUrl}/api/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
              signal: controller.signal,
            })
          } catch (e) {
            clearTimeout(timeout)
            throw new Error("Failed to reach Ollama server. Ensure Ollama is running: ollama serve")
          }

          clearTimeout(timeout)

          if (!response.ok || !response.body) {
            throw new Error(`Ollama error: ${response.status}`)
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            // Ollama streams JSON lines per chunk
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""
            for (const line of lines) {
              if (!line.trim()) continue
              try {
                const event = JSON.parse(line)
                if (event.message && event.message.content) {
                  yield event.message.content
                }
              } catch (err) {
                // Ignore malformed lines
              }
            }
          }
        },
      }
    }

    // If no provider usable, return null to trigger fallback
    return null
  },
}

// ===== INITIALIZE APPLICATION =====
App.init()

// ===== ADD NOTIFICATION ANIMATIONS TO CSS =====
const notificationStyles = document.createElement("style")
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`
document.head.appendChild(notificationStyles)
