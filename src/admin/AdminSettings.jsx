import { useEffect, useState } from "react";
import {
  getSiteSettings,
  updateSiteSettingApi,
} from "../services/api";

export default function AdminSettings() {
  const [minWithdraw, setMinWithdraw] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [siteName, setSiteName] = useState("");

  async function loadSettings() {
    const { data } = await getSiteSettings();

    const settings = {};

    (data || []).forEach((item) => {
      settings[item.key] = item.value;
    });

    setMinWithdraw(settings.min_withdraw || "");
    setSupportTelegram(settings.support_telegram || "");
    setSiteName(settings.site_name || "");
  }

  async function saveSettings() {
    await updateSiteSettingApi("min_withdraw", minWithdraw);
    await updateSiteSettingApi("support_telegram", supportTelegram);
    await updateSiteSettingApi("site_name", siteName);

    alert("Настройки сохранены");
    loadSettings();
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <>
      <div className="pageHeader">
        <h1>Настройки</h1>
      </div>

      <div className="taskEditor">
        <input
          className="searchInput"
          placeholder="Минимальный вывод"
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
        <input
  className="searchInput"
  placeholder="Количество пользователей"
  value={settings.display_users || ""}
  onChange={(e)=>
    updateSetting("display_users",e.target.value)
  }
/>

<input
  className="searchInput"
  placeholder="Выплачено"
  value={settings.display_paid || ""}
  onChange={(e)=>
    updateSetting("display_paid",e.target.value)
  }
/>

<input
  className="searchInput"
  placeholder="Количество заданий"
  value={settings.display_tasks || ""}
  onChange={(e)=>
    updateSetting("display_tasks",e.target.value)
  }
/>

        <button className="primaryBtn" onClick={saveSettings}>
          Сохранить настройки
        </button>
      </div>
    </>
  );
}