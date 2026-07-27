import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiClock,
  FiLock,
  FiMessageCircle,
  FiSend,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import {
  getAdminChatMessages,
  sendAdminChatMessage,
} from "../services/api";

import { supabase } from "../lib/supabase";

export default function AdminTeamChat() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  async function loadCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "Ошибка получения текущего пользователя:",
          error
        );

        return;
      }

      setCurrentUser(user || null);
    } catch (error) {
      console.error(
        "Ошибка получения текущего пользователя:",
        error
      );
    }
  }

  async function loadMessages(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const { data, error } =
        await getAdminChatMessages();

      if (error) {
        alert(error.message);
        return;
      }

      const sortedMessages = [...(data || [])].sort(
        (firstMessage, secondMessage) =>
          new Date(firstMessage.created_at) -
          new Date(secondMessage.created_at)
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error(
        "Ошибка загрузки командного чата:",
        error
      );

      alert("Не удалось загрузить сообщения");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  async function sendMessage() {
    const cleanText = text.trim();

    if (!cleanText || !currentUser || sending) {
      return;
    }

    try {
      setSending(true);

      const { error } =
        await sendAdminChatMessage({
          senderId: currentUser.id,
          senderEmail:
            currentUser.email ||
            "Администратор",
          message: cleanText,
        });

      if (error) {
        alert(error.message);
        return;
      }

      setText("");
    } catch (error) {
      console.error(
        "Ошибка отправки сообщения:",
        error
      );

      alert("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  }

  const statistics = useMemo(() => {
    const senders = new Set(
      messages
        .map((message) => message.sender_id)
        .filter(Boolean)
    );

    const ownMessages = messages.filter(
      (message) =>
        message.sender_id === currentUser?.id
    ).length;

    return {
      messages: messages.length,
      participants: senders.size,
      ownMessages,
    };
  }, [messages, currentUser]);

  function formatMessageDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "ru-RU",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getUserInitial(email) {
    const cleanEmail = String(email || "")
      .trim()
      .toUpperCase();

    return cleanEmail.charAt(0) || "A";
  }

  useEffect(() => {
    loadCurrentUser();
    loadMessages(true);

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
            const alreadyExists =
              previousMessages.some(
                (item) =>
                  item.id === payload.new.id
              );

            if (alreadyExists) {
              return previousMessages;
            }

            return [
              ...previousMessages,
              payload.new,
            ].sort(
              (firstMessage, secondMessage) =>
                new Date(firstMessage.created_at) -
                new Date(secondMessage.created_at)
            );
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
  }, [messages.length]);

  if (loading) {
    return (
      <div className="adminTeamChatLoading">
        <div className="adminTeamChatLoadingIcon">
          <FiUsers />
        </div>

        <span>Загрузка командного чата...</span>
      </div>
    );
  }

  return (
    <div className="adminTeamChatPage">
      <section className="adminTeamChatHero">
        <div className="adminTeamChatHeroMain">
          <div className="adminTeamChatHeroIcon">
            <FiUsers />
          </div>

          <div>
            <span>Внутренняя коммуникация</span>

            <h1>Командный чат</h1>

            <p>
              Общайтесь с администраторами и обсуждайте
              рабочие вопросы в режиме реального времени.
            </p>
          </div>
        </div>

        <div className="adminTeamChatSecure">
          <FiLock />

          Только для команды
        </div>
      </section>

      <section className="adminTeamChatStats">
        <article>
          <div className="adminTeamChatStatIcon blue">
            <FiMessageCircle />
          </div>

          <div>
            <span>Сообщений</span>
            <strong>{statistics.messages}</strong>
          </div>
        </article>

        <article>
          <div className="adminTeamChatStatIcon purple">
            <FiUsers />
          </div>

          <div>
            <span>Участников</span>
            <strong>{statistics.participants}</strong>
          </div>
        </article>

        <article>
          <div className="adminTeamChatStatIcon green">
            <FiSend />
          </div>

          <div>
            <span>Ваших сообщений</span>
            <strong>{statistics.ownMessages}</strong>
          </div>
        </article>

        <article>
          <div className="adminTeamChatStatIcon orange">
            <FiShield />
          </div>

          <div>
            <span>Статус</span>
            <strong>Онлайн</strong>
          </div>
        </article>
      </section>

      <section className="adminTeamChatWorkspace">
        <header className="adminTeamChatHeader">
          <div className="adminTeamChatHeaderAvatar">
            {getUserInitial(currentUser?.email)}
          </div>

          <div className="adminTeamChatHeaderInfo">
            <span>Рабочий канал</span>

            <h2>Чат администраторов</h2>

            <p>
              Внутреннее общение команды BONUSTEST
            </p>
          </div>

          <div className="adminTeamChatCurrentUser">
            <div>
              <FiUser />
            </div>

            <span>
              {currentUser?.email ||
                "Администратор"}
            </span>
          </div>
        </header>

        <div className="adminTeamChatMessages">
          {messages.length === 0 ? (
            <div className="adminTeamChatEmpty">
              <div className="adminTeamChatEmptyIcon">
                <FiMessageCircle />
              </div>

              <h3>Сообщений пока нет</h3>

              <p>
                Напишите первое сообщение своей команде.
              </p>
            </div>
          ) : (
            messages.map((item) => {
              const isOwnMessage =
                item.sender_id === currentUser?.id;

              return (
                <div
                  key={item.id}
                  className={`adminTeamMessageRow ${
                    isOwnMessage ? "own" : "other"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="adminTeamMessageAvatar">
                      {getUserInitial(
                        item.sender_email
                      )}
                    </div>
                  )}

                  <div className="adminTeamMessageContent">
                    {!isOwnMessage && (
                      <strong className="adminTeamMessageAuthor">
                        {item.sender_email ||
                          "Администратор"}
                      </strong>
                    )}

                    <div className="adminTeamMessageBubble">
                      <p>{item.message}</p>
                    </div>

                    <span className="adminTeamMessageDate">
                      <FiClock />

                      {formatMessageDate(
                        item.created_at
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        <div className="adminTeamChatComposer">
          <div className="adminTeamChatComposerInput">
            <textarea
              placeholder="Напишите сообщение команде..."
              value={text}
              rows={1}
              onChange={(event) =>
                setText(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              disabled={sending || !currentUser}
            />

            <span>
              Enter — отправить, Shift + Enter — новая
              строка
            </span>
          </div>

          <button
            type="button"
            className="primaryBtn adminTeamChatSendButton"
            onClick={sendMessage}
            disabled={
              !text.trim() ||
              sending ||
              !currentUser
            }
          >
            <FiSend />

            {sending
              ? "Отправка..."
              : "Отправить"}
          </button>
        </div>
      </section>
    </div>
  );
}