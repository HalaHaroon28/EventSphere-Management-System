import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Send,
  Building2,
  Search,
  MessageSquare,
  Trash2,
  RefreshCw,
  UserCheck
} from "lucide-react";

export const AttendeeMessages = ({ initialExhibitorId }) => {
  const {
    currentUser = {},
    fetchInboxApi,
    fetchThreadApi,
    sendMessageApi,
    deleteThreadApi,
    fetchMessagingContactsApi,
    showcases = [],
    booths = [],
    applications = []
  } = useApp();

  const userId = currentUser?._id || currentUser?.user_id;

  const [contacts, setContacts] = useState([]);
  const [inboxThreads, setInboxThreads] = useState([]);
  const [selectedExhibitorId, setSelectedExhibitorId] = useState(initialExhibitorId || "");
  const [activeMessages, setActiveMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  // 1. Fetch available Exhibitor contacts & user inbox on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsList, inboxList] = await Promise.all([
        fetchMessagingContactsApi(),
        fetchInboxApi()
      ]);
      setContacts(contactsList || []);
      setInboxThreads(inboxList || []);

      if (initialExhibitorId) {
        setSelectedExhibitorId(initialExhibitorId);
      } else if (inboxList && inboxList.length > 0) {
        const firstPartnerId = inboxList[0]?.contact?._id;
        if (firstPartnerId) setSelectedExhibitorId(firstPartnerId);
      } else if (contactsList && contactsList.length > 0) {
        setSelectedExhibitorId(contactsList[0]._id);
      }
    } catch (err) {
      console.error("Failed to load messaging data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected exhibitor if initialExhibitorId changes from props
  useEffect(() => {
    if (initialExhibitorId) {
      setSelectedExhibitorId(initialExhibitorId);
    }
  }, [initialExhibitorId]);

  // 2. Fetch live message thread whenever selectedExhibitorId changes
  const loadThread = async (exhibitorId) => {
    if (!exhibitorId) return;
    setLoadingThread(true);
    try {
      const threadMsgs = await fetchThreadApi(exhibitorId);
      setActiveMessages(threadMsgs || []);
    } catch (err) {
      console.error("Failed to load thread:", err);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (selectedExhibitorId) {
      loadThread(selectedExhibitorId);
    }
  }, [selectedExhibitorId]);

  // Handle Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedExhibitorId) return;

    const textToSend = replyText.trim();
    setReplyText("");

    // Optimistic UI append
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      sender_id: userId,
      receiver_id: selectedExhibitorId,
      content: textToSend,
      sent_at: new Date().toISOString()
    };
    setActiveMessages((prev) => [...prev, tempMsg]);

    const createdMsg = await sendMessageApi(selectedExhibitorId, textToSend);
    if (createdMsg) {
      loadThread(selectedExhibitorId);
      const inboxList = await fetchInboxApi();
      if (inboxList) setInboxThreads(inboxList);
    }
  };

  // Handle Delete Conversation Thread
  const handleDeleteThread = async () => {
    if (!selectedExhibitorId) return;
    const success = await deleteThreadApi(selectedExhibitorId);
    if (success) {
      setActiveMessages([]);
      const [cList, iList] = await Promise.all([
        fetchMessagingContactsApi(),
        fetchInboxApi()
      ]);
      setContacts(cList || []);
      setInboxThreads(iList || []);
      if (iList && iList.length > 0) {
        setSelectedExhibitorId(iList[0].contact._id);
      } else if (cList && cList.length > 0) {
        setSelectedExhibitorId(cList[0]._id);
      } else {
        setSelectedExhibitorId("");
      }
    }
  };

  // Merge contacts and inbox into sidebar exhibitor items list
  const conversationPartnersMap = {};

  // Add exhibitors from contacts list (strictly role === 'exhibitor')
  (contacts || []).forEach((c) => {
    if (c.role === "exhibitor") {
      conversationPartnersMap[c._id] = {
        _id: c._id,
        name: c.company_profile?.company_name || c.name || "Exhibitor Company",
        logo: c.company_profile?.logo || c.profile_photo_url || null,
        lastMsg: null,
        unread: 0
      };
    }
  });

  // Add/update from inbox threads
  (inboxThreads || []).forEach((ib) => {
    const contact = ib.contact;
    if (contact && (contact.role === "exhibitor" || !contact.role)) {
      const cId = contact._id;
      conversationPartnersMap[cId] = {
        _id: cId,
        name: contact.company_profile?.company_name || contact.name || "Exhibitor Company",
        logo: contact.company_profile?.logo || contact.profile_photo_url || null,
        lastMsg: ib.last_message,
        unread: ib.last_message && !ib.last_message.read && ib.last_message.sender_id !== userId ? 1 : 0
      };
    }
  });

  // If selectedExhibitorId passed via props but not in contacts yet
  if (selectedExhibitorId && !conversationPartnersMap[selectedExhibitorId]) {
    const allSc = [...(showcases || [])];
    const matchSc = allSc.find((s) => String(s.exhibitor_id) === String(selectedExhibitorId) || String(s._id) === String(selectedExhibitorId));
    const matchApp = (applications || []).find((a) => String(a.exhibitor_id) === String(selectedExhibitorId));
    const matchBooth = (booths || []).find((b) => String(b.exhibitor_id) === String(selectedExhibitorId));

    const compName = matchSc?.company_name || matchApp?.company_name || matchBooth?.exhibitor_name || "Exhibitor Booth";

    conversationPartnersMap[selectedExhibitorId] = {
      _id: selectedExhibitorId,
      name: compName,
      logo: matchSc?.logo_url || matchApp?.logo_url || null,
      lastMsg: null,
      unread: 0
    };
  }

  const exhibitorItems = Object.values(conversationPartnersMap).filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q);
    }
    return true;
  });

  const activePartner = conversationPartnersMap[selectedExhibitorId] || exhibitorItems[0];

  return (
    <div id="attendee-messages-view" className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight">
            Exhibitor Inquiries & Direct Messaging
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">
            Chat directly with verified booth representatives, schedule 1-on-1 demos, and request custom pricing.
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1A202C] hover:bg-slate-200 dark:hover:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Refresh Messages
        </button>
      </div>

      {/* Inbox Layout */}
      <div className="bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Left Side: Exhibitor Contacts & Threads List */}
        <div className={`md:col-span-4 border-r border-[#E5E7EB] dark:border-white/10 flex-col ${selectedExhibitorId ? "hidden md:flex" : "flex"}`}>
          <div className="p-3.5 border-b border-[#E5E7EB] dark:border-white/10 bg-slate-50 dark:bg-[#0F172A] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F2937] dark:text-white font-heading">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#38B2AC]" /> Exhibitor Directory ({exhibitorItems.length})
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
              <input
                type="text"
                placeholder="Search exhibitor company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-lg text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#38B2AC]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB] dark:divide-white/5 overflow-y-auto flex-1 max-h-[440px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                Loading exhibitor directory...
              </div>
            ) : exhibitorItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 space-y-1">
                <Building2 className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                <p className="font-bold">No exhibitors available</p>
                <p className="text-[11px]">Exhibitor contacts will appear here dynamically once registered.</p>
              </div>
            ) : (
              exhibitorItems.map((item) => {
                const isSelected = item._id === selectedExhibitorId;
                const lastContent = item.lastMsg
                  ? typeof item.lastMsg.content === "object"
                    ? item.lastMsg.content?.content || item.lastMsg.content?.message || JSON.stringify(item.lastMsg.content)
                    : String(item.lastMsg.content || item.lastMsg.message || "")
                  : "Tap to start conversation";

                return (
                  <button
                    key={item._id}
                    onClick={() => setSelectedExhibitorId(item._id)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-[#203748]/50 transition-colors flex items-start justify-between gap-2 cursor-pointer ${isSelected ? "bg-teal-50/70 dark:bg-[#203748] border-l-4 border-[#1488A6] dark:border-[#38B2AC]" : ""
                      }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {item.logo ? (
                        <img
                          src={item.logo.startsWith("http") || item.logo.startsWith("data:") ? item.logo : `http://localhost:5000${item.logo.startsWith("/") ? "" : "/"}${item.logo}`}
                          alt={item.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#38B2AC]/40"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) e.target.nextSibling.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-[#1488A6] text-white ${item.logo ? "hidden" : "flex"} items-center justify-center text-xs font-bold font-mono shrink-0`}>
                        {(item.name || "EX").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-[#1F2937] dark:text-[#F8FAFC] font-heading truncate">
                            {item.name}
                          </span>
                          {item.unread > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#1488A6] dark:bg-[#38B2AC] text-white shrink-0">
                              {item.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate mt-0.5">
                          {lastContent}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Stream */}
        <div className={`md:col-span-8 flex-col justify-between h-full bg-slate-50/40 dark:bg-[#0F172A]/40 ${!selectedExhibitorId ? "hidden md:flex" : "flex"}`}>
          {/* Chat Header */}
          <div className="p-3.5 px-4 sm:px-5 bg-white dark:bg-[#1A202C] border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedExhibitorId("")}
                className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-[#203748] text-xs font-bold text-[#1F2937] dark:text-white cursor-pointer"
                title="Back to Directory"
              >
                ← Back
              </button>
              {activePartner?.logo ? (
                <img
                  src={activePartner.logo.startsWith("http") || activePartner.logo.startsWith("data:") ? activePartner.logo : `http://localhost:5000${activePartner.logo.startsWith("/") ? "" : "/"}${activePartner.logo}`}
                  alt={activePartner.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#38B2AC]/40 shrink-0"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded-full bg-[#1488A6] dark:bg-[#38B2AC] text-white dark:text-[#0F172A] ${activePartner?.logo ? "hidden" : "flex"} items-center justify-center text-xs font-bold font-mono shadow-xs shrink-0`}>
                {(activePartner?.name || "EX").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  {activePartner?.name || "Select Exhibitor"}
                </h4>
              </div>
            </div>

            {selectedExhibitorId && activeMessages.length > 0 && (
              <button
                onClick={handleDeleteThread}
                title="Delete Chat History"
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div className="p-4 sm:p-6 space-y-3 overflow-y-auto max-h-[380px] flex-1">
            {loadingThread ? (
              <div className="py-12 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                Loading messages...
              </div>
            ) : !selectedExhibitorId ? (
              <div className="p-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                Select an exhibitor from the list to start messaging.
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#1F2937] dark:text-[#F8FAFC] max-w-sm space-y-1 shadow-xs my-auto">
                <span className="font-bold block text-[#1488A6] dark:text-[#38B2AC] font-heading">
                  Direct Vendor Inquiry:
                </span>
                <p className="text-[#6B7280] dark:text-[#CBD5E1]">
                  Send a message below to inquire about live demos, product specifications, or private meetings with {activePartner?.name || "this booth"}.
                </p>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const msgSenderId = typeof msg.sender_id === "object" ? msg.sender_id?._id : msg.sender_id;
                const isMe = String(msgSenderId) === String(userId);
                const msgText = typeof (msg.content || msg.message) === "object"
                  ? ((msg.content || msg.message)?.content || (msg.content || msg.message)?.message || JSON.stringify(msg.content || msg.message))
                  : String(msg.content || msg.message || "");

                return (
                  <div
                    key={msg._id || `m_${Math.random()}`}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-md ${isMe
                          ? "btn-teal-primary text-white rounded-br-xs shadow-xs"
                          : "bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-[#1F2937] dark:text-[#F8FAFC] rounded-bl-xs shadow-xs"
                        }`}
                    >
                      <p>{msgText}</p>
                    </div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/50 mt-1 px-1 font-mono">
                      {new Date(msg.sent_at || msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-[#1A202C] border-t border-[#E5E7EB] dark:border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              required
              disabled={!selectedExhibitorId}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                selectedExhibitorId
                  ? `Write a message to ${activePartner?.name || "this booth"}...`
                  : "Select an exhibitor first..."
              }
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedExhibitorId || !replyText.trim()}
              className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendeeMessages;
