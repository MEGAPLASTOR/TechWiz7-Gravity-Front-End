import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User } from 'lucide-react';
import { aiApi } from '@/api/ai.api';

export const AiAssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý Ảo MarketLink AI. Tôi có thể giúp bạn tra cứu thông tin chợ phiên, lịch họp chợ, khung giờ nhận hàng (Pay-at-pickup) hoặc gợi ý nông sản tươi ngon trong ngày!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'Chợ phiên nào mở cửa vào cuối tuần này?',
    'Mô hình Pay-at-pickup nhận hàng thế nào?',
    'Có những loại rau lá hữu cơ nào hôm nay?',
    'Giờ chốt đơn (cutoff time) của nông dân là khi nào?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend = input) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiApi.chat(text);
      const aiReply = res?.reply || res?.data?.reply || (typeof res === 'string' ? res : 'Cảm ơn bạn đã liên hệ với trợ lý ảo MarketLink!');
      const timingNotes = res?.timingNotes || res?.data?.timingNotes;

      let finalText = aiReply;
      if (timingNotes) {
        finalText += `\n\n📌 ${timingNotes}`;
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: finalText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Hiện tại hệ thống AI đang bận kết nối đến máy chủ chợ. Bạn có thể xem danh sách chợ phiên trên trang chủ hoặc thử lại sau ít phút nhé!',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-header-info">
            <div className="ai-avatar-icon">
              <Bot size={22} />
            </div>
            <div>
              <div className="ai-modal-title">MarketLink AI Assistant</div>
              <div className="ai-modal-subtitle">Trực tuyến • Hỗ trợ thông tin 24/7</div>
            </div>
          </div>

          <button onClick={onClose} className="ai-modal-close-btn" type="button" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="ai-chat-body">
          {messages.map((m) => (
            <div key={m.id} className={`ai-bubble-row ${m.sender === 'user' ? 'user' : ''}`}>
              {m.sender === 'ai' && (
                <div className="ai-avatar-icon" style={{ width: '32px', height: '32px', background: '#dcfce7', color: '#166534', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              <div className={`ai-bubble ${m.sender === 'user' ? 'user' : 'bot'}`}>
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="ai-avatar-icon" style={{ width: '32px', height: '32px', background: '#dbeafe', color: '#1d4ed8', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ai-bubble-row">
              <div className="ai-avatar-icon" style={{ width: '32px', height: '32px', background: '#dcfce7', color: '#166534', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div className="ai-bubble bot animate-pulse" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Trợ lý AI đang suy nghĩ...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chips-container">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="ai-question-chip"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="ai-input-bar"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về ngày họp chợ, địa điểm, đặt trước..."
            className="ai-text-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="ai-send-btn"
          >
            <Send size={16} />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
