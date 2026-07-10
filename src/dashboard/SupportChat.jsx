import { useEffect, useRef, useState } from "react";
import {
  getUserSupportMessages,
  sendSupportMessage,
} from "../services/api";
import { supabase } from "../lib/supabase";

export default function SupportChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  async function loadMessages() {
    const { data, error } = await getUserSupportMessages(user.id);

    if (error) {
      console.log(error.message);
      setMessages([]);
      return;
    }

    setMessages(data || []);
  }

  async function sendMessage() {
    if (!text.trim()) return;

    const messageText = text.trim();
    setText("");

    const { error } = await sendSupportMessage({
      userId: user.id,
      userEmail: user.email,
      sender: "user",
      message: messageText,
    });

    if (error) {
      alert(error.message);
      return;
    }

    loadMessages();
  }

  useEffect(() => {
    if (!user?.id) return;

    loadMessages();

    const channel = supabase
      .channel(`support-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="supportChatBox">
      <div className="chatWelcome">
        <div className="chatAvatar">💬</div>

        <div>
          <h4>Поддержка BONUSTEST</h4>
          <p>Обычно отвечаем быстро</p>
        </div>
      </div>

      <div className="chatMessages">
        {messages.length === 0 ? (
          <div className="chatEmpty">
            <div>👋</div>
            <h4>Напишите нам</h4>
            <p>Задайте вопрос по заданиям, выплатам или аккаунту.</p>
          </div>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className={`chatBubble ${item.sender}`}
            >
              <p>{item.message}</p>

              <span>
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chatForm">
        <input
          className="chatInput"
          placeholder="Введите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          className="chatSendBtn"
          onClick={sendMessage}
        >
          ➤
        </button>
      </div>
    </section>
  );
}