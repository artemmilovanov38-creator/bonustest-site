import { useEffect, useMemo, useState } from "react";
import {
  getAllSupportMessages,
  sendAdminSupportMessage,
} from "../services/api";
import { supabase } from "../lib/supabase";

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");

  async function loadMessages() {
    const { data } = await getAllSupportMessages();
    setMessages(data || []);
  }

  const dialogs = useMemo(() => {
    const map = {};

    messages.forEach((msg) => {
      if (!map[msg.user_id]) {
        map[msg.user_id] = {
          user_id: msg.user_id,
          user_email: msg.user_email,
          last_message: msg.message,
          last_date: msg.created_at,
        };
      }
    });

    return Object.values(map);
  }, [messages]);

  const filteredDialogs = dialogs.filter((dialog) =>
    (dialog.user_email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeMessages = messages
    .filter((msg) => msg.user_id === activeUser?.user_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  async function sendMessage() {
    if (!text.trim() || !activeUser) return;

    await sendAdminSupportMessage({
      userId: activeUser.user_id,
      userEmail: activeUser.user_email,
      message: text,
    });

    setText("");
    loadMessages();
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("support-admin")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="adminSupport">
      <div className="supportDialogs">
        <h2>Диалоги</h2>

        <input
          className="dialogSearch"
          placeholder="Поиск по email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredDialogs.length === 0 ? (
          <div className="emptyBox">Диалогов не найдено</div>
        ) : (
          filteredDialogs.map((dialog) => (
            <button
              key={dialog.user_id}
              className={`dialogItem ${
                activeUser?.user_id === dialog.user_id ? "active" : ""
              }`}
              onClick={() => setActiveUser(dialog)}
            >
              <strong>{dialog.user_email}</strong>
              <span>{dialog.last_message}</span>
            </button>
          ))
        )}
      </div>

      <div className="supportConversation">
        {!activeUser ? (
          <div className="emptyBox">Выберите диалог</div>
        ) : (
          <>
            <div className="conversationHeader">
              <h2>{activeUser.user_email}</h2>
            </div>

            <div className="chatMessages adminChatMessages">
              {activeMessages.map((item) => (
                <div key={item.id} className={`chatBubble ${item.sender}`}>
                  <p>{item.message}</p>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="chatForm">
              <input
                className="authInput"
                placeholder="Ответить..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button className="primaryBtn" onClick={sendMessage}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}