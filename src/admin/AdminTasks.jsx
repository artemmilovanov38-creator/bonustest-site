import { useState } from "react";
import {
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../services/api";

export default function AdminTasks({ admin }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReward, setEditReward] = useState("");

  async function createTask() {
    if (!title || !description || !reward) {
      alert("Заполните все поля");
      return;
    }

    await createTaskApi({
      title,
      description,
      reward: Number(reward),
      level: 1,
    });

    setTitle("");
    setDescription("");
    setReward("");

    admin.reload();
  }

  function startEdit(task) {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditReward(task.reward);
  }

  async function saveEdit() {
    if (!editTitle || !editDescription || !editReward) {
      alert("Заполните все поля");
      return;
    }

    await updateTaskApi(editId, {
      title: editTitle,
      description: editDescription,
      reward: Number(editReward),
    });

    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditReward("");

    admin.reload();
  }

  async function removeTask(id) {
    const ok = confirm("Удалить задание?");
    if (!ok) return;

    await deleteTaskApi(id);
    admin.reload();
  }

  return (
    <>
      <div className="pageHeader">
        <h1>Задания</h1>
      </div>

      <div className="taskEditor">
        <input
          className="searchInput"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="taskTextarea"
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Награда"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
        />

        <button className="primaryBtn" onClick={createTask}>
          Создать задание
        </button>
      </div>

      <div className="usersGrid">
        {admin.tasks?.map((task) => (
          <div key={task.id} className="userCard">
            {editId === task.id ? (
              <>
                <input
                  className="searchInput"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <textarea
                  className="taskTextarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />

                <input
                  className="searchInput"
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
                />

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
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <h2>+{task.reward} ₽</h2>

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