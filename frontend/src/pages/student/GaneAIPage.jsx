import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Plus, Send, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import SEO from "../../seo/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { aiService } from "../../services/aiService";
import { ErrorState } from "../../components/ui/StateViews";
import { bentoToast } from "../../utils/bentoToast";

export default function GaneAIPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isVerified = user?.verification_status === "verified";

  const suggestedPrompts = [
    t("student.prompt1"),
    t("student.prompt2"),
    t("student.prompt3"),
    t("student.prompt4"),
  ];

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const activeConv = conversations.find((c) => c.id === activeId) || null;

  const loadConversations = useCallback(() =>
    aiService.getConversations().then((list) => {
      setConversations(list);
      setError(null);
      setActiveId((id) => id || list[0]?.id || null);
    }).catch((err) => setError(err.message || t("student.ganeaiLoadError")))
      .finally(() => setLoadingList(false)), [t]);

  useEffect(() => {
    if (isVerified) loadConversations();
  }, [isVerified, loadConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages?.length, sending]);

  const handleNewConversation = async () => {
    const created = await aiService.createConversation(null, t("student.newChat"));
    setConversations((prev) => [created, ...prev]);
    setActiveId(created.id);
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    await aiService.deleteConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || null);
    bentoToast.deleted(t("student.chatDeletedTitle"), t("student.chatDeletedDesc"));
  };

  const handleSend = async (promptOverride = null) => {
    const text = (promptOverride ?? input).trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    setInput("");

    try {
      let targetId = activeId;
      if (!targetId) {
        const created = await aiService.createConversation(null, text.slice(0, 36));
        setConversations((prev) => [created, ...prev]);
        targetId = created.id;
        setActiveId(targetId);
      }

      await aiService.sendMessage(targetId, text);
      const updated = await aiService.getConversations();
      setConversations(updated);
    } catch (err) {
      setError(err.message || t("student.ganeaiSendError"));
    } finally {
      setSending(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <SEO title="GANEAI | GANESPACE" noIndex />
        <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD166] border-2 border-[#102B69] text-[#102B69] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">
            {t("student.ganeaiLockedTitle")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("student.ganeaiLockedDesc", {
              status: t(`status.${user?.verification_status || "pending"}`),
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] md:h-[calc(100vh-8rem)] rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-hidden grid grid-cols-1 md:grid-cols-12">
      <SEO title="GANEAI Assistant | GANESPACE" noIndex />

      <aside className="md:col-span-4 lg:col-span-3 max-h-56 md:max-h-none bg-[#F5F7FC] dark:bg-[#0B1222] border-b-2 md:border-b-0 md:border-r-2 border-[#102B69]/15 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <img src="/assets/ganeai-mascot.jpeg" alt="GANEAI" className="w-9 h-9 rounded-xl object-cover border border-[#102B69]" />
            <div>
              <p className="font-display font-extrabold text-sm text-[#102B69] dark:text-white leading-none">GANEAI</p>
              <p className="text-[10px] font-bold text-[#1649B8] dark:text-[#D6F45A]">Campus Companion</p>
            </div>
          </div>

          <button
            onClick={handleNewConversation}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95 transition"
          >
            <Plus className="w-4 h-4" /> {t("student.newChat")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loadingList ? (
            <p className="text-xs text-slate-500 p-2">{t("student.loadingHistory")}</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-500 p-3 text-center">{t("student.noChatHistory")}</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl cursor-pointer text-xs font-bold border-2 transition ${
                  conv.id === activeId
                    ? "bg-white dark:bg-[#111A2E] border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-white"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#1649B8] dark:text-[#D6F45A]" />
                  <span className="truncate">{conv.title}</span>
                </span>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  aria-label={t("student.deleteChatAria")}
                  className="opacity-60 hover:opacity-100 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="md:col-span-8 lg:col-span-9 flex flex-col min-h-[420px] md:min-h-0">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="font-display font-extrabold text-base text-[#102B69] dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
            {activeConv ? activeConv.title : "GANEAI Chat"}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t("student.chatSubtitle")}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-white dark:bg-[#111A2E]">
          {error && <ErrorState message={error} onRetry={loadConversations} />}

          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 py-6">
              <img
                src="/assets/ganeai-mascot.jpeg"
                alt="GANEAI"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#102B69] shadow-[0_4px_0_0_#102B69]"
              />
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">
                  {t("student.ganeaiWelcome", {
                    name: user?.name?.split(" ")[0] || t("student.defaultName"),
                  })}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t("student.ganeaiWelcomeSub")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left p-3.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-xs font-bold text-[#102B69] dark:text-slate-200 hover:border-[#102B69] dark:hover:border-[#D6F45A] transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start gap-2.5"}`}
                >
                  {msg.sender !== "user" && (
                    <img src="/assets/ganeai-mascot.jpeg" alt="GANEAI" className="w-8 h-8 rounded-xl object-cover border border-[#102B69] shrink-0 mt-0.5" />
                  )}
                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#102B69] dark:bg-[#D6F45A] text-white dark:text-[#102B69] font-medium rounded-br-sm"
                        : "bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/15 dark:border-slate-700 text-[#172033] dark:text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2.5">
                  <img src="/assets/ganeai-mascot.jpeg" alt="GANEAI" className="w-8 h-8 rounded-xl object-cover border border-[#102B69]" />
                  <div className="px-4 py-3 rounded-2xl bg-[#EAF1FF] dark:bg-slate-800 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] animate-pulse">
                    {t("student.ganeaiTyping")}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={t("student.ganeaiInputPh")}
            className="flex-1 px-4 py-3 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="p-3 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>
    </div>
  );
}