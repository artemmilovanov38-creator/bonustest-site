import { useState } from "react";
import { getStatusText } from "../utils/status";

export default function Dashboard({
  user,
  balance,
  tasks,
  completedTasks,
  proofFiles,
  setProofFiles,
  completeTask,
  taskHistory,
  withdrawHistory,
  showWithdraw,
  setShowWithdraw,
  withdrawAmount,
  setWithdrawAmount,
  withdrawWallet,
  setWithdrawWallet,
  createWithdrawRequest,
  siteSettings,
  isAdmin,
  setIsAdminPanel,
  loadTasks,
  loadTaskHistory,
  loadWithdrawHistory,
  loadSiteStats,
  signOutUser,
}) {
  const approvedTasks = taskHistory.filter(
    (item) => item.status === "approved"
  );

  const pendingTasks = taskHistory.filter(
    (item) => item.status === "pending"
  );

  const totalEarned = approvedTasks.reduce(
    (sum, item) => sum + Number(item.task?.reward || 0),
    0
  );

  const [activeTab, setActiveTab] = useState("tasks");

const approvedHistory = taskHistory.filter(
  (item) => item.status === "approved"
);

  return (
    <div className="userDashboard">
      
      <header className="userTopbar">
        <div>
          <span>Личный кабинет</span>
          <h1>{user.email}</h1>
        </div>

        <div className="userTopActions">
          <div className="syncStatus">
  🟢 Автообновление
</div>
          {isAdmin && (
            <button
              className="secondaryBtn"
              onClick={() => setIsAdminPanel(true)}
            >
              Админка
            </button>
          )}

          <button className="primaryBtn" onClick={signOutUser}>
            Выйти
          </button>
        </div>
      </header>

      <section className="userStatsGrid">
        <div className="userStatCard balance">
          <span>Баланс</span>
          <h2>{balance} ₽</h2>
          <p>Доступно к выводу</p>
        </div>

        <div className="userStatCard">
          <span>Заработано</span>
          <h2>{totalEarned} ₽</h2>
          <p>Всего одобрено</p>
        </div>

        <div className="userStatCard">
          <span>На проверке</span>
          <h2>{pendingTasks.length}</h2>
          <p>Ожидают модерации</p>
        </div>

        <div className="userStatCard">
          <span>Заданий</span>
          <h2>{tasks.length}</h2>
          <p>Доступно сейчас</p>
        </div>
      </section>

      <section className="dashboardActions">
        <button
          className="primaryBtn"
          onClick={() => {
            document
              .querySelector("#availableTasks")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Заработать
        </button>

        <button
          className="secondaryBtn"
          onClick={() => setShowWithdraw(true)}
        >
          Вывести
        </button>

       
      </section>

      <div className="cabinetTabs">
  <button
    className={activeTab === "tasks" ? "active" : ""}
    onClick={() => setActiveTab("tasks")}
  >
    Задания
  </button>

  <button
    className={activeTab === "history" ? "active" : ""}
    onClick={() => setActiveTab("history")}
  >
    История
  </button>

  <button
    className={activeTab === "done" ? "active" : ""}
    onClick={() => setActiveTab("done")}
  >
    Выполненные
  </button>

  <button
    className={activeTab === "withdraws" ? "active" : ""}
    onClick={() => setActiveTab("withdraws")}
  >
    Выводы
  </button>
</div>

{activeTab === "tasks" && (

      <section className="userSection" id="availableTasks">
        <div className="sectionHead">
          <h2>Доступные задания</h2>
          <p>Прикрепите скриншот и отправьте на проверку.</p>
        </div>

        <div className="taskGrid">
          {tasks.map((task) => (
            <div className="userTaskCard" key={task.id}>
              <div>
                <span className="taskTag">Задание</span>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
              </div>

              <div className="taskRewardBox">
                +{task.reward} ₽
              </div>

              {!completedTasks.includes(task.id) && (
                <label className={`fileUpload ${proofFiles[task.id] ? "hasFile" : ""}`}>
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setProofFiles({
        ...proofFiles,
        [task.id]: e.target.files[0],
      })
    }
  />

  <span className="fileUploadIcon">
    {proofFiles[task.id] ? "✅" : "📎"}
  </span>

  <span>
    {proofFiles[task.id]
      ? proofFiles[task.id].name
      : "Прикрепить скриншот"}
  </span>
</label>
              )}

              <button
                className="primaryBtn"
                disabled={completedTasks.includes(task.id)}
                onClick={() => completeTask(task)}
              >
                {completedTasks.includes(task.id)
                  ? "На проверке"
                  : "Отправить"}
              </button>
            </div>
          ))}
        </div>
      </section>

      )}

{activeTab === "history" && (
      <section className="userSection">
        <div className="sectionHead">
          <h2>История заданий</h2>
          <p>Статусы ваших отправленных заданий.</p>
        </div>

        <div className="historyTimeline">
  {taskHistory.length === 0 ? (
    <div className="emptyBox">
      Вы ещё не выполняли задания
    </div>
  ) : (
    taskHistory.map((item) => (
      <div
        className={`historyCard ${item.status}`}
        key={item.id}
      >
        <div>
          <h3>{item.task?.title}</h3>
          <p>{getStatusText(item.status || "pending")}</p>
        </div>

        <strong>
          {item.status === "approved"
            ? `+${item.task?.reward || 0} ₽`
            : "Ожидает"}
        </strong>
      </div>
    ))
  )}
</div>
      </section>

)}

{activeTab === "done" && (
  <section className="userSection">
    <div className="sectionHead">
      <h2>Выполненные задания</h2>
      <p>Задания, которые были одобрены модератором.</p>
    </div>

    <div className="historyTimeline">
      {approvedHistory.length === 0 ? (
        <div className="emptyBox">
          Одобренных заданий пока нет
        </div>
      ) : (
        approvedHistory.map((item) => (
          <div
            className={`historyCard ${item.status}`}
            key={item.id}
          >
            <div>
              <h3>{item.task?.title}</h3>
              <p>{getStatusText(item.status || "approved")}</p>
            </div>

            <strong>
              +{item.task?.reward || 0} ₽
            </strong>
          </div>
        ))
      )}
    </div>
  </section>
)}


{activeTab === "withdraws" && (
      <section className="userSection">
        <div className="sectionHead">
          <h2>История выводов</h2>
          <p>Все ваши заявки на вывод средств.</p>
        </div>

       <div className="withdrawTimeline">
  {withdrawHistory.length === 0 ? (
    <div className="emptyBox">
      Заявок на вывод пока нет
    </div>
  ) : (
    withdrawHistory.map((item) => (
      <div
        className={`withdrawCard ${item.status}`}
        key={item.id}
      >
        <div>
          <h3>{item.amount} ₽</h3>
          <p>{item.wallet}</p>
        </div>

        <strong>{getStatusText(item.status)}</strong>
      </div>
    ))
  )}
</div>
      </section>

      )}

      {showWithdraw && (
  <div className="modal">
    <div className="withdrawModal">
      <button
        className="close"
        onClick={() => setShowWithdraw(false)}
      >
        ×
      </button>

      <div className="withdrawIcon">💸</div>

      <h2>Вывод средств</h2>

      <p className="withdrawHint">
        Минимальная сумма вывода:{" "}
        <strong>{siteSettings.min_withdraw || 0} ₽</strong>
      </p>

      <input
        className="authInput"
        placeholder="Сумма вывода"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
      />

      <input
        className="authInput"
        placeholder="Telegram @username"
        value={withdrawWallet}
        onChange={(e) => setWithdrawWallet(e.target.value)}
      />

      <button
        className="primaryBtn authSubmit"
        onClick={createWithdrawRequest}
      >
        Отправить заявку
      </button>
    </div>
  </div>
)}
    </div>
  );
}