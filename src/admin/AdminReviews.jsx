import { useMemo, useState } from "react";

import {
  FiCheck,
  FiClock,
  FiExternalLink,
  FiImage,
  FiSearch,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import {
  updateTaskReview,
  updateUserBalance,
} from "../services/api";

export default function AdminReviews({ admin }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const reviews = admin.reviews || [];

  const statistics = useMemo(() => {
    const pending = reviews.filter(
      (item) =>
        !item.status ||
        item.status === "pending"
    ).length;

    const approved = reviews.filter(
      (item) => item.status === "approved"
    ).length;

    const rejected = reviews.filter(
      (item) => item.status === "rejected"
    ).length;

    return {
      total: reviews.length,
      pending,
      approved,
      rejected,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    return reviews.filter((item) => {
      const title = (
        item.task?.title || ""
      ).toLowerCase();

      const email = (
        item.dbUser?.email || ""
      ).toLowerCase();

      const reviewStatus =
        item.status || "pending";

      const matchesSearch =
        !cleanSearch ||
        title.includes(cleanSearch) ||
        email.includes(cleanSearch) ||
        String(item.id || "")
          .toLowerCase()
          .includes(cleanSearch);

      const matchesFilter =
        filter === "all" ||
        reviewStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [reviews, search, filter]);

  function getStatus(item) {
    return item.status || "pending";
  }

  function getStatusLabel(status) {
    if (status === "approved") {
      return "Одобрено";
    }

    if (status === "rejected") {
      return "Отклонено";
    }

    return "На проверке";
  }

  async function handleApprove(item) {
    if (
      !item?.id ||
      !item?.dbUser?.id ||
      !item?.task
    ) {
      alert(
        "Не удалось получить данные задания или пользователя"
      );
      return;
    }

    if (getStatus(item) === "approved") {
      alert("Этот отзыв уже одобрен");
      return;
    }

    try {
      setActionLoadingId(item.id);

      const { error } =
        await updateTaskReview(
          item.id,
          "approved"
        );

      if (error) {
        alert(error.message);
        return;
      }

      const currentBalance = Number(
        item.dbUser.balance || 0
      );

      const reward = Number(
        item.task.reward || 0
      );

      const { error: balanceError } =
        await updateUserBalance(
          item.dbUser.id,
          currentBalance + reward
        );

      if (balanceError) {
        alert(balanceError.message);
        return;
      }

      await admin.reload();
    } catch (error) {
      console.error(
        "Ошибка одобрения отзыва:",
        error
      );

      alert("Не удалось одобрить отзыв");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(item) {
    if (!item?.id) {
      alert("Не удалось получить данные отзыва");
      return;
    }

    if (getStatus(item) === "rejected") {
      alert("Этот отзыв уже отклонён");
      return;
    }

    try {
      setActionLoadingId(item.id);

      const { error } =
        await updateTaskReview(
          item.id,
          "rejected"
        );

      if (error) {
        alert(error.message);
        return;
      }

      await admin.reload();
    } catch (error) {
      console.error(
        "Ошибка отклонения отзыва:",
        error
      );

      alert("Не удалось отклонить отзыв");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (admin.loading) {
    return (
      <div className="adminReviewsLoading">
        Загрузка отзывов...
      </div>
    );
  }

  return (
    <div className="adminReviewsPage">
      <section className="adminReviewsStats">
        <article className="adminReviewsStat">
          <div className="adminReviewsStatIcon blue">
            <FiImage />
          </div>

          <div>
            <span>Всего отзывов</span>
            <strong>{statistics.total}</strong>
          </div>
        </article>

        <article className="adminReviewsStat">
          <div className="adminReviewsStatIcon orange">
            <FiClock />
          </div>

          <div>
            <span>Ожидают проверки</span>
            <strong>{statistics.pending}</strong>
          </div>
        </article>

        <article className="adminReviewsStat">
          <div className="adminReviewsStatIcon green">
            <FiCheck />
          </div>

          <div>
            <span>Одобрено</span>
            <strong>{statistics.approved}</strong>
          </div>
        </article>

        <article className="adminReviewsStat">
          <div className="adminReviewsStatIcon red">
            <FiXCircle />
          </div>

          <div>
            <span>Отклонено</span>
            <strong>{statistics.rejected}</strong>
          </div>
        </article>
      </section>

      <section className="adminReviewsDirectory">
        <div className="adminReviewsHeader">
          <div>
            <span>Проверка заданий</span>

            <h2>Отзывы пользователей</h2>

            <p>
              Найдено: {filteredReviews.length} из{" "}
              {statistics.total}
            </p>
          </div>

          <div className="adminReviewsSearch">
            <FiSearch />

            <input
              type="search"
              placeholder="Поиск по заданию или пользователю"
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

        <div className="adminReviewsFilters">
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
            На проверке
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

        {filteredReviews.length === 0 ? (
          <div className="adminReviewsEmpty">
            <div>
              <FiImage />
            </div>

            <h3>Отзывы не найдены</h3>

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
          <div className="adminReviewsGrid">
            {filteredReviews.map((item) => {
              const status = getStatus(item);

              const isLoading =
                actionLoadingId === item.id;

              return (
                <article
                  className="adminReviewCard"
                  key={item.id}
                >
                  <div className="adminReviewCardHeader">
                    <span
                      className={`adminReviewStatus ${status}`}
                    >
                      {status === "approved" && (
                        <FiCheck />
                      )}

                      {status === "rejected" && (
                        <FiXCircle />
                      )}

                      {status === "pending" && (
                        <FiClock />
                      )}

                      {getStatusLabel(status)}
                    </span>

                    <span className="adminReviewId">
                      ID: {item.id}
                    </span>
                  </div>

                  <div className="adminReviewTask">
                    <span>Задание</span>

                    <h3>
                      {item.task?.title ||
                        "Задание без названия"}
                    </h3>
                  </div>

                  <div className="adminReviewUser">
                    <div className="adminReviewUserAvatar">
                      {(item.dbUser?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <span>
                        <FiUser />
                        Пользователь
                      </span>

                      <strong>
                        {item.dbUser?.email ||
                          "Пользователь не найден"}
                      </strong>
                    </div>
                  </div>

                  <div className="adminReviewReward">
                    <span>Награда за выполнение</span>

                    <strong>
                      {Number(
                        item.task?.reward || 0
                      ).toLocaleString("ru-RU")}{" "}
                      ₽
                    </strong>
                  </div>

                  <div className="adminReviewSubmittedAt">
  <FiClock />

  <span>
    Отправлено:{" "}
    {item.created_at
      ? new Date(item.created_at).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Неизвестно"}
  </span>
</div>

                  {item.proof_url ? (
                    <button
                      type="button"
                      className="adminReviewProof"
                      onClick={() =>
                        window.open(
                          item.proof_url,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <img
                        src={item.proof_url}
                        alt="Подтверждение выполнения задания"
                      />

                      <span>
                        <FiExternalLink />
                        Открыть изображение
                      </span>
                    </button>
                  ) : (
                    <div className="adminReviewNoProof">
                      <FiImage />

                      <span>
                        Подтверждение не загружено
                      </span>
                    </div>
                  )}

                  <div className="adminReviewActions">
                    <button
                      type="button"
                      className="primaryBtn"
                      onClick={() =>
                        handleApprove(item)
                      }
                      disabled={
                        isLoading ||
                        status === "approved"
                      }
                    >
                      <FiCheck />

                      {isLoading
                        ? "Сохраняем..."
                        : status === "approved"
                          ? "Уже одобрено"
                          : "Одобрить"}
                    </button>

                    <button
                      type="button"
                      className="secondaryBtn"
                      onClick={() =>
                        handleReject(item)
                      }
                      disabled={
                        isLoading ||
                        status === "rejected"
                      }
                    >
                      <FiXCircle />

                      {status === "rejected"
                        ? "Уже отклонено"
                        : "Отклонить"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}