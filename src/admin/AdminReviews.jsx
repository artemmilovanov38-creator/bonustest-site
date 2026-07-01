import {
  updateTaskReview,
  updateUserBalance,
} from "../services/api";

export default function AdminReviews({ admin }) {
  if (admin.loading) {
    return <h2>Загрузка...</h2>;
  }

  return (
    <div className="usersGrid">
      {admin.reviews.map((item) => (
        <div
          className="userCard"
          key={item.id}
        >
          <h3>
            {item.task?.title}
          </h3>

          <p>
            {item.dbUser?.email}
          </p>

          <p>
            Награда:
            <strong>
              {" "}
              {item.task?.reward} ₽
            </strong>
          </p>

          {item.proof_url && (
            <img
              src={item.proof_url}
              alt=""
              className="proofImage"
              onClick={() =>
                window.open(
                  item.proof_url,
                  "_blank"
                )
              }
            />
          )}

          <div className="reviewButtons">
            <button
              className="primaryBtn"
              onClick={async () => {
                await updateTaskReview(
                  item.id,
                  "approved"
                );

                await updateUserBalance(
                  item.dbUser.id,
                  Number(
                    item.dbUser.balance
                  ) +
                    Number(
                      item.task.reward
                    )
                );

                admin.reload();
              }}
            >
              Одобрить
            </button>

            <button
              className="secondaryBtn"
              onClick={async () => {
                await updateTaskReview(
                  item.id,
                  "rejected"
                );

                admin.reload();
              }}
            >
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}