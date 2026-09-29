import React, { useState, useRef, useEffect } from "react";
import "@/assets/styles/layout/AIChatbot.css";
import aiService from "@/services/aiService";
import { useLanguage } from "@/context";

export default function AIChatbot({ token }) {
  const { language, isEn, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: "bot",
      text: isEn
        ? "Hello! I am MarketLink's AI Assistant 🌿. Are you looking for weekend farmers' markets, seasonal fresh produce, or pickup stall info?"
        : "Xin chào! Tôi là Trợ lý AI của MarketLink 🌿. Bạn muốn tìm chợ nông sản họp hôm nay, hay cần gợi ý rau củ tươi sạch từ nông dân?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = isEn
    ? [
        "Which market opens on Saturday?",
        "What organic produce is in season?",
        "How does pre-order pickup work?",
      ]
    : [
        "Chợ nào mở vào sáng Thứ 7?",
        "Rau hữu cơ nào đang vào vụ?",
        "Cách đặt trước nhận tại sạp?",
      ];

  // Cập nhật lời chào ban đầu nếu chưa có tin nhắn nào từ người dùng khi đổi ngôn ngữ
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === "bot") {
        return [
          {
            id: 1,
            sender: "bot",
            text: isEn
              ? "Hello! I am MarketLink's AI Assistant 🌿. Are you looking for weekend farmers' markets, seasonal fresh produce, or pickup stall info?"
              : "Xin chào! Tôi là Trợ lý AI của MarketLink 🌿. Bạn muốn tìm chợ nông sản họp hôm nay, hay cần gợi ý rau củ tươi sạch từ nông dân?",
          },
        ];
      }
      return prev;
    });
  }, [isEn]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setIsLoading(true);

    try {
      const botReply = await aiService.askAssistant(textToSend, language);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: isEn
            ? "Sorry, the assistant is temporarily experiencing connection issues. You can browse produce directly on the website!"
            : "Xin lỗi bạn, trợ lý tạm thời gặp sự cố kết nối. Bạn có thể xem danh mục nông sản trực tiếp trên website nhé!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-chatbot-container">
      <button
        id="ml-ai-chat-toggle"
        type="button"
        className={`ml-chatbot-bubble ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isEn ? "Open MarketLink AI Assistant" : "Mở trợ lý AI MarketLink"}
      >
        <span className="ml-bubble-icon">{isOpen ? "✕" : "🤖"}</span>
        {!isOpen && <span className="ml-bubble-pulse" />}
      </button>

      {isOpen && (
        <div className="ml-chat-window">
          <div className="ml-chat-header">
            <div className="ml-chat-bot-info">
              <div className="ml-chat-avatar">🌱</div>
              <div>
                <div className="ml-chat-name">
                  {isEn ? "Farm AI Assistant" : "Trợ lý AI Nông Sản"}
                </div>
                <div className="ml-chat-status">
                  <span className="ml-status-dot" />{" "}
                  {isEn ? "Online • Ready to help" : "Trực tuyến • Sẵn sàng hỗ trợ"}
                </div>
              </div>
            </div>
            <div className="ml-chat-header-actions">
              <button
                id="ml-ai-chat-lang-btn"
                type="button"
                className="ml-chat-lang-btn"
                onClick={toggleLanguage}
                title={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
              >
                {isEn ? "VI" : "EN"}
              </button>
              <button
                type="button"
                className="ml-chat-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label={isEn ? "Close Chat" : "Đóng chat"}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="ml-chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ml-chat-bubble-row ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.sender === "bot" && (
                  <span className="ml-msg-bot-avatar">🤖</span>
                )}
                <div
                  className={`ml-msg-bubble ${msg.sender === "user" ? "user" : "bot"}`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ml-chat-bubble-row bot">
                <span className="ml-msg-bot-avatar">🤖</span>
                <div className="ml-msg-bubble bot ml-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ml-chat-prompts">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="ml-prompt-chip"
                onClick={() => handleSendMessage(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <form
            className="ml-chat-footer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              id="ml-chat-input"
              type="text"
              className="ml-chat-input"
              placeholder={
                isEn
                  ? "Ask about markets, produce, prices, pre-order..."
                  : "Hỏi về chợ, nông sản, giá bán..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              id="ml-chat-send-btn"
              type="submit"
              className="ml-chat-send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label={isEn ? "Send message" : "Gửi tin nhắn"}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
