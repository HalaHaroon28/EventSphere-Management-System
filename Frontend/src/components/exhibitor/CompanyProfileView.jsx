import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Check, Building2, Globe, MapPin, Phone, Mail, Loader2, Upload, Image as ImageIcon } from "lucide-react";

const CompanyProfileView = () => {
  const { currentUser, updateCompanyProfile, showToast } = useApp();

  const compProf = currentUser?.company_profile || {};

  const [companyName, setCompanyName] = useState(
    compProf.company_name || currentUser?.company_name || currentUser?.name || ""
  );
  const [email, setEmail] = useState(
    compProf.contact_email || currentUser?.email || ""
  );
  const [phone, setPhone] = useState(
    compProf.contact_phone || currentUser?.phone || ""
  );
  const [website, setWebsite] = useState(compProf.website || "");
  const [headquarters, setHeadquarters] = useState(compProf.address || "");
  const [about, setAbout] = useState(compProf.description || "");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(compProf.logo || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cp = currentUser?.company_profile || {};
    setCompanyName(cp.company_name || currentUser?.company_name || currentUser?.name || "");
    setEmail(cp.contact_email || currentUser?.email || "");
    setPhone(cp.contact_phone || currentUser?.phone || "");
    setWebsite(cp.website || "");
    setHeadquarters(cp.address || "");
    setAbout(cp.description || "");
    setLogoPreview(cp.logo || "");
  }, [currentUser]);

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Invalid File", "Please select an image file for your company logo.", "error");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !email.trim()) {
      showToast("Validation Error", "Company name and contact email are required.", "error");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("company_name", companyName.trim());
    formData.append("contact_email", email.trim());
    formData.append("contact_phone", phone.trim());
    formData.append("website", website.trim());
    formData.append("address", headquarters.trim());
    formData.append("description", about.trim());

    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (logoPreview) {
      formData.append("logo", logoPreview);
    }

    await updateCompanyProfile(formData);
    setSaving(false);
  };

  const getLogoSrc = (pathStr) => {
    if (!pathStr) return "";
    if (pathStr.startsWith("http") || pathStr.startsWith("blob:") || pathStr.startsWith("data:")) return pathStr;
    const cleanPath = pathStr.replace(/^\/+/, "");
    const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    return `${API_URL}/${cleanPath}`;
  };

  return (
    <div id="company-profile-view" className="space-y-6 max-w-4xl mx-auto font-body">

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
          Company Profile
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1 font-normal">
          Update your public company logo, contact details, website, and industry description.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="w-16 h-16 rounded-2xl border-2 border-[#1488A6] dark:border-[#38B2AC] overflow-hidden bg-slate-900 shrink-0 shadow-md">
                  <img
                    src={getLogoSrc(logoPreview)}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1488A6] to-[#38B2AC] text-white flex items-center justify-center text-xl font-bold font-mono shadow-md shrink-0">
                  {(companyName || "Co").slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-base font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  {companyName || "Company Profile"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono teal-badge mt-1 inline-block">
                  Verified Enterprise Tier
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
                id="company-logo-input"
              />
              <label
                htmlFor="company-logo-input"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-all shrink-0 shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                {logoFile ? "Change Logo File" : "Upload Company Logo"}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB] dark:border-white/10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                Company Legal Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Quantum Dynamics AI"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                Primary Contact Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.ai"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                Corporate Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (415) 890-4421"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.ai"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                Headquarters Address
              </label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. San Francisco, CA, USA"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
                About the Enterprise
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your company, key offerings, and vision..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB] dark:border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export { CompanyProfileView };
export default CompanyProfileView;
