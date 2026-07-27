import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";

import Sidebar from "../layout/Sidebar";

const pageTitles = {
  dashboard: {
    title: "Обзор",
    description: "Основные показатели платформы BONUSTEST",
  },
  users: {
    title: "Пользователи",
    description: "Создание аккаунтов и управление пользователями",
  },
  reviews: {
    title: "Проверка заданий",
    description: "Проверка заявок и выполненных заданий",
  },
  withdraws: {
    title: "Выплаты",
    description: "Обработка запросов пользователей на вывод средств",
  },
  tasks: {
    title: "Задания",
    description: "Создание и управление заданиями платформы",
  },
  support: {
    title: "Поддержка",
    description: "Обращения пользователей и диалоги с поддержкой",
  },
  "team-chat": {
    title: "Командный чат",
    description: "Внутреннее общение администраторов",
  },
  settings: {
    title: "Настройки",
    description: "Основные параметры платформы",
  },
};

export default function AdminLayout({
  role,
  activeTab,
  setActiveTab,
  children,
  onExit,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentPage =
    pageTitles[activeTab] || pageTitles.dashboard;

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    closeSidebar();
  };

  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="adminLayout">
      <Sidebar
        role={role}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onExit={onExit}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="adminSidebarOverlay"
          aria-label="Закрыть меню"
          onClick={closeSidebar}
        />
      )}

      <main className="adminContent">
        <header className="adminMobileHeader">
          <button
            type="button"
            className="adminMenuButton"
            aria-label="Открыть меню"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FiMenu />
          </button>

          <div className="adminMobileLogo">
            <span>BONUS</span>
            <strong>TEST</strong>
          </div>

          <div className="adminMobileAvatar">A</div>
        </header>

        <div className="adminTopBar">
          <div className="adminPageHeading">
            <div className="adminPageLabel">
              Панель управления
            </div>

            <h1>{currentPage.title}</h1>

            <p>{currentPage.description}</p>
          </div>

          <div className="adminProfile">
            <div className="adminAvatar">A</div>

            <div className="adminProfileInfo">
              <h4>Администратор</h4>

              <span>
                {role === "creator"
                  ? "Создатель · полный доступ"
                  : "Администратор"}
              </span>
            </div>
          </div>
        </div>

        <div className="adminBody">{children}</div>
      </main>
    </div>
  );
}