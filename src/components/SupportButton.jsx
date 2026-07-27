import { useState } from "react";
import SupportChat from "../dashboard/SupportChat";
import "../styles/dashboard.css";

export default function SupportButton({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="bonusSupportFloat"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть поддержку"
      >
        <span>💬</span>
        <i />
      </button>

      {open && (
        <div
          className="bonusSupportOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="bonusSupportWindow">
            <div className="bonusSupportHeader">
              <div>
                <span>Связь с командой</span>
                <h3>Поддержка</h3>
              </div>

              <button
                className="bonusSupportClose"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть поддержку"
              >
                ×
              </button>
            </div>

            <SupportChat user={user} />
          </div>
        </div>
      )}
    </>
  );
}