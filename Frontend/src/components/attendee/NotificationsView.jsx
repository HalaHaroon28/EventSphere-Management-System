import { useApp } from "../../context/AppContext";
import { Bell, CheckCheck, Trash2, Calendar, MessageSquare, Info } from "lucide-react";

export const NotificationsView = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser } = useApp();

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");
  const myNotifs = (notifications || []).filter((n) => {
    if (!currentUser || !currentUserId) return false;
    const notifUserId = n.user_id ? String(typeof n.user_id === "object" ? n.user_id?._id : n.user_id) : "";
    if (notifUserId) {
      return notifUserId === currentUserId;
    }
    return !n.target_role || n.target_role === (currentUser.role || "attendee") || n.target_role === "all";
  });

  const getIcon = (type) => {
    switch (type) {
      case "application_status":
      case "expo":
        return <Calendar className="w-5 h-5 text-[#38B2AC]" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-[#1488A6]" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div id="notifications-view" className="space-y-6 font-body">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />
            Notifications & Alerts
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Stay updated with real-time alerts regarding your expos, applications, and messages.
          </p>
        </div>

        {myNotifs.length > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-xl btn-teal-primary text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {myNotifs.length === 0 ? (
          <div className="py-16 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center space-y-2">
            <Bell className="w-10 h-10 text-[#6B7280]/40 mx-auto" />
            <p className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC]">No Notifications</p>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">You're all caught up! Important updates will appear here.</p>
          </div>
        ) : (
          myNotifs.map((n) => {
            const isRead = n.read;
            const notifTitle = n.title
              ? (typeof n.title === 'object' ? (n.title.title || JSON.stringify(n.title)) : String(n.title))
              : n.type === 'application_status' ? 'Exhibitor Application Status'
                : n.type === 'booth_update' ? 'Booth Assignment Update'
                  : n.type === 'message' ? 'New Message'
                    : n.type === 'session_reminder' ? 'Upcoming Session Reminder'
                      : 'System Notification';

            const notifMsg = typeof n.message === 'object' && n.message !== null
              ? (n.message.message || n.message.text || JSON.stringify(n.message))
              : String(n.message || '');

            return (
              <div
                key={n._id}
                onClick={() => markNotificationAsRead(n._id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${!isRead
                    ? "bg-white dark:bg-[#1A202C] border-[#1488A6]/40 dark:border-[#38B2AC]/40 shadow-xs"
                    : "bg-slate-50/70 dark:bg-[#0F172A]/70 border-[#E5E7EB] dark:border-white/5 opacity-80"
                  }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#203748] shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${!isRead ? "font-bold text-[#1F2937] dark:text-[#F8FAFC]" : "font-medium text-[#6B7280] dark:text-[#CBD5E1]"}`}>
                        {notifTitle}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#38B2AC] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1] leading-relaxed">
                      {notifMsg}
                    </p>
                    <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block pt-1">
                      {new Date(n.created_at || n.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
