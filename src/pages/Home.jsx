

export default function Home({ siteSettings, siteStats, setShowAuth }) {


  const siteName = siteSettings.site_name || "BONUSTEST";
  const support = (siteSettings.support_telegram || "").replace("@", "");
  

  return (
    <div className="site v2Home">
      <header className="header v2Header">
        <div className="logo">{siteName}</div>

        <button className="loginBtn" onClick={() => setShowAuth(true)}>
          Войти
        </button>
      </header>

      <section className="hero v2Hero">
        <div className="heroContent">
          <div className="badge">Платформа простых заданий</div>

          <h1>
            Выполняйте задания
            <br />
            и получайте бонусы
          </h1>

          <p>
            Удобный сервис для выполнения простых действий, проверки заданий
            и безопасного вывода средств.
          </p>

          <div className="heroButtons">
            <button className="primaryBtn" onClick={() => setShowAuth(true)}>
              Начать бесплатно
            </button>

            <button
              className="secondaryBtn"
              onClick={() => {
                document
                  .querySelector(".howItWorks")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Как это работает
            </button>
          </div>

        <div className="stats v2Stats">
  <div className="stat">
    <div className="statIcon">👥</div>

    <b>
      {siteSettings.display_users ||
        `${siteStats.users || 0}+`}
    </b>

    <span>Пользователей</span>
  </div>

  <div className="stat">
    <div className="statIcon">💸</div>

    <b>
      {siteSettings.display_paid ||
        `${Number(siteStats.paid || 0).toLocaleString("ru-RU")} ₽`}
    </b>

    <span>Выплачено</span>
  </div>

  <div className="stat">
    <div className="statIcon">🎯</div>

    <b>
      {siteSettings.display_tasks ||
        `${siteStats.tasks || 0}+`}
    </b>

    <span>Заданий</span>
  </div>
</div>
        </div>

        <div className="visual v2Visual">
          <div className="orb">
            <div className="coin">₽</div>
          </div>

          <div className="card cardOne">
            <span>На проверке</span>
            <b>🟡 Задание</b>
          </div>

          <div className="card cardTwo">
            <span>После одобрения</span>
            <b>+ бонус</b>
          </div>
        </div>
      </section>

      <section className="howItWorks">
        <div className="sectionTitle">
          <span>Как это работает</span>
          <h2>4 простых шага</h2>
        </div>

        <div className="stepsRow">
          {[
            ["01", "Регистрация", "Создайте аккаунт и войдите в кабинет."],
            ["02", "Выбор задания", "Выберите доступное задание."],
            ["03", "Скриншот", "Прикрепите доказательство выполнения."],
            ["04", "Проверка", "Админ проверит и начислит бонус."],
          ].map((step) => (
            <div className="stepCard" key={step[0]}>
              <div className="stepNumber">{step[0]}</div>
              <h3>{step[1]}</h3>
              <p>{step[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="advantagesSection">
        <div className="sectionTitle">
          <span>Преимущества</span>
          <h2>Почему выбирают {siteName}</h2>
        </div>

        <div className="advantagesGrid">
          <div className="advantageCard">
            <div className="advantageIcon">🔒</div>
            <h3>Проверка заданий</h3>
            <p>Награда начисляется только после модерации.</p>
          </div>

          <div className="advantageCard">
            <div className="advantageIcon">💸</div>
            <h3>Вывод средств</h3>
            <p>Создавайте заявки и отслеживайте их статус.</p>
          </div>

          <div className="advantageCard">
            <div className="advantageIcon">📊</div>
            <h3>История</h3>
            <p>Все задания и выводы сохраняются в кабинете.</p>
          </div>
        </div>
      </section>

      <section className="supportSection">
        <div className="supportBox">
          <span>Поддержка</span>

          <h2>Остались вопросы?</h2>

          <p>
            Напишите в поддержку, если нужна помощь с заданием, выводом
            или аккаунтом.
          </p>

          <button
            className="primaryBtn"
            onClick={() => {
              if (support) {
                window.open(`https://t.me/${support}`, "_blank");
              }
            }}
          >
            Написать в поддержку
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footerLogo">{siteName}</div>

        <div className="footerLinks">
  <a href="/agreement">
    Пользовательское соглашение
  </a>

  <a href="/privacy">
    Политика конфиденциальности
  </a>

  <a
    href={support ? `https://t.me/${support}` : "#"}
    target={support ? "_blank" : undefined}
    rel={support ? "noopener noreferrer" : undefined}
  >
    Поддержка
  </a>
</div>

        <div className="footerCopy">© 2026 {siteName}</div>
      </footer>
      
    </div>
  );
}