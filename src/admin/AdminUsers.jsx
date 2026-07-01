import { useMemo, useState } from "react";
import {
  updateUserBalance,
  toggleUserBlock,
} from "../services/api";

export default function AdminUsers({ admin }) {
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
const [editingUser, setEditingUser] = useState(null);

  const users = useMemo(() => {
    return admin.users.filter((u) =>
      (u.email || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [admin.users, search]);

  if (admin.loading) {
    return <h2>Загрузка...</h2>;
  }

  return (
    <>

      <div className="pageHeader">

        <h1>Пользователи</h1>

        <input
          className="searchInput"
          placeholder="Поиск по email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="usersGrid">

        {users.map((user) => (

          <div
            key={user.id}
            className="userCard"
          >

            <h3>{user.email}</h3>

            <p>
              Баланс:
              <strong>
                {" "}
                {user.balance} ₽
              </strong>
            </p>

            <p>
              Статус:
              <strong>
                {" "}
                {user.is_blocked
                  ? "Заблокирован"
                  : "Активен"}
              </strong>
            </p>

{editingUser === user.id ? (
  <>

    <input
      className="searchInput"
      placeholder="Сумма"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
    />

    <button
      className="primaryBtn"
      onClick={async () => {
        await updateUserBalance(
          user.id,
          Number(user.balance) + Number(amount)
        );

        setEditingUser(null);
        setAmount("");

        admin.reload();
      }}
    >
      Начислить
    </button>

    <button
      className="secondaryBtn"
      onClick={() => {
        setEditingUser(null);
        setAmount("");
      }}
    >
      Отмена
    </button>

  </>
) : (
  <button
    className="secondaryBtn"
    onClick={() => setEditingUser(user.id)}
  >
    Изменить баланс
  </button>
)}

<button
  className="secondaryBtn"
  onClick={async () => {
    await toggleUserBlock(
      user.id,
      !user.is_blocked
    );

    admin.reload();
  }}
>
  {user.is_blocked
    ? "Разблокировать"
    : "Заблокировать"}
</button>

            <p>
              Регистрация
              <br />

              {new Date(
                user.created_at
              ).toLocaleDateString()}
            </p>

          </div>

        ))}

      </div>

    </>
  );
}