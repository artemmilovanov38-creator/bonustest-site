import { useMemo, useState } from "react";

import {
  FiActivity,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  createTaskApi,
  deleteTaskApi,
  updateTaskApi,
} from "../services/api";

const createEmptyTask = () => ({
  title: "",
  description: "",
  instruction: "",
  reward: "",
  task_link: "",
  category: "Общее",
  difficulty: "Простое",
  estimated_time: "2 минуты",
  proof_required: true,
  is_active: true,
  is_hot: false,
});

function TaskFields({ data, onChange }) {
  return (
    <div className="adminTaskFields">
      <label className="adminField adminTaskFullField">
        <span>Название задания</span>

        <input
          type="text"
          placeholder="Например: Подписаться на Telegram"
          value={data.title}
          onChange={(event) =>
            onChange("title", event.target.value)
          }
        />
      </label>

      <label className="adminField adminTaskFullField">
        <span>Краткое описание</span>

        <textarea
          className="taskTextarea"
          placeholder="Кратко опишите, что нужно сделать"
          value={data.description}
          onChange={(event) =>
            onChange("description", event.target.value)
          }
        />
      </label>

      <label className="adminField adminTaskFullField">
        <span>Подробная инструкция</span>

        <textarea
          className="taskTextarea adminTaskInstructionTextarea"
          placeholder="Опишите действия пользователя по шагам"
          value={data.instruction}
          onChange={(event) =>
            onChange("instruction", event.target.value)
          }
        />
      </label>

      <label className="adminField">
        <span>Награда, ₽</span>

        <input
          type="number"
          min="0"
          step="1"
          placeholder="100"
          value={data.reward}
          onChange={(event) =>
            onChange("reward", event.target.value)
          }
        />
      </label>

      <label className="adminField">
        <span>Время выполнения</span>

        <input
          type="text"
          placeholder="Например: 5 минут"
          value={data.estimated_time}
          onChange={(event) =>
            onChange(
              "estimated_time",
              event.target.value
            )
          }
        />
      </label>

      <label className="adminField">
        <span>Категория</span>

        <input
          type="text"
          placeholder="Например: Telegram"
          value={data.category}
          onChange={(event) =>
            onChange("category", event.target.value)
          }
        />
      </label>

      <label className="adminField">
        <span>Сложность</span>

        <select
          value={data.difficulty}
          onChange={(event) =>
            onChange("difficulty", event.target.value)
          }
        >
          <option value="Простое">Простое</option>
          <option value="Среднее">Среднее</option>
          <option value="Сложное">Сложное</option>
        </select>
      </label>

      <label className="adminField adminTaskFullField">
        <span>Ссылка на задание</span>

        <input
          type="url"
          placeholder="https://example.com"
          value={data.task_link}
          onChange={(event) =>
            onChange("task_link", event.target.value)
          }
        />
      </label>

      <div className="adminTaskChecks adminTaskFullField">
        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.proof_required}
            onChange={(event) =>
              onChange(
                "proof_required",
                event.target.checked
              )
            }
          />

          <span>
            <strong>Требуется скриншот</strong>

            <small>
              Пользователь должен прикрепить подтверждение
            </small>
          </span>
        </label>

        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(event) =>
              onChange(
                "is_active",
                event.target.checked
              )
            }
          />

          <span>
            <strong>Активное задание</strong>

            <small>
              Задание отображается пользователям
            </small>
          </span>
        </label>

        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.is_hot}
            onChange={(event) =>
              onChange(
                "is_hot",
                event.target.checked
              )
            }
          />

          <span>
            <strong>Горячее задание</strong>

            <small>
              Задание получит дополнительное выделение
            </small>
          </span>
        </label>
      </div>
    </div>
  );
}

