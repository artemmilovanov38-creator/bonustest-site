import { useEffect, useMemo, useState } from "react";
import {
  deleteUserCompletely,
  makeAdmin,
  makeCreator,
  removeAdmin,
  toggleUserBlock,
  updateUserBalance,
} from "../services/api";
import { supabase } from "../lib/supabase";

export default function AdminUsers({ admin }) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceMode, setBalanceMode] = useState("add");

  const [adminRoles, setAdminRoles] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  async function loadAdminRoles() {
    const { data, error } = await supabase
      .from("admins")
      .select("email, role");

    if (error) {
      alert(error.message);
      return;
    }

    const roles = {};

    (data || []).forEach((item) => {
      roles[(item.email || "").toLowerCase()] =
        item.role || "admin";
    });

    setAdminRoles(roles);
  }

  useEffect(() => {
    loadAdminRoles();
  }, [admin.users]);

  const users = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return admin.users.filter((user) => {
      const email = (user.email || "").toLowerCase();
      const role =
        adminRoles[email] || "user";

      return (
        email.includes(cleanSearch) ||
        role.includes(cleanSearch) ||
        String(user.balance || 0).includes(cleanSearch)
      );
    });
  }, [admin.users, adminRoles, search]);

  function getUserRole(user) {
    return (
      adminRoles[(user.email || "").toLowerCase()] ||
      "user"
    );
  }

  function getRoleLabel(role) {
    if (role === "creator") return "👑 Создатель";
    if (role === "admin") return "🛡 Администратор";
    return "👤 Пользователь";
  }

  async function changeBalance() {
    if (!selectedUser) return;

    const amount = Number(balanceAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    const currentBalance = Number(selectedUser.balance || 0);

    const newBalance =
      balanceMode === "add"
        ? currentBalance + amount
        : currentBalance - amount;

    if (newBalance < 0) {
      alert("Баланс не может быть меньше нуля");
      return;
    }

    setActionLoading(true);

    const { error } = await updateUserBalance(
      selectedUser.id,
      newBalance
    );

    setActionLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setBalanceAmount("");
    setSelectedUser(null);

    await admin.reload();
  }

  async function changeRole(user, role) {
    setActionLoading(true);

    let result;

    if (role === "creator") {
      result = await makeCreator(user.email);
    } else if (role === "admin") {
      result = await makeAdmin(user.email);
    } else {
      result = await removeAdmin(user.email);
    }

    setActionLoading(false);

    if (result?.error) {
      alert(result.error.message);
      return;
    }

    await loadAdminRoles();
    alert("Роль обновлена");
  }

  async function handleBlock(user) {
    setActionLoading(true);

    const { error } = await toggleUserBlock(
      user.id,
      !user.is_blocked
    );

    setActionLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    await admin.reload();
  }

  async function handleDelete(user) {
    const confirmed = confirm(
      `Удалить пользователя ${user.email} и связанные данные?`
    );

    if (!confirmed) return;

    const repeatedConfirmation = confirm(
      "Это действие нельзя отменить. Продолжить?"
    );

    if (!repeatedConfirmation) return;

    setActionLoading(true);

    const result = await deleteUserCompletely(user);

    setActionLoading(false);

    if (result?.error) {
      alert(result.error.message);
      return;
    }

    setSelectedUser(null);

    await loadAdminRoles();
    await admin.reload();

    alert("Пользователь удалён из базы");
  }

  if (admin.loading) {
    return <h2>Загрузка...</h2>;
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Пользователи</h1>
          <p className="pageSubtitle">
            Управление балансом, ролями и доступом
          </p>
        </div>

        <input
          className="searchInput"
          placeholder="Поиск по email, роли или балансу..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="usersAdminTable">
        <div className="usersTableHead">
          <span>Пользователь</span>
          <span>Баланс</span>
          <span>Роль</span>
          <span>Статус</span>
          <span>Регистрация</span>
          <span>Действия</span>
        </div>

        {users.length === 0 ? (
          <div className="emptyBox">
            Пользователи не найдены
          </div>
        ) : (
          users.map((user) => {
            const role = getUserRole(user);

            return (
              <div
                className="usersTableRow"
                key={user.id}
              >
                <div className="userIdentity">
                  <div className="userAvatar">
                    {(user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>{user.email}</strong>
                    <span>ID: {user.id}</span>
                  </div>
                </div>

                <strong>
                  {Number(user.balance || 0).toLocaleString(
                    "ru-RU"
                  )}{" "}
                  ₽
                </strong>

                <span
                  className={`roleBadge role-${role}`}
                >
                  {getRoleLabel(role)}
                </span>

                <span
                  className={`userStatusBadge ${
                    user.is_blocked
                      ? "blocked"
                      : "active"
                  }`}
                >
                  {user.is_blocked
                    ? "Заблокирован"
                    : "Активен"}
                </span>

                <span>
                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleDateString("ru-RU")
                    : "—"}
                </span>

                <button
                  className="secondaryBtn userManageBtn"
                  onClick={() => {
                    setSelectedUser(user);
                    setBalanceAmount("");
                    setBalanceMode("add");
                  }}
                >
                  Управление
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedUser && (
        <div
          className="userDrawerOverlay"
          onClick={() => setSelectedUser(null)}
        >
          <aside
            className="userDrawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="userDrawerHeader">
              <div>
                <span>Управление пользователем</span>
                <h2>{selectedUser.email}</h2>
              </div>

              <button
                className="drawerClose"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className="drawerSection">
              <h3>Баланс</h3>

              <div className="drawerBalance">
                {Number(
                  selectedUser.balance || 0
                ).toLocaleString("ru-RU")}{" "}
                ₽
              </div>

              <div className="balanceModeSwitch">
                <button
                  className={
                    balanceMode === "add"
                      ? "active"
                      : ""
                  }
                  onClick={() => setBalanceMode("add")}
                >
                  Начислить
                </button>

                <button
                  className={
                    balanceMode === "remove"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setBalanceMode("remove")
                  }
                >
                  Списать
                </button>
              </div>

              <input
                className="searchInput"
                type="number"
                min="1"
                placeholder="Введите сумму"
                value={balanceAmount}
                onChange={(event) =>
                  setBalanceAmount(event.target.value)
                }
              />

              <button
                className="primaryBtn drawerActionBtn"
                onClick={changeBalance}
                disabled={actionLoading}
              >
                {balanceMode === "add"
                  ? "Начислить средства"
                  : "Списать средства"}
              </button>
            </div>

            <div className="drawerSection">
              <h3>Роль</h3>

              <p className="drawerCurrentRole">
                Текущая роль:{" "}
                <strong>
                  {getRoleLabel(
                    getUserRole(selectedUser)
                  )}
                </strong>
              </p>

              <div className="drawerActions">
                {getUserRole(selectedUser) !==
                  "creator" && (
                  <button
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "creator"
                      )
                    }
                    disabled={actionLoading}
                  >
                    👑 Сделать создателем
                  </button>
                )}

                {getUserRole(selectedUser) !==
                  "admin" && (
                  <button
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "admin"
                      )
                    }
                    disabled={actionLoading}
                  >
                    🛡 Сделать администратором
                  </button>
                )}

                {getUserRole(selectedUser) !==
                  "user" && (
                  <button
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "user"
                      )
                    }
                    disabled={actionLoading}
                  >
                    👤 Сделать пользователем
                  </button>
                )}
              </div>
            </div>

            <div className="drawerSection">
              <h3>Доступ</h3>

              <button
                className="secondaryBtn drawerActionBtn"
                onClick={() =>
                  handleBlock(selectedUser)
                }
                disabled={actionLoading}
              >
                {selectedUser.is_blocked
                  ? "🔓 Разблокировать"
                  : "🚫 Заблокировать"}
              </button>
            </div>

            <div className="drawerSection dangerZone">
              <h3>Опасная зона</h3>

              <p>
                Удалит профиль, задания, выплаты,
                сообщения поддержки и роль.
              </p>

              <button
                className="dangerBtn drawerActionBtn"
                onClick={() =>
                  handleDelete(selectedUser)
                }
                disabled={actionLoading}
              >
                🗑 Удалить пользователя
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}