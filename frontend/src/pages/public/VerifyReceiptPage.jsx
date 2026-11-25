import { useCallback } from "react";
import { useParams } from "react-router-dom";
import SEO from "../../seo/SEO";
import { useRemoteList } from "../../hooks/useRemoteList";
import { ErrorState, PageLoader } from "../../components/ui/StateViews";
import { registrationService } from "../../services/registrationService";

export default function VerifyReceiptPage() {
  const { uuid } = useParams();
  const load = useCallback(() => registrationService.verifyReceipt(uuid), [uuid]);
  const { data, loading, error, refresh } = useRemoteList(load);
  return (
    <main className="max-w-xl mx-auto px-5 py-16">
      <SEO title="Verifikasi bukti pendaftaran | GaneSpace" noIndex />
      <h1 className="font-display text-2xl font-bold mb-5">Verifikasi bukti pendaftaran</h1>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={refresh} /> :
        <section className="p-6 rounded-3xl border-2 border-[#102B69] bg-white text-[#102B69]">
          <h2 className="font-bold text-xl">{data.event_title}</h2>
          <p className="mt-2">Status pendaftaran · <strong>{data.status === "active" ? "Terdaftar" : "Dibatalkan"}</strong></p>
        </section>}
    </main>
  );
}
