export default function EventPagination({ meta, change }) {
  if (!meta || meta.last_page < 2) return null;
  return <nav aria-label="Halaman acara" className="flex justify-center items-center gap-4 pt-5">
    <button className="underline disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => change(meta.current_page - 1)}>Sebelumnya</button>
    <span>{meta.current_page} / {meta.last_page}</span>
    <button className="underline disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => change(meta.current_page + 1)}>Berikutnya</button>
  </nav>;
}
