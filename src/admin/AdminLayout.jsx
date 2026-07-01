import Sidebar from "../layout/Sidebar";

export default function AdminLayout({
  activeTab,
  setActiveTab,
  children,
  onExit,
}) {
  return (
    <div className="adminLayout">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExit={onExit}
      />

      <main className="adminContent">

        <div className="adminTopBar">

          <div>
            <h1>Админ-панель</h1>
            <p>Управление платформой BONUSTEST</p>
          </div>

          <div className="adminProfile">

            <div className="adminAvatar">
              A
            </div>

            <div>
              <h4>Администратор</h4>
              <span>Полный доступ</span>
            </div>

          </div>

        </div>

        <div className="adminBody">
          {children}
        </div>

      </main>

    </div>
  );
}