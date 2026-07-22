import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Agreement from "./pages/Agreement";
import Privacy from "./pages/Privacy";
import Admin from "./admin/Admin";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
},
 []);
 useEffect(() => {
  if (resendTimer <= 0) return;

  const timer = setInterval(() => {
    setResendTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [resendTimer]);



  

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
  console.error("Ошибка отправки задания:", error);

  toast.error(
    "Не удалось отправить задание на проверку. Попробуйте ещё раз."
  );

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
  console.error("Ошибка создания заявки на вывод:", error);

  toast.error(
    "Не удалось создать заявку на вывод. Попробуйте ещё раз."
  );

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
  console.error("Ошибка обновления баланса:", balanceError);

  toast.error(
    "Заявка создана, но не удалось обновить баланс. Обратитесь в поддержку."
  );

  return;
}

    setBalance(newBalance);
    setWithdrawAmount("");
    setWithdrawWallet("");
    setShowWithdraw(false);

    loadWithdrawHistory(user.id);

    toast.success("Заявка отправлена");
  }

  function getAuthErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("email not confirmed")) {
    return "Сначала подтвердите Email. Мы отправили письмо на вашу почту. Также проверьте папку «Спам».";
  }

  if (message.includes("email rate limit exceeded")) {
    return "Слишком много писем было отправлено за короткое время. Подождите несколько минут и попробуйте снова.";
  }

  if (message.includes("invalid login credentials")) {
    return "Неверный Email или пароль.";
  }

  if (message.includes("user already registered")) {
    return "Пользователь с таким Email уже зарегистрирован.";
  }

  if (
    message.includes("password should be at least") ||
    message.includes("password must be at least")
  ) {
    return "Пароль должен содержать минимум 6 символов.";
  }

  if (message.includes("invalid email")) {
    return "Введите корректный адрес электронной почты.";
  }

  if (message.includes("signup is disabled")) {
    return "Регистрация временно недоступна.";
  }

  if (
    message.includes("load failed") ||
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.";
  }

  if (
    message.includes("request rate limit reached") ||
    message.includes("rate limit")
  ) {
    return "Слишком много попыток. Подождите несколько минут и повторите.";
  }

  return "Произошла ошибка. Попробуйте ещё раз.";
}
  async function handleSignUp() {
  if (!name.trim() || !email.trim() || !password) {
    toast.error("Введите имя, Email и пароль.");
    return;
  }

  if (!legalAccepted) {
    toast.error(
      "Подтвердите согласие с Пользовательским соглашением и Политикой конфиденциальности."
    );
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      toast.error(getAuthErrorMessage(error));
      return;
    }

    if (!data?.user) {
  toast.error(
    "Не удалось создать аккаунт. Проверьте введённые данные и попробуйте ещё раз."
  );
  return;
}

const { error: insertError } = await supabase
  .from("users")
  .insert({
    auth_id: data.user.id,
    email: data.user.email,
    name: name.trim(),
    balance: 0,
  });

if (insertError && insertError.code !== "23505") {
  console.error("Ошибка сохранения профиля:", insertError);

  toast.error(
    "Аккаунт создан, но не удалось сохранить профиль. Обратитесь в поддержку."
  );

  return;
}

toast.success(
  "Аккаунт создан. Мы отправили письмо для подтверждения Email. Откройте письмо, подтвердите адрес и затем войдите."
);
setShowAuth(false);

    setName("");
    setEmail("");
    setPassword("");
    setLegalAccepted(false);
    setAuthMode("signin");
  } catch (error) {
    toast.error(getAuthErrorMessage(error));
  } finally {
    setLoading(false);
  }
}

