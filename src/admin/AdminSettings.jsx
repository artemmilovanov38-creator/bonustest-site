import { useEffect, useState } from "react";
import {
  getSiteSettings,
  updateSiteSettingApi,
} from "../services/api";

export default function AdminSettings() {
  const [minWithdraw, setMinWithdraw] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [siteName, setSiteName] = useState("");

  const [displayUsers, setDisplayUsers] = useState("");
  const [displayPaid, setDisplayPaid] = useState("");
  const [displayTasks, setDisplayTasks] = useState("");

  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    const { data, error } = await getSiteSettings();

    if (error) {
      alert(error.message);
      return;
    }

    const values = {};

    (data || []).forEach((item) => {
      values[item.key] = item.value;
    });

    setMinWithdraw(values.min_withdraw || "");
    setSupportTelegram(values.support_telegram || "");
    setSiteName(values.site_name || "");

    setDisplayUsers(values.display_users || "");
    setDisplayPaid(values.display_paid || "");
    setDisplayTasks(values.display_tasks || "");
  }

  async function saveValue(key, value) {
    const { error } = await updateSiteSettingApi(key, value);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      await Promise.all([
        saveValue("min_withdraw", minWithdraw),
        saveValue("support_telegram", supportTelegram),
        saveValue("site_name", siteName),
        saveValue("display_users", displayUsers),
        saveValue("display_paid", displayPaid),
        saveValue("display_tasks", displayTasks),
      ]);

      alert("Настройки сохранены");
      await loadSettings();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Настройки</h1>
          <p className="pageSubtitle">
            Параметры сайта и статистика главной страницы
          </p>
        </div>
      </div>

      <div className="taskEditor">
        <h2>Основные настройки</h2>

        <input
          className="searchInput"
          placeholder="Минимальная сумма вывода"
          value={minWithdraw}
          onChange={(e) => setMinWithdraw(e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Telegram поддержки"
          value={supportTelegram}
          onChange={(e) => setSupportTelegram(e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Название сайта"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />

        <h2>Статистика на главной</h2>

        <input
          className="searchInput"
          placeholder="Например: 2 359+"
          value={displayUsers}
          onChange={(e) => setDisplayUsers(e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Например: 10 523 500 ₽"
          value={displayPaid}
          onChange={(e) => setDisplayPaid(e.target.value)}
        />

        <input
          className="searchInput"
          placeholder="Например: 20+"
          value={displayTasks}
          onChange={(e) => setDisplayTasks(e.target.value)}
        />

        <button
          className="primaryBtn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </button>
      </div>
    </>
  );
}