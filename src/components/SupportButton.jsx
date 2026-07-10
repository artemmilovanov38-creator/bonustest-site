import { useState } from "react";
import SupportChat from "../dashboard/SupportChat";

export default function SupportButton({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="supportFloatButton"
        onClick={() => setOpen(true)}
      >
        💬
      </button>

      {open && (
        <div className="supportOverlay">
          <div className="supportWindow">

            <div className="supportHeader">
              <h3>Поддержка</h3>

              <button
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <SupportChat user={user} />

          </div>
        </div>
      )}
    </>
  );
}