import { useMemo, useState } from "react";
import { getStatusText } from "../utils/status";
import SupportButton from "../components/SupportButton";
import "../styles/dashboard.css";

function getTaskIcon(title = "") {
  const text = title.toLowerCase();

  if (text.includes("telegram") || text.includes("тг")) return "✈️";
  if (text.includes("vk") || text.includes("вк")) return "VK";
  if (text.includes("youtube") || text.includes("ютуб")) return "▶";
  if (text.includes("tiktok") || text.includes("тикток")) return "♪";
  if (text.includes("instagram") || text.includes("инст")) return "◉";
  if (text.includes("сайт")) return "⌁";
  if (text.includes("регистра")) return "＋";

  return "✦";
}

function getDifficultyLabel(difficulty) {
  if (difficulty === "Сложное") return "Сложное";
  if (difficulty === "Среднее") return "Среднее";
  return "Простое";
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
  signOutUser,
}) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [openedTasks, setOpenedTasks] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const approvedTasks = useMemo(
    () =>
      taskHistory.filter(
        (item) => item.status === "approved" || item.rewarded === true
      ),
    [taskHistory]
  );

  const pendingTasks = useMemo(
    () => taskHistory.filter((item) => item.status === "pending"),
    [taskHistory]
  );

  const totalEarned = useMemo(
    () =>
      approvedTasks.reduce(
        (sum, item) => sum + Number(item.task?.reward || 0),
        0
      ),
    [approvedTasks]
  );

  const availableTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const status = taskHistory.find(
          (item) => item.task_id === task.id
        )?.status;

        return status !== "approved" && status !== "pending";
      }),
    [tasks, taskHistory]
  );

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Пользователь";

  const tabs = [
    { id: "tasks", label: "Задания", count: availableTasks.length },
    { id: "history", label: "История", count: taskHistory.length },
    { id: "done", label: "Выполнено", count: approvedTasks.length },
    { id: "withdraws", label: "Выводы", count: withdrawHistory.length },
  ];

  return (
    <div className="luxDashboard">
      <div className="luxDashboardBackdrop" aria-hidden="true">
        <div className="luxDashboardGlow luxDashboardGlowBlue" />
        <div className="luxDashboardGlow luxDashboardGlowPink" />
        <div className="luxDashboardGrid" />
      </div>

      <header className="luxTopbar">
        <button
  type="button"
  className="luxMobileMenuButton"
  onClick={() => setMobileMenuOpen(true)}
  aria-label="Открыть меню"
>
  <span />
  <span />
  <span />
</button>
        <div className="luxBrandBlock">
          <div className="luxBrandMark">B</div>

          <div>
            <span>Личный кабинет</span>
            <strong>{userName}</strong>
          </div>
        </div>

        <div className="luxTopActions">
          <div className="luxLiveStatus">
            <span />
            Автообновление
          </div>

          {isAdmin && (
            <button
              className="luxGhostButton"
              type="button"
              onClick={() => {
                localStorage.setItem("isAdminPanel", "true");
                setIsAdminPanel(true);
              }}
            >
              Админка
            </button>
          )}

          <button
            className="luxExitButton"
            type="button"
            onClick={signOutUser}
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="luxDashboardMain">
        <section className="luxHeroPanel">
          <div className="luxBalanceHero">
            <div className="luxBalanceTopline">
              <span>Доступный баланс</span>

              <button
                type="button"
                className="luxMiniAction"
                onClick={() => setShowWithdraw(true)}
              >
                Вывести
                <span aria-hidden="true">↗</span>
              </button>
            </div>

            <strong>{Number(balance || 0).toLocaleString("ru-RU")} ₽</strong>

            <p>
              Средства, доступные для создания заявки на вывод.
            </p>

            <div className="luxBalanceActions">
              <button
                type="button"
                className="luxPrimaryAction"
                onClick={() => {
                  setActiveTab("tasks");
                  setTimeout(() => {
                    document
                      .querySelector("#availableTasks")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
              >
                Найти задание
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="luxSecondaryAction"
                onClick={() => setShowWithdraw(true)}
              >
                Создать вывод
              </button>
            </div>
          </div>

          <div className="luxMetricsPanel">
            <article>
              <span>Заработано</span>
              <strong>{totalEarned.toLocaleString("ru-RU")} ₽</strong>
              <p>Сумма одобренных заданий</p>
            </article>

            <article>
              <span>На проверке</span>
              <strong>{pendingTasks.length}</strong>
              <p>Ожидают решения модератора</p>
            </article>

            <article>
              <span>Доступно</span>
              <strong>{availableTasks.length}</strong>
              <p>Заданий можно выполнить сейчас</p>
            </article>
          </div>
        </section>

        <section className="luxContentShell">
          <div className="luxTabs" role="tablist" aria-label="Разделы кабинета">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <b>{tab.count}</b>
              </button>
            ))}
          </div>

          {activeTab === "tasks" && (
            <section className="luxSection" id="availableTasks">
              <div className="luxSectionHeader">
                <div>
                  <span>Доступные задания</span>
                  <h2>Выберите следующее действие</h2>
                  <p>
                    Откройте задание, выполните его и отправьте подтверждение.
                  </p>
                </div>

                <div className="luxSectionCount">
                  {availableTasks.length} доступно
                </div>
              </div>

              {availableTasks.length === 0 ? (
                <div className="luxEmptyState">
                  <div className="luxEmptyIcon">✓</div>
                  <h3>Все задания выполнены</h3>
                  <p>
                    Сейчас нет новых заданий. Загляните позже.
                  </p>
                </div>
              ) : (
                <div className="luxTaskGrid">
                  {availableTasks.map((task) => {
                    const isOpened = Boolean(openedTasks[task.id]);
                    const taskStatus = taskHistory.find(
                      (item) => item.task_id === task.id
                    )?.status;

                    return (
                      <article
                        className={`luxTaskCard ${
                          task.is_hot ? "luxTaskCardHot" : ""
                        } ${isOpened ? "luxTaskCardOpened" : ""}`}
                        key={task.id}
                      >
                        <div className="luxTaskCardTop">
                          <div className="luxTaskIdentity">
                            <div className="luxTaskIcon">
                              {task.is_hot ? "🔥" : getTaskIcon(task.title)}
                            </div>

                            <div>
                              <span>{getDifficultyLabel(task.difficulty)}</span>
                              <h3>{task.title}</h3>
                            </div>
                          </div>

                          <div className="luxReward">
                            +{task.reward} ₽
                          </div>
                        </div>

                        <p className="luxTaskDescription">
                          {task.description}
                        </p>

                        <div className="luxTaskMeta">
                          <span>{task.estimated_time || "2 минуты"}</span>
                          <span>{task.is_hot ? "Приоритетное" : "Обычное"}</span>
                        </div>

                        <button
                          type="button"
                          className="luxTaskToggle"
                          onClick={() =>
                            setOpenedTasks((prev) => ({
                              ...prev,
                              [task.id]: !prev[task.id],
                            }))
                          }
                        >
                          <span>
                            {isOpened ? "Свернуть" : "Открыть задание"}
                          </span>
                          <span aria-hidden="true">
                            {isOpened ? "↑" : "↓"}
                          </span>
                        </button>

                        {isOpened && (
                          <div className="luxTaskExpanded">
                            {task.instruction && (
                              <div className="luxTaskInfoBlock">
                                <span>Инструкция</span>
                                <p>{task.instruction}</p>
                              </div>
                            )}

                            {task.task_link && (
                              <a
                                className="luxTaskLink"
                                href={task.task_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Перейти к заданию
                                <span aria-hidden="true">↗</span>
                              </a>
                            )}

                            <div className="luxUploadBlock">
                              <span>Подтверждение выполнения</span>

                              {!completedTasks.includes(task.id) && (
                                <label
                                  className={`luxFileUpload ${
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

                                  <strong>
                                    {proofFiles[task.id]
                                      ? proofFiles[task.id].name
                                      : "Выбрать скриншот"}
                                  </strong>

                                  <span>
                                    {proofFiles[task.id]
                                      ? "Файл готов к отправке"
                                      : "PNG, JPG или WEBP"}
                                  </span>
                                </label>
                              )}
                            </div>

                            <button
                              className="luxSubmitTask"
                              type="button"
                              disabled={
                                taskStatus === "pending" ||
                                taskStatus === "approved"
                              }
                              onClick={() => completeTask(task)}
                            >
                              {taskStatus === "pending"
                                ? "На проверке"
                                : taskStatus === "approved"
                                ? "Выполнено"
                                : "Отправить на проверку"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "history" && (
            <section className="luxSection">
              <div className="luxSectionHeader">
                <div>
                  <span>История</span>
                  <h2>Все отправленные задания</h2>
                  <p>Следите за ходом проверки и результатами.</p>
                </div>
              </div>

              {taskHistory.length === 0 ? (
                <div className="luxEmptyState">
                  <div className="luxEmptyIcon">⌁</div>
                  <h3>История пока пустая</h3>
                  <p>После отправки задания оно появится здесь.</p>
                </div>
              ) : (
                <div className="luxTimeline">
                  {taskHistory.map((item) => (
                    <article
                      className={`luxTimelineItem ${item.status}`}
                      key={item.id}
                    >
                      <div className="luxTimelineDot" />

                      <div className="luxTimelineMain">
                        <span>{getStatusText(item.status || "pending")}</span>
                        <h3>{item.task?.title || "Задание"}</h3>
                      </div>

                      <strong>
                        {item.status === "approved"
                          ? `+${item.task?.reward || 0} ₽`
                          : "Ожидает"}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "done" && (
            <section className="luxSection">
              <div className="luxSectionHeader">
                <div>
                  <span>Выполнено</span>
                  <h2>Одобренные задания</h2>
                  <p>Все задания, за которые уже начислен бонус.</p>
                </div>
              </div>

              {approvedTasks.length === 0 ? (
                <div className="luxEmptyState">
                  <div className="luxEmptyIcon">✓</div>
                  <h3>Пока нет одобренных заданий</h3>
                  <p>Выполните первое задание, чтобы оно появилось здесь.</p>
                </div>
              ) : (
                <div className="luxTimeline">
                  {approvedTasks.map((item) => (
                    <article
                      className="luxTimelineItem approved"
                      key={item.id}
                    >
                      <div className="luxTimelineDot" />

                      <div className="luxTimelineMain">
                        <span>{getStatusText(item.status || "approved")}</span>
                        <h3>{item.task?.title || "Задание"}</h3>
                      </div>

                      <strong>+{item.task?.reward || 0} ₽</strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "withdraws" && (
            <section className="luxSection">
              <div className="luxSectionHeader">
                <div>
                  <span>Выводы</span>
                  <h2>Заявки на вывод средств</h2>
                  <p>Отслеживайте сумму, реквизиты и статус заявки.</p>
                </div>

                <button
                  type="button"
                  className="luxMiniAction"
                  onClick={() => setShowWithdraw(true)}
                >
                  Новый вывод
                </button>
              </div>

              {withdrawHistory.length === 0 ? (
                <div className="luxEmptyState">
                  <div className="luxEmptyIcon">₽</div>
                  <h3>Заявок пока нет</h3>
                  <p>Создайте первую заявку на вывод средств.</p>
                </div>
              ) : (
                <div className="luxWithdrawList">
                  {withdrawHistory.map((item) => (
                    <article
                      className={`luxWithdrawItem ${item.status}`}
                      key={item.id}
                    >
                      <div>
                        <span>{getStatusText(item.status)}</span>
                        <h3>{Number(item.amount || 0).toLocaleString("ru-RU")} ₽</h3>
                        <p>{item.wallet}</p>
                      </div>

                      <div className="luxWithdrawBadge">
                        {getStatusText(item.status)}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </main>

      {showWithdraw && (
        <div className="luxModalOverlay">
          <div className="luxWithdrawModal">
            <button
              className="luxModalClose"
              type="button"
              onClick={() => setShowWithdraw(false)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="luxModalIcon">₽</div>

            <span>Вывод средств</span>
            <h2>Создать заявку</h2>

            <p>
              Минимальная сумма:{" "}
              <strong>{siteSettings.min_withdraw || 0} ₽</strong>
            </p>

            <label className="luxField">
              <span>Сумма</span>
              <input
                inputMode="decimal"
                placeholder="Например, 500"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </label>

            <label className="luxField">
              <span>Telegram</span>
              <input
                placeholder="@username"
                value={withdrawWallet}
                onChange={(e) => setWithdrawWallet(e.target.value)}
              />
            </label>

            <button
              className="luxSubmitWithdraw"
              type="button"
              onClick={createWithdrawRequest}
            >
              Отправить заявку
            </button>
          </div>
        </div>
      )}
{mobileMenuOpen && (
  <div
    className="luxMobileMenuOverlay"
    onClick={() => setMobileMenuOpen(false)}
  >
    <aside
      className="luxMobileMenu"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="luxMobileMenuHeader">
        <div className="luxMobileMenuUser">
          <div className="luxMobileMenuAvatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{userName}</strong>
            <span>Личный кабинет</span>
          </div>
        </div>

        <button
          type="button"
          className="luxMobileMenuClose"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Закрыть меню"
        >
          ×
        </button>
      </div>

      <nav className="luxMobileNavigation">
        <button
          type="button"
          onClick={() => {
            setActiveTab("tasks");
            setMobileMenuOpen(false);
          }}
        >
          <span>Задания</span>
          <strong>{availableTasks.length}</strong>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("history");
            setMobileMenuOpen(false);
          }}
        >
          <span>История</span>
          <strong>{taskHistory.length}</strong>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("done");
            setMobileMenuOpen(false);
          }}
        >
          <span>Выполнено</span>
          <strong>{approvedTasks.length}</strong>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("withdraws");
            setMobileMenuOpen(false);
          }}
        >
          <span>Выводы</span>
          <strong>{withdrawHistory.length}</strong>
        </button>
      </nav>

      <div className="luxMobileMenuFooter">
        {isAdmin && (
          <button
            type="button"
            className="luxMobileAdminButton"
            onClick={() => {
              localStorage.setItem("isAdminPanel", "true");
              setIsAdminPanel(true);
              setMobileMenuOpen(false);
            }}
          >
            Админка
            <span>→</span>
          </button>
        )}

        <button
          type="button"
          className="luxMobileLogoutButton"
          onClick={signOutUser}
        >
          Выйти
        </button>
      </div>
    </aside>
  </div>
)}
      <SupportButton user={user} />
    </div>
  );
}