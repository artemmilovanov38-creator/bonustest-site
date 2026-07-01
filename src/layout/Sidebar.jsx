import {
  FiGrid,
  FiUsers,
  FiCheckSquare,
  FiDollarSign,
  FiClipboard,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const menu = [
  {
    id: "dashboard",
    icon: <FiGrid />,
    title: "Dashboard",
  },
  {
    id: "users",
    icon: <FiUsers />,
    title: "Пользователи",
  },
  {
    id: "reviews",
    icon: <FiCheckSquare />,
    title: "Проверка",
  },
  {
    id: "withdraws",
    icon: <FiDollarSign />,
    title: "Выплаты",
  },
  {
    id: "tasks",
    icon: <FiClipboard />,
    title: "Задания",
  },
  {
    id: "settings",
    icon: <FiSettings />,
    title: "Настройки",
  },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  onExit,
}) {
  return (
    <aside className="sidebar">

      <div className="sidebarLogo">
        <span>BONUS</span>
        <strong>TEST</strong>
      </div>

      <nav className="sidebarMenu">

        {menu.map((item) => (
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