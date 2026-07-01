import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

export default function App() {
const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState("signup");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const [user, setUser] = useState(null);
const [balance, setBalance] = useState(0);
const [siteStats, setSiteStats] = useState({
  users: 0,
  paid: 0,
  tasks: 0,
});

const [tasks, setTasks] = useState([]);
const [completedTasks, setCompletedTasks] = useState([]);
const [proofFiles, setProofFiles] = useState({});
const [taskHistory, setTaskHistory] = useState([]);
const [showWithdraw, setShowWithdraw] = useState(false);
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawWallet, setWithdrawWallet] = useState("");

const [withdrawHistory, setWithdrawHistory] = useState([]);
const [isAdminPanel, setIsAdminPanel] = useState(false);
const [adminWithdraws, setAdminWithdraws] = useState([]);
const [adminTab, setAdminTab] = useState("main");
const [adminUsers, setAdminUsers] = useState([]);
const [userSearch, setUserSearch] = useState("");
const [balanceEditUserId, setBalanceEditUserId] = useState(null);
const [balanceAmount, setBalanceAmount] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [adminTasks, setAdminTasks] = useState([]);
const [adminUserTasks, setAdminUserTasks] = useState([]);
const [siteSettings, setSiteSettings] = useState({});
const [minWithdraw, setMinWithdraw] = useState("");
const [supportTelegram, setSupportTelegram] = useState("");
const [siteName, setSiteName] = useState("");
const [newTaskTitle, setNewTaskTitle] = useState("");
const [newTaskDescription, setNewTaskDescription] = useState("");
const [newTaskReward, setNewTaskReward] = useState("");
const [editingTaskId, setEditingTaskId] = useState(null);
const [editTaskTitle, setEditTaskTitle] = useState("");
const [editTaskDescription, setEditTaskDescription] = useState("");
const [editTaskReward, setEditTaskReward] = useState("");


useEffect(() => {
  checkUser();
  loadSiteStats();
  loadSiteSettings();
}, []);

async function updateSiteSetting(key, value) {
  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", key);

  if (error) {
    alert(error.message);
    return;
  }
}

async function saveSiteSettings() {
  await updateSiteSetting("min_withdraw", minWithdraw);
  await updateSiteSetting("support_telegram", supportTelegram);
  await updateSiteSetting("site_name", siteName);

  loadSiteSettings();

  alert("Настройки сохранены");
}

async function checkUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    loadTasks();
    return;
  }
  const { data: completed } = await supabase
  .from("user_tasks")
  .select("task_id")
  .eq("user_id", session.user.id);

if (completed) {
  setCompletedTasks(
    completed.map((item) => item.task_id)
  );
}
loadTaskHistory(session.user.id);
loadWithdrawHistory(session.user.id);

  setUser(session.user);
  checkIsAdmin(session.user.email);

  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", session.user.id)
    .single();

  if (dbUser) {
  if (dbUser.is_blocked) {
    alert("Ваш аккаунт заблокирован");
    await supabase.auth.signOut();
    setUser(null);
    return;
  }

  setBalance(dbUser.balance);
}

  loadTasks();
}

async function loadTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("id");

  if (!error) {
    setTasks(data);
  }
}

async function loadSiteStats() {
  const { data: users } = await supabase
    .from("users")
    .select("id");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id");

  const { data: paidWithdraws } = await supabase
    .from("withdraw_requests")
    .select("amount")
    .eq("status", "approved");

  const paid = (paidWithdraws || []).reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  setSiteStats({
    users: users?.length || 0,
    tasks: tasks?.length || 0,
    paid,
  });
}
async function loadSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*");

  if (error) {
    console.log(error.message);
    return;
  }

  const settings = {};

  data.forEach((item) => {
    settings[item.key] = item.value;
  });

  setSiteSettings(settings);
  setMinWithdraw(settings.min_withdraw || "");
  setSupportTelegram(settings.support_telegram || "");
  setSiteName(settings.site_name || "");
}

