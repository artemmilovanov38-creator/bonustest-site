import {
  FiGrid,
  FiUsers,
  FiCheckSquare,
  FiDollarSign,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiMessageCircle,
  FiHeadphones,
  FiX,
} from "react-icons/fi";

const menu = [
  {
    id: "dashboard",
    icon: <FiGrid />,
    title: "Обзор",
    roles: ["creator", "admin"],
  },
  {
    id: "users",
    icon: <FiUsers />,
    title: "Пользователи",
    roles: ["creator"],
  },
  {
    id: "reviews",
    icon: <FiCheckSquare />,
    title: "Проверка",
    roles: ["creator", "admin"],
  },
  {
    id: "withdraws",
    icon: <FiDollarSign />,
    title: "Выплаты",
    roles: ["creator", "admin"],
  },
  {
    id: "tasks",
    icon: <FiClipboard />,
    title: "Задания",
    roles: ["creator"],
  },
  {
    id: "support",
    icon: <FiHeadphones />,
    title: "Поддержка",
    roles: ["creator", "admin"],
  },
  {
    id: "team-chat",
    icon: <FiMessageCircle />,
    title: "Чат админов",
    roles: ["creator", "admin"],
  },
  {
    id: "settings",
    icon: <FiSettings />,
    title: "Настройки",
    roles: ["creator"],
  },
];

export default function Sidebar({
  role = "admin",
  activeTab,
  setActiveTab,
  onExit,
  isOpen = false,
  onClose,
}) {
  const visibleMenu = menu.filter((item) =>
    item.roles.includes(role)
  );

  const handleExit = () => {
    onClose?.();
    onExit?.();
  };

  return (
    <aside
      className={`sidebar ${
        isOpen ? "sidebarOpen" : ""
      }`}
    >
      <div className="sidebarHeader">
        <div className="sidebarLogo">
          <span>BONUS</span>
          <strong>TEST</strong>
        </div>

        <button
          type="button"
          className="sidebarClose"
          aria-label="Закрыть меню"
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>

      <div className="sidebarAccount">
        <div className="sidebarAccountAvatar">A</div>

        <div className="sidebarAccountInfo">
          <strong>Администратор</strong>

          <span>
            {role === "creator"
              ? "Полный доступ"
              : "Панель администратора"}
          </span>
        </div>
      </div>

      <div
        className={`sidebarRole ${
          role === "creator"
            ? "sidebarRoleCreator"
            : ""
        }`}
      >
        <span className="sidebarRoleDot" />

        {role === "creator"
          ? "Создатель"
          : "Администратор"}
      </div>

      <div className="sidebarSectionTitle">
        Навигация
      </div>

      <nav className="sidebarMenu">
        {visibleMenu.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              type="button"
              key={item.id}
              className={`sidebarItem ${
                isActive ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sidebarIcon">
                {item.icon}
              </span>

              <span className="sidebarItemTitle">
                {item.title}
              </span>

              {isActive && (
                <span className="sidebarActiveDot" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        <button
          type="button"
          className="sidebarExit"
          onClick={handleExit}
        >
          <span className="sidebarIcon">
            <FiLogOut />
          </span>

          <span>Вернуться в кабинет</span>
        </button>

        <div className="sidebarVersion">
          BONUSTEST Admin · v1.0
        </div>
      </div>
    </aside>
  );
}