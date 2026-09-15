import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  X,
  Send,
  Building2,
  MessageSquare,
  Search,
  RefreshCw,
  Clock,
  User,
  Plus,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const AttendeeInquiriesDrawer = ({
  isOpen,
  onClose,
  initialExhibitorId
}) => {
  const {
    currentUser = {},
    fetchInboxApi,
    fetchThreadApi,
    sendMessageApi,
    fetchMessagingContactsApi,
    messages = [],
    booths = [],
    showcases = [],
    showcase = [],
    sendMessage,
    showToast
  } = useApp();

  const [threads, setThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(initialExhibitorId || null);
  const [activePartnerObj, setActivePartnerObj] = useState(null);
  const [activeThreadMessages, setActiveThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchContactQuery, setSearchContactQuery] = useState("");
  const [showNewInquiryList, setShowNewInquiryList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inboxList, contactsList] = await Promise.all([
        fetchInboxApi ? fetchInboxApi() : [],
        fetchMessagingContactsApi ? fetchMessagingContactsApi() : []
      ]);
      setThreads(inboxList || []);
      setContacts(contactsList || []);

      if (initialExhibitorId) {
        setActivePartnerId(initialExhibitorId);
        setShowNewInquiryList(false);
      } else if (inboxList && inboxList.length > 0 && !activePartnerId) {
        const firstContact = inboxList[0]?.contact?._id || inboxList[0]?._id;
        if (firstContact) {
          setActivePartnerId(firstContact);
          setShowNewInquiryList(false);
        }
      } else if ((!inboxList || inboxList.length === 0) && !activePartnerId) {
        setShowNewInquiryList(true);
      }
    } catch (err) {
      console.error("Failed to load messaging data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialExhibitorId) {
        setActivePartnerId(initialExhibitorId);
        setShowNewInquiryList(false);
      }
    }
  }, [isOpen, initialExhibitorId]);

  // Load live message thread
  useEffect(() => {
    const loadThread = async () => {
      if (!activePartnerId) return;
      try {
        if (fetchThreadApi) {
          const msgs = await fetchThreadApi(activePartnerId);
          setActiveThreadMessages(msgs || []);
        } else {
          // Fallback to local messages
          const filtered = (messages || []).filter((m) => {
            const sender = String(m.sender_id?._id || m.sender_id || "");
            const receiver = String(m.receiver_id?._id || m.receiver_id || "");
            const partner = String(activePartnerId);
            return (
              (sender === currentUserId && receiver === partner) ||
              (sender === partner && receiver === currentUserId)
            );
          });
          setActiveThreadMessages(filtered);
        }
      } catch (err) {
        console.error("Failed to load thread:", err);
      }
    };
    if (isOpen && activePartnerId) {
      loadThread();
    }
  }, [activePartnerId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadMessages]);

  if (!isOpen) return null;

  // Compile all unique exhibitors available to contact from registered contacts
  const allExhibitorCandidates = (contacts || []).filter(
    (c) => c.role === "exhibitor" || (!c.role && c.company_profile)
  );

  const filteredCandidates = allExhibitorCandidates.filter((c) => {
    if (!searchContactQuery.trim()) return true;
    const q = searchContactQuery.toLowerCase();
    const name = (c.company_profile?.company_name || c.name || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleSelectPartner = (partnerId, partnerObj = null) => {
    setActivePartnerId(partnerId);
    setActivePartnerObj(partnerObj);
    setShowNewInquiryList(false);
  };

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activePartnerId || isSending) return;

    setIsSending(true);
    const text = replyText.trim();

    try {
      if (sendMessageApi) {
        const sent = await sendMessageApi(activePartnerId, text);
        if (sent) {
          setReplyText("");
          // Refresh thread & inbox
          if (fetchThreadApi) {
            const updated = await fetchThreadApi(activePartnerId);
            setActiveThreadMessages(updated || []);
          }
          if (fetchInboxApi) {
            const updatedInbox = await fetchInboxApi();
            setThreads(updatedInbox || []);
          }
        } else {
          setReplyText(text);
        }
      } else if (sendMessage) {
        sendMessage(activePartnerId, text);
        setReplyText("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setReplyText(text);
    } finally {
      setIsSending(false);
    }
  };

  const getMessageText = (msg) => {
    if (!msg) return "";
    if (typeof msg === "string") return msg;
    if (typeof msg === "object") {
      return msg.content || msg.message || msg.text || "";
    }
    return String(msg);
  };

  // Derive active partner display name
  const currentPartnerInfo =
    activePartnerObj ||
    contacts.find((c) => String(c._id) === String(activePartnerId)) ||
    threads.find((t) => String(t.contact?._id || t._id) === String(activePartnerId))?.contact ||
    booths.find((b) => String(b.exhibitor_id?._id || b.exhibitor_id) === String(activePartnerId));

  const partnerDisplayName =
    (typeof currentPartnerInfo?.company_name === "string" && currentPartnerInfo.company_name) ||
    (typeof currentPartnerInfo?.name === "string" && currentPartnerInfo.name) ||
    (typeof currentPartnerInfo?.exhibitor_name === "string" && currentPartnerInfo.exhibitor_name) ||
    "Exhibitor Attendant";

  const partnerBooth = currentPartnerInfo?.booth_number || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-4xl w-full h-[85vh] max-h-[750px] flex flex-col overflow-hidden text-[#1F2937] dark:text-[#F8FAFC] my-auto">

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Direct Messaging
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                My Inquiries & Direct Messages
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Contact and chat directly with verified exhibition booth attendants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              title="Refresh messages"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split View Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

          {/* LEFT SIDEBAR: Active Threads & New Inquiry Picker */}
          <div className="w-full md:w-80 border-r border-[#E5E7EB] dark:border-white/10 flex flex-col bg-slate-50 dark:bg-[#0F172A] shrink-0">
            {/* Action Bar: New Inquiry button + Search */}
            <div className="p-3.5 border-b border-[#E5E7EB] dark:border-white/10 space-y-2.5">
              <button
                onClick={() => setShowNewInquiryList(!showNewInquiryList)}
                className="w-full py-2 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showNewInquiryList ? "View Active Chats" : "New Direct Inquiry"}</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="text"
                  placeholder={showNewInquiryList ? "Search exhibitors to message..." : "Filter conversations..."}
                  value={searchContactQuery}
                  onChange={(e) => setSearchContactQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {showNewInquiryList ? (
                /* NEW INQUIRY CANDIDATES */
                filteredCandidates.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 px-4 space-y-2">
                    <Building2 className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                    <p className="font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC]">No exhibitors found</p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60">
                      No registered exhibitors are currently available.
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map((cand) => {
                    const cId = cand._id;
                    const cName = cand.company_profile?.company_name || cand.name || "Exhibitor";
                    const isSelected = String(activePartnerId) === String(cId);

                    return (
                      <button
                        key={cId}
                        onClick={() => handleSelectPartner(cId, cand)}
                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-2 cursor-pointer border ${isSelected
                          ? "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                          : "bg-white dark:bg-[#1A202C] border-transparent hover:border-[#E5E7EB] dark:hover:border-white/10 shadow-2xs"
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                            {cName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold teal-badge px-1.5 py-0.2 rounded">
                              Exhibitor
                            </span>
                            {cand.email && (
                              <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 truncate">
                                {cand.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#CBD5E1]/40 shrink-0" />
                      </button>
                    );
                  })
                )
              ) : (
                /* ACTIVE THREADS LIST */
                threads.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 px-4 space-y-2">
                    <Building2 className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                    <p className="font-semibold">No active inquiries yet</p>
                    <button
                      onClick={() => setShowNewInquiryList(true)}
                      className="text-xs text-[#1488A6] dark:text-[#38B2AC] font-bold hover:underline"
                    >
                      Click here to message an exhibitor
                    </button>
                  </div>
                ) : (
                  threads.map((t) => {
                    const partner = t.contact || t;
                    const partnerId = partner._id;
                    const name = partner.company_name || partner.name || "Exhibitor";
                    const isSelected = String(activePartnerId) === String(partnerId);
                    const snippet = getMessageText(t.last_message) || "Active conversation";

                    return (
                      <button
                        key={t._id || partnerId}
                        onClick={() => handleSelectPartner(partnerId, partner)}
                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-start justify-between gap-2 cursor-pointer border ${isSelected
                          ? "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                          : "bg-white dark:bg-[#1A202C] border-transparent hover:border-[#E5E7EB] dark:hover:border-white/10 shadow-2xs"
                          }`}
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                            {name}
                          </h4>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate">
                            {snippet}
                          </p>
                        </div>
                        {t.unread_count > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#38B2AC] shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* RIGHT MAIN: Active Message Stream */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#1A202C] min-w-0">
            {activePartnerId ? (
              <>
                {/* Conversation Header */}
                <div className="px-5 py-3 border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#1A202C] shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                      {partnerDisplayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                        {partnerDisplayName}
                      </h4>
                      {partnerBooth && (
                        <span className="text-[10px] font-mono text-[#1488A6] dark:text-[#38B2AC] font-bold">
                          Booth {partnerBooth}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Direct Channel
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/50 dark:bg-[#0F172A]/40">
                  {activeThreadMessages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 space-y-1">
                      <MessageSquare className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                      <p className="font-semibold">Start your direct inquiry with {partnerDisplayName}</p>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50">
                        Ask questions regarding products, pricing, or live demonstrations.
                      </p>
                    </div>
                  ) : (
                    activeThreadMessages.map((msg, idx) => {
                      const senderId = String(
                        typeof msg.sender_id === "object" ? msg.sender_id?._id : msg.sender_id || ""
                      );
                      const isMe = senderId === currentUserId;
                      const text = getMessageText(msg);

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs leading-relaxed ${isMe
                              ? "btn-teal-primary text-white rounded-br-xs"
                              : "bg-white dark:bg-[#1A202C] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 rounded-bl-xs"
                              }`}
                          >
                            <p className="whitespace-pre-wrap">{text}</p>
                          </div>
                          <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/50 font-mono mt-1 px-1">
                            {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 sm:p-4 bg-white dark:bg-[#1A202C] border-t border-[#E5E7EB] dark:border-white/10 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type message to ${partnerDisplayName}...`}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="p-2.5 rounded-xl btn-teal-primary text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Empty Selection State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 flex items-center justify-center text-[#1488A6] dark:text-[#38B2AC]">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  Select an inquiry or start a new message
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-sm">
                  Reach out to corporate vendors directly from your attendee portal.
                </p>
                <button
                  onClick={() => setShowNewInquiryList(true)}
                  className="px-4 py-2 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Browse Exhibitors to Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeInquiriesDrawer;
