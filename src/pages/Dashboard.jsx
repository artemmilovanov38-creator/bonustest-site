import { useState } from "react";
import { getStatusText } from "../utils/status";
import SupportButton from "../components/SupportButton";

function getTaskIcon(title = "") {
  const text = title.toLowerCase();

  if (text.includes("telegram")) return "✈️";
  if (text.includes("тг")) return "✈️";
  if (text.includes("vk")) return "🔵";
  if (text.includes("вк")) return "🔵";
  if (text.includes("youtube")) return "▶️";
  if (text.includes("ютуб")) return "▶️";
  if (text.includes("tiktok")) return "🎵";
  if (text.includes("тикток")) return "🎵";
  if (text.includes("instagram")) return "📷";
  if (text.includes("инст")) return "📷";
  if (text.includes("сайт")) return "🌐";
  if (text.includes("регистра")) return "👤";

  return "⭐";
}

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
const [openedTasks, setOpenedTasks] = useState({});

const approvedHistory = taskHistory.filter(
  (item) => item.status === "approved" || item.rewarded === true
);


const availableTasks = tasks.filter((task) => {
  const status = taskHistory.find(
    (item) => item.task_id === task.id
  )?.status;

  return (
    status !== "approved" &&
    status !== "pending"
  );
});

  return (
    
    <div className="userDashboard">
      
      <header className="userTopbar">
        <div>
          <span>Личный кабинет</span>

<h1>
  👋 Здравствуйте, {user.name || user.email}
</h1>

<p className="userEmail">
  {user.email}
</p>
        </div>

        <div className="userTopActions">
          <div className="syncStatus">
  🟢 Автообновление
</div>
          {isAdmin && (
            <button
              className="secondaryBtn"
              onClick={() => {
  localStorage.setItem("isAdminPanel", "true");
  setIsAdminPanel(true);
}}
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
  {availableTasks.length === 0 ? (
    <div className="emptyTasks">
      <div className="emptyIcon">🎉</div>

      <h2>Все задания выполнены</h2>

      <p>
        Сейчас для вас нет доступных заданий.
        Загляните позже — скоро появятся новые.
      </p>
    </div>
  ) : (
    availableTasks.map((task) => (
        <div
  className={`userTaskCard taskCardV2 ${
    openedTasks[task.id] ? "opened" : "collapsed"
  } ${task.is_hot ? "hotTaskCard" : ""}`}
  key={task.id}
>
  <div className="taskCardHead">
  <div className="taskBadges">
    <span className="taskDifficulty">
      {task.difficulty === "Сложное"
        ? "🔴 Сложное"
        : task.difficulty === "Среднее"
        ? "🟡 Среднее"
        : "🟢 Простое"}
    </span>

    <span className="taskTime">
      ⏱ {task.estimated_time || "2 минуты"}
    </span>
  </div>

  <span className="taskRewardBox">
    +{task.reward} ₽
  </span>
</div>

  <div className="taskTitleRow">
    <div className={`taskIcon ${task.is_hot ? "hotTaskIcon" : ""}`}>
  {task.is_hot ? "🔥" : getTaskIcon(task.title)}
</div>

    <div className="taskMainInfo">
      <h3>{task.title}</h3>

      <p className="taskDescriptionPreview">
        {task.description}
      </p>
    </div>
  </div>

  <button
    type="button"
    className="taskOpenBtn"
    onClick={() =>
      setOpenedTasks((prev) => ({
        ...prev,
        [task.id]: !prev[task.id],
      }))
    }
  >
    {openedTasks[task.id]
      ? "▲ Свернуть задание"
      : "▼ Открыть задание"}
  </button>
 

  {openedTasks[task.id] && (
    <div className="taskExpandedContent">
      {task.description && (
        <div className="taskFullDescription">
          <h4>Описание</h4>
          <p>{task.description}</p>
        </div>
      )}
      {task.instruction && (
  <div className="taskInstructionBlock">
    <h4>Подробная инструкция</h4>

    <div className="taskInstruction">
      {task.instruction}
    </div>
  </div>
)}

     

      {task.task_link && (
        <a
          href={task.task_link}
          target="_blank"
          rel="noopener noreferrer"
          className="taskStartBtn"
        >
          🚀 Выполнить задание
        </a>
      )}

      <div className="taskUploadBlock">
        <span>📎 Скриншот выполнения</span>

        {!completedTasks.includes(task.id) && (
          <label
            className={`fileUploadV2 ${
              proofFiles[task.id] ? "hasFile" : ""
            }`}
          >
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

            {proofFiles[task.id]
              ? `✅ ${proofFiles[task.id].name}`
              : "Прикрепить файл"}
          </label>
        )}
      </div>

      {(() => {
        const taskStatus = taskHistory.find(
          (item) => item.task_id === task.id
        )?.status;

        return (
          <button
            className="primaryBtn taskSubmitBtn"
            disabled={
              taskStatus === "pending" ||
              taskStatus === "approved"
            }
            onClick={() => completeTask(task)}
          >
            {taskStatus === "pending"
              ? "🟡 На проверке"
              : taskStatus === "approved"
              ? "✅ Выполнено"
              : "Отправить на проверку"}
          </button>
        );
      })()}
    </div>
  )}
</div>
          ))
)}
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
<SupportButton user={user} />
    </div>
  );
}