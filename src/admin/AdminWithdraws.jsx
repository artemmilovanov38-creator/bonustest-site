import { useMemo, useState } from "react";

import {
  FiCheck,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiSearch,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { updateWithdrawStatusApi } from "../services/api";
import { getStatusText } from "../utils/status";

export default function AdminWithdraws({ admin }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const withdraws = admin.withdraws || [];

  const statistics = useMemo(() => {
    const pending = withdraws.filter(
      (item) => item.status === "pending"
    );

    const approved = withdraws.filter(
      (item) => item.status === "approved"
    );

    const rejected = withdraws.filter(
      (item) => item.status === "rejected"
    );

    const pendingAmount = pending.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return {
      total: withdraws.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      pendingAmount,
    };
  }, [withdraws]);

  const filteredWithdraws = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return withdraws.filter((item) => {
      const email = String(
        item.email || ""
      ).toLowerCase();

      const wallet = String(
        item.wallet || ""
      ).toLowerCase();

      const id = String(item.id || "").toLowerCase();

      const amount = String(item.amount || "");

      const matchesSearch =
        !cleanSearch ||
        email.includes(cleanSearch) ||
        wallet.includes(cleanSearch) ||
        id.includes(cleanSearch) ||
        amount.includes(cleanSearch);

      const matchesFilter =
        filter === "all" ||
        item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [withdraws, search, filter]);

  function getStatusIcon(status) {
    if (status === "approved") {
      return <FiCheck />;
    }

    if (status === "rejected") {
      return <FiXCircle />;
    }

    return <FiClock />;
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString(
      "ru-RU"
    );
  }

  function formatDate(date) {
    if (!date) {
      return "Дата не указана";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Дата не указана";
    }

    return parsedDate.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function changeWithdrawStatus(
    item,
    nextStatus
  ) {
    if (!item?.id) {
      alert("Не удалось определить заявку");
      return;
    }

    if (item.status !== "pending") {
      alert("Эта заявка уже обработана");
      return;
    }

    const actionText =
      nextStatus === "approved"
        ? "одобрить"
        : "отклонить";

    const confirmed = window.confirm(
      `Вы уверены, что хотите ${actionText} выплату на сумму ${formatAmount(
        item.amount
      )} ₽?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(item.id);

      const result =
        await updateWithdrawStatusApi(
          item.id,
          nextStatus
        );

      if (result?.error) {
        alert(result.error.message);
        return;
      }

      await admin.reload();
    } catch (error) {
      console.error(
        "Ошибка изменения статуса выплаты:",
        error
      );

      alert(
        "Не удалось изменить статус выплаты"
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  if (admin.loading) {
    return (
      <div className="adminWithdrawsLoading">
        Загрузка выплат...
      </div>
    );
  }

  return (
    <div className="adminWithdrawsPage">
      <section className="adminWithdrawsStats">
        <article className="adminWithdrawsStat">
          <div className="adminWithdrawsStatIcon blue">
            <FiCreditCard />
          </div>

          <div>
            <span>Всего заявок</span>
            <strong>{statistics.total}</strong>
          </div>
        </article>

        <article className="adminWithdrawsStat">
          <div className="adminWithdrawsStatIcon orange">
            <FiClock />
          </div>

          <div>
            <span>Ожидают решения</span>
            <strong>{statistics.pending}</strong>
          </div>
        </article>

        <article className="adminWithdrawsStat">
          <div className="adminWithdrawsStatIcon green">
            <FiCheck />
          </div>

          <div>
            <span>Одобрено</span>
            <strong>{statistics.approved}</strong>
          </div>
        </article>

        <article className="adminWithdrawsStat">
          <div className="adminWithdrawsStatIcon purple">
            <FiDollarSign />
          </div>

          <div>
            <span>Сумма в ожидании</span>

            <strong>
              {formatAmount(
                statistics.pendingAmount
              )}{" "}
              ₽
            </strong>
          </div>
        </article>
      </section>

      <section className="adminWithdrawsDirectory">
        <div className="adminWithdrawsHeader">
          <div>
            <span>Финансовые операции</span>

            <h2>Заявки на выплату</h2>

            <p>
              Найдено: {filteredWithdraws.length} из{" "}
              {statistics.total}
            </p>
          </div>

          <div className="adminWithdrawsSearch">
            <FiSearch />

            <input
              type="search"
              placeholder="Поиск по логину, кошельку или сумме"
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

        <div className="adminWithdrawsFilters">
          <button
            type="button"
            className={
              filter === "all" ? "active" : ""
            }
            onClick={() => setFilter("all")}
          >
            Все
            <span>{statistics.total}</span>
          </button>

          <button
            type="button"
            className={
              filter === "pending" ? "active" : ""
            }
            onClick={() => setFilter("pending")}
          >
            В ожидании
            <span>{statistics.pending}</span>
          </button>

          <button
            type="button"
            className={
              filter === "approved" ? "active" : ""
            }
            onClick={() => setFilter("approved")}
          >
            Одобрено
            <span>{statistics.approved}</span>
          </button>

          <button
            type="button"
            className={
              filter === "rejected" ? "active" : ""
            }
            onClick={() => setFilter("rejected")}
          >
            Отклонено
            <span>{statistics.rejected}</span>
          </button>
        </div>

        {filteredWithdraws.length === 0 ? (
          <div className="adminWithdrawsEmpty">
            <div>
              <FiCreditCard />
            </div>

            <h3>Заявки не найдены</h3>

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
          <div className="adminWithdrawsGrid">
            {filteredWithdraws.map((item) => {
              const isLoading =
                actionLoadingId === item.id;

              return (
                <article
                  className="adminWithdrawCard"
                  key={item.id}
                >
                  <div className="adminWithdrawCardHeader">
                    <span
                      className={`adminWithdrawStatus ${
                        item.status || "pending"
                      }`}
                    >
                      {getStatusIcon(item.status)}

                      {getStatusText(item.status)}
                    </span>

                    <span className="adminWithdrawId">
                      ID: {item.id}
                    </span>
                  </div>

                  <div className="adminWithdrawAmount">
                    <span>Сумма выплаты</span>

                    <strong>
                      {formatAmount(item.amount)} ₽
                    </strong>
                  </div>

                  <div className="adminWithdrawUser">
                    <div className="adminWithdrawUserAvatar">
                      {(item.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <span>
                        <FiUser />
                        Пользователь
                      </span>

                      <strong>
                        {item.email ||
                          "Логин не указан"}
                      </strong>
                    </div>
                  </div>

                  <div className="adminWithdrawWallet">
                    <div className="adminWithdrawWalletIcon">
                      <FiCreditCard />
                    </div>

                    <div>
                      <span>Кошелёк</span>

                      <strong>
                        {item.wallet ||
                          "Кошелёк не указан"}
                      </strong>
                    </div>
                  </div>

                  <div className="adminWithdrawMeta">
                    <div>
                      <span>Статус</span>

                      <strong>
                        {getStatusText(item.status)}
                      </strong>
                    </div>

                    <div>
                      <span>Дата заявки</span>

                      <strong>
                        {formatDate(
                          item.created_at
                        )}
                      </strong>
                    </div>
                  </div>

                  {item.status === "pending" ? (
                    <div className="adminWithdrawActions">
                      <button
                        type="button"
                        className="primaryBtn"
                        onClick={() =>
                          changeWithdrawStatus(
                            item,
                            "approved"
                          )
                        }
                        disabled={isLoading}
                      >
                        <FiCheck />

                        {isLoading
                          ? "Сохраняем..."
                          : "Одобрить"}
                      </button>

                      <button
                        type="button"
                        className="secondaryBtn"
                        onClick={() =>
                          changeWithdrawStatus(
                            item,
                            "rejected"
                          )
                        }
                        disabled={isLoading}
                      >
                        <FiXCircle />

                        Отклонить
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`adminWithdrawProcessed ${
                        item.status || "pending"
                      }`}
                    >
                      {getStatusIcon(item.status)}

                      <span>
                        Заявка уже обработана
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}