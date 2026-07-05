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
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanel, setIsAdminPanel] = useState(false);

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
    checkUser();
    loadSiteStats();
    loadSiteSettings();
  }, []);

  useEffect(() => {
  if (!user) return;

  const interval = setInterval(() => {
    loadTaskHistory(user.id);
    loadWithdrawHistory(user.id);
    loadTasks();
  }, 10000);

  return () => clearInterval(interval);
}, [user]);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      loadTasks();
      return;
    }

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

    const { data: completed } = await supabase
      .from("user_tasks")
      .select("task_id")
      .eq("user_id", session.user.id);

    if (completed) {
      setCompletedTasks(completed.map((item) => item.task_id));
    }

    loadTasks();
    loadTaskHistory(session.user.id);
    loadWithdrawHistory(session.user.id);
  }

  async function checkIsAdmin(email) {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(!!data);
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id");

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
          .single();

        return {
          ...item,
          task,
        };
      })
    );

    setTaskHistory(historyWithTasks);
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
      alert("Сначала войдите в аккаунт");
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

    const { error } = await supabase.from("user_tasks").insert({
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
        const { error: insertError } = await supabase.from("users").insert({
          auth_id: data.user.id,
          email: data.user.email,
          balance: 0,
        });

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
      loadTasks();
      setShowAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function signOutUser() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdminPanel(false);
  }

  if (user && isAdminPanel) {
    return <Admin onExit={() => setIsAdminPanel(false)} />;
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