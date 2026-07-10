import Sidebar from "../layout/Sidebar";


export default function AdminLayout({
  role,
  activeTab,
  setActiveTab,
  children,
  onExit,
})
 {
  
  
  return (
    <div className="adminLayout">

      <Sidebar
  role={role}
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
              <span>
  {role === "creator"
    ? "Создатель · полный доступ"
    : "Администратор"}
</span>
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