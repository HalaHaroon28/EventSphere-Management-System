import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Calendar,
  MapPin,
  Building2,
  Tag,
  Layers
} from "lucide-react";

export const HALL_LOCATIONS = [
  "Grand Main Hall",
  "Royal Pavilion Hall",
  "Apex Convention Center",
  "Starlight Exhibition Hall",
  "Imperial Grand Arena",
];

export const ManageExpos = () => {
  const { expos, createExpo, updateExpo, deleteExpo, uploadExpoBanner, booths, currentUser, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpo, setEditingExpo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toISOString().split("T")[0];
  };

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getMinDate());
  const [location, setLocation] = useState(HALL_LOCATIONS[0]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [totalBooths, setTotalBooths] = useState(24);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const myExpos = expos.filter((e) => {
    if (!currentUser) return true;
    const orgId = typeof e.organizer_id === "object" ? e.organizer_id?._id : e.organizer_id;
    return (
      orgId === currentUser._id ||
      e.organizer_name === currentUser.name ||
      e.organizer_id === currentUser._id
    );
  });

  const displayExposList = myExpos.length > 0 ? myExpos : expos;

  const isHallBookedOnDate = (hallName, selectedDateStr, currentExpoId = null) => {
    if (!hallName || !selectedDateStr) return false;
    return expos.some((e) => {
      if (currentExpoId && (e._id === currentExpoId || e.id === currentExpoId)) return false;
      if (e.location !== hallName) return false;
      const expoDateStr = e.date ? new Date(e.date).toISOString().split("T")[0] : "";
      return expoDateStr === selectedDateStr;
    });
  };

  const openCreateModal = () => {
    setEditingExpo(null);
    setTitle("");
    setTheme("");
    setDescription("");
    setDate(getMinDate());
    setLocation(HALL_LOCATIONS[0]);
    setCategory("");
    setStatus("upcoming");
    setTotalBooths(24);
    setBannerImage("");
    setBannerFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expo) => {
    setEditingExpo(expo);
    setTitle(expo.title || "");
    setTheme(expo.theme || "");
    setDescription(expo.description || "");
    const rawDate = expo.date ? new Date(expo.date).toISOString().split("T")[0] : getMinDate();
    setDate(rawDate < getMinDate() ? getMinDate() : rawDate);
    setLocation(expo.location || HALL_LOCATIONS[0]);
    setCategory(expo.category || "");
    setStatus(expo.status || "upcoming");
    setTotalBooths(expo.total_booths ?? 24);
    setBannerImage(expo.banner_image || "");
    setBannerFile(null);
    setIsModalOpen(true);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const minDateStr = getMinDate();

    if (!title.trim() || !location.trim() || !category.trim()) {
      showToast("Validation Error", "Please fill in Exhibition Title, Location / Hall, and Category.", "error");
      return;
    }

    if (date < minDateStr) {
      showToast("Invalid Event Date", `Event date must be at least 4 days after today (${minDateStr}).`, "error");
      return;
    }

    if (isHallBookedOnDate(location, date, editingExpo?._id)) {
      showToast(
        "Hall Conflict",
        `The hall "${location}" is already booked for another exhibition on ${date}. Please select another hall or date.`,
        "error"
      );
      return;
    }

    setIsUploading(true);
    let uploadedUrl = bannerImage;
    if (bannerFile && uploadExpoBanner) {
      const resUrl = await uploadExpoBanner(bannerFile);
      if (resUrl) {
        uploadedUrl = resUrl;
      }
    }

    const payload = {
      title: title.trim(),
      theme: theme.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      location: location.trim(),
      category: category.trim(),
      status,
      total_booths: Number(totalBooths),
      banner_image: uploadedUrl,
      floor_plan_image_url: "/blueprint-floorplan.jpg",
      organizer_id: currentUser?._id || "user_org_1",
      organizer_name: currentUser?.name || "Organizer Admin"
    };

    if (editingExpo) {
      await updateExpo(editingExpo._id, payload);
    } else {
      await createExpo(payload);
    }
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const filteredExpos = displayExposList.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="manage-expos-view" className="space-y-6 font-body">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Manage Exhibitions
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Dynamic control center to create, update, and manage your hosted trade expos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Exhibition
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredExpos.map((expo) => {
          const expoBooths = booths.filter((b) => b.expo_id === expo._id);
          const bookedCount = expoBooths.filter((b) => b.status === "booked").length;
          const currentTotalBooths = expo.total_booths ?? 24;

          return (
            <div
              key={expo._id}
              className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC] font-heading">{expo.title}</h3>
                  {expo.theme && <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">{expo.theme}</p>}
                </div>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded teal-badge shrink-0">
                  {expo.category || "General"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] block uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60">Location</span>
                  <span className="font-medium text-[#1F2937] dark:text-[#F8FAFC] truncate block">{expo.location}</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60">Event Date</span>
                  <span className="font-mono font-medium text-[#1F2937] dark:text-[#F8FAFC]">
                    {expo.date ? new Date(expo.date).toLocaleDateString() : "Scheduled"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] block uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60">Total Booths</span>
                  <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                    {bookedCount} / {currentTotalBooths}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold capitalize text-[#1488A6] dark:text-[#38B2AC] font-mono">
                  Status: {expo.status || "upcoming"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(expo)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${expo.title}"?`)) {
                        deleteExpo(expo._id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-white/10 text-[11px] font-bold text-[#1F2937] dark:text-[#F8FAFC] uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3.5">Exhibition / Theme</th>
                <th className="px-5 py-3.5">Location & Date</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Booths</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredExpos.map((expo) => {
                const expoBooths = booths.filter((b) => b.expo_id === expo._id);
                const bookedCount = expoBooths.filter((b) => b.status === "booked").length;
                const currentTotalBooths = expo.total_booths ?? 24;

                return (
                  <tr key={expo._id} className="hover:bg-slate-50/70 dark:hover:bg-[#203748]/50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-[#1F2937] dark:text-[#F8FAFC] text-xs sm:text-sm truncate font-heading">
                        {expo.title}
                      </div>
                      {expo.theme && <div className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate mt-0.5">{expo.theme}</div>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-[#1F2937] dark:text-[#F8FAFC]">{expo.location}</div>
                      <div className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 mt-0.5 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" />
                        <span>{expo.date ? new Date(expo.date).toLocaleDateString() : "Scheduled"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded teal-badge font-mono">
                        {expo.category || "Technology & AI"}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#1F2937] dark:text-[#F8FAFC] font-mono">
                        {bookedCount} / {currentTotalBooths}
                      </div>
                      <div className="text-[11px] text-[#1488A6] dark:text-[#38B2AC] font-medium font-mono">
                        {Math.round((bookedCount / (currentTotalBooths || 1)) * 100)}% Booked
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <select
                        value={expo.status || "upcoming"}
                        onChange={(e) => updateExpo(expo._id, { status: e.target.value })}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${expo.status === "upcoming"
                          ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                          : expo.status === "ongoing"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-[#203748] text-[#6B7280] dark:text-[#CBD5E1] border-slate-200 dark:border-white/10"
                          }`}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(expo)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#0F172A] rounded-lg text-[#6B7280] dark:text-[#CBD5E1] transition-colors cursor-pointer"
                        title="Edit Expo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${expo.title}"?`)) {
                            deleteExpo(expo._id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Expo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  {editingExpo ? "Edit Exhibition" : "Create New Exhibition"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
                  Configure dynamic exhibition details, location, and booth pricing.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Exhibition Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. International AI & Robotics Expo 2026"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Theme / Tagline
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g. Next-Gen Autonomous Systems & Cloud Architecture"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide overview of keynotes, vendor tracks, and summit highlights..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono">
                    Exhibition Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    {bannerImage && (
                      <img
                        src={bannerImage}
                        alt="Banner Preview"
                        className="w-20 h-14 object-cover rounded-xl border border-[#E5E7EB] dark:border-white/10"
                      />
                    )}
                    <label className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-dashed border-[#1488A6]/40 dark:border-[#38B2AC]/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-teal-50/50 dark:hover:bg-[#203748]/40 transition-colors">
                      <span className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC]">
                        {bannerImage ? "Change Exhibition Image" : "Upload Exhibition Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono">
                      Event Date * (Min 4 Days After Today)
                    </label>
                    <span className="text-[10px] font-mono text-[#1488A6] dark:text-[#38B2AC] font-bold">
                      Min Date: {getMinDate()}
                    </span>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <input
                      type="date"
                      required
                      min={getMinDate()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 mt-1">
                    * Previous dates & today are disabled. Events must be scheduled at least 4 days in advance.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Location / Hall *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <select
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
                    >
                      {HALL_LOCATIONS.map((hall) => {
                        const isBooked = isHallBookedOnDate(hall, date, editingExpo?._id);
                        return (
                          <option key={hall} value={hall} disabled={isBooked}>
                            {hall} {isBooked ? "⚠️ (Booked on this Date)" : "✓ (Available)"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {isHallBookedOnDate(location, date, editingExpo?._id) && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1 font-mono">
                      ⚠️ Selected hall is already booked on {date}. Please pick an available hall.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category name (e.g. AI & Robotics)"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Total Planned Booths *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={totalBooths}
                      onChange={(e) => setTotalBooths(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#E5E7EB] dark:border-white/10 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Blueprint floor plan image (`/blueprint-floorplan.jpg`) is permanently enabled for all booth layouts.</span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#0F172A] cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {editingExpo ? "Update Exhibition" : "Publish Exhibition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExpos;
