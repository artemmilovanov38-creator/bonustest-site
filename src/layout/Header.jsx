import { FiBell, FiSearch } from "react-icons/fi";

export default function Header() {
  return (
    <header className="adminHeader">

      <div className="headerSearch">

        <FiSearch />

        <input
          type="text"
          placeholder="Поиск..."
        />

      </div>

      <div className="headerRight">

        <button className="headerIcon">
          <FiBell />
        </button>

        <div className="headerUser">

          <div className="avatar">
            A
          </div>

          <div>

            <strong>Администратор</strong>

            <span>Full Access</span>

          </div>

        </div>

      </div>

    </header>
  );
}