async function loadTaskHistory(userId) {
  const { data: history, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    return;
  }

  const historyWithTasks = await Promise.all(
    history.map(async (item) => {
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", item.task_id)
        .single();

      return {
        ...item,
        task,
      };
    })
  );

  setTaskHistory(historyWithTasks);
}

async function completeTask(task) {
  if (!user) {
    alert("Сначала войдите в аккаунт");
    return;
  }

  const file = proofFiles[task.id];

  if (!file) {
    alert("Прикрепите скриншот выполнения задания");
    return;
  }

  const { data: alreadyDone, error: checkError } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_id", task.id);

  if (checkError) {
    alert(checkError.message);
    return;
  }

  if (alreadyDone && alreadyDone.length > 0) {
    alert("Вы уже отправили это задание");
    return;
  }

  const filePath = `${user.id}/${task.id}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("task-proofs")
    .upload(filePath, file);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("task-proofs")
    .getPublicUrl(filePath);

  const { error } = await supabase
    .from("user_tasks")
    .insert({
      user_id: user.id,
      task_id: task.id,
      completed: true,
      rewarded: false,
      status: "pending",
      proof_url: publicUrlData.publicUrl,
    });

  if (error) {
    alert(error.message);
    return;
  }

  setCompletedTasks([...completedTasks, task.id]);
  setProofFiles({
    ...proofFiles,
    [task.id]: null,
  });

  loadTaskHistory(user.id);

  alert("Задание отправлено на проверку");
}

async function createWithdrawRequest() {
  if (!withdrawAmount || !withdrawWallet) {
    alert("Заполните все поля");
    return;
  }

  if (Number(withdrawAmount) <= 0) {
    alert("Введите корректную сумму");
    return;
  }

  if (Number(withdrawAmount) < Number(siteSettings.min_withdraw || 0)) {
  alert(`Минимальная сумма вывода: ${siteSettings.min_withdraw} ₽`);
  return;
}

  if (Number(withdrawAmount) > Number(balance)) {
    alert("Недостаточно средств");
    return;
  }

  const { error } = await supabase
    .from("withdraw_requests")
    .insert({
      user_id: user.id,
      email: user.email,
      amount: Number(withdrawAmount),
      wallet: withdrawWallet,
      status: "pending",
    });

  if (error) {
    alert(error.message);
    return;
  }

  const newBalance =
    Number(balance) - Number(withdrawAmount);

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      balance: newBalance,
    })
    .eq("auth_id", user.id);

  if (balanceError) {
    alert(balanceError.message);
    return;
  }

  setBalance(newBalance);

  setWithdrawAmount("");
  setWithdrawWallet("");
  setShowWithdraw(false);
  loadWithdrawHistory(user.id);

  alert("Заявка отправлена");
}

async function loadWithdrawHistory(userId) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    return;
  }

  setWithdrawHistory(data || []);
}

async function loadAdminWithdraws() {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  setAdminWithdraws(data || []);
}


async function updateWithdrawStatus(id, status) {
  const { error } = await supabase
    .from("withdraw_requests")
    .update({ status: status })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }


  loadAdminWithdraws();

  alert(
    status === "approved"
      ? "Заявка одобрена"
      : "Заявка отклонена"
  );
}

async function loadAdminTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("id");

  if (error) {
    alert(error.message);
    return;
  }

  setAdminTasks(data || []);
}

async function loadAdminUserTasks() {
  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  const withDetails = await Promise.all(
    data.map(async (item) => {
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", item.task_id)
        .single();

      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", item.user_id)
        .single();

      return {
        ...item,
        task,
        dbUser,
      };
    })
  );

  setAdminUserTasks(withDetails);
}

async function updateUserTaskStatus(item, status) {
  const { error } = await supabase
    .from("user_tasks")
    .update({
      status: status,
      rewarded: status === "approved",
    })
    .eq("id", item.id);

  if (error) {
    alert(error.message);
    return;
  }

  if (status === "approved") {
    const newBalance =
      Number(item.dbUser.balance) + Number(item.task.reward);

    const { error: balanceError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
      })
      .eq("auth_id", item.user_id);

    if (balanceError) {
      alert(balanceError.message);
      return;
    }
  }

  loadAdminUserTasks();
  loadAdminUsers();

  alert(
    status === "approved"
      ? "Задание одобрено, деньги начислены"
      : "Задание отклонено"
  );
}

async function loadAdminUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  setAdminUsers(data || []);
}

async function changeUserBalance(userItem, type) {
  if (!balanceAmount || Number(balanceAmount) <= 0) {
    alert("Введите корректную сумму");
    return;
  }

  let newBalance = Number(userItem.balance);

  if (type === "add") {
    newBalance = newBalance + Number(balanceAmount);
  }

  if (type === "remove") {
    newBalance = newBalance - Number(balanceAmount);
  }

  if (newBalance < 0) {
    alert("Баланс не может быть меньше 0");
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      balance: newBalance,
    })
    .eq("id", userItem.id);

  if (error) {
    alert(error.message);
    return;
  }

  setBalanceAmount("");
  setBalanceEditUserId(null);

  loadAdminUsers();

  alert("Баланс обновлён");
}

async function toggleUserBlock(userItem) {
  const { error } = await supabase
    .from("users")
    .update({
      is_blocked: !userItem.is_blocked,
    })
    .eq("id", userItem.id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminUsers();

  alert(
    userItem.is_blocked
      ? "Пользователь разблокирован"
      : "Пользователь заблокирован"
  );
}

async function checkIsAdmin(email) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.log(error.message);
    setIsAdmin(false);
    return;
  }

  setIsAdmin(!!data);
}

async function createTask() {
  if (!newTaskTitle || !newTaskDescription || !newTaskReward) {
    alert("Заполните все поля задания");
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .insert({
      title: newTaskTitle,
      description: newTaskDescription,
      reward: Number(newTaskReward),
      level: 1,
    });

  if (error) {
    alert(error.message);
    return;
  }

  setNewTaskTitle("");
  setNewTaskDescription("");
  setNewTaskReward("");

  loadAdminTasks();
  loadTasks();

  alert("Задание создано");
}

async function deleteTask(id) {
  const confirmDelete = confirm("Удалить это задание?");

  if (!confirmDelete) {
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminTasks();
  loadTasks();

  alert("Задание удалено");
}

function startEditTask(task) {
  setEditingTaskId(task.id);
  setEditTaskTitle(task.title);
  setEditTaskDescription(task.description);
  setEditTaskReward(task.reward);
}

async function saveTaskEdit() {
  if (!editTaskTitle || !editTaskDescription || !editTaskReward) {
    alert("Заполните все поля");
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title: editTaskTitle,
      description: editTaskDescription,
      reward: Number(editTaskReward),
    })
    .eq("id", editingTaskId);

  if (error) {
    alert(error.message);
    return;
  }

  setEditingTaskId(null);
  setEditTaskTitle("");
  setEditTaskDescription("");
  setEditTaskReward("");

  loadAdminTasks();
  loadTasks();

  alert("Задание обновлено");
}

function cancelEditTask() {
  setEditingTaskId(null);
  setEditTaskTitle("");
  setEditTaskDescription("");
  setEditTaskReward("");
}

function getStatusText(status) {
  if (status === "pending") {
    return "🟡 На проверке";
  }

  if (status === "approved") {
    return "🟢 Одобрено";
  }

  if (status === "rejected") {
    return "🔴 Отклонено";
  }

  return "⚪ Неизвестно";
}

async function handleSignUp() {
  if (!email || !password) {
    alert("Введите email и пароль");
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }
    if (data?.user) {
  console.log("USER:", data.user);

  const { data: insertedData, error: insertError } = await supabase
    .from("users")
    .insert({
      auth_id: data.user.id,
      email: data.user.email,
      balance: 0,
    })
    .select();

  console.log("INSERT DATA:", insertedData);
  console.log("INSERT ERROR:", insertError);

  if (insertError) {
    alert(insertError.message);
  }
}

    alert("Аккаунт создан. Теперь можно войти.");
    setAuthMode("signin");
  } finally {
    setLoading(false);
  }
}

async function handleSignIn() {
  if (!email || !password) {
    alert("Введите email и пароль");
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

    if (error) {
      alert(error.message);
      return;
    }

   setUser(data.user);
   checkIsAdmin(data.user.email);
   loadTaskHistory(data.user.id);
   loadWithdrawHistory(data.user.id);
setShowAuth(false);
  } finally {
    setLoading(false);
  }
}

if (user && isAdminPanel) {
  return (
    <div className="dashboard">
      <div className="dashboardHeader">
        <h1>Админка</h1>

        <button
          className="secondaryBtn"
          onClick={() => setIsAdminPanel(false)}
        >
          Кабинет
        </button>
      </div>

      <div className="heroButtons">
        <button className="secondaryBtn" onClick={() => setAdminTab("main")}>
          Главная
        </button>

        <button className="secondaryBtn" onClick={() => setAdminTab("users")}>
          Пользователи
        </button>

        <button className="secondaryBtn" onClick={() => setAdminTab("withdraws")}>
          Заявки
        </button>

        <button
  className="secondaryBtn"
  onClick={() => setAdminTab("taskReviews")}
>
  Проверка заданий
</button>

        <button className="secondaryBtn" onClick={() => setAdminTab("tasks")}>
          Задания
        </button>

        <button
  className="secondaryBtn"
  onClick={() => setAdminTab("settings")}
>
  Настройки
</button>
      </div>

      {adminTab === "main" && (
        <div className="tasksSection">
          <h2>Статистика</h2>

          <div className="taskCard">
  <div className="taskInfo">
    <h3>Ожидают обработки</h3>
    <p>
      {
        adminWithdraws.filter(
          (item) => item.status === "pending"
        ).length
      }
    </p>
  </div>
</div>

<div className="taskCard">
  <div className="taskInfo">
    <h3>Одобрено заявок</h3>
    <p>
      {
        adminWithdraws.filter(
          (item) => item.status === "approved"
        ).length
      }
    </p>
  </div>
</div>

<div className="taskCard">
  <div className="taskInfo">
    <h3>Отклонено заявок</h3>
    <p>
      {
        adminWithdraws.filter(
          (item) => item.status === "rejected"
        ).length
      }
    </p>
  </div>
</div>

<div className="taskCard">
  <div className="taskInfo">
    <h3>Сумма одобренных выплат</h3>
    <p>
      {
        adminWithdraws
          .filter((item) => item.status === "approved")
          .reduce((sum, item) => sum + Number(item.amount), 0)
      } ₽
    </p>
  </div>
</div>

          <div className="taskCard">
            <div className="taskInfo">
              <h3>Пользователей</h3>
              <p>{adminUsers.length}</p>
            </div>
          </div>

          <div className="taskCard">
            <div className="taskInfo">
              <h3>Заявок на вывод</h3>
              <p>{adminWithdraws.length}</p>
            </div>
          </div>

          <div className="taskCard">
            <div className="taskInfo">
              <h3>Заданий</h3>
              <p>{adminTasks.length}</p>
            </div>
          </div>
        </div>
      )}

      {adminTab === "users" && (
        <div className="tasksSection">
          <h2>Пользователи</h2>

          <input
  className="authInput"
  placeholder="Поиск по email"
  value={userSearch}
  onChange={(e) => setUserSearch(e.target.value)}
/>

        {adminUsers
  .filter((item) =>
    item.email
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  )
  .map((item) => (
            <div className="taskCard" key={item.id}>
              <div className="taskInfo">
                <h3>{item.email}</h3>
                <p>Баланс: {item.balance} ₽</p>
                {balanceEditUserId === item.id ? (
  <div>
    <input
      className="authInput"
      placeholder="Сумма"
      value={balanceAmount}
      onChange={(e) => setBalanceAmount(e.target.value)}
    />

    <div className="heroButtons">
      <button
        className="primaryBtn"
        onClick={() => changeUserBalance(item, "add")}
      >
        Начислить
      </button>

      <button
        className="secondaryBtn"
        onClick={() => changeUserBalance(item, "remove")}
      >
        Списать
      </button>

      <button
        className="secondaryBtn"
        onClick={() => {
          setBalanceEditUserId(null);
          setBalanceAmount("");
        }}
      >
        Отмена
      </button>
    </div>
    <button
  className="secondaryBtn"
  onClick={() => toggleUserBlock(item)}
>
  {item.is_blocked ? "Разблокировать" : "Заблокировать"}
</button>
  </div>
  
) : (
  <button
    className="secondaryBtn"
    onClick={() => setBalanceEditUserId(item.id)}
  >
    Изменить баланс
  </button>
)}
                <p>
                  Регистрация:{" "}
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="reviewCard">
  <div className="reviewHeader">
    <div>
      <h3>{item.task?.title || "Задание"}</h3>
      <p>{item.dbUser?.email}</p>
    </div>

    <span className="statusBadge">
      {getStatusText(item.status || "pending")}
    </span>
  </div>

  <div className="reviewMeta">
    <span>💰 {item.task?.reward || 0} ₽</span>
    <span>
      🕒 {new Date(item.created_at).toLocaleString()}
    </span>
  </div>

  {item.proof_url ? (
    <div className="proofBox">
      <img
        src={item.proof_url}
        alt="Скриншот выполнения"
        onClick={() => window.open(item.proof_url, "_blank")}
      />

      <button
        className="secondaryBtn"
        onClick={() => window.open(item.proof_url, "_blank")}
      >
        Открыть скриншот
      </button>
    </div>
  ) : (
    <p className="noProof">Скриншот не прикреплён</p>
  )}

  {item.status === "pending" && (
    <div className="reviewActions">
      <button
        className="primaryBtn"
        onClick={() => updateUserTaskStatus(item, "approved")}
      >
        Одобрить
      </button>

      <button
        className="secondaryBtn"
        onClick={() => updateUserTaskStatus(item, "rejected")}
      >
        Отклонить
      </button>
    </div>
  )}
</div>

      {adminTab === "withdraws" && (
        <div className="tasksSection">
          <h2>Заявки на вывод</h2>

          {adminWithdraws.length === 0 ? (
            <p>Заявок пока нет</p>
          ) : (
            adminWithdraws.map((item) => (
              <div className="taskCard" key={item.id}>
                <div className="taskInfo">
                  <h3>{item.email}</h3>
                  <p>Сумма: {item.amount} ₽</p>
                  <p>Telegram: {item.wallet}</p>

                  <div className="taskReward">
                    Статус: {getStatusText(item.status)}
                  </div>

                  {item.status === "pending" && (
                    <div className="heroButtons">
                      <button
                        className="primaryBtn"
                        onClick={() => updateWithdrawStatus(item.id, "approved")}
                      >
                        Одобрить
                      </button>

                      <button
                        className="secondaryBtn"
                        onClick={() => updateWithdrawStatus(item.id, "rejected")}
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === "tasks" && (
        <div className="tasksSection">
          <h2>Управление заданиями</h2>

          <div className="taskCard">
            <div className="taskInfo">
              <h3>Новое задание</h3>

              <input
                className="authInput"
                placeholder="Название"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />

              <input
                className="authInput"
                placeholder="Описание"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />

              <input
                className="authInput"
                placeholder="Награда"
                value={newTaskReward}
                onChange={(e) => setNewTaskReward(e.target.value)}
              />

              <button
                className="primaryBtn authSubmit"
                onClick={createTask}
              >
                Создать задание
              </button>
            </div>
          </div>

         {adminTasks.map((task) => (
  <div className="taskCard" key={task.id}>
    {editingTaskId === task.id ? (
      <div className="taskInfo">
        <h3>Редактирование</h3>

        <input
          className="authInput"
          value={editTaskTitle}
          onChange={(e) => setEditTaskTitle(e.target.value)}
        />

        <input
          className="authInput"
          value={editTaskDescription}
          onChange={(e) => setEditTaskDescription(e.target.value)}
        />

        <input
          className="authInput"
          value={editTaskReward}
          onChange={(e) => setEditTaskReward(e.target.value)}
        />

        <div className="heroButtons">
          <button className="primaryBtn" onClick={saveTaskEdit}>
            Сохранить
          </button>

          <button className="secondaryBtn" onClick={cancelEditTask}>
            Отмена
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="taskInfo">
          <h3>{task.title}</h3>
          <p>{task.description}</p>

          <div className="taskReward">
            Награда: +{task.reward} ₽
          </div>
        </div>

        <div className="heroButtons">
          <button
            className="primaryBtn"
            onClick={() => startEditTask(task)}
          >
            Редактировать
          </button>

          <button
            className="secondaryBtn"
            onClick={() => deleteTask(task.id)}
          >
            Удалить
          </button>
        </div>
      </>
    )}
  </div>
))}

        </div>
      )}

      {adminTab === "settings" && (
  <div className="tasksSection">
    <h2>Настройки сайта</h2>

    <div className="taskCard">
      <div className="taskInfo">
        <h3>Основные настройки</h3>

        <input
          className="authInput"
          placeholder="Минимальный вывод"
          value={minWithdraw}
          onChange={(e) => setMinWithdraw(e.target.value)}
        />

        <input
          className="authInput"
          placeholder="Telegram поддержки"
          value={supportTelegram}
          onChange={(e) => setSupportTelegram(e.target.value)}
        />

        <input
          className="authInput"
          placeholder="Название сайта"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />

        <button
          className="primaryBtn authSubmit"
          onClick={saveSiteSettings}
        >
          Сохранить настройки
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
if (user) {
  return (
    <Dashboard
      user={user}
      balance={balance}
      tasks={tasks}
      completedTasks={completedTasks}
      proofFiles={proofFiles}
      setProofFiles={setProofFiles}
      completeTask={completeTask}
      taskHistory={taskHistory}
      withdrawHistory={withdrawHistory}
      showWithdraw={showWithdraw}
      setShowWithdraw={setShowWithdraw}
      withdrawAmount={withdrawAmount}
      setWithdrawAmount={setWithdrawAmount}
      withdrawWallet={withdrawWallet}
      setWithdrawWallet={setWithdrawWallet}
      createWithdrawRequest={createWithdrawRequest}
      siteSettings={siteSettings}
      isAdmin={isAdmin}
      setIsAdminPanel={setIsAdminPanel}
      loadTasks={loadTasks}
      loadTaskHistory={loadTaskHistory}
      loadWithdrawHistory={loadWithdrawHistory}
      loadSiteStats={loadSiteStats}
      signOutUser={async () => {
        await supabase.auth.signOut();
        setUser(null);
      }}
    />
  );
}

 return (
  <>
    <Home
      siteSettings={siteSettings}
      siteStats={siteStats}
      setShowAuth={setShowAuth}
    />

    {showAuth && (
      <div className="modal">
        <div className="authBox">
          <button className="close" onClick={() => setShowAuth(false)}>
            ×
          </button>

          <h2>{authMode === "signup" ? "Регистрация" : "Вход"}</h2>

          <input
            className="authInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="authInput"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="primaryBtn authSubmit"
            onClick={authMode === "signup" ? handleSignUp : handleSignIn}
            disabled={loading}
          >
            {loading
              ? "Загрузка..."
              : authMode === "signup"
                ? "Создать аккаунт"
                : "Войти"}
          </button>

          <button
            className="switchAuth"
            onClick={() =>
              setAuthMode(authMode === "signup" ? "signin" : "signup")
            }
          >
            {authMode === "signup"
              ? "Уже есть аккаунт? Войти"
              : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>
      </div>
    )}
  </>
);
}