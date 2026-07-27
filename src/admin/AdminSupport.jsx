import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiChevronLeft,
  FiClock,
  FiHeadphones,
  FiInbox,
  FiMessageCircle,
  FiSearch,
  FiSend,
  FiUser,
  FiX,
} from "react-icons/fi";

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

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  async function loadMessages(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const { data, error } =
        await getAllSupportMessages();

      if (error) {
        alert(error.message);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error(
        "Ошибка загрузки сообщений поддержки:",
        error
      );

      alert("Не удалось загрузить сообщения");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  const dialogs = useMemo(() => {
    const sortedMessages = [...messages].sort(
      (firstMessage, secondMessage) =>
        new Date(secondMessage.created_at) -
        new Date(firstMessage.created_at)
    );

    const dialogMap = {};

    sortedMessages.forEach((message) => {
      if (!dialogMap[message.user_id]) {
        dialogMap[message.user_id] = {
          user_id: message.user_id,
          user_email:
            message.user_email ||
            "Пользователь без email",

          last_message: message.message,
          last_date: message.created_at,

          last_sender: message.sender,

          messages_count: messages.filter(
            (item) =>
              item.user_id === message.user_id
          ).length,
        };
      }
    });

    return Object.values(dialogMap).sort(
      (firstDialog, secondDialog) =>
        new Date(secondDialog.last_date) -
        new Date(firstDialog.last_date)
    );
  }, [messages]);

  const filteredDialogs = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return dialogs;
    }

    return dialogs.filter((dialog) => {
      const email = String(
        dialog.user_email || ""
      ).toLowerCase();

      const lastMessage = String(
        dialog.last_message || ""
      ).toLowerCase();

      return (
        email.includes(normalizedSearch) ||
        lastMessage.includes(normalizedSearch)
      );
    });
  }, [dialogs, search]);

  const activeMessages = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return messages
      .filter(
        (message) =>
          message.user_id === activeUser.user_id
      )
      .sort(
        (firstMessage, secondMessage) =>
          new Date(firstMessage.created_at) -
          new Date(secondMessage.created_at)
      );
  }, [messages, activeUser]);

  const statistics = useMemo(() => {
    const userMessages = messages.filter(
      (message) => message.sender !== "admin"
    ).length;

    const adminMessages = messages.filter(
      (message) => message.sender === "admin"
    ).length;

    return {
      dialogs: dialogs.length,
      messages: messages.length,
      userMessages,
      adminMessages,
    };
  }, [dialogs, messages]);

  function formatDialogDate(date) {
    if (!date) {
      return "";
    }

    const messageDate = new Date(date);
    const today = new Date();

    const isToday =
      messageDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString(
        "ru-RU",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return messageDate.toLocaleDateString(
      "ru-RU",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  }

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

  function selectDialog(dialog) {
    setActiveUser(dialog);
    setText("");
  }

  async function sendMessage() {
    const preparedText = text.trim();

    if (
      !preparedText ||
      !activeUser ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const { error } =
        await sendAdminSupportMessage({
          userId: activeUser.user_id,
          userEmail: activeUser.user_email,
          message: preparedText,
        });

      if (error) {
        alert(error.message);
        return;
      }

      setText("");

      await loadMessages();
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

  useEffect(() => {
    loadMessages(true);

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
          setMessages((previousMessages) => {
            const alreadyExists =
              previousMessages.some(
                (message) =>
                  message.id === payload.new.id
              );

            if (alreadyExists) {
              return previousMessages;
            }

            return [
              payload.new,
              ...previousMessages,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!activeUser) {
      return;
    }

    const updatedDialog = dialogs.find(
      (dialog) =>
        dialog.user_id === activeUser.user_id
    );

    if (updatedDialog) {
      setActiveUser(updatedDialog);
    }
  }, [dialogs, activeUser?.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeMessages.length, activeUser]);

  if (loading) {
    return (
      <div className="adminSupportLoading">
        <div className="adminSupportLoadingIcon">
          <FiHeadphones />
        </div>

        <span>Загрузка обращений...</span>
      </div>
    );
  }

  return (
    <div className="adminSupportPage">
      <section className="adminSupportHeader">
        <div className="adminSupportHeaderMain">
          <div className="adminSupportHeaderIcon">
            <FiHeadphones />
          </div>

          <div>
            <span>Центр коммуникации</span>

            <h1>Поддержка пользователей</h1>

            <p>
              Просматривайте обращения пользователей
              и отвечайте на сообщения в реальном
              времени.
            </p>
          </div>
        </div>

        <div className="adminSupportLive">
          <span />
          Онлайн
        </div>
      </section>

      <section className="adminSupportStats">
        <article>
          <div className="adminSupportStatIcon blue">
            <FiMessageCircle />
          </div>

          <div>
            <span>Диалогов</span>
            <strong>{statistics.dialogs}</strong>
          </div>
        </article>

        <article>
          <div className="adminSupportStatIcon purple">
            <FiInbox />
          </div>

          <div>
            <span>Сообщений</span>
            <strong>{statistics.messages}</strong>
          </div>
        </article>

        <article>
          <div className="adminSupportStatIcon orange">
            <FiUser />
          </div>

          <div>
            <span>От пользователей</span>
            <strong>
              {statistics.userMessages}
            </strong>
          </div>
        </article>

        <article>
          <div className="adminSupportStatIcon green">
            <FiSend />
          </div>

          <div>
            <span>Ответов поддержки</span>
            <strong>
              {statistics.adminMessages}
            </strong>
          </div>
        </article>
      </section>

      <section
        className={`adminSupportWorkspace ${
          activeUser
            ? "adminSupportConversationOpened"
            : ""
        }`}
      >
        <aside className="adminSupportDialogs">
          <div className="adminSupportDialogsHeader">
            <div>
              <span>Обращения</span>

              <h2>Все диалоги</h2>

              <p>
                Найдено: {filteredDialogs.length}
              </p>
            </div>
          </div>

          <div className="adminSupportSearch">
            <FiSearch />

            <input
              type="search"
              placeholder="Поиск по email или сообщению"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Очистить поиск"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="adminSupportDialogsList">
            {filteredDialogs.length === 0 ? (
              <div className="adminSupportDialogsEmpty">
                <div>
                  <FiInbox />
                </div>

                <h3>Диалоги не найдены</h3>

                <p>
                  Попробуйте изменить поисковый
                  запрос.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Очистить поиск
                  </button>
                )}
              </div>
            ) : (
              filteredDialogs.map((dialog) => {
                const isActive =
                  activeUser?.user_id ===
                  dialog.user_id;

                return (
                  <button
                    type="button"
                    key={dialog.user_id}
                    className={`adminSupportDialogItem ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() =>
                      selectDialog(dialog)
                    }
                  >
                    <div className="adminSupportDialogAvatar">
                      <FiUser />
                    </div>

                    <div className="adminSupportDialogContent">
                      <div className="adminSupportDialogTop">
                        <strong>
                          {dialog.user_email}
                        </strong>

                        <time>
                          {formatDialogDate(
                            dialog.last_date
                          )}
                        </time>
                      </div>

                      <div className="adminSupportDialogBottom">
                        <span>
                          {dialog.last_sender ===
                          "admin"
                            ? "Вы: "
                            : ""}

                          {dialog.last_message ||
                            "Нет сообщений"}
                        </span>

                        <small>
                          {dialog.messages_count}
                        </small>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="adminSupportConversation">
          {!activeUser ? (
            <div className="adminSupportWelcome">
              <div className="adminSupportWelcomeIcon">
                <FiMessageCircle />
              </div>

              <h2>Выберите диалог</h2>

              <p>
                Выберите пользователя в списке слева,
                чтобы посмотреть историю обращения и
                отправить ответ.
              </p>
            </div>
          ) : (
            <>
              <header className="adminSupportConversationHeader">
                <button
                  type="button"
                  className="adminSupportBackButton"
                  onClick={() =>
                    setActiveUser(null)
                  }
                  aria-label="Вернуться к диалогам"
                >
                  <FiChevronLeft />
                </button>

                <div className="adminSupportConversationAvatar">
                  <FiUser />
                </div>

                <div className="adminSupportConversationUser">
                  <span>Пользователь</span>

                  <h2>
                    {activeUser.user_email}
                  </h2>
                </div>

                <div className="adminSupportConversationInfo">
                  <FiMessageCircle />

                  <span>
                    {activeMessages.length}{" "}
                    сообщений
                  </span>
                </div>
              </header>

              <div className="adminSupportMessages">
                {activeMessages.length === 0 ? (
                  <div className="adminSupportMessagesEmpty">
                    В этом диалоге пока нет сообщений
                  </div>
                ) : (
                  activeMessages.map((item) => {
                    const isAdmin =
                      item.sender === "admin";

                    return (
                      <div
                        key={item.id}
                        className={`adminSupportMessageRow ${
                          isAdmin
                            ? "admin"
                            : "user"
                        }`}
                      >
                        {!isAdmin && (
                          <div className="adminSupportMessageAvatar">
                            <FiUser />
                          </div>
                        )}

                        <div className="adminSupportMessageContent">
                          <div className="adminSupportMessageBubble">
                            <p>{item.message}</p>
                          </div>

                          <span className="adminSupportMessageTime">
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

                <div ref={messagesEndRef} />
              </div>

              <div className="adminSupportComposer">
                <div className="adminSupportComposerInput">
                  <textarea
                    rows="1"
                    placeholder="Напишите ответ пользователю..."
                    value={text}
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
                    disabled={sending}
                  />

                  <span>
                    Enter — отправить, Shift + Enter —
                    новая строка
                  </span>
                </div>

                <button
                  type="button"
                  className="primaryBtn adminSupportSendButton"
                  onClick={sendMessage}
                  disabled={
                    !text.trim() || sending
                  }
                >
                  <FiSend />

                  {sending
                    ? "Отправка..."
                    : "Отправить"}
                </button>
              </div>
            </>
          )}
        </main>
      </section>
    </div>
  );
}