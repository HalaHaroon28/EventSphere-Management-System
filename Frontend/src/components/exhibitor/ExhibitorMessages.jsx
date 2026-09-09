import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Send,
  Search,
  MessageSquare,
  User,
  CheckCheck,
  Trash2,
  Plus,
  Building2,
  ShieldAlert,
  Loader2,
  X
} from "lucide-react";

const ExhibitorMessages = () => {
  const {
    currentUser,
    currentRole,
    fetchInboxApi,
    fetchThreadApi,
    sendMessageApi,
    deleteThreadApi,
    fetchMessagingContactsApi,
    showToast
  } = useApp();

  const isOrganizer = currentRole === "organizer";
  const isAttendee = currentRole === "attendee";

  const [inbox, setInbox] = useState([]);
  const [allowedContacts, setAllowedContacts] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // Fetch Inbox and Allowed Contacts from MongoDB on Mount
  const loadInboxAndContacts = async () => {
    setLoadingInbox(true);
    const [inboxData, contactsData] = await Promise.all([
      fetchInboxApi(),
      fetchMessagingContactsApi()
    ]);

    // Role filtering:
    // Organizers: see Exhibitors only
    // Attendees: see Exhibitors only
    // Exhibitors: see Organizers, Exhibitors, and Attendees
    const filteredInboxData = (inboxData || []).filter((item) => {
      const partnerRole = item.contact?.role;
      if (isOrganizer || isAttendee) return partnerRole === "exhibitor";
      return partnerRole === "organizer" || partnerRole === "exhibitor" || partnerRole === "attendee";
    });

    const myId = String(currentUser?._id || currentUser?.user_id || "");
    const realDbContacts = (contactsData || []).filter((c) => {
      if (!c || !c._id) return false;
      if (myId && String(c._id) === myId) return false;
      if (isOrganizer || isAttendee) return c.role === "exhibitor";
      return c.role === "organizer" || c.role === "exhibitor" || c.role === "attendee";
    });

    setInbox(filteredInboxData);
    setAllowedContacts(realDbContacts);
    setLoadingInbox(false);

    // Auto-select first conversation partner or first real DB contact
    if (filteredInboxData.length > 0) {
      setSelectedPartner(filteredInboxData[0].contact);
    } else if (realDbContacts.length > 0) {
      setSelectedPartner(realDbContacts[0]);
    } else {
      setSelectedPartner(null);
    }
  };

  useEffect(() => {
    loadInboxAndContacts();
  }, [currentRole, currentUser?._id]);

  // Fetch full conversation thread whenever selectedPartner changes
  const loadThread = async (partnerId) => {
    if (!partnerId) {
      setThreadMessages([]);
      return;
    }
    setLoadingThread(true);
    const msgs = await fetchThreadApi(partnerId);
    setThreadMessages(msgs);
    setLoadingThread(false);
  };

  useEffect(() => {
    if (selectedPartner?._id) {
      loadThread(selectedPartner._id);
    }
  }, [selectedPartner?._id]);

  // Filtered inbox list by search bar
  const filteredInbox = inbox.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = item.contact?.name || "";
    const company = item.contact?.company_profile?.company_name || "";
    const email = item.contact?.email || "";
    const role = item.contact?.role || "";
    return (
      name.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q)
    );
  });

  // Filtered new contacts list for "Start New Chat" modal
  const filteredNewContacts = allowedContacts.filter((contact) => {
    if ((isOrganizer || isAttendee) && contact.role !== "exhibitor") return false;

    if (!contactSearchQuery.trim()) return true;
    const q = contactSearchQuery.toLowerCase();
    const name = contact.name || "";
    const company = contact.company_profile?.company_name || "";
    const email = contact.email || "";
    return (
      name.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q)
    );
  });

  // Send Message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPartner?._id) return;

    setSending(true);
    const sentMsg = await sendMessageApi(selectedPartner._id, replyText.trim());
    setSending(false);

    if (sentMsg) {
      setReplyText("");
      // Refresh thread and inbox list
      loadThread(selectedPartner._id);
      const freshInbox = await fetchInboxApi();
      setInbox(
        freshInbox.filter((item) => {
          if (isOrganizer || isAttendee) return item.contact?.role === "exhibitor";
          return item.contact?.role === "organizer" || item.contact?.role === "exhibitor" || item.contact?.role === "attendee";
        })
      );
    }
  };

  // Start new chat with a contact from modal
  const handleSelectNewContact = (contact) => {
    setSelectedPartner(contact);
    setShowNewChatModal(false);
    setContactSearchQuery("");
    // Check if thread exists or load empty thread
    loadThread(contact._id);
  };

  return (
    <div id="exhibitor-messages-view" className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight">
              {isOrganizer ? "Organizer B2B Messages Inbox" : isAttendee ? "Attendee Messages Inbox" : "Exhibitor Direct Messages Inbox"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono teal-badge uppercase">
              Direct Communications
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
            {isOrganizer
              ? "Communicate directly with registered event exhibitors for booth coordination, logistics, and announcements."
              : isAttendee
                ? "Communicate directly with event exhibitors for booth inquiries, products, and information."
                : "Communicate directly with event organizers, fellow exhibitors, and attendees."}
          </p>
        </div>

        <button
          onClick={() => setShowNewChatModal(true)}
          className="px-4 py-2.5 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Start New Chat
        </button>
      </div>

      {/* Split Inbox Layout */}
      <div className="bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        {/* Left Side: Threads List */}
        <div className={`md:col-span-4 border-r border-[#E5E7EB] dark:border-white/10 flex-col ${selectedPartner ? "hidden md:flex" : "flex"}`}>
          <div className="p-3.5 border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#38B2AC]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB] dark:divide-white/10 overflow-y-auto flex-1 max-h-[480px]">
            {loadingInbox ? (
              <div className="p-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#38B2AC]" />
                Loading conversations...
              </div>
            ) : filteredInbox.length === 0 ? (
              <div className="p-3 space-y-2">
                <div className="px-2 py-1 text-[11px] font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 uppercase tracking-wider">
                  {isOrganizer ? `Exhibitors (${filteredNewContacts.length})` : `Organizers & Exhibitors (${filteredNewContacts.length})`}
                </div>
                {filteredNewContacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                    No matching contacts found.
                  </div>
                ) : (
                  filteredNewContacts.map((contact) => {
                    const isSelected = String(selectedPartner?._id) === String(contact._id);
                    const companyName = contact.company_profile?.company_name || contact.company_name;

                    return (
                      <button
                        key={contact._id}
                        onClick={() => setSelectedPartner(contact)}
                        className={`w-full text-left p-3 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#203748]/50 transition-colors flex items-center justify-between gap-2 cursor-pointer ${isSelected
                            ? "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border-l-4 border-[#1488A6] dark:border-[#38B2AC]"
                            : ""
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                              {contact.name}
                            </span>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC]">
                              {contact.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate mt-0.5">
                            {companyName || contact.email}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              filteredInbox.map((item) => {
                const partner = item.contact;
                const isSelected = String(selectedPartner?._id) === String(partner?._id);
                const partnerName = partner?.name || "User";
                const companyName = partner?.company_profile?.company_name || partner?.company_name;
                const lastContent = item.last_message
                  ? typeof item.last_message.content === "object"
                    ? item.last_message.content?.content || item.last_message.content?.message || JSON.stringify(item.last_message.content)
                    : String(item.last_message.content || item.last_message.message || "")
                  : "Start conversation";

                return (
                  <button
                    key={partner?._id || item._id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`w-full text-left p-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#203748]/50 transition-colors flex items-start justify-between gap-2 cursor-pointer ${isSelected
                        ? "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border-l-4 border-[#1488A6] dark:border-[#38B2AC]"
                        : ""
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-xs text-[#1F2937] dark:text-[#F8FAFC] font-heading truncate">
                            {partnerName}
                          </span>
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC] shrink-0">
                            {partner?.role}
                          </span>
                        </div>
                        {item.unread_count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#1488A6] dark:bg-[#38B2AC] text-white shrink-0">
                            {item.unread_count}
                          </span>
                        )}
                      </div>
                      {companyName && (
                        <span className="text-[10px] font-semibold text-[#1488A6] dark:text-[#38B2AC] block truncate">
                          {companyName}
                        </span>
                      )}
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate mt-0.5">
                        {lastContent}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono shrink-0">
                      {item.last_message?.sent_at
                        ? new Date(item.last_message.sent_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : ""}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat View */}
        <div className={`md:col-span-8 flex-col justify-between h-full bg-[#F8FAFC]/50 dark:bg-[#0F172A]/50 ${!selectedPartner ? "hidden md:flex" : "flex"}`}>
          {!selectedPartner ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-body space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                  No Conversation Selected
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1 max-w-xs">
                  Select a contact from the inbox list or click Start New Chat to message an organizer or fellow exhibitor.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-3.5 px-4 sm:px-5 bg-white dark:bg-[#1A202C] border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-[#203748] text-xs font-bold text-[#1F2937] dark:text-white cursor-pointer"
                    title="Back to Inbox"
                  >
                    ← Back
                  </button>
                  <div className="w-9 h-9 rounded-full bg-[#1488A6] dark:bg-[#38B2AC] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {(selectedPartner?.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                        {selectedPartner?.name}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC] border border-[#E5E7EB] dark:border-white/10">
                        {selectedPartner?.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 block truncate">
                      {selectedPartner?.company_profile?.company_name || selectedPartner?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto max-h-[390px] flex-1">
                {loadingThread ? (
                  <div className="p-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#38B2AC]" />
                    Loading message history...
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#6B7280] dark:text-[#CBD5E1] max-w-md mx-auto shadow-xs text-center space-y-2">
                    <MessageSquare className="w-6 h-6 mx-auto text-[#1488A6] dark:text-[#38B2AC]" />
                    <p className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                      Start a New Conversation
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      No previous messages found with <strong>{selectedPartner.name}</strong>. Send your first message below to open a new chat thread!
                    </p>
                  </div>
                ) : (
                  threadMessages.map((msg, idx) => {
                    const senderId = typeof msg.sender_id === "object" ? msg.sender_id._id : msg.sender_id;
                    const isMe = String(senderId) === String(currentUser._id || currentUser.user_id);
                    const msgKey = msg._id || `msg-${idx}`;

                    return (
                      <div
                        key={msgKey}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-md ${isMe
                              ? "btn-teal-primary text-white rounded-br-xs shadow-xs font-medium"
                              : "bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-[#1F2937] dark:text-[#F8FAFC] rounded-bl-xs shadow-xs"
                            }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/50 mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.sent_at || msg.createdAt || "").toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {isMe && <CheckCheck className="w-3 h-3 text-[#38B2AC]" />}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-[#1A202C] border-t border-[#E5E7EB] dark:border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Send a message to ${selectedPartner?.name}...`}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Start New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-body">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  Start New B2B Conversation
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                  {isOrganizer ? "Select a registered exhibitor to open a chat thread." : "Select an organizer or fellow exhibitor to open a chat thread."}
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input inside Modal */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
              <input
                type="text"
                placeholder={isOrganizer ? "Search exhibitor name, company..." : "Search organizer or exhibitor name, company..."}
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            {/* Contacts List inside Modal */}
            <div className="divide-y divide-[#E5E7EB] dark:divide-white/10 max-h-64 overflow-y-auto rounded-2xl border border-[#E5E7EB] dark:border-white/10">
              {filteredNewContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                  {isOrganizer ? "No registered exhibitors found." : "No matching organizers or exhibitors found."}
                </div>
              ) : (
                filteredNewContacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => handleSelectNewContact(contact)}
                    className="w-full text-left p-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#203748]/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1488A6] dark:bg-[#38B2AC] text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono">
                        {(contact.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate">
                            {contact.name}
                          </h4>
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC]">
                            {contact.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 block truncate">
                          {contact.company_profile?.company_name || contact.email}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-[#1488A6] dark:text-[#38B2AC] text-xs font-bold rounded-lg shrink-0">
                      Message
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ExhibitorMessages };
export default ExhibitorMessages;
