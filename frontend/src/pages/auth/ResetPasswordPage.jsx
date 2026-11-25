import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import SEO from "../../seo/SEO";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const validLink = Boolean(params.get("email") && params.get("token"));
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await authService.resetPassword({ email: params.get("email"), token: params.get("token"),
        password: form.get("password"), password_confirmation: form.get("confirmation") });
      setDone(true);
    } catch (err) { setError(Object.values(err.errors || {}).flat()[0] || err.message); }
    finally { setBusy(false); }
  }
  return <main className="max-w-md mx-auto my-20 p-7 rounded-3xl border-2 border-[#102B69] space-y-4">
    <SEO title="Reset password | GaneSpace" noIndex />
    <h1 className="text-2xl font-extrabold">Atur ulang password</h1>
    {done ? <p>Password tersimpan. <Link to="/login" className="underline">Masuk ke GaneSpace</Link></p> :
      !validLink ? <Link to="/forgot-password" className="underline">Minta tautan pemulihan baru</Link> :
      <form onSubmit={submit} className="grid gap-4">
        <p>Gunakan minimal 10 karakter dengan huruf dan angka.</p>
        {[["password", "Password baru"], ["confirmation", "Ulangi password"]].map(([name, label]) =>
          <label key={name}>{label}<input name={name} required type="password" minLength={10} autoComplete="new-password" className="block w-full rounded-xl border p-2" /></label>)}
        {error && <p role="alert">{error}</p>}
        <button disabled={busy} className="rounded-full bg-[#102B69] text-white p-2">{busy ? "Menyimpan…" : "Simpan password"}</button>
      </form>}
  </main>;
}
