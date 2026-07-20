import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admin from "./admin/Admin";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [isAdminPanel, setIsAdminPanel] = useState(() => {
  return localStorage.getItem("isAdminPanel") === "true";
});

  const [siteStats, setSiteStats] = useState({
    users: 0,
    paid: 0,
    tasks: 0,
  });

  const [siteSettings, setSiteSettings] = useState({});

  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [proofFiles, setProofFiles] = useState({});
  const [taskHistory, setTaskHistory] = useState([]);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);

 useEffect(() => {
  let mounted = true;

  async function initializeApp() {
    try {
      await Promise.all([
        loadSiteStats(),
        loadSiteSettings(),
        loadTasks(),
      ]);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Ошибка получения сессии:", error);
      }

      if (!mounted) return;

      if (session?.user) {
        await loadCurrentUser(session.user);
      } else {
        clearUserState();
      }
    } catch (error) {
      console.error("Ошибка запуска приложения:", error);
      clearUserState();
    } finally {
      if (mounted) {
        setAuthReady(true);
      }
    }
  }

  initializeApp();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return;

    if (event === "SIGNED_OUT" || !session?.user) {
      clearUserState();
      setAuthReady(true);
      return;
    }

    if (event === "SIGNED_IN") {
      setTimeout(async () => {
        try {
          await loadCurrentUser(session.user);
        } catch (error) {
          console.error("Ошибка восстановления пользователя:", error);
        } finally {
          if (mounted) {
            setAuthReady(true);
          }
        }
      }, 0);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  

  function clearUserState() {
  setUser(null);
  setBalance(0);
  setCompletedTasks([]);
  setTaskHistory([]);
  setWithdrawHistory([]);
  setIsAdmin(false);
  setAdminRole(null);
  setIsAdminPanel(false);
  localStorage.removeItem("isAdminPanel");
}

async function loadCurrentUser(authUser) {
  if (!authUser?.id) {
    clearUserState();
    return;
  }

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (userError) {
    console.error("Ошибка загрузки пользователя:", userError);
    throw userError;
  }

  if (dbUser?.is_blocked) {
    toast.error("Ваш аккаунт заблокирован");
    await supabase.auth.signOut();
    clearUserState();
    return;
  }

  setUser({
    ...authUser,
    name: dbUser?.name || "",
  });

  setBalance(Number(dbUser?.balance || 0));

  await Promise.all([
    checkIsAdmin(authUser.email),
    loadTaskHistory(authUser.id),
    loadWithdrawHistory(authUser.id),
  ]);
}

  async function checkIsAdmin(email) {
  const { data, error } = await supabase
    .from("admins")
    .select("email, role")
    .ilike("email", email)
    .maybeSingle();

  if (error || !data) {
    setIsAdmin(false);
    setAdminRole(null);
    return;
  }

  setIsAdmin(true);
  setAdminRole(data.role || "admin");
}



  async function loadTasks() {
  const { data, error } = await supabase
  .from("tasks")
  .select("*")
  .order("is_hot", { ascending: false })
  .order("sort_order", {
    ascending: true,
    nullsFirst: false,
  })
  .order("id", { ascending: true });

  if (!error) {
    setTasks(data || []);
  }
}

  async function loadSiteStats() {
    const { data: users } = await supabase.from("users").select("id");
    const { data: tasks } = await supabase.from("tasks").select("id");

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
    const { data, error } = await supabase.from("site_settings").select("*");

    if (error) return;

    const settings = {};

    (data || []).forEach((item) => {
      settings[item.key] = item.value;
    });

    setSiteSettings(settings);
  }

  async function loadTaskHistory(userId) {
    const { data: history, error } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return;

    const historyWithTasks = await Promise.all(
      (history || []).map(async (item) => {
        const { data: task } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", item.task_id)
          .maybeSingle();

        return {
          ...item,
          task,
        };
      })
    );

    setTaskHistory(historyWithTasks);

    setCompletedTasks(
  historyWithTasks
    .filter(
      (item) =>
        item.status === "pending" ||
        item.status === "approved"
    )
    .map((item) => item.task_id)
);
  }

  async function loadWithdrawHistory(userId) {
    const { data, error } = await supabase
      .from("withdraw_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setWithdrawHistory(data || []);
    }
  }

 async function completeTask(task) {
  if (!user) {
    toast.error("Сначала войдите в аккаунт");
    return;
  }

  const file = proofFiles[task.id];

  if (!file) {
    toast.error("Прикрепите скриншот выполнения задания");
    return;
  }

  const { data: alreadyDone } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_id", task.id);

  const activeRequest = alreadyDone?.find(
    (item) =>
      item.status === "pending" ||
      item.status === "approved"
  );

  if (activeRequest) {
    toast.error("Это задание уже отправлено или одобрено");
    return;
  }

  const rejectedRequest = alreadyDone?.find(
    (item) => item.status === "rejected"
  );

  const filePath = `${user.id}/${task.id}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("task-proofs")
    .upload(filePath, file);

  if (uploadError) {
    toast.error(uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("task-proofs")
    .getPublicUrl(filePath);

  let error;

  if (rejectedRequest) {
    const result = await supabase
      .from("user_tasks")
      .update({
        completed: true,
        rewarded: false,
        status: "pending",
        proof_url: publicUrlData.publicUrl,
        created_at: new Date().toISOString(),
      })
      .eq("id", rejectedRequest.id);

    error = result.error;
  } else {
    const result = await supabase.from("user_tasks").insert({
      user_id: user.id,
      task_id: task.id,
      completed: true,
      rewarded: false,
      status: "pending",
      proof_url: publicUrlData.publicUrl,
    });

    error = result.error;
  }

  if (error) {
    toast.error(error.message);
    return;
  }

  setCompletedTasks([...completedTasks, task.id]);

  setProofFiles({
    ...proofFiles,
    [task.id]: null,
  });

  loadTaskHistory(user.id);

  toast.success("Задание отправлено на проверку");
}

  async function createWithdrawRequest() {
    if (!withdrawAmount || !withdrawWallet) {
      toast.error("Заполните все поля");
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
      toast.error("Недостаточно средств");
      return;
    }

    const { error } = await supabase.from("withdraw_requests").insert({
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

    const newBalance = Number(balance) - Number(withdrawAmount);

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

    toast.success("Заявка отправлена");
  }

  async function handleSignUp() {
    if (!name.trim() || !email || !password) {
  toast.error("Введите имя, email и пароль");
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
        const { error: insertError } = await supabase.from("users").insert({
  auth_id: data.user.id,
  email: data.user.email,
  name: name.trim(),
  balance: 0,
});

        if (insertError) {
          alert(insertError.message);
        }
      }

      alert("Аккаунт создан. Теперь можно войти.");
      setName("");
      setAuthMode("signin");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
  if (!email || !password) {
    toast.error("Введите email и пароль");
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .maybeSingle();

    if (userError) {
      toast.error(userError.message);
      return;
    }

    if (dbUser?.is_blocked) {
      toast.error("Ваш аккаунт заблокирован");
      await supabase.auth.signOut();
      return;
    }

    setUser({
      ...data.user,
      name: dbUser?.name || "",
    });

    setBalance(dbUser?.balance || 0);

    await checkIsAdmin(data.user.email);
    await loadTaskHistory(data.user.id);
    await loadWithdrawHistory(data.user.id);
    await loadTasks();

    setShowAuth(false);
    setEmail("");
    setPassword("");
  } finally {
    setLoading(false);
  }
}

  async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    toast.error(error.message);
    return;
  }

  clearUserState();
}
if (!authReady) {
  return (
    <div className="appLoadingScreen">
      <div className="appLoadingSpinner" />
      <p>Загрузка...</p>
    </div>
  );
}
  if (user && isAdminPanel) {
    return (
  <Admin
    role={adminRole}
    onExit={() => {
  localStorage.removeItem("isAdminPanel");
  setIsAdminPanel(false);
  
}}
  />
);
  }

 if (user) {
  return (
    <>
      <Toaster position="top-right" />
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
        signOutUser={signOutUser}
      />
      </>
    );
  }

  return (
    <>
    <Toaster position="top-right" />
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

            {authMode === "signup" && (
  <input
    className="authInput"
    type="text"
    placeholder="Ваше имя"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
)}

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