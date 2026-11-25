import { useCallback, useState } from "react";
import { useRemoteList } from "../../hooks/useRemoteList";
import { adminService } from "../../services/adminService";
import { ErrorState } from "../../components/ui/StateViews";

const catalogs = {
  faculties: { title: "Fakultas", code: true },
  departments: { title: "Jurusan", code: true, parent: "faculties", field: "faculty_id" },
  "study-programs": { title: "Program studi", code: true, parent: "departments", field: "department_id" },
  "event-categories": { title: "Kategori acara" },
  "event-types": { title: "Tipe acara", parent: "event-categories", field: "event_category_id" },
};

function Catalog({ kind }) {
  const schema = catalogs[kind];
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(() => adminService.catalogRows(kind), [kind]);
  const loadParents = useCallback(() => schema.parent ? adminService.catalogRows(schema.parent) : Promise.resolve([]), [schema]);
  const listing = useRemoteList(load);
  const parents = useRemoteList(loadParents);
  const category = kind === "event-categories";
  const type = kind === "event-types";
  async function save(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!category) values.is_active = values.is_active === "on";
    if (row.id && type) delete values.event_category_id;
    setBusy(true); setError("");
    try { await adminService.saveCatalogRow(kind, row.id, values); setRow(null); listing.refresh(); }
    catch (err) { setError(Object.values(err.errors || {}).flat()[0] || err.message); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4">
    {!category && <button className="underline font-bold" onClick={() => setRow({})}>Tambah {schema.title.toLowerCase()}</button>}
    {row && <form key={row.id || "new"} onSubmit={save} className="grid gap-3 p-4 border rounded-xl">
      <label>Nama <input className="border rounded p-1" name="name" required defaultValue={row.name} /></label>
      {schema.code && <label>Kode <input name="code" required defaultValue={row.code} className="border rounded p-1" /></label>}
      {kind === "study-programs" && <label>Jenjang <input name="degree_level" defaultValue={row.degree_level} className="border rounded p-1" /></label>}
      {schema.parent && <label>{catalogs[schema.parent].title} <select name={schema.field} required disabled={busy || (row.id && type)} defaultValue={row[schema.field] || row.category?.id || ""}>
        <option value="">Pilih</option>{parents.items.filter((p) => p.is_active || p.id === row[schema.field] || p.id === row.category?.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></label>}
      {!category && <label><input type="checkbox" name="is_active" defaultChecked={row.is_active ?? true} /> Aktif</label>}
      <div className="flex gap-4"><button disabled={busy} className="font-bold underline">Simpan</button><button type="button" disabled={busy} onClick={() => setRow(null)}>Batal</button></div>
    </form>}
    {error && <p role="alert">{error}</p>}
    {parents.error && <ErrorState message={parents.error} onRetry={parents.refresh} />}
    {listing.error ? <ErrorState message={listing.error} onRetry={listing.refresh} /> : listing.loading ? <p>Memuat…</p> :
      listing.items.length === 0 ? <p>Belum ada data.</p> : <ul className="divide-y">{listing.items.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2">
        <span>{item.name} {item.code && `(${item.code})`} {item.is_active === false && "· Nonaktif"}</span>
        <span className="flex gap-3"><button className="underline" onClick={() => setRow(item)}>Edit</button>
        {type && <button className="underline" disabled={busy} onClick={async () => {
          if (!window.confirm(`Hapus tipe acara ${item.name}?`)) return;
          setBusy(true); setError("");
          try { await adminService.deleteEventType(item.id); setRow(null); listing.refresh(); }
          catch (err) { setError(err.message); } finally { setBusy(false); }
        }}>Hapus</button>}</span>
      </li>)}</ul>}
  </section>;
}

export default function MasterCatalogPage() {
  const [kind, setKind] = useState("faculties");
  return <main className="space-y-5">
    <h1 className="text-2xl font-extrabold">Direktori kampus dan acara</h1>
    <label>Daftar <select value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(catalogs).map(([id, c]) =>
      <option key={id} value={id}>{c.title}</option>)}</select></label>
    <Catalog key={kind} kind={kind} />
  </main>;
}
