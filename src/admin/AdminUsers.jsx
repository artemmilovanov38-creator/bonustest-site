import { useEffect, useMemo, useState } from "react";

import {
  FiDollarSign,
  FiLock,
  FiSearch,
  FiShield,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  createUserByAdmin,
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
  const [filter, setFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceMode, setBalanceMode] = useState("add");

  const [adminRoles, setAdminRoles] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const [newUserSurname, setNewUserSurname] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createdCredentials, setCreatedCredentials] =
    useState(null);

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
      const email = (item.email || "").toLowerCase();

      if (!email) {
        return;
      }

      roles[email] = item.role || "admin";
    });

    setAdminRoles(roles);
  }

  useEffect(() => {
    loadAdminRoles();
  }, [admin.users]);

  function getUserRole(user) {
    const email = (user.email || "").toLowerCase();

    return adminRoles[email] || "user";
  }

  function getRoleLabel(role) {
    if (role === "creator") {
      return "Создатель";
    }

    if (role === "admin") {
      return "Администратор";
    }

    return "Пользователь";
  }

  const statistics = useMemo(() => {
    const allUsers = admin.users || [];

    const administrators = allUsers.filter((user) => {
      const role =
        adminRoles[(user.email || "").toLowerCase()] || "user";

      return role === "admin" || role === "creator";
    }).length;

    const blocked = allUsers.filter(
      (user) => user.is_blocked
    ).length;

    const totalBalance = allUsers.reduce(
      (sum, user) => sum + Number(user.balance || 0),
      0
    );

    return {
      total: allUsers.length,
      administrators,
      blocked,
      totalBalance,
    };
  }, [admin.users, adminRoles]);

  const users = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return (admin.users || []).filter((user) => {
      const email = (user.email || "").toLowerCase();
      const id = String(user.id || "").toLowerCase();
      const role =
        adminRoles[email] || "user";

      const matchesSearch =
        !cleanSearch ||
        email.includes(cleanSearch) ||
        id.includes(cleanSearch) ||
        role.includes(cleanSearch) ||
        String(user.balance || 0).includes(cleanSearch);

      let matchesFilter = true;

      if (filter === "users") {
        matchesFilter = role === "user";
      }

      if (filter === "admins") {
        matchesFilter =
          role === "admin" || role === "creator";
      }

      if (filter === "blocked") {
        matchesFilter = Boolean(user.is_blocked);
      }

      if (filter === "active") {
        matchesFilter = !user.is_blocked;
      }

      return matchesSearch && matchesFilter;
    });
  }, [admin.users, adminRoles, search, filter]);

  async function handleCreateUser() {
    const surname = newUserSurname.trim();

    if (surname.length < 2) {
      alert("Введите фамилию пользователя");
      return;
    }

    try {
      setCreatingUser(true);
      setCreatedCredentials(null);

      const { data, error } =
        await createUserByAdmin(surname);

      if (error) {
        alert(
          error.message ||
            "Не удалось создать пользователя"
        );
        return;
      }

      setCreatedCredentials(data);
      setNewUserSurname("");

      if (admin?.reload) {
        await admin.reload();
      }
    } catch (error) {
      console.error(
        "Ошибка создания пользователя:",
        error
      );

      alert("Не удалось создать пользователя");
    } finally {
      setCreatingUser(false);
    }
  }

  async function copyCredentials() {
    if (!createdCredentials) {
      return;
    }

    const credentialsText = [
      `Фамилия: ${createdCredentials.surname}`,
      `Логин: ${createdCredentials.login}`,
      `Пароль: ${createdCredentials.password}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(
        credentialsText
      );

      alert("Логин и пароль скопированы");
    } catch (error) {
      console.error(
        "Ошибка копирования:",
        error
      );

      alert(
        "Не удалось скопировать данные. Скопируйте их вручную."
      );
    }
  }

  async function changeBalance() {
    if (!selectedUser) {
      return;
    }

    const amount = Number(balanceAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    const currentBalance = Number(
      selectedUser.balance || 0
    );

    const newBalance =
      balanceMode === "add"
        ? currentBalance + amount
        : currentBalance - amount;

    if (newBalance < 0) {
      alert("Баланс не может быть меньше нуля");
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await updateUserBalance(
        selectedUser.id,
        newBalance
      );

      if (error) {
        alert(error.message);
        return;
      }

      await admin.reload();

      setSelectedUser(null);
      setBalanceAmount("");
    } catch (error) {
      console.error(
        "Ошибка изменения баланса:",
        error
      );

      alert("Не удалось изменить баланс");
    } finally {
      setActionLoading(false);
    }
  }

  async function changeRole(user, role) {
    try {
      setActionLoading(true);

      let result;

      if (role === "creator") {
        result = await makeCreator(user.email);
      } else if (role === "admin") {
        result = await makeAdmin(user.email);
      } else {
        result = await removeAdmin(user.email);
      }

      if (result?.error) {
        alert(result.error.message);
        return;
      }

      await loadAdminRoles();

      alert("Роль обновлена");
    } catch (error) {
      console.error(
        "Ошибка изменения роли:",
        error
      );

      alert("Не удалось изменить роль");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBlock(user) {
    try {
      setActionLoading(true);

      const nextBlockedState = !user.is_blocked;

      const { error } = await toggleUserBlock(
        user.id,
        nextBlockedState
      );

      if (error) {
        alert(error.message);
        return;
      }

      await admin.reload();

      setSelectedUser((currentUser) => {
        if (!currentUser) {
          return null;
        }

        return {
          ...currentUser,
          is_blocked: nextBlockedState,
        };
      });
    } catch (error) {
      console.error(
        "Ошибка изменения доступа:",
        error
      );

      alert("Не удалось изменить доступ пользователя");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Удалить пользователя ${user.email} и связанные данные?`
    );

    if (!confirmed) {
      return;
    }

    const repeatedConfirmation = window.confirm(
      "Это действие нельзя отменить. Продолжить?"
    );

    if (!repeatedConfirmation) {
      return;
    }

    try {
      setActionLoading(true);

      const result = await deleteUserCompletely(user);

      if (result?.error) {
        alert(result.error.message);
        return;
      }

      setSelectedUser(null);

      await loadAdminRoles();
      await admin.reload();

      alert("Пользователь удалён из базы");
    } catch (error) {
      console.error(
        "Ошибка удаления пользователя:",
        error
      );

      alert("Не удалось удалить пользователя");
    } finally {
      setActionLoading(false);
    }
  }

  function openUserDrawer(user) {
    setSelectedUser(user);
    setBalanceAmount("");
    setBalanceMode("add");
  }

  function closeUserDrawer() {
    if (actionLoading) {
      return;
    }

    setSelectedUser(null);
    setBalanceAmount("");
    setBalanceMode("add");
  }

  if (admin.loading) {
    return (
      <div className="adminUsersLoading">
        Загрузка пользователей...
      </div>
    );
  }

  return (
    <div className="adminUsersPage">
      <section className="adminCreateUser">
        <div className="adminCreateUserTop">
          <div className="adminCreateUserIcon">
            <FiUserPlus />
          </div>

          <div className="adminCreateUserHeading">
            <span>Новый сотрудник</span>

            <h2>Создать аккаунт</h2>

            <p>
              Введите фамилию сотрудника. Система
              автоматически создаст логин и пароль.
            </p>
          </div>
        </div>

        <div className="adminCreateUserForm">
          <label>
            <span>Фамилия сотрудника</span>

            <input
              className="searchInput"
              type="text"
              placeholder="Например, Иванов"
              value={newUserSurname}
              onChange={(event) =>
                setNewUserSurname(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !creatingUser &&
                  newUserSurname.trim().length >= 2
                ) {
                  handleCreateUser();
                }
              }}
              disabled={creatingUser}
            />
          </label>

          <button
            type="button"
            className="primaryBtn"
            onClick={handleCreateUser}
            disabled={
              creatingUser ||
              newUserSurname.trim().length < 2
            }
          >
            <FiUserPlus />

            {creatingUser
              ? "Создаём..."
              : "Создать аккаунт"}
          </button>
        </div>

        {createdCredentials && (
          <div className="createdCredentials">
            <div className="createdCredentialsHeader">
              <div>
                <span>Аккаунт успешно создан</span>
                <h3>
                  {createdCredentials.surname}
                </h3>
              </div>

              <button
                type="button"
                className="createdCredentialsClose"
                onClick={() =>
                  setCreatedCredentials(null)
                }
                aria-label="Закрыть"
              >
                <FiX />
              </button>
            </div>

            <div className="credentialsGrid">
              <div className="credentialRow">
                <span>Логин</span>
                <code>{createdCredentials.login}</code>
              </div>

              <div className="credentialRow">
                <span>Пароль</span>
                <code>{createdCredentials.password}</code>
              </div>
            </div>

            <p className="credentialsWarning">
              Скопируйте пароль сейчас. После обновления
              страницы повторно посмотреть его будет
              нельзя.
            </p>

            <button
              type="button"
              className="secondaryBtn"
              onClick={copyCredentials}
            >
              Скопировать данные
            </button>
          </div>
        )}
      </section>

      <section className="adminUsersStats">
        <article className="adminUsersStat">
          <div className="adminUsersStatIcon blue">
            <FiUsers />
          </div>

          <div>
            <span>Всего пользователей</span>
            <strong>{statistics.total}</strong>
          </div>
        </article>

        <article className="adminUsersStat">
          <div className="adminUsersStatIcon purple">
            <FiShield />
          </div>

          <div>
            <span>Администраторы</span>
            <strong>{statistics.administrators}</strong>
          </div>
        </article>

        <article className="adminUsersStat">
          <div className="adminUsersStatIcon red">
            <FiLock />
          </div>

          <div>
            <span>Заблокированы</span>
            <strong>{statistics.blocked}</strong>
          </div>
        </article>

        <article className="adminUsersStat">
          <div className="adminUsersStatIcon green">
            <FiDollarSign />
          </div>

          <div>
            <span>Общий баланс</span>

            <strong>
              {statistics.totalBalance.toLocaleString(
                "ru-RU"
              )}{" "}
              ₽
            </strong>
          </div>
        </article>
      </section>

      <section className="adminUsersDirectory">
        <div className="adminUsersDirectoryHeader">
          <div>
            <span>База аккаунтов</span>
            <h2>Пользователи</h2>

            <p>
              Найдено: {users.length} из{" "}
              {statistics.total}
            </p>
          </div>

          <div className="adminUsersSearch">
            <FiSearch />

            <input
              type="search"
              placeholder="Поиск по логину, ID или балансу"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Очистить поиск"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="adminUsersFilters">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Все
            <span>{statistics.total}</span>
          </button>

          <button
            type="button"
            className={
              filter === "users" ? "active" : ""
            }
            onClick={() => setFilter("users")}
          >
            Пользователи
          </button>

          <button
            type="button"
            className={
              filter === "admins" ? "active" : ""
            }
            onClick={() => setFilter("admins")}
          >
            Администраторы
            <span>{statistics.administrators}</span>
          </button>

          <button
            type="button"
            className={
              filter === "active" ? "active" : ""
            }
            onClick={() => setFilter("active")}
          >
            Активные
          </button>

          <button
            type="button"
            className={
              filter === "blocked" ? "active" : ""
            }
            onClick={() => setFilter("blocked")}
          >
            Заблокированные
            <span>{statistics.blocked}</span>
          </button>
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
            <div className="adminUsersEmpty">
              <div>
                <FiUsers />
              </div>

              <h3>Пользователи не найдены</h3>

              <p>
                Измени фильтр или поисковый запрос.
              </p>

              <button
                type="button"
                className="secondaryBtn"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Сбросить фильтры
              </button>
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
                      <strong>
                        {user.email || "Без логина"}
                      </strong>

                      <span>ID: {user.id}</span>
                    </div>
                  </div>

                  <strong className="userBalanceValue">
                    {Number(
                      user.balance || 0
                    ).toLocaleString("ru-RU")}{" "}
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

                  <span className="userCreatedDate">
                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString("ru-RU")
                      : "—"}
                  </span>

                  <button
                    type="button"
                    className="secondaryBtn userManageBtn"
                    onClick={() =>
                      openUserDrawer(user)
                    }
                  >
                    Управление
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedUser && (
        <div
          className="userDrawerOverlay"
          onClick={closeUserDrawer}
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

                <h2>
                  {selectedUser.email || "Без логина"}
                </h2>
              </div>

              <button
                type="button"
                className="drawerClose"
                onClick={closeUserDrawer}
                disabled={actionLoading}
                aria-label="Закрыть"
              >
                <FiX />
              </button>
            </div>

            <div className="drawerUserSummary">
              <div className="drawerUserAvatar">
                {(selectedUser.email || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {getRoleLabel(
                    getUserRole(selectedUser)
                  )}
                </strong>

                <span>
                  {selectedUser.is_blocked
                    ? "Доступ заблокирован"
                    : "Аккаунт активен"}
                </span>
              </div>
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
                  type="button"
                  className={
                    balanceMode === "add"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setBalanceMode("add")
                  }
                  disabled={actionLoading}
                >
                  Начислить
                </button>

                <button
                  type="button"
                  className={
                    balanceMode === "remove"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setBalanceMode("remove")
                  }
                  disabled={actionLoading}
                >
                  Списать
                </button>
              </div>

              <input
                className="searchInput"
                type="number"
                min="1"
                step="1"
                placeholder="Введите сумму"
                value={balanceAmount}
                onChange={(event) =>
                  setBalanceAmount(event.target.value)
                }
                disabled={actionLoading}
              />

              <button
                type="button"
                className="primaryBtn drawerActionBtn"
                onClick={changeBalance}
                disabled={
                  actionLoading ||
                  !balanceAmount ||
                  Number(balanceAmount) <= 0
                }
              >
                {actionLoading
                  ? "Сохраняем..."
                  : balanceMode === "add"
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
                    type="button"
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "creator"
                      )
                    }
                    disabled={actionLoading}
                  >
                    Сделать создателем
                  </button>
                )}

                {getUserRole(selectedUser) !==
                  "admin" && (
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "admin"
                      )
                    }
                    disabled={actionLoading}
                  >
                    Сделать администратором
                  </button>
                )}

                {getUserRole(selectedUser) !==
                  "user" && (
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={() =>
                      changeRole(
                        selectedUser,
                        "user"
                      )
                    }
                    disabled={actionLoading}
                  >
                    Сделать пользователем
                  </button>
                )}
              </div>
            </div>

            <div className="drawerSection">
              <h3>Доступ</h3>

              <button
                type="button"
                className="secondaryBtn drawerActionBtn"
                onClick={() =>
                  handleBlock(selectedUser)
                }
                disabled={actionLoading}
              >
                {selectedUser.is_blocked
                  ? "Разблокировать аккаунт"
                  : "Заблокировать аккаунт"}
              </button>
            </div>

            <div className="drawerSection dangerZone">
              <h3>Опасная зона</h3>

              <p>
                Будут удалены профиль, задания,
                выплаты, сообщения поддержки и роль.
              </p>

              <button
                type="button"
                className="dangerBtn drawerActionBtn"
                onClick={() =>
                  handleDelete(selectedUser)
                }
                disabled={actionLoading}
              >
                Удалить пользователя
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}