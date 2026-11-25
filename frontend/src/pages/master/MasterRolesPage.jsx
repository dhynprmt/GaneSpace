import { useState } from "react";
import { useRemoteList } from "../../hooks/useRemoteList";
import { adminService } from "../../services/adminService";

export default function MasterRolesPage() {
  const orgs = useRemoteList(adminService.getAdminOrganizations);
  const [role, setRole] = useState("event_admin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event, revoke) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (revoke && !window.confirm("Cabut penugasan ini?")) return;
    setBusy(true); setMessage("");
    try {
      if (revoke) {
        await adminService.revokeRole(form.get("assignment")); setMessage("Penugasan dicabut.");
      } else {
        const assignment = await adminService.updateUserRole(form.get("user"), role, form.get("organization"));
        setMessage(`Penugasan tersimpan dengan ID ${assignment.id}.`);
      }
    } catch (err) { setMessage(Object.values(err.errors || {}).flat()[0] || err.message); }
    finally { setBusy(false); }
  }
  return <main className="space-y-5"><h1 className="text-2xl font-extrabold">Penugasan peran</h1>
    <form onSubmit={(e) => submit(e, false)} className="grid gap-3 p-4 border rounded-xl">
      <label>ID akun <input name="user" type="number" min="1" required /></label>
      <label>Peran <select value={role} onChange={(e) => setRole(e.target.value)}><option value="event_admin">Event Admin</option><option value="super_admin">Super Admin</option><option value="student">Mahasiswa</option></select></label>
      {role === "event_admin" && <label>Organisasi <select name="organization" required defaultValue=""><option value="">Pilih organisasi</option>{orgs.items.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>}
      {orgs.error && <p role="alert">{orgs.error}</p>}
      <button disabled={busy} className="font-bold underline">Berikan peran</button>
    </form>
    <form onSubmit={(e) => submit(e, true)} className="grid gap-3 p-4 border rounded-xl">
      <label>ID penugasan <input type="number" name="assignment" min="1" required /></label><button disabled={busy} className="underline">Cabut peran</button>
    </form>
    <p role="status">{message}</p>
  </main>;
}
