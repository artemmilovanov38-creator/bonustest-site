export default function Card({ children, className = "" }) {
  return (
    <div className={`taskCard ${className}`}>
      {children}
    </div>
  );
}