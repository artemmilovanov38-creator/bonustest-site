import Admin from "../admin/Admin";

export default function AdminPreview() {
  return (
    <Admin
      onExit={() => {
        window.location.href = "/";
      }}
    />
  );
}