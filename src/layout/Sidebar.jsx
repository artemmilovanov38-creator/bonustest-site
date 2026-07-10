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
} from "react-icons/fi";

const menu = [
  {
    id: "dashboard",
    icon: <FiGrid />,
    title: "Dashboard",
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
}) {
  const visibleMenu = menu.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebarLogo">
        <span>BONUS</span>
        <strong>TEST</strong>
      </div>

      <div className="sidebarRole">
        {role === "creator" ? "👑 Создатель" : "🛡 Администратор"}
      </div>

      <nav className="sidebarMenu">
        {visibleMenu.map((item) => (
          <button
            key={item.id}
            className={`sidebarItem ${
              activeTab === item.id ? "active" : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebarIcon">
              {item.icon}
            </span>

            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      <button
        className="sidebarExit"
        onClick={onExit}
      >
        <FiLogOut />
        <span>Вернуться в кабинет</span>
      </button>
    </aside>
  );
}