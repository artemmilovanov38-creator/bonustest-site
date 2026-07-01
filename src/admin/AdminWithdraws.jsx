import { updateWithdrawStatusApi } from "../services/api";
import { getStatusText } from "../utils/status";

export default function AdminWithdraws({ admin }) {
  if (admin.loading) {
    return <h2>Загрузка...</h2>;
  }

  return (
    <>
      <div className="pageHeader">
        <h1>Выплаты</h1>
      </div>

      <div className="usersGrid">
        {admin.withdraws.map((item) => (
          <div className="userCard" key={item.id}>
            <h3>{item.email}</h3>

            <p>
              Сумма: <strong>{item.amount} ₽</strong>
            </p>

            <p>Кошелёк: {item.wallet}</p>

            <p>Статус: {getStatusText(item.status)}</p>

            {item.status === "pending" && (
              <div className="reviewButtons">
                <button
                  className="primaryBtn"
                  onClick={async () => {
                    await updateWithdrawStatusApi(item.id, "approved");
                    admin.reload();
                  }}
                >
                  Одобрить
                </button>

                <button
                  className="secondaryBtn"
                  onClick={async () => {
                    await updateWithdrawStatusApi(item.id, "rejected");
                    admin.reload();
                  }}
                >
                  Отклонить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}