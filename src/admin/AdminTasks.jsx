import { useState } from "react";
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
      <label className="adminField">
        <span>Название задания</span>

        <input
          className="searchInput"
          type="text"
          placeholder="Например: Подписаться на Telegram"
          value={data.title}
          onChange={(event) =>
            onChange("title", event.target.value)
          }
        />
      </label>

      <label className="adminField">
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

      <label className="adminField">
        <span>Подробная инструкция</span>

        <textarea
          className="taskTextarea"
          placeholder="Опишите действия пользователя по шагам"
          value={data.instruction}
          onChange={(event) =>
            onChange("instruction", event.target.value)
          }
        />
      </label>

      <div className="adminTaskFieldsRow">
        <label className="adminField">
          <span>Награда, ₽</span>

          <input
            className="searchInput"
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
            className="searchInput"
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
      </div>

      <label className="adminField">
        <span>Ссылка на задание</span>

        <input
          className="searchInput"
          type="url"
          placeholder="https://example.com"
          value={data.task_link}
          onChange={(event) =>
            onChange("task_link", event.target.value)
          }
        />
      </label>

      <div className="adminTaskFieldsRow">
        <label className="adminField">
          <span>Категория</span>

          <input
            className="searchInput"
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
            className="searchInput"
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
      </div>

      <div className="adminTaskChecks">
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
              onChange("is_active", event.target.checked)
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
              onChange("is_hot", event.target.checked)
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
  const [editForm, setEditForm] = useState(createEmptyTask);
  const [saving, setSaving] = useState(false);
  const [openedAdminTasks, setOpenedAdminTasks] = useState({});

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
    if (!validateTask(form) || saving) return;

    try {
      setSaving(true);

      const taskData = prepareTask(form);

taskData.sort_order =
  Math.max(
    0,
    ...(admin.tasks || []).map(
      (task) => Number(task.sort_order) || 0
    )
  ) + 1;

const { error } = await createTaskApi(taskData);

      if (error) {
        alert(error.message);
        return;
      }

      setForm(createEmptyTask());
      await admin.reload();

      alert("Задание создано");
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
      difficulty: task.difficulty || "Простое",
      estimated_time:
        task.estimated_time || "2 минуты",
      proof_required: task.proof_required ?? true,
      is_active: task.is_active ?? true,
      is_hot: task.is_hot ?? false,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(createEmptyTask());
  }

  async function saveEdit() {
    if (!editId || !validateTask(editForm) || saving) {
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
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id) {
    const confirmed = confirm(
      "Удалить задание? Это действие нельзя отменить."
    );

    if (!confirmed || saving) return;

    try {
      setSaving(true);

      const { error } = await deleteTaskApi(id);

      if (error) {
        alert(error.message);
        return;
      }

      if (editId === id) {
        cancelEdit();
      }

      await admin.reload();
    } finally {
      setSaving(false);
    }
  }

  async function moveTask(task, direction) {
  if (saving) return;

  const taskList = admin.tasks || [];

  const currentIndex = taskList.findIndex(
    (item) => item.id === task.id
  );

  if (currentIndex === -1) return;

  const sameGroupTasks = taskList.filter(
    (item) => Boolean(item.is_hot) === Boolean(task.is_hot)
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

  const targetTask = sameGroupTasks[targetGroupIndex];

  const currentOrder =
    task.sort_order ?? currentIndex;

  const targetOrder =
    targetTask.sort_order ??
    taskList.findIndex((item) => item.id === targetTask.id);

  try {
    setSaving(true);

    const { error: currentError } = await updateTaskApi(
      task.id,
      {
        sort_order: targetOrder,
      }
    );

    if (currentError) {
      alert(currentError.message);
      return;
    }

    const { error: targetError } = await updateTaskApi(
      targetTask.id,
      {
        sort_order: currentOrder,
      }
    );

    if (targetError) {
      alert(targetError.message);
      return;
    }

    await admin.reload();
  } finally {
    setSaving(false);
  }
}
if (admin.loading) {
  return <h2>Загрузка заданий...</h2>;
}

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Задания</h1>

          <p className="pageSubtitle">
            Создание, редактирование и управление заданиями
          </p>
        </div>
      </div>

      <section className="adminTaskCreate">
        <div className="adminTaskSectionHeader">
          <div>
            <span>Новое задание</span>
            <h2>Создать задание</h2>
          </div>
        </div>

        <TaskFields
          data={form}
          onChange={updateForm}
        />

        <button
          className="primaryBtn adminTaskSaveBtn"
          onClick={createTask}
          disabled={saving}
        >
          {saving
            ? "Сохранение..."
            : "Создать задание"}
        </button>
      </section>

      <section className="adminTaskListSection">
        <div className="adminTaskSectionHeader">
          <div>
            <span>Все задания</span>
            <h2>
              Задания: {admin.tasks?.length || 0}
            </h2>
          </div>
        </div>

        <div className="usersGrid">
          {admin.tasks?.length === 0 ? (
            <div className="emptyBox">
              Заданий пока нет
            </div>

            
          ) : (

            
            admin.tasks.map((task, index) => (
              <article
                key={task.id}
                className="userCard adminTaskCard"
              >
                {editId === task.id ? (
                  <>
                    <div className="adminTaskEditTitle">
                      Редактирование задания
                    </div>

                    <TaskFields
                      data={editForm}
                      onChange={updateEditForm}
                    />

                    <div className="reviewButtons">
                      <button
                        className="primaryBtn"
                        onClick={saveEdit}
                        disabled={saving}
                      >
                        Сохранить
                      </button>

                      <button
                        className="secondaryBtn"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Отмена
                      </button>
                    </div>
                  </>
                ) : (
  <>
    <div className="adminCompactTaskHead">
      <div className="adminCompactTaskBadges">
        <span
          className={`adminTaskStatus ${
            task.is_active ? "active" : "hidden"
          }`}
        >
          {task.is_active ? "Активно" : "Скрыто"}
        </span>

        <span className="adminCompactTime">
          ⏱ {task.estimated_time || "2 минуты"}
        </span>
      </div>

      <strong className="adminCompactReward">
        +{task.reward} ₽
      </strong>
    </div>

    <div className="adminCompactTaskMain">
      <div
        className={`taskIcon ${
          task.is_hot ? "hotTaskIcon" : ""
        }`}
      >
        {task.is_hot ? "🔥" : "⭐"}
      </div>

      <div className="adminCompactTaskInfo">
        <h3>{task.title}</h3>

        <p className="adminCompactDescription">
          {task.description}
        </p>
      </div>
    </div>

    <button
      type="button"
      className="taskOpenBtn adminTaskOpenBtn"
      onClick={() =>
        setOpenedAdminTasks((previous) => ({
          ...previous,
          [task.id]: !previous[task.id],
        }))
      }
    >
      {openedAdminTasks[task.id]
        ? "▲ Свернуть задание"
        : "▼ Открыть задание"}
    </button>

    {openedAdminTasks[task.id] && (
      <div className="adminTaskExpandedContent">
        {task.instruction && (
          <div className="adminTaskInstruction">
            <strong>Подробная инструкция</strong>
            <p>{task.instruction}</p>
          </div>
        )}

        <div className="adminTaskMetaGrid">
          <div>
            <span>Категория</span>
            <strong>{task.category || "Общее"}</strong>
          </div>

          <div>
            <span>Сложность</span>
            <strong>{task.difficulty || "Простое"}</strong>
          </div>

          <div>
            <span>Время</span>
            <strong>
              {task.estimated_time || "2 минуты"}
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
              {task.is_hot ? "Горячее" : "Обычное"}
            </strong>
          </div>

          <div>
            <span>Порядок</span>
            <strong>{task.sort_order ?? "Не задан"}</strong>
          </div>
        </div>

        {task.task_link && (
          <a
            href={task.task_link}
            target="_blank"
            rel="noopener noreferrer"
            className="adminTaskLink"
          >
            Открыть ссылку задания
          </a>
        )}

        <div className="reviewButtons">
          <div className="adminTaskOrderControls">
            <button
              type="button"
              className="adminTaskOrderBtn"
              title="Переместить выше"
              onClick={() => moveTask(task, "up")}
              disabled={saving}
            >
              ↑
            </button>

            <button
              type="button"
              className="adminTaskOrderBtn"
              title="Переместить ниже"
              onClick={() => moveTask(task, "down")}
              disabled={saving}
            >
              ↓
            </button>
          </div>

          <button
            type="button"
            className="secondaryBtn"
            onClick={() => startEdit(task)}
            disabled={saving}
          >
            Редактировать
          </button>

          <button
            type="button"
            className="dangerBtn"
            onClick={() => removeTask(task.id)}
            disabled={saving}
          >
            Удалить
          </button>
        </div>
      </div>
    )}
  </>
)}
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}