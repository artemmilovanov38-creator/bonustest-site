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
  return (
    <div className="dashboard">
      <div className="dashboardHeader">
        <h1>Личный кабинет</h1>

        <div className="heroButtons">
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
      </div>

      <div className="dashboardCard">
        <h2>{user.email}</h2>
        <p>Баланс: {balance} ₽</p>

        <div className="heroButtons">
          <button className="primaryBtn">Заработать</button>

          <button
            className="secondaryBtn"
            onClick={() => setShowWithdraw(true)}
          >
            Вывести
          </button>

          <button
            className="secondaryBtn"
            onClick={() => {
              loadTasks();
              loadTaskHistory(user.id);
              loadWithdrawHistory(user.id);
              loadSiteStats();
            }}
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      <div className="tasksSection">
        <h2>История заданий</h2>

        {taskHistory.length === 0 ? (
          <p>Вы ещё не выполняли задания</p>
        ) : (
          taskHistory.map((item) => (
            <div className="taskCard" key={item.id}>
              <div className="taskInfo">
                <h3>{item.task?.title}</h3>

                <p>
                  Статус: {getStatusText(item.status || "pending")}
                </p>

                <div className="taskReward">
                  {item.status === "approved"
                    ? `Начислено: +${item.task?.reward || 0} ₽`
                    : "Ожидает проверки"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="tasksSection">
        <h2>История выводов</h2>

        {withdrawHistory.length === 0 ? (
          <p>Заявок на вывод пока нет</p>
        ) : (
          withdrawHistory.map((item) => (
            <div className="taskCard" key={item.id}>
              <div className="taskInfo">
                <h3>Вывод: {item.amount} ₽</h3>
                <p>Кошелёк: {item.wallet}</p>
                <div className="taskReward">
                  Статус: {getStatusText(item.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="tasksSection">
        <h2>Доступные задания</h2>

        {tasks.map((task) => (
          <div className="taskCard" key={task.id}>
            <div className="taskInfo">
              <h3>{task.title}</h3>
              <p>{task.description}</p>

              <div className="taskReward">
                Награда: +{task.reward} ₽
              </div>
            </div>

            {!completedTasks.includes(task.id) && (
              <input
                className="authInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProofFiles({
                    ...proofFiles,
                    [task.id]: e.target.files[0],
                  })
                }
              />
            )}

            <button
              className="primaryBtn"
              disabled={completedTasks.includes(task.id)}
              onClick={() => completeTask(task)}
            >
              {completedTasks.includes(task.id)
                ? "🟡 На проверке"
                : "Выполнить"}
            </button>
          </div>
        ))}
      </div>

      {showWithdraw && (
        <div className="modal">
          <div className="authBox">
            <button
              className="close"
              onClick={() => setShowWithdraw(false)}
            >
              ×
            </button>

            <h2>Вывод средств</h2>

            <p>
              Минимальная сумма вывода:{" "}
              {siteSettings.min_withdraw || 0} ₽
            </p>

            <input
              className="authInput"
              placeholder="Сумма"
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