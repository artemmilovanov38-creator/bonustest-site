import "../styles/home.css";

export default function Home({ siteSettings, siteStats, setShowAuth }) {
  const siteName = siteSettings.site_name || "BONUSTEST";
  const support = (siteSettings.support_telegram || "").replace("@", "");

  const usersValue =
    siteSettings.display_users || `${siteStats.users || 0}+`;

  const paidValue =
    siteSettings.display_paid ||
    `${Number(siteStats.paid || 0).toLocaleString("ru-RU")} ₽`;

  const tasksValue =
    siteSettings.display_tasks || `${siteStats.tasks || 0}+`;

  const scrollToHowItWorks = () => {
    document
      .querySelector(".luxuryHow")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const openSupport = () => {
    if (!support) return;

    window.open(
      `https://t.me/${support}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="luxuryHome">
      <div className="luxuryBackdrop" aria-hidden="true">
        <div className="luxuryAura luxuryAuraBlue" />
        <div className="luxuryAura luxuryAuraPink" />
        <div className="luxuryMesh" />
        <div className="luxuryGrain" />
      </div>

      <header className="luxuryHeader">
        <a className="luxuryBrand" href="/" aria-label={siteName}>
          <span className="luxuryBrandMark">B</span>
          <span>{siteName}</span>
        </a>

        <div className="luxuryHeaderNav">
          <button type="button" onClick={scrollToHowItWorks}>
            Как это работает
          </button>

          <button
            className="luxuryLogin"
            type="button"
            onClick={() => setShowAuth(true)}
          >
            Войти
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <main>
        <section className="luxuryHero">
          <div className="luxuryHeroCopy">
            <div className="luxuryKicker">
              <span />
              Платформа простых заданий
            </div>

            <h1>
              Задания,
              <span>которые приносят результат.</span>
            </h1>

            <p className="luxuryLead">
              Выполняйте понятные действия, отправляйте подтверждение и
              получайте бонус после проверки — без лишней сложности.
            </p>

            <div className="luxuryActions">
              <button
                className="luxuryPrimary"
                type="button"
                onClick={() => setShowAuth(true)}
              >
                <span>Начать бесплатно</span>
                <span aria-hidden="true">→</span>
              </button>

              <button
                className="luxurySecondary"
                type="button"
                onClick={scrollToHowItWorks}
              >
                Узнать подробнее
              </button>
            </div>

            <div className="luxuryAccessNote">
              <span />
              Логин и пароль выдаёт менеджер
            </div>
          </div>

          <div className="luxuryShowcase">
            <div className="luxuryShowcaseGlow" />

            <div className="luxuryProductCard">
              <div className="luxuryProductHead">
                <div className="luxuryProductDots">
                  <span />
                  <span />
                  <span />
                </div>

                <span>Панель пользователя</span>
              </div>

              <div className="luxuryProductMain">
                <div className="luxuryProductTitle">
                  <span>Текущий статус</span>
                  <strong>Задание на проверке</strong>
                </div>

                <div className="luxuryStatusBadge">
                  <span />
                  В процессе
                </div>
              </div>

              <div className="luxuryProductProgress">
                <span />
              </div>

              <div className="luxuryProductStats">
                <div>
                  <span>Пользователей</span>
                  <strong>{usersValue}</strong>
                </div>

                <div>
                  <span>Заданий</span>
                  <strong>{tasksValue}</strong>
                </div>

                <div className="luxuryProductStatsWide">
                  <span>Выплачено пользователям</span>
                  <strong>{paidValue}</strong>
                </div>
              </div>
            </div>

            <div className="luxuryOrbit luxuryOrbitOne" />
            <div className="luxuryOrbit luxuryOrbitTwo" />
            <div className="luxuryOrbit luxuryOrbitThree" />
          </div>
        </section>

        <section className="luxuryProof">
          <article>
            <span>01</span>
            <div>
              <strong>Ручная проверка</strong>
              <p>Каждое подтверждение проверяется перед начислением.</p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <strong>Понятный статус</strong>
              <p>Вы всегда знаете, что происходит с заданием.</p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <strong>Единый кабинет</strong>
              <p>Задания, история и вывод средств находятся рядом.</p>
            </div>
          </article>
        </section>

        <section className="luxuryHow luxurySection">
          <div className="luxurySectionIntro">
            <span>Как это работает</span>
            <h2>Четыре шага до бонуса</h2>
            <p>
              Понятный сценарий без сложных форм и лишних экранов.
            </p>
          </div>

          <div className="luxurySteps">
            {[
              ["01", "Получите доступ", "Напишите менеджеру и получите данные для входа."],
              ["02", "Выберите задание", "Откройте подходящее задание в личном кабинете."],
              ["03", "Отправьте результат", "Прикрепите подтверждение выполнения."],
              ["04", "Получите бонус", "После проверки награда появится на балансе."],
            ].map(([number, title, text]) => (
              <article className="luxuryStep" key={number}>
                <div className="luxuryStepHead">
                  <span>{number}</span>
                  <i aria-hidden="true">↗</i>
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="luxurySection luxuryFeatures">
          <div className="luxurySectionIntro luxurySectionIntroLeft">
            <span>Возможности</span>
            <h2>Всё необходимое. Ничего лишнего.</h2>
            <p>
              Продуманный интерфейс, понятные действия и полный контроль над
              каждым этапом.
            </p>
          </div>

          <div className="luxuryFeatureGrid">
            <article className="luxuryFeature luxuryFeatureMain">
              <div className="luxuryFeatureNumber">01</div>

              <div>
                <h3>Контроль в реальном времени</h3>
                <p>
                  Статус задания, результат проверки и история всегда доступны
                  в одном месте.
                </p>
              </div>

              <div className="luxuryChart" aria-hidden="true">
                <span style={{ height: "34%" }} />
                <span style={{ height: "52%" }} />
                <span style={{ height: "46%" }} />
                <span style={{ height: "72%" }} />
                <span style={{ height: "64%" }} />
                <span style={{ height: "88%" }} />
              </div>
            </article>

            <article className="luxuryFeature">
              <div className="luxuryFeatureNumber">02</div>
              <h3>Прозрачные выплаты</h3>
              <p>
                Создавайте заявки и отслеживайте их статус без переписок и
                догадок.
              </p>
            </article>

            <article className="luxuryFeature">
              <div className="luxuryFeatureNumber">03</div>
              <h3>Полная история</h3>
              <p>
                Все действия сохраняются и остаются доступными в вашем
                кабинете.
              </p>
            </article>
          </div>
        </section>

        <section className="luxurySupport">
          <div className="luxurySupportCard">
            <div>
              <span>Поддержка</span>
              <h2>Мы рядом, когда это нужно</h2>
              <p>
                Поможем с заданием, выводом средств или доступом к аккаунту.
              </p>
            </div>

            <button
              className="luxuryPrimary"
              type="button"
              onClick={openSupport}
              disabled={!support}
            >
              <span>Написать в поддержку</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="luxuryFooter">
        <strong>{siteName}</strong>

        <div>
          <a href="/agreement">Пользовательское соглашение</a>
          <a href="/privacy">Политика конфиденциальности</a>
          <a
            href={support ? `https://t.me/${support}` : "#"}
            target={support ? "_blank" : undefined}
            rel={support ? "noopener noreferrer" : undefined}
          >
            Поддержка
          </a>
        </div>

        <span>© 2026 {siteName}</span>
      </footer>
    </div>
  );
}