async function resendConfirmationEmail() {
  const normalizedEmail = email.trim();
if (resendTimer > 0) {
  toast.error(
    `Повторная отправка будет доступна через ${resendTimer} сек.`
  );
  return;
}
  if (!normalizedEmail) {
    toast.error(
      "Введите Email, на который нужно повторно отправить письмо."
    );
    return;
  }

  try {
    setResendingEmail(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error(
        "Ошибка повторной отправки письма:",
        error
      );

      toast.error(getAuthErrorMessage(error));
      return;
    }

    toast.success(
      `Письмо повторно отправлено на ${normalizedEmail}. Проверьте входящие сообщения и папку «Спам».`
    );
    setResendTimer(60);
  } catch (error) {
    console.error(
      "Ошибка повторной отправки письма:",
      error
    );

    toast.error(getAuthErrorMessage(error));
  } finally {
    setResendingEmail(false);
  }
}
 
 async function handleSignIn() {
  if (!email.trim() || !password) {
    toast.error("Введите Email и пароль.");
    return;
  }

  try {
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        
        email: email.trim(),
        password,
      });
       if (error) {
  console.error("Ошибка входа:", error);

  toast.error(getAuthErrorMessage(error));

  return;
}
      if (!data?.user) {
  toast.error(
    "Не удалось получить данные аккаунта."
  );
  return;
}

    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .maybeSingle();

    if (userError) {
      toast.error(
        "Не удалось загрузить профиль. Попробуйте войти ещё раз."
      );
      return;
    }

    if (dbUser?.is_blocked) {
      toast.error("Ваш аккаунт заблокирован.");
      await supabase.auth.signOut();
      return;
    }

    setUser({
      ...data.user,
      name: dbUser?.name || "",
    });

    setBalance(Number(dbUser?.balance || 0));

    await Promise.all([
      checkIsAdmin(data.user.email),
      loadTaskHistory(data.user.id),
      loadWithdrawHistory(data.user.id),
      loadTasks(),
    ]);

    setShowAuth(false);
    setEmail("");
    setPassword("");

    toast.success("Вы успешно вошли в аккаунт.");
  } catch (error) {
    toast.error(getAuthErrorMessage(error));
  } finally {
    setLoading(false);
  }
}

  async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    toast.error(getAuthErrorMessage(error));
    return;
  }

  clearUserState();
}

const currentPath =
  window.location.pathname.replace(/\/+$/, "") || "/";

const legalSiteName =
  siteSettings.site_name || "BONUSTEST";

if (currentPath === "/agreement") {
  return (
    <Agreement siteName={legalSiteName} />
  );
}

if (currentPath === "/privacy") {
  return (
    <Privacy siteName={legalSiteName} />
  );
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
            <button
  className="close"
  onClick={() => {
    setShowAuth(false);
    setPassword("");
    setLegalAccepted(false);
  }}
>
  ×
</button>

           <div className="authHeading">
  <span className="authEyebrow">
    {authMode === "signup"
      ? "Создание аккаунта"
      : "Личный кабинет"}
  </span>

  <h2>
    {authMode === "signup"
      ? "Регистрация"
      : "Вход"}
  </h2>

  <p>
    {authMode === "signup"
      ? "Заполните данные, чтобы начать выполнять задания."
      : "Введите данные для входа в аккаунт."}
  </p>
</div>

            <div className="authFields">
  {authMode === "signup" && (
    <label className="authField">
      <span>Ваше имя</span>

      <input
        className="authInput"
        type="text"
        placeholder="Например, Артём"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />
    </label>
  )}

  <label className="authField">
    <span>Email</span>

    <input
      className="authInput"
      type="email"
      placeholder="example@mail.ru"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      autoComplete="email"
    />
  </label>

  <label className="authField">
    <span>Пароль</span>

    <input
      className="authInput"
      type="password"
      placeholder="Минимум 6 символов"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete={
        authMode === "signup"
          ? "new-password"
          : "current-password"
      }
    />
  </label>
</div>
{authMode === "signin" && (
  <div className="authEmailHelp">
    <span>Не пришло письмо с подтверждением?</span>

    <button
      type="button"
      className="resendEmailBtn"
      onClick={resendConfirmationEmail}
      disabled={
  resendingEmail ||
  loading ||
  resendTimer > 0
}
    >
      {
  resendingEmail
    ? "Отправляем..."
    : resendTimer > 0
      ? `Повторно через ${resendTimer} сек`
      : "Отправить письмо ещё раз"
}
    </button>
  </div>
)}
            {authMode === "signup" && (
  <label className="legalAcceptCheck">
    <input
      type="checkbox"
      checked={legalAccepted}
      onChange={(event) =>
        setLegalAccepted(event.target.checked)
      }
    />

    <span className="legalAcceptCustom" />

    <span className="legalAcceptText">
      Я принимаю{" "}
      <a
        href="/agreement"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        Пользовательское соглашение
      </a>{" "}
      и{" "}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        Политику конфиденциальности
      </a>
    </span>
  </label>
)}

            <button
  className="primaryBtn authSubmit"
  onClick={authMode === "signup" ? handleSignUp : handleSignIn}
  disabled={
    loading ||
    (authMode === "signup" && !legalAccepted)
  }
>
              {loading
  ? authMode === "signup"
    ? "Создаём аккаунт..."
    : "Выполняется вход..."
  : authMode === "signup"
    ? "Создать аккаунт"
    : "Войти"}
            </button>

            <button
  className="switchAuth"
  onClick={() => {
    setAuthMode(
      authMode === "signup" ? "signin" : "signup"
    );

    setLegalAccepted(false);
  }}
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