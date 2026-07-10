import { useEffect, useRef, useState } from "react";
import {
  getAdminChatMessages,
  sendAdminChatMessage,
} from "../services/api";
import { supabase } from "../lib/supabase";

export default function AdminTeamChat() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user || null);
  }

  async function loadMessages() {
    const { data, error } = await getAdminChatMessages();

    if (error) {
      alert(error.message);
      return;
    }

    setMessages(data || []);
  }

  async function sendMessage() {
    const cleanText = text.trim();

    if (!cleanText || !currentUser || sending) return;

    setSending(true);

    const { error } = await sendAdminChatMessage({
      senderId: currentUser.id,
      senderEmail: currentUser.email,
      message: cleanText,
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setText("");
  }

  useEffect(() => {
    loadCurrentUser();
    loadMessages();

    const channel = supabase
      .channel("admin-team-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_messages",
        },
        (payload) => {
          setMessages((previousMessages) => {
            const alreadyExists = previousMessages.some(
              (item) => item.id === payload.new.id
            );

            if (alreadyExists) return previousMessages;

            return [...previousMessages, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="adminTeamChat">
      <div className="teamChatHeader">
        <div className="teamChatAvatar">A</div>

        <div>
          <h2>Чат администраторов</h2>
          <p>Внутреннее общение команды BONUSTEST</p>
        </div>

        <span className="teamChatSecure">
          🔒 Только администраторы
        </span>
      </div>

      <div className="teamChatMessages">
        {messages.length === 0 ? (
          <div className="teamChatEmpty">
            <div>👋</div>
            <h3>Сообщений пока нет</h3>
            <p>Напишите первое сообщение команде.</p>
          </div>
        ) : (
          messages.map((item) => {
            const isOwnMessage =
              item.sender_id === currentUser?.id;

            return (
              <div
                key={item.id}
                className={`teamMessage ${
                  isOwnMessage ? "own" : "other"
                }`}
              >
                {!isOwnMessage && (
                  <strong>{item.sender_email}</strong>
                )}

                <p>{item.message}</p>

                <span>
                  {new Date(item.created_at).toLocaleString(
                    "ru-RU",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="teamChatForm">
        <textarea
          placeholder="Напишите сообщение команде..."
          value={text}
          rows={1}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          className="primaryBtn"
          onClick={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}