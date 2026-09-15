import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";
import { User, Phone, Mail, Lock, Shield, Camera, Check, Sparkles } from "lucide-react";

export const ProfileView = ({ isModal = false, onClose }) => {
  const { currentUser = {}, updateUserProfile, changePassword, showToast } = useApp();

  const [name, setName] = useState(currentUser.name || "");
  const [phone, setPhone] = useState(currentUser.phone || "+1 (555) 234-5678");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    currentUser.profile_photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  );
  const [companyName, setCompanyName] = useState(currentUser.company_name || "");
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await authService.uploadPfp(file);
      if (res && res.url) {
        setProfilePhotoUrl(res.url);
        await updateUserProfile({
          name,
          phone,
          profile_photo_url: res.url,
          ...(currentUser.role === "exhibitor" ? { company_name: companyName } : {})
        });
        showToast("Photo Updated", "Your profile photo has been updated dynamically.", "success");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result;
          setProfilePhotoUrl(dataUrl);
          await updateUserProfile({
            name,
            phone,
            profile_photo_url: dataUrl,
            ...(currentUser.role === "exhibitor" ? { company_name: companyName } : {})
          });
          showToast("Photo Updated", "Profile photo updated.", "info");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      profile_photo_url: profilePhotoUrl,
      ...(currentUser.role === "exhibitor" ? { company_name: companyName } : {})
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const success = changePassword(currentPassword, newPassword, confirmPassword);
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  return (
    <div id="user-profile-view" className={`space-y-5 ${isModal ? "w-full" : "max-w-4xl mx-auto"} font-body`}>

      {!isModal && (
        <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading flex items-center gap-2.5">
                <User className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />
                My Profile & Account Settings
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5 font-body">
                View and manage your personal account details, contact information, profile photo, and password.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider teal-badge">
              Role: {currentUser.role}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading border-b border-[#E5E7EB] dark:border-white/10 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" /> Personal Information
        </h3>

        <form onSubmit={handleSaveDetails} className="space-y-6">

          <div>
            <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-2">
              Profile Photo
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <img
                  src={profilePhotoUrl}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-[#1488A6] dark:ring-[#38B2AC] shadow-md"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    Uploading...
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1488A6]/10 dark:bg-[#38B2AC]/20 text-[#1488A6] dark:text-[#38B2AC] hover:bg-[#1488A6]/20 dark:hover:bg-[#38B2AC]/30 border border-[#1488A6]/30 dark:border-[#38B2AC]/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs">
                  <Camera className="w-4 h-4" />
                  {uploading ? "Uploading Image..." : "Upload New Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60">
                  Choose an image file (PNG, JPG, WEBP).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ""}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-[#0F172A]/50 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#6B7280] dark:text-[#CBD5E1]/60 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 mt-1 block">
                Email is tied to your account login.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading border-b border-[#E5E7EB] dark:border-white/10 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" /> Change Password
        </h3>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Your password has been changed successfully!</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4" /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