export default function AdminTasks({ admin }) {
  const [form, setForm] = useState(createEmptyTask);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] =
    useState(createEmptyTask);

  const [saving, setSaving] = useState(false);

  const [openedAdminTasks, setOpenedAdminTasks] =
    useState({});

  const [createOpened, setCreateOpened] =
    useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("order");

  const tasks = admin.tasks || [];

  const statistics = useMemo(() => {
    const active = tasks.filter(
      (task) => task.is_active
    ).length;

    const hidden = tasks.filter(
      (task) => !task.is_active
    ).length;

    const hot = tasks.filter(
      (task) => task.is_hot
    ).length;

    return {
      total: tasks.length,
      active,
      hidden,
      hot,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    const result = tasks.filter((task) => {
      const title = String(
        task.title || ""
      ).toLowerCase();

      const description = String(
        task.description || ""
      ).toLowerCase();

      const category = String(
        task.category || ""
      ).toLowerCase();

      const matchesSearch =
        !cleanSearch ||
        title.includes(cleanSearch) ||
        description.includes(cleanSearch) ||
        category.includes(cleanSearch);

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter = Boolean(task.is_active);
      }

      if (filter === "hidden") {
        matchesFilter = !task.is_active;
      }

      if (filter === "hot") {
        matchesFilter = Boolean(task.is_hot);
      }

      if (filter === "regular") {
        matchesFilter = !task.is_hot;
      }

      return matchesSearch && matchesFilter;
    });

    return [...result].sort((firstTask, secondTask) => {
      if (sort === "rewardHigh") {
        return (
          Number(secondTask.reward || 0) -
          Number(firstTask.reward || 0)
        );
      }

      if (sort === "rewardLow") {
        return (
          Number(firstTask.reward || 0) -
          Number(secondTask.reward || 0)
        );
      }

      if (sort === "title") {
        return String(firstTask.title || "").localeCompare(
          String(secondTask.title || ""),
          "ru"
        );
      }

      return (
        Number(firstTask.sort_order || 0) -
        Number(secondTask.sort_order || 0)
      );
    });
  }, [tasks, search, filter, sort]);

  function updateForm(key, value) {
    setForm((previousForm) => ({
      ...previousForm,
      [key]: value,
    }));
  }

  function updateEditForm(key, value) {
    setEditForm((previousForm) => ({
      ...previousForm,
      [key]: value,
    }));
  }

  function validateTask(task) {
    if (!task.title.trim()) {
      alert("Введите название задания");
      return false;
    }

    if (!task.description.trim()) {
      alert("Введите описание задания");
      return false;
    }

    const reward = Number(task.reward);

    if (!Number.isFinite(reward) || reward <= 0) {
      alert("Введите корректную награду");
      return false;
    }

    if (
      task.task_link.trim() &&
      !/^https?:\/\//i.test(task.task_link.trim())
    ) {
      alert(
        "Ссылка должна начинаться с http:// или https://"
      );

      return false;
    }

    return true;
  }

  function prepareTask(task) {
    return {
      title: task.title.trim(),
      description: task.description.trim(),
      instruction: task.instruction.trim(),
      reward: Number(task.reward),
      task_link: task.task_link.trim() || null,
      category: task.category.trim() || "Общее",
      difficulty: task.difficulty || "Простое",
      estimated_time:
        task.estimated_time.trim() || "2 минуты",
      proof_required: Boolean(task.proof_required),
      is_active: Boolean(task.is_active),
      is_hot: Boolean(task.is_hot),
      level: 1,
    };
  }

  async function createTask() {
    if (!validateTask(form) || saving) {
      return;
    }

    try {
      setSaving(true);

      const taskData = prepareTask(form);

      taskData.sort_order =
        Math.max(
          0,
          ...tasks.map(
            (task) =>
              Number(task.sort_order) || 0
          )
        ) + 1;

      const { error } =
        await createTaskApi(taskData);

      if (error) {
        alert(error.message);
        return;
      }

      setForm(createEmptyTask());

      await admin.reload();

      alert("Задание создано");
    } catch (error) {
      console.error(
        "Ошибка создания задания:",
        error
      );

      alert("Не удалось создать задание");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task) {
    setEditId(task.id);

    setEditForm({
      title: task.title || "",
      description: task.description || "",
      instruction: task.instruction || "",
      reward: task.reward ?? "",
      task_link: task.task_link || "",
      category: task.category || "Общее",
      difficulty:
        task.difficulty || "Простое",
      estimated_time:
        task.estimated_time || "2 минуты",
      proof_required:
        task.proof_required ?? true,
      is_active: task.is_active ?? true,
      is_hot: task.is_hot ?? false,
    });

    setOpenedAdminTasks((previous) => ({
      ...previous,
      [task.id]: true,
    }));
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(createEmptyTask());
  }

  async function saveEdit() {
    if (
      !editId ||
      !validateTask(editForm) ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);

      const taskData = prepareTask(editForm);

      delete taskData.level;

      const { error } = await updateTaskApi(
        editId,
        taskData
      );

      if (error) {
        alert(error.message);
        return;
      }

      cancelEdit();

      await admin.reload();

      alert("Задание обновлено");
    } catch (error) {
      console.error(
        "Ошибка обновления задания:",
        error
      );

      alert("Не удалось обновить задание");
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id) {
    const confirmed = window.confirm(
      "Удалить задание? Это действие нельзя отменить."
    );

    if (!confirmed || saving) {
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await deleteTaskApi(id);

      if (error) {
        alert(error.message);
        return;
      }

      if (editId === id) {
        cancelEdit();
      }

      await admin.reload();
    } catch (error) {
      console.error(
        "Ошибка удаления задания:",
        error
      );

      alert("Не удалось удалить задание");
    } finally {
      setSaving(false);
    }
  }

  async function moveTask(task, direction) {
    if (saving) {
      return;
    }

    const orderedTasks = [...tasks].sort(
      (firstTask, secondTask) =>
        Number(firstTask.sort_order || 0) -
        Number(secondTask.sort_order || 0)
    );

    const sameGroupTasks = orderedTasks.filter(
      (item) =>
        Boolean(item.is_hot) ===
        Boolean(task.is_hot)
    );

    const groupIndex = sameGroupTasks.findIndex(
      (item) => item.id === task.id
    );

    const targetGroupIndex =
      direction === "up"
        ? groupIndex - 1
        : groupIndex + 1;

    if (
      targetGroupIndex < 0 ||
      targetGroupIndex >= sameGroupTasks.length
    ) {
      return;
    }

    const targetTask =
      sameGroupTasks[targetGroupIndex];

    const currentOrder =
      Number(task.sort_order) || groupIndex + 1;

    const targetOrder =
      Number(targetTask.sort_order) ||
      targetGroupIndex + 1;

    try {
      setSaving(true);

      const { error: currentError } =
        await updateTaskApi(task.id, {
          sort_order: targetOrder,
        });

      if (currentError) {
        alert(currentError.message);
        return;
      }

      const { error: targetError } =
        await updateTaskApi(targetTask.id, {
          sort_order: currentOrder,
        });

      if (targetError) {
        alert(targetError.message);
        return;
      }

      await admin.reload();
    } catch (error) {
      console.error(
        "Ошибка перемещения задания:",
        error
      );

      alert("Не удалось изменить порядок");
    } finally {
      setSaving(false);
    }
  }

  if (admin.loading) {
    return (
      <div className="adminTasksLoading">
        Загрузка заданий...
      </div>
    );
  }

  return (
    <div className="adminTasksPage">
      <section className="adminTasksStats">
        <article className="adminTasksStat">
          <div className="adminTasksStatIcon blue">
            <FiActivity />
          </div>

          <div>
            <span>Всего заданий</span>
            <strong>{statistics.total}</strong>
          </div>
        </article>

        <article className="adminTasksStat">
          <div className="adminTasksStatIcon green">
            <FiCheckCircle />
          </div>

          <div>
            <span>Активные</span>
            <strong>{statistics.active}</strong>
          </div>
        </article>

        <article className="adminTasksStat">
          <div className="adminTasksStatIcon red">
            <FiEyeOff />
          </div>

          <div>
            <span>Скрытые</span>
            <strong>{statistics.hidden}</strong>
          </div>
        </article>

        <article className="adminTasksStat">
          <div className="adminTasksStatIcon orange">
            <FiZap />
          </div>

          <div>
            <span>Горячие</span>
            <strong>{statistics.hot}</strong>
          </div>
        </article>
      </section>

      <section className="adminTaskCreate">
        <button
          type="button"
          className="adminTaskCreateHeader"
          onClick={() =>
            setCreateOpened(
              (previous) => !previous
            )
          }
        >
          <div className="adminTaskCreateTitle">
            <div className="adminTaskCreateIcon">
              <FiPlus />
            </div>

            <div>
              <span>Новое задание</span>
              <h2>Создать задание</h2>
            </div>
          </div>

          {createOpened ? (
            <FiChevronUp />
          ) : (
            <FiChevronDown />
          )}
        </button>

        {createOpened && (
          <div className="adminTaskCreateBody">
            <TaskFields
              data={form}
              onChange={updateForm}
            />

            <div className="adminTaskCreateFooter">
              <button
                type="button"
                className="secondaryBtn"
                onClick={() =>
                  setForm(createEmptyTask())
                }
                disabled={saving}
              >
                Очистить
              </button>

              <button
                type="button"
                className="primaryBtn adminTaskSaveBtn"
                onClick={createTask}
                disabled={saving}
              >
                <FiPlus />

                {saving
                  ? "Сохранение..."
                  : "Создать задание"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="adminTasksDirectory">
        <div className="adminTasksDirectoryHeader">
          <div>
            <span>Управление контентом</span>

            <h2>Все задания</h2>

            <p>
              Найдено: {filteredTasks.length} из{" "}
              {statistics.total}
            </p>
          </div>

          <div className="adminTasksSearch">
            <FiSearch />

            <input
              type="search"
              placeholder="Поиск по названию или категории"
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

        <div className="adminTasksToolbar">
          <div className="adminTasksFilters">
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
                filter === "active"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("active")}
            >
              Активные
              <span>{statistics.active}</span>
            </button>

            <button
              type="button"
              className={
                filter === "hidden"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("hidden")}
            >
              Скрытые
              <span>{statistics.hidden}</span>
            </button>

            <button
              type="button"
              className={
                filter === "hot" ? "active" : ""
              }
              onClick={() => setFilter("hot")}
            >
              Горячие
              <span>{statistics.hot}</span>
            </button>

            <button
              type="button"
              className={
                filter === "regular"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("regular")}
            >
              Обычные
            </button>
          </div>

          <label className="adminTasksSort">
            <FiFilter />

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="order">
                По порядку
              </option>

              <option value="rewardHigh">
                Сначала дорогие
              </option>

              <option value="rewardLow">
                Сначала дешёвые
              </option>

              <option value="title">
                По названию
              </option>
            </select>
          </label>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="adminTasksEmpty">
            <div>
              <FiActivity />
            </div>

            <h3>Задания не найдены</h3>

            <p>
              Измени поисковый запрос или выбранный
              фильтр.
            </p>

            <button
              type="button"
              className="secondaryBtn"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setSort("order");
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="adminTasksGrid">
            {filteredTasks.map((task) => {
              const isOpened =
                openedAdminTasks[task.id];

              const isEditing =
                editId === task.id;

              return (
                <article
                  key={task.id}
                  className={`adminTaskCard ${
                    task.is_hot
                      ? "adminTaskCardHot"
                      : ""
                  }`}
                >
                  {isEditing ? (
                    <div className="adminTaskEdit">
                      <div className="adminTaskEditHeader">
                        <div>
                          <span>
                            Редактирование
                          </span>

                          <h3>{task.title}</h3>
                        </div>

                        <button
                          type="button"
                          className="adminTaskCloseEdit"
                          onClick={cancelEdit}
                          disabled={saving}
                          aria-label="Закрыть редактирование"
                        >
                          <FiX />
                        </button>
                      </div>

                      <TaskFields
                        data={editForm}
                        onChange={updateEditForm}
                      />

                      <div className="adminTaskEditActions">
                        <button
                          type="button"
                          className="secondaryBtn"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Отмена
                        </button>

                        <button
                          type="button"
                          className="primaryBtn"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          <FiCheckCircle />

                          {saving
                            ? "Сохранение..."
                            : "Сохранить"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="adminTaskCardTop">
                        <div className="adminTaskBadges">
                          <span
                            className={`adminTaskStatus ${
                              task.is_active
                                ? "active"
                                : "hidden"
                            }`}
                          >
                            {task.is_active ? (
                              <FiEye />
                            ) : (
                              <FiEyeOff />
                            )}

                            {task.is_active
                              ? "Активно"
                              : "Скрыто"}
                          </span>

                          {task.is_hot && (
                            <span className="adminTaskHotBadge">
                              <FiZap />
                              Горячее
                            </span>
                          )}
                        </div>

                        <strong className="adminTaskReward">
                          +{Number(
                            task.reward || 0
                          ).toLocaleString("ru-RU")}{" "}
                          ₽
                        </strong>
                      </div>

                      <div className="adminTaskCardMain">
                        <div
                          className={`adminTaskIcon ${
                            task.is_hot ? "hot" : ""
                          }`}
                        >
                          {task.is_hot ? (
                            <FiZap />
                          ) : (
                            <FiActivity />
                          )}
                        </div>

                        <div className="adminTaskCardInfo">
                          <span>
                            {task.category || "Общее"}
                          </span>

                          <h3>
                            {task.title ||
                              "Задание без названия"}
                          </h3>

                          <p>
                            {task.description ||
                              "Описание не добавлено"}
                          </p>
                        </div>
                      </div>

                      <div className="adminTaskQuickMeta">
                        <span>
                          <FiClock />
                          {task.estimated_time ||
                            "2 минуты"}
                        </span>

                        <span>
                          {task.difficulty ||
                            "Простое"}
                        </span>

                        <span>
                          Порядок:{" "}
                          {task.sort_order ?? "—"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="adminTaskExpandBtn"
                        onClick={() =>
                          setOpenedAdminTasks(
                            (previous) => ({
                              ...previous,
                              [task.id]:
                                !previous[task.id],
                            })
                          )
                        }
                      >
                        {isOpened ? (
                          <>
                            <FiChevronUp />
                            Свернуть задание
                          </>
                        ) : (
                          <>
                            <FiChevronDown />
                            Подробнее
                          </>
                        )}
                      </button>

                      {isOpened && (
                        <div className="adminTaskExpanded">
                          {task.instruction && (
                            <div className="adminTaskInstruction">
                              <span>
                                Подробная инструкция
                              </span>

                              <p>
                                {task.instruction}
                              </p>
                            </div>
                          )}

                          <div className="adminTaskMetaGrid">
                            <div>
                              <span>Категория</span>
                              <strong>
                                {task.category ||
                                  "Общее"}
                              </strong>
                            </div>

                            <div>
                              <span>Сложность</span>
                              <strong>
                                {task.difficulty ||
                                  "Простое"}
                              </strong>
                            </div>

                            <div>
                              <span>Время</span>
                              <strong>
                                {task.estimated_time ||
                                  "2 минуты"}
                              </strong>
                            </div>

                            <div>
                              <span>Скриншот</span>
                              <strong>
                                {task.proof_required
                                  ? "Требуется"
                                  : "Не требуется"}
                              </strong>
                            </div>

                            <div>
                              <span>Тип</span>
                              <strong>
                                {task.is_hot
                                  ? "Горячее"
                                  : "Обычное"}
                              </strong>
                            </div>

                            <div>
                              <span>Порядок</span>
                              <strong>
                                {task.sort_order ??
                                  "Не задан"}
                              </strong>
                            </div>
                          </div>

                          {task.task_link && (
                            <a
                              href={task.task_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adminTaskLink"
                            >
                              <FiExternalLink />
                              Открыть ссылку задания
                            </a>
                          )}

                          <div className="adminTaskActions">
                            <div className="adminTaskOrderControls">
                              <button
                                type="button"
                                title="Переместить выше"
                                onClick={() =>
                                  moveTask(task, "up")
                                }
                                disabled={saving}
                              >
                                <FiArrowUp />
                              </button>

                              <button
                                type="button"
                                title="Переместить ниже"
                                onClick={() =>
                                  moveTask(task, "down")
                                }
                                disabled={saving}
                              >
                                <FiArrowDown />
                              </button>
                            </div>

                            <button
                              type="button"
                              className="secondaryBtn"
                              onClick={() =>
                                startEdit(task)
                              }
                              disabled={saving}
                            >
                              <FiEdit2 />
                              Редактировать
                            </button>

                            <button
                              type="button"
                              className="dangerBtn"
                              onClick={() =>
                                removeTask(task.id)
                              }
                              disabled={saving}
                            >
                              <FiTrash2 />
                              Удалить
                            </button>
                          </div>
                        </div>
                      )}
                    </>
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