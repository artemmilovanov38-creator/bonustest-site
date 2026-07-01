export default function AdminDashboard({ admin }) {
  const pendingWithdraws = admin.withdraws.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedWithdrawsSum = admin.withdraws
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const pendingReviews = admin.reviews.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <>
      <div className="pageHeader">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboardGrid">
        <div className="dashboardStat">
          <span>Пользователи</span>
          <h2>{admin.users.length}</h2>
        </div>

        <div className="dashboardStat">
          <span>Задания</span>
          <h2>{admin.tasks.length}</h2>
        </div>

        <div className="dashboardStat">
          <span>Проверки заданий</span>
          <h2>{pendingReviews}</h2>
        </div>

        <div className="dashboardStat">
          <span>Заявки на вывод</span>
          <h2>{pendingWithdraws}</h2>
        </div>

        <div className="dashboardStat">
          <span>Всего выплат</span>
          <h2>{approvedWithdrawsSum} ₽</h2>
        </div>

        <div className="dashboardStat">
          <span>Всего заявок</span>
          <h2>{admin.withdraws.length}</h2>
        </div>
      </div>

      <div className="dashboardWelcome">
        <h2>Система работает</h2>
        <p>
          Здесь отображается актуальная статистика по пользователям, заданиям,
          проверкам и выплатам.
        </p>
      </div>
    </>
  );
}