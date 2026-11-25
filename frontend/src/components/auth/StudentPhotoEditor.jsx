import { useEffect, useImperativeHandle, useRef, useState } from "react";

export default function StudentPhotoEditor({ ref, currentPhoto }) {
  const canvas = useRef(null);
  const [source, setSource] = useState(null);
  const [image, setImage] = useState(null);
  const [ratio, setRatio] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [error, setError] = useState("");

  function select(file) {
    setImage(null);
    setX(50); setY(50); setZoom(1);
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024)) {
      setError("Pilih JPG, PNG, atau WebP hingga 8 MB.");
      setSource(null);
      return;
    }
    setSource(file || null);
    setError("");
  }

  useEffect(() => {
    if (!source) return;
    const url = URL.createObjectURL(source);
    const photo = new Image();
    photo.onload = () => setImage(photo);
    photo.onerror = () => setError("Foto gagal dibaca. Pilih gambar lain.");
    photo.src = url;
    return () => {
      photo.onload = null; photo.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [source]);

  useEffect(() => {
    if (!image || !canvas.current) return;
    const width = Math.min(image.naturalWidth, image.naturalHeight * ratio) / zoom;
    const height = width / ratio;
    const context = canvas.current.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.current.width, canvas.current.height);
    context.drawImage(image, (image.naturalWidth - width) * x / 100, (image.naturalHeight - height) * y / 100,
      width, height, 0, 0, canvas.current.width, canvas.current.height);
  }, [image, ratio, zoom, x, y]);

  useImperativeHandle(ref, () => ({
    async getFile() {
      if (error) throw new Error(error);
      if (!source) return null;
      if (!image) throw new Error("Tunggu hingga pratinjau foto tersedia.");
      const blob = await new Promise((resolve) => canvas.current.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) throw new Error("Gagal menyiapkan foto.");
      return new File([blob], "profil.jpg", { type: "image/jpeg" });
    },
  }), [source, image, error]);

  return <fieldset className="space-y-3">
    <legend className="font-extrabold text-sm">Foto profil (opsional)</legend>
    <input aria-label="Pilih foto profil" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
      select(event.target.files[0]); event.target.value = "";
    }} />
    {currentPhoto && <button type="button" className="underline" onClick={() => select(currentPhoto)}>Atur ulang foto tersimpan</button>}
    {error && <p role="alert">{error}</p>}
    {(source || error) && <button type="button" className="underline" onClick={() => select(null)}>Batalkan pilihan</button>}
    {image && <div className="grid gap-2 text-sm">
      <canvas ref={canvas} width={600} height={Math.round(600 / ratio)} aria-label="Pratinjau potongan foto" className="w-36 rounded-lg" />
      <label>Rasio foto <select value={ratio} onChange={(e) => setRatio(Number(e.target.value))}>
        <option value={1}>1:1</option><option value={0.75}>3:4</option><option value={4 / 3}>4:3</option>
      </select></label>
      {[["Perbesar", zoom, setZoom, 1, 3, 0.05], ["Posisi horizontal", x, setX, 0, 100, 1],
        ["Posisi vertikal", y, setY, 0, 100, 1]].map(([title, value, change, min, max, step]) =>
        <label key={title}>{title} <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => change(Number(e.target.value))} /></label>)}
    </div>}
  </fieldset>;
}
