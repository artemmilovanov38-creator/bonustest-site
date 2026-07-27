import {
  FiUsers,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiActivity,
  FiArrowUpRight,
} from "react-icons/fi";

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU").format(value || 0);
}

export default function AdminDashboard({ admin }) {
  const users = admin?.users || [];
  const tasks = admin?.tasks || [];
  const reviews = admin?.reviews || [];
  const withdraws = admin?.withdraws || [];

  const pendingWithdraws = withdraws.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedWithdraws = withdraws.filter(
    (item) => item.status === "approved"
  );

  const approvedWithdrawsSum = approvedWithdraws.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const pendingReviews = reviews.filter(
    (item) => item.status === "pending"
  ).length;

  const completedReviews = reviews.filter(
    (item) =>
      item.status === "approved" ||
      item.status === "completed"
  ).length;

  const activeTasks = tasks.filter(
    (item) =>
      item.is_active !== false &&
      item.status !== "hidden"
  ).length;

  const stats = [
    {
      id: "users",
      title: "Пользователи",
      value: users.length,
      description: "Всего аккаунтов",
      icon: <FiUsers />,
      type: "blue",
    },
    {
      id: "tasks",
      title: "Активные задания",
      value: activeTasks,
      description: `Всего заданий: ${tasks.length}`,
      icon: <FiClipboard />,
      type: "purple",
    },
    {
      id: "reviews",
      title: "Ждут проверки",
      value: pendingReviews,
      description: `Завершено: ${completedReviews}`,
      icon: <FiClock />,
      type: "orange",
    },
    {
      id: "withdraws",
      title: "Ждут выплаты",
      value: pendingWithdraws,
      description: `Всего заявок: ${withdraws.length}`,
      icon: <FiDollarSign />,
      type: "green",
    },
  ];

  const recentReviews = reviews.slice(0, 4);
  const recentWithdraws = withdraws.slice(0, 4);

  return (
    <div className="adminDashboard">
      <section className="adminDashboardHero">
        <div className="adminDashboardHeroContent">
          <div className="adminDashboardHeroBadge">
            <FiActivity />
            Система активна
          </div>

          <h2>Добро пожаловать в BONUSTEST</h2>

          <p>
            Следите за пользователями, заданиями,
            проверками и выплатами в одном месте.
          </p>
        </div>

        <div className="adminDashboardHeroMoney">
          <span>Всего выплачено</span>

          <strong>
            {formatMoney(approvedWithdrawsSum)} ₽
          </strong>

          <small>
            Одобрено заявок: {approvedWithdraws.length}
          </small>
        </div>
      </section>

      <section className="adminDashboardStats">
        {stats.map((item) => (
          <article
            key={item.id}
            className={`adminDashboardStat adminDashboardStat-${item.type}`}
          >
            <div className="adminDashboardStatTop">
              <div className="adminDashboardStatIcon">
                {item.icon}
              </div>

              <FiArrowUpRight className="adminDashboardStatArrow" />
            </div>

            <div className="adminDashboardStatValue">
              {item.value}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="adminDashboardColumns">
        <article className="adminDashboardPanel">
          <div className="adminDashboardPanelHeader">
            <div>
              <span>Последняя активность</span>
              <h2>Проверки заданий</h2>
            </div>

            <div className="adminDashboardPanelCount">
              {pendingReviews}
            </div>
          </div>

          <div className="adminDashboardList">
            {recentReviews.length === 0 ? (
              <div className="adminDashboardEmpty">
                <FiCheckCircle />

                <h3>Проверок пока нет</h3>

                <p>
                  Новые выполненные задания появятся здесь.
                </p>
              </div>
            ) : (
              recentReviews.map((review, index) => (
                <div
                  className="adminDashboardListItem"
                  key={review.id || index}
                >
                  <div className="adminDashboardListIcon">
                    <FiClipboard />
                  </div>

                  <div className="adminDashboardListInfo">
                    <strong>
                      {review.task_title ||
                        review.title ||
                        "Проверка задания"}
                    </strong>

                    <span>
                      {review.user_name ||
                        review.username ||
                        "Пользователь"}
                    </span>
                  </div>

                  <div
                    className={`adminDashboardStatus ${
                      review.status === "pending"
                        ? "pending"
                        : "success"
                    }`}
                  >
                    {review.status === "pending"
                      ? "Ожидает"
                      : "Проверено"}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="adminDashboardPanel">
          <div className="adminDashboardPanelHeader">
            <div>
              <span>Финансы</span>
              <h2>Последние выплаты</h2>
            </div>

            <div className="adminDashboardPanelCount">
              {pendingWithdraws}
            </div>
          </div>

          <div className="adminDashboardList">
            {recentWithdraws.length === 0 ? (
              <div className="adminDashboardEmpty">
                <FiDollarSign />

                <h3>Заявок пока нет</h3>

                <p>
                  Новые запросы на вывод появятся здесь.
                </p>
              </div>
            ) : (
              recentWithdraws.map((withdraw, index) => (
                <div
                  className="adminDashboardListItem"
                  key={withdraw.id || index}
                >
                  <div className="adminDashboardListIcon">
                    <FiDollarSign />
                  </div>

                  <div className="adminDashboardListInfo">
                    <strong>
                      {formatMoney(withdraw.amount)} ₽
                    </strong>

                    <span>
                      {withdraw.user_name ||
                        withdraw.username ||
                        "Пользователь"}
                    </span>
                  </div>

                  <div
                    className={`adminDashboardStatus ${
                      withdraw.status === "pending"
                        ? "pending"
                        : "success"
                    }`}
                  >
                    {withdraw.status === "pending"
                      ? "Ожидает"
                      : "Выплачено"}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="adminDashboardSystem">
        <div className="adminDashboardSystemIcon">
          <FiCheckCircle />
        </div>

        <div>
          <h3>Все системы работают стабильно</h3>

          <p>
            Данные пользователей, заданий, проверок и
            выплат загружены.
          </p>
        </div>

        <div className="adminDashboardOnline">
          <span />
          Онлайн
        </div>
      </section>
    </div>
  );
}