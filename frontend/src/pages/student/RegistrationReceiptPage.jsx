import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Calendar, Download, Info, MapPin, QrCode } from "lucide-react";
import { API_CONFIG } from "../../services/api/apiClient";
import SEO from "../../seo/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { registrationService } from "../../services/registrationService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { EmptyState, PageLoader } from "../../components/ui/StateViews";
import { bentoToast } from "../../utils/bentoToast";

export default function RegistrationReceiptPage() {
  const { id } = useParams();
  return <ReceiptDetail key={id} id={id} />;
}

function ReceiptDetail({ id }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let current = true;
    let objectUrl;
    registrationService.getRegistrationById(id).then((record) => {
      if (!current) return;
      setReg(record);
      setLoading(false);
      if (API_CONFIG.useMockApi || !record) return;
      registrationService.getReceiptQr(id).then((blob) => {
        if (current) {
          objectUrl = URL.createObjectURL(blob);
          setQrUrl(objectUrl);
        }
      }).catch((failure) => { if (current) setQrError(failure.message); });
    }).catch((failure) => {
      if (current) { setError(failure.message); setLoading(false); }
    });
    return () => {
      current = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await registrationService.downloadReceiptPdf(id);
      bentoToast.success(t("student.receiptReadyTitle"), t("student.receiptReadyDesc"));
    } catch (err) {
      bentoToast.error(t("student.downloadFailedTitle"), err.message || t("student.downloadFailedDesc"));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <p role="alert">{error}</p>;
  if (!reg) {
    return (
      <EmptyState
        title={t("student.receiptNotFoundTitle")}
        description={t("student.receiptNotFoundDesc")}
        action={
          <Link to="/student/registrations" className="px-5 py-2.5 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold">
            {t("student.backToBookings")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SEO title={`Receipt ${reg.registration_code} | GANESPACE`} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/student/registrations"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A]"
        >
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold shadow-[0_3px_0_0_#102B69] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? t("student.preparingPdf") : t("student.downloadPdf")}
        </button>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-hidden">
        <div className="bg-[#102B69] text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1">
              <img src="/assets/logo-ganespace.png" alt="GANESPACE" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-display font-extrabold text-lg leading-none">
                {t("student.receiptTitle")}
              </p>
              <p className="text-xs text-[#D6F45A] font-bold mt-0.5">GANESPACE | Undiksha</p>
            </div>
          </div>

          <span
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase border border-[#102B69] ${
              reg.status === "registered" ? "bg-[#D6F45A] text-[#102B69]" : "bg-[#FF5A5F] text-white"
            }`}
          >
            {t(`status.${reg.status}`)}
          </span>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {t("student.eventTitleLabel")}
              </p>
              <h1 className="font-display font-extrabold text-xl text-[#102B69] dark:text-white mt-1">
                {reg.event_title}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  {t("student.studentLabel")}
                </p>
                <p className="font-bold text-[#172033] dark:text-white">{reg.name || user?.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400">NIM</p>
                <p className="font-bold text-[#172033] dark:text-white font-mono">{reg.nim || user?.nim || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  {t("student.regCodeLabel")}
                </p>
                <p className="font-extrabold text-[#1649B8] dark:text-[#D6F45A] font-mono">{reg.registration_code}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  {t("student.organizerLabel")}
                </p>
                <p className="font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" /> {reg.organizer}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
                {formatDateTimeWITA(reg.start_datetime)}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
                {reg.location}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center rounded-3xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/20 dark:border-slate-700 p-5 text-center space-y-3">
            <div className="w-36 h-36 rounded-2xl bg-white border-2 border-[#102B69] p-3 flex items-center justify-center">
              {API_CONFIG.useMockApi ? <QrCode className="w-24 h-24 text-[#102B69]" /> :
                qrUrl ? <img src={qrUrl} alt="QR verifikasi bukti pendaftaran" /> :
                  <span role="status">{qrError || "Memuat QR…"}</span>}
            </div>
            <p className="text-[11px] font-mono font-extrabold text-[#102B69] dark:text-[#D6F45A]">
              {reg.registration_code}
            </p>
            {reg.verification_url && <a className="text-xs underline" href={reg.verification_url}>Verifikasi bukti</a>}
          </div>
        </div>

        <div className="bg-[#EAF1FF] dark:bg-[#0B1222] border-t-2 border-[#102B69]/15 dark:border-slate-800 px-6 py-3.5 flex items-start gap-2.5 text-xs text-[#102B69] dark:text-slate-300">
          <Info className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] shrink-0 mt-0.5" />
          <span>{t("student.qrNote")}</span>
        </div>
      </div>
    </div>
  );
}