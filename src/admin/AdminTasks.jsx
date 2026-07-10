import { useState } from "react";
import {
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../services/api";

const emptyTask = {
  title: "",
  description: "",
  reward: "",
  task_link: "",
  category: "Общее",
  difficulty: "Простое",
  estimated_time: "2 минуты",
  proof_required: true,
  is_active: true,
  is_hot: false,
  instruction: "",
};

export default function AdminTasks({ admin }) {
  const [form, setForm] = useState(emptyTask);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyTask);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEditForm(key, value) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createTask() {
    if (!form.title || !form.description || !form.reward) {
      alert("Заполните название, описание и награду");
      return;
    }

    await createTaskApi({
      ...form,
      reward: Number(form.reward),
      level: 1,
    });

    setForm(emptyTask);
    admin.reload();
  }

  function startEdit(task) {
    setEditId(task.id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      reward: task.reward || "",
      task_link: task.task_link || "",
      category: task.category || "Общее",
      difficulty: task.difficulty || "Простое",
      estimated_time: task.estimated_time || "2 минуты",
      proof_required: task.proof_required ?? true,
      is_active: task.is_active ?? true,
      is_hot: task.is_hot ?? false,
      instruction: task.instruction || "",
    });
  }

  async function saveEdit() {
    if (!editForm.title || !editForm.description || !editForm.reward) {
      alert("Заполните название, описание и награду");
      return;
    }

    await updateTaskApi(editId, {
      ...editForm,
      reward: Number(editForm.reward),
    });

    setEditId(null);
    setEditForm(emptyTask);
    admin.reload();
  }

  async function removeTask(id) {
    if (!confirm("Удалить задание?")) return;
    await deleteTaskApi(id);
    admin.reload();
  }

  function TaskFields({ data, setValue }) {
    return (
      <>
        <input
          className="searchInput"
          placeholder="Название задания"
          value={data.title}
          onChange={(e) => setValue("title", e.target.value)}
        />

        <textarea
          className="taskTextarea"
          placeholder="Описание задания"
          value={data.description}
          onChange={(e) => setValue("description", e.target.value)}
        />

        <textarea
          className="taskTextarea"
          placeholder="Инструкция выполнения"
          value={data.instruction}
          onChange={(e) => setValue("instruction", e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Награда"
          value={data.reward}
          onChange={(e) => setValue("reward", e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Ссылка на задание"
          value={data.task_link}
          onChange={(e) => setValue("task_link", e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Категория"
          value={data.category}
          onChange={(e) => setValue("category", e.target.value)}
        />

        <select
          className="searchInput"
          value={data.difficulty}
          onChange={(e) => setValue("difficulty", e.target.value)}
        >
          <option>Простое</option>
          <option>Среднее</option>
          <option>Сложное</option>
        </select>

        <input
          className="searchInput"
          placeholder="Время выполнения"
          value={data.estimated_time}
          onChange={(e) => setValue("estimated_time", e.target.value)}
        />

        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.proof_required}
            onChange={(e) => setValue("proof_required", e.target.checked)}
          />
          Требуется скриншот
        </label>

        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) => setValue("is_active", e.target.checked)}
          />
          Активное задание
        </label>

        <label className="adminCheck">
          <input
            type="checkbox"
            checked={data.is_hot}
            onChange={(e) => setValue("is_hot", e.target.checked)}
          />
          Горячее задание
        </label>
      </>
    );
  }

  return (
    <>
      <div className="pageHeader">
        <h1>Задания</h1>
      </div>

      <div className="taskEditor">
        <TaskFields data={form} setValue={updateForm} />

        <button className="primaryBtn" onClick={createTask}>
          Создать задание
        </button>
      </div>

      <div className="usersGrid">
        {admin.tasks?.map((task) => (
          <div key={task.id} className="userCard">
            {editId === task.id ? (
              <>
                <TaskFields data={editForm} setValue={updateEditForm} />

                <div className="reviewButtons">
                  <button className="primaryBtn" onClick={saveEdit}>
                    Сохранить
                  </button>

                  <button
                    className="secondaryBtn"
                    onClick={() => setEditId(null)}
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  {task.is_hot ? "🔥 " : ""}
                  {task.title}
                </h3>

                <p>{task.description}</p>

                <p>
                  Категория: <strong>{task.category || "Общее"}</strong>
                </p>

                <p>
                  Сложность: <strong>{task.difficulty || "Простое"}</strong>
                </p>

                <p>
                  Время: <strong>{task.estimated_time || "2 минуты"}</strong>
                </p>

                <p>
                  Скриншот:{" "}
                  <strong>{task.proof_required ? "нужен" : "не нужен"}</strong>
                </p>

                <p>
                  Статус:{" "}
                  <strong>{task.is_active ? "активно" : "скрыто"}</strong>
                </p>

                <h2>+{task.reward} ₽</h2>

                {task.task_link && (
                  <a
                    href={task.task_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adminTaskLink"
                  >
                    Открыть ссылку
                  </a>
                )}

                <div className="reviewButtons">
                  <button
                    className="secondaryBtn"
                    onClick={() => startEdit(task)}
                  >
                    Редактировать
                  </button>

                  <button
                    className="primaryBtn"
                    onClick={() => removeTask(task.id)}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}