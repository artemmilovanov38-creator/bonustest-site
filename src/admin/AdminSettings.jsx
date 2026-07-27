import { useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiCheckCircle,
  FiDollarSign,
  FiGlobe,
  FiSave,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

import {
  getSiteSettings,
  updateSiteSettingApi,
} from "../services/api";

export default function AdminSettings() {
  const [minWithdraw, setMinWithdraw] = useState("");
  const [supportTelegram, setSupportTelegram] =
    useState("");
  const [siteName, setSiteName] = useState("");

  const [displayUsers, setDisplayUsers] = useState("");
  const [displayPaid, setDisplayPaid] = useState("");
  const [displayTasks, setDisplayTasks] = useState("");

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);

      const { data, error } = await getSiteSettings();

      if (error) {
        alert(error.message);
        return;
      }

      const values = {};

      (data || []).forEach((item) => {
        values[item.key] = item.value;
      });

      const loadedValues = {
        minWithdraw: values.min_withdraw || "",
        supportTelegram:
          values.support_telegram || "",
        siteName: values.site_name || "",
        displayUsers: values.display_users || "",
        displayPaid: values.display_paid || "",
        displayTasks: values.display_tasks || "",
      };

      setMinWithdraw(loadedValues.minWithdraw);
      setSupportTelegram(
        loadedValues.supportTelegram
      );
      setSiteName(loadedValues.siteName);
      setDisplayUsers(loadedValues.displayUsers);
      setDisplayPaid(loadedValues.displayPaid);
      setDisplayTasks(loadedValues.displayTasks);

      setInitialValues(loadedValues);
    } catch (error) {
      console.error(
        "Ошибка загрузки настроек:",
        error
      );

      alert("Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }

  async function saveValue(key, value) {
    const { error } = await updateSiteSettingApi(
      key,
      value
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async function saveSettings() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      await Promise.all([
        saveValue("min_withdraw", minWithdraw),
        saveValue(
          "support_telegram",
          supportTelegram
        ),
        saveValue("site_name", siteName),
        saveValue("display_users", displayUsers),
        saveValue("display_paid", displayPaid),
        saveValue("display_tasks", displayTasks),
      ]);

      alert("Настройки сохранены");

      await loadSettings();
    } catch (error) {
      console.error(
        "Ошибка сохранения настроек:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    if (!initialValues) {
      return;
    }

    setMinWithdraw(initialValues.minWithdraw);
    setSupportTelegram(
      initialValues.supportTelegram
    );
    setSiteName(initialValues.siteName);
    setDisplayUsers(initialValues.displayUsers);
    setDisplayPaid(initialValues.displayPaid);
    setDisplayTasks(initialValues.displayTasks);
  }

  const hasChanges = useMemo(() => {
    if (!initialValues) {
      return false;
    }

    return (
      minWithdraw !== initialValues.minWithdraw ||
      supportTelegram !==
        initialValues.supportTelegram ||
      siteName !== initialValues.siteName ||
      displayUsers !== initialValues.displayUsers ||
      displayPaid !== initialValues.displayPaid ||
      displayTasks !== initialValues.displayTasks
    );
  }, [
    initialValues,
    minWithdraw,
    supportTelegram,
    siteName,
    displayUsers,
    displayPaid,
    displayTasks,
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="adminSettingsLoading">
        Загрузка настроек...
      </div>
    );
  }

  return (
    <div className="adminSettingsPage">
      <section className="adminSettingsHero">
        <div className="adminSettingsHeroIcon">
          <FiSettings />
        </div>

        <div>
          <span>Панель управления</span>

          <h1>Настройки сайта</h1>

          <p>
            Управляйте основными параметрами проекта и
            статистикой, отображаемой на главной странице.
          </p>
        </div>

        <div
          className={`adminSettingsState ${
            hasChanges ? "changed" : "saved"
          }`}
        >
          {hasChanges ? (
            <>
              <FiActivity />
              Есть изменения
            </>
          ) : (
            <>
              <FiCheckCircle />
              Всё сохранено
            </>
          )}
        </div>
      </section>

      <div className="adminSettingsGrid">
        <section className="adminSettingsSection">
          <div className="adminSettingsSectionHeader">
            <div className="adminSettingsSectionIcon blue">
              <FiGlobe />
            </div>

            <div>
              <span>Общие параметры</span>
              <h2>Основные настройки</h2>
              <p>
                Название сайта, поддержка и условия
                вывода средств.
              </p>
            </div>
          </div>

          <div className="adminSettingsFields">
            <label className="adminSettingsField">
              <span>Название сайта</span>

              <div className="adminSettingsInput">
                <FiGlobe />

                <input
                  type="text"
                  placeholder="Название проекта"
                  value={siteName}
                  onChange={(event) =>
                    setSiteName(event.target.value)
                  }
                />
              </div>

              <small>
                Отображается в интерфейсе и на главной
                странице.
              </small>
            </label>

            <label className="adminSettingsField">
              <span>Telegram поддержки</span>

              <div className="adminSettingsInput">
                <span className="adminSettingsInputPrefix">
                  @
                </span>

                <input
                  type="text"
                  placeholder="support_username"
                  value={supportTelegram}
                  onChange={(event) =>
                    setSupportTelegram(
                      event.target.value
                    )
                  }
                />
              </div>

              <small>
                Укажите имя пользователя без ссылки.
              </small>
            </label>

            <label className="adminSettingsField">
              <span>Минимальная сумма вывода</span>

              <div className="adminSettingsInput">
                <FiDollarSign />

                <input
                  type="number"
                  min="0"
                  placeholder="500"
                  value={minWithdraw}
                  onChange={(event) =>
                    setMinWithdraw(event.target.value)
                  }
                />

                <span className="adminSettingsInputSuffix">
                  ₽
                </span>
              </div>

              <small>
                Минимальная сумма, доступная пользователю
                для вывода.
              </small>
            </label>
          </div>
        </section>

        <section className="adminSettingsSection">
          <div className="adminSettingsSectionHeader">
            <div className="adminSettingsSectionIcon green">
              <FiActivity />
            </div>

            <div>
              <span>Главная страница</span>
              <h2>Публичная статистика</h2>
              <p>
                Значения, которые посетители видят на
                главной странице.
              </p>
            </div>
          </div>

          <div className="adminSettingsFields">
            <label className="adminSettingsField">
              <span>Количество пользователей</span>

              <div className="adminSettingsInput">
                <FiUsers />

                <input
                  type="text"
                  placeholder="Например: 2 359+"
                  value={displayUsers}
                  onChange={(event) =>
                    setDisplayUsers(
                      event.target.value
                    )
                  }
                />
              </div>

              <small>
                Можно использовать пробелы и знак "+".
              </small>
            </label>

            <label className="adminSettingsField">
              <span>Всего выплачено</span>

              <div className="adminSettingsInput">
                <FiDollarSign />

                <input
                  type="text"
                  placeholder="Например: 10 523 500 ₽"
                  value={displayPaid}
                  onChange={(event) =>
                    setDisplayPaid(event.target.value)
                  }
                />
              </div>

              <small>
                Это публичное значение, оно не считается
                автоматически.
              </small>
            </label>

            <label className="adminSettingsField">
              <span>Количество заданий</span>

              <div className="adminSettingsInput">
                <FiActivity />

                <input
                  type="text"
                  placeholder="Например: 20+"
                  value={displayTasks}
                  onChange={(event) =>
                    setDisplayTasks(
                      event.target.value
                    )
                  }
                />
              </div>

              <small>
                Отображаемое число доступных заданий.
              </small>
            </label>
          </div>
        </section>
      </div>

      <section className="adminSettingsPreview">
        <div className="adminSettingsPreviewHeader">
          <div>
            <span>Предварительный просмотр</span>
            <h2>Как статистика выглядит сейчас</h2>
          </div>
        </div>

        <div className="adminSettingsPreviewGrid">
          <article>
            <div className="adminSettingsPreviewIcon">
              <FiUsers />
            </div>

            <span>Пользователей</span>

            <strong>
              {displayUsers || "Не указано"}
            </strong>
          </article>

          <article>
            <div className="adminSettingsPreviewIcon">
              <FiDollarSign />
            </div>

            <span>Выплачено</span>

            <strong>
              {displayPaid || "Не указано"}
            </strong>
          </article>

          <article>
            <div className="adminSettingsPreviewIcon">
              <FiActivity />
            </div>

            <span>Заданий</span>

            <strong>
              {displayTasks || "Не указано"}
            </strong>
          </article>
        </div>
      </section>

      <div className="adminSettingsActions">
        <div>
          {hasChanges ? (
            <span className="adminSettingsUnsaved">
              Настройки изменены, но ещё не сохранены
            </span>
          ) : (
            <span className="adminSettingsSaved">
              Все изменения сохранены
            </span>
          )}
        </div>

        <div className="adminSettingsButtons">
          <button
            type="button"
            className="secondaryBtn"
            onClick={resetSettings}
            disabled={!hasChanges || saving}
          >
            Сбросить
          </button>

          <button
            type="button"
            className="primaryBtn"
            onClick={saveSettings}
            disabled={!hasChanges || saving}
          >
            <FiSave />

            {saving
              ? "Сохранение..."
              : "Сохранить настройки"}
          </button>
        </div>
      </div>
    </div>
  );
}