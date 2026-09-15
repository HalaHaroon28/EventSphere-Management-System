import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import {
  INITIAL_USERS,
  INITIAL_EXPOS,
  INITIAL_BOOTHS,
  INITIAL_APPLICATIONS,
  INITIAL_SESSIONS,
  INITIAL_REGISTRATIONS,
  INITIAL_BOOKMARKS,
  INITIAL_SHOWCASE,
  INITIAL_MESSAGES,
  INITIAL_FEEDBACK,
  INITIAL_NOTIFICATIONS
} from "../data/initialData";

const AppContext = createContext(void 0);

function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(`eventsphere_${key}`);
    if (saved && saved !== "undefined" && saved !== "null") {
      const parsed = JSON.parse(saved);
      if (parsed !== null && parsed !== undefined) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
  }
  return defaultValue;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(`eventsphere_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => loadFromStorage("theme", "light"));
  const [currentUser, setCurrentUser] = useState(() => {
    const token = authService.getToken();
    if (!token) return null;
    return loadFromStorage("user", null);
  });
  const [currentRole, setCurrentRoleState] = useState(() => {
    const token = authService.getToken();
    if (!token) return "public";
    return loadFromStorage("role", "public");
  });
  const [activeView, setActiveView] = useState(() => {
    const token = authService.getToken();
    if (!token) return "landing";
    return loadFromStorage("view", "landing");
  });
  const [selectedExpoId, setSelectedExpoId] = useState("");

  const [users, setUsers] = useState(() => loadFromStorage("users", INITIAL_USERS));
  const [expos, setExpos] = useState(() => loadFromStorage("expos", INITIAL_EXPOS));
  const [booths, setBooths] = useState(() => {
    const savedExpos = loadFromStorage("expos", []);
    if (!savedExpos || savedExpos.length === 0) return [];
    const validExpoIds = new Set(savedExpos.map((e) => String(e._id || e.id)));
    const saved = loadFromStorage("booths", []);
    return (saved || []).filter(
      (b) =>
        b &&
        !String(b._id).startsWith("booth_") &&
        validExpoIds.has(String(b.expo_id?._id || b.expo_id || ""))
    );
  });
  const [applications, setApplications] = useState(() => {
    const saved = loadFromStorage("applications", []);
    return (saved || []).filter(
      (a) =>
        a &&
        !String(a._id).startsWith("app_00") &&
        a.exhibitor_id !== "user_exh_1" &&
        a.company_name !== "Quantum Dynamics AI"
    );
  });
  const [sessions, setSessions] = useState(() => loadFromStorage("sessions", INITIAL_SESSIONS));
  const [registrations, setRegistrations] = useState(() => loadFromStorage("registrations", INITIAL_REGISTRATIONS));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage("bookmarks", INITIAL_BOOKMARKS));
  const [showcase, setShowcase] = useState(() => {
    const saved = loadFromStorage("showcase", INITIAL_SHOWCASE);
    return (saved || []).filter(
      (s) => s && s.exhibitor_id !== "user_exh_1" && s.company_name !== "Quantum Dynamics AI"
    );
  });
  const [messages, setMessages] = useState(() => loadFromStorage("messages", INITIAL_MESSAGES));
  const [feedbackList, setFeedbackList] = useState(() => loadFromStorage("feedback", INITIAL_FEEDBACK));
  const [notifications, setNotifications] = useState(() => {
    const saved = loadFromStorage("notifications", []);
    return (saved || []).filter(
      (n) =>
        n &&
        !['Exhibitor Application Received', 'Booth Selection Pending Review', 'New Support Inquiry Logged'].includes(n.title) &&
        !String(n.message).includes('TechCorp Solutions') &&
        !String(n.message).includes('NextGen AI Dynamics') &&
        !String(n.message).includes('Sarah Connor')
    );
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveToStorage("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const syncUserFromDb = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const dbUser = await authService.getCurrentUser();
          if (dbUser && dbUser._id) {
            setCurrentUser(dbUser);
            authService.setUser(dbUser);
            saveToStorage("user", dbUser);
          } else {
            authService.logout();
            setCurrentUser(null);
            setCurrentRoleState("public");
            setActiveView("landing");
          }
        } catch (e) {
          console.error("Failed to sync user from DB on startup:", e);
        }
      }
    };
    syncUserFromDb();
  }, []);

  useEffect(() => {
    if (currentUser) {
      saveToStorage("user", currentUser);
      authService.setUser(currentUser);
      if (currentUser.role && currentRole === "public") {
        setCurrentRoleState(currentUser.role);
      }
      fetchBookmarksApi();
    } else {
      localStorage.removeItem("eventsphere_user");
      localStorage.removeItem("eventsphere_auth_user");
      setBookmarks([]);
      localStorage.removeItem("eventsphere_bookmarks");
      localStorage.removeItem("bookmarks");
    }
  }, [currentUser]);

  useEffect(() => { saveToStorage("role", currentRole); }, [currentRole]);
  useEffect(() => { saveToStorage("view", activeView); }, [activeView]);
  useEffect(() => { saveToStorage("users", users); }, [users]);
  useEffect(() => { saveToStorage("expos", expos); }, [expos]);
  useEffect(() => { saveToStorage("booths", booths); }, [booths]);
  useEffect(() => { saveToStorage("applications", applications); }, [applications]);
  useEffect(() => { saveToStorage("sessions", sessions); }, [sessions]);
  useEffect(() => { saveToStorage("registrations", registrations); }, [registrations]);
  useEffect(() => {
    if (currentUser) {
      saveToStorage("bookmarks", bookmarks);
    } else {
      localStorage.removeItem("eventsphere_bookmarks");
      localStorage.removeItem("bookmarks");
    }
  }, [bookmarks, currentUser]);
  useEffect(() => { saveToStorage("showcase", showcase); }, [showcase]);
  useEffect(() => { saveToStorage("messages", messages); }, [messages]);
  useEffect(() => { saveToStorage("feedback", feedbackList); }, [feedbackList]);
  useEffect(() => { saveToStorage("notifications", notifications); }, [notifications]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = (title, message, type = "info") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newToast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentRole = (role) => {
    setCurrentRoleState(role);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRoleState("public");
    setActiveView("landing");
    setBookmarks([]);
    try {
      localStorage.removeItem("eventsphere_bookmarks");
      localStorage.removeItem("bookmarks");
    } catch (e) { }
    showToast("Logged Out Successfully", "You have been returned to the home page.", "info");
  };

  const loginAs = (roleOrUser) => {
    let user;
    if (typeof roleOrUser === "object" && roleOrUser !== null) {
      user = roleOrUser;
    } else {
      user = users.find((u) => u.role === roleOrUser);
    }
    if (user) {
      setCurrentUser(user);
      setCurrentRoleState(user.role);
      if (user.role === "attendee") {
        setActiveView("landing");
      } else {
        setActiveView("dashboard");
      }
      showToast("Logged In Successfully", `Welcome back, ${user.name}!`, "success");
    }
  };

  const updateUserProfile = async (data) => {
    try {
      const apiRes = await authService.updateProfile(data);
      const updatedUser = apiRes.user || { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => u._id === updatedUser._id ? updatedUser : u));
      showToast("Profile Updated", "Your name, phone, and profile details have been saved.", "success");
      return true;

    } catch (err) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u));
      showToast("Profile Updated", "Your profile details have been saved.", "success");
      return true;
    }
  };

  const updateCompanyProfile = async (data) => {
    try {
      const apiRes = await authService.updateCompanyProfile(data);
      const updatedUser = apiRes.user || {
        ...currentUser,
        company_profile: { ...currentUser?.company_profile, ...(apiRes.company_profile || data) }
      };
      setCurrentUser(updatedUser);
      saveToStorage("user", updatedUser);
      authService.setUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      showToast("Company Profile Saved", "Your enterprise details & logo have been saved", "success");
      return true;
    } catch (err) {
      console.error("Failed to update company profile:", err);
      showToast("Profile Error", err.message || "Failed to update company profile.", "error");
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!newPassword || newPassword.length < 6) {
      showToast("Password Too Short", "New password must be at least 6 characters.", "error");
      return false;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords Do Not Match", "Please make sure your new passwords match.", "error");
      return false;
    }
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      const updated = { ...currentUser, password: newPassword, password_hash: "hashed_" + newPassword };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u));
      showToast("Password Changed", "Your password has been updated successfully.", "success");
      return true;
    } catch (err) {
      showToast("Password Error", err.message || "Failed to update password.", "error");
      return false;
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchExpos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expos`);
      if (response.ok) {
        const data = await response.json();
        if (data.expos && Array.isArray(data.expos)) {
          setExpos(data.expos);
          if (data.expos.length === 0) {
            setBooths([]);
            setSessions([]);
            saveToStorage("booths", []);
            saveToStorage("sessions", []);
            saveToStorage("expos", []);
          } else {
            const activeExpoIds = new Set(data.expos.map((e) => String(e._id)));
            setBooths((prev) => (prev || []).filter((b) => {
              const bExpoId = String(b.expo_id?._id || b.expo_id || "");
              return activeExpoIds.has(bExpoId);
            }));
            setSessions((prev) => (prev || []).filter((s) => {
              const sExpoId = String(s.expo_id?._id || s.expo_id || "");
              return activeExpoIds.has(sExpoId);
            }));
            data.expos.forEach((e) => {
              if (e._id) {
                fetchBoothsForExpo(e._id);
                fetchSessionsForExpo(e._id);
              }
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch expos from DB:", e);
    }
  };

  const fetchExpoAnalyticsApi = async (expoId) => {
    try {
      const token = authService.getToken();
      if (!token || !expoId) return null;
      const response = await fetch(`${API_BASE_URL}/expos/${expoId}/analytics`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (e) {
      console.error(`Failed to fetch analytics for expo ${expoId}:`, e);
      return null;
    }
  };

  const fetchBoothsForExpo = async (expoId) => {
    if (!expoId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/expos/${expoId}/booths`);
      if (response.ok) {
        const data = await response.json();
        if (data.booths && Array.isArray(data.booths)) {
          setBooths((prev) => {
            const filtered = prev.filter(
              (b) =>
                !String(b._id).startsWith("booth_") &&
                b.expo_id !== expoId &&
                b.expo_id?._id !== expoId &&
                String(b.expo_id) !== String(expoId)
            );
            return [...filtered, ...data.booths];
          });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch booths for expo ${expoId} from DB:`, e);
    }
  };

  const createExpo = async (expoData) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/expos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(expoData)
        });
        const resData = await response.json();
        if (response.ok) {
          const createdExpo = resData.expo || resData;
          setExpos((prev) => [createdExpo, ...prev]);
          showToast("Expo Created", `"${createdExpo.title}" has been saved.`, "success");
          fetchExpos();
          return createdExpo;
        } else {
          showToast("Expo Error", resData.message || "Failed to create expo.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error creating expo via API:", e);
    }

    const newExpo = {
      ...expoData,
      _id: "expo_" + Date.now(),
      created_at: new Date().toISOString()
    };
    setExpos((prev) => [newExpo, ...prev]);
    showToast("Expo Created", `"${newExpo.title}" published.`, "info");
    return newExpo;
  };

  const updateExpo = async (id, data) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/expos/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await response.json();
        if (response.ok) {
          const updatedExpo = resData.expo || { _id: id, ...data };
          setExpos((prev) => prev.map((e) => (e._id === id || e.id === id ? { ...e, ...updatedExpo } : e)));
          showToast("Expo Updated", "Exhibition saved successfully.", "success");
          fetchExpos();
          return updatedExpo;
        } else {
          showToast("Update Failed", resData.message || "Could not update expo.", "error");
        }
      }
    } catch (e) {
      console.error("Error updating expo via API:", e);
    }

    setExpos((prev) => prev.map((e) => (e._id === id || e.id === id ? { ...e, ...data } : e)));
    showToast("Expo Updated", "The expo details have been modified.", "info");
  };

  const deleteExpo = async (id) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/expos/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          setExpos((prev) => prev.filter((e) => e._id !== id));
          showToast("Expo Deleted", "Exhibition removed successfully.", "info");
          return;
        }
      }
    } catch (e) {
      console.error("Error deleting expo via API:", e);
    }

    setExpos((prev) => prev.filter((e) => e._id !== id));
    showToast("Expo Deleted", "The exhibition was removed.", "info");
  };

  const uploadExpoBanner = async (file) => {
    try {
      const token = authService.getToken();
      if (token) {
        const formData = new FormData();
        formData.append("banner_image", file);

        const response = await fetch(`${API_BASE_URL}/expos/upload-banner`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.url) return resData.url;
        }
      }
    } catch (e) {
      console.warn("Direct banner upload endpoint failed, converting to image payload:", e);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const addBooth = async (boothData) => {
    const targetExpoId = boothData.expo_id || boothData.expoId;
    try {
      const token = authService.getToken();
      if (token && targetExpoId) {
        const response = await fetch(`${API_BASE_URL}/expos/${targetExpoId}/booths`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(boothData)
        });
        const resData = await response.json();
        if (response.ok) {
          const createdBooth = resData.booth || resData;
          setBooths((prev) => [createdBooth, ...prev]);
          showToast("Booth Saved", `Booth ${createdBooth.booth_number} created successfully.`, "success");
          fetchBoothsForExpo(targetExpoId);
          return createdBooth;
        } else {
          showToast("Booth Error", resData.message || "Failed to save booth.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error adding booth via API:", e);
    }

    const newBooth = {
      ...boothData,
      _id: "booth_" + Date.now(),
      created_at: new Date().toISOString()
    };
    setBooths((prev) => [newBooth, ...prev]);
    showToast("Booth Placed", `Booth ${newBooth.booth_number} added to layout.`, "info");
    return newBooth;
  };

  const updateBooth = async (id, data) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/booths/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await response.json();
        if (response.ok) {
          const updatedBooth = resData.booth || { _id: id, ...data };
          setBooths((prev) => prev.map((b) => (b._id === id ? { ...b, ...updatedBooth } : b)));
          showToast("Booth Updated", "Booth configuration saved successfully.", "success");
          return;
        }
      }
    } catch (e) {
      console.error("Error updating booth via API:", e);
    }

    setBooths((prev) => prev.map((b) => (b._id === id ? { ...b, ...data } : b)));
    showToast("Booth Updated", "Booth configuration saved.", "info");
  };

  const updateMyBoothDetails = async (boothId, detailsData) => {
    try {
      const token = authService.getToken();
      if (token && boothId) {
        const response = await fetch(`${API_BASE_URL}/booths/${boothId}/details`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(detailsData)
        });
        const resData = await response.json();
        if (response.ok) {
          const updatedBooth = resData.booth;
          setBooths((prev) => {
            const nextBooths = prev.map((b) => (String(b._id) === String(boothId) ? { ...b, ...updatedBooth } : b));
            saveToStorage("booths", nextBooths);
            return nextBooths;
          });
          showToast("Booth Profile Saved", "Your booth products & staff profile have been saved to database.", "success");
          return updatedBooth;
        } else {
          showToast("Save Error", resData.message || "Failed to update booth profile.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error updating booth details via API:", e);
      showToast("Save Error", "Failed to update booth details.", "error");
      return null;
    }
  };

  const uploadBoothProductImage = async (file) => {
    try {
      const token = authService.getToken();
      if (!token || !file) return null;
      const formData = new FormData();
      formData.append("product_image", file);

      const response = await fetch(`${API_BASE_URL}/booths/upload-product-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const resData = await response.json();
      if (response.ok) {
        return resData.url;
      } else {
        showToast("Upload Error", resData.message || "Failed to upload product image.", "error");
        return null;
      }
    } catch (e) {
      console.error("Error uploading product image via API:", e);
      showToast("Upload Error", "Failed to upload product image.", "error");
      return null;
    }
  };

  const deleteBooth = (id) => {
    setBooths((prev) => prev.filter((b) => b._id !== id));
    showToast("Booth Deleted", "Booth spot removed from layout.", "info");
  };

  const applyForExpo = async (appData) => {
    const targetExpoId = appData.expo_id || appData.expoId;
    try {
      const token = authService.getToken();
      if (token && targetExpoId) {
        let body;
        let headers = {
          "Authorization": `Bearer ${token}`
        };

        if (appData.files && appData.files.length > 0) {
          const formData = new FormData();
          formData.append("company_name", appData.company_name);
          formData.append("contact_email", appData.contact_email || currentUser?.email || "");
          formData.append("products_services", appData.products_services || "");
          formData.append("booth_tier_requested", appData.booth_tier_requested || "medium");
          appData.files.forEach((file) => {
            formData.append("documents", file);
          });
          body = formData;
        } else {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify({
            company_name: appData.company_name,
            contact_email: appData.contact_email || currentUser?.email || "",
            products_services: appData.products_services || "",
            booth_tier_requested: appData.booth_tier_requested || "medium",
            documents: appData.documents || []
          });
        }

        const response = await fetch(`${API_BASE_URL}/expos/${targetExpoId}/applications`, {
          method: "POST",
          headers,
          body
        });
        const resData = await response.json();
        if (response.ok) {
          const createdApp = resData.application || resData;
          setApplications((prev) => [createdApp, ...prev]);
          showToast("Application Submitted", "Your exhibitor application was submitted to MongoDB.", "success");
          return createdApp;
        } else {
          showToast("Application Error", resData.message || "Failed to submit application.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error submitting application via API:", e);
    }

    const newApp = {
      ...appData,
      _id: "app_" + Date.now(),
      status: "pending",
      submitted_at: new Date().toISOString()
    };
    setApplications((prev) => [newApp, ...prev]);
    showToast("Application Submitted", "Your exhibitor application is pending review.", "info");
    return newApp;
  };

  const fetchApplications = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      if (currentRole === "attendee" || currentRole === "public") return;
      const url = currentRole === "organizer"
        ? `${API_BASE_URL}/applications`
        : `${API_BASE_URL}/applications/mine`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      }
    } catch (e) {
      console.error("Failed to fetch applications from DB:", e);
    }
  };

  const updateApplicationStatus = (id, status, notes = "") => {
    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status, review_notes: notes } : a))
    );
    showToast("Status Updated", `Application marked as ${status}.`, "info");
  };

  const approveApplication = async (appId, boothId = "", approvalMessage = "") => {
    try {
      const token = authService.getToken();
      if (token && appId) {
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/approve`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            booth_id: boothId,
            approval_message: approvalMessage,
            review_notes: approvalMessage
          })
        });
        const resData = await response.json();
        if (response.ok) {
          showToast("Application Approved", "Exhibitor application approved successfully.", "success");
          fetchApplications();
          fetchExpos();
          return;
        } else {
          showToast("Approval Error", resData.message || "Failed to approve application.", "error");
        }
      }
    } catch (e) {
      console.error("Error approving application via API:", e);
    }

    setApplications((prev) =>
      prev.map((a) =>
        a._id === appId
          ? {
            ...a,
            status: "approved",
            booth_id: boothId || a.booth_id,
            approval_message: approvalMessage,
            review_notes: approvalMessage
          }
          : a
      )
    );
    showToast("Application Approved", "Marked as approved.", "info");
  };

  const rejectApplication = async (appId, rejectionReason = "") => {
    try {
      const token = authService.getToken();
      if (token && appId) {
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/reject`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason,
            reason: rejectionReason,
            rejectNotes: rejectionReason
          })
        });
        const resData = await response.json();
        if (response.ok) {
          showToast("Application Declined", "Rejection status & reason saved.", "info");
          fetchApplications();
          return;
        } else {
          showToast("Rejection Error", resData.message || "Failed to reject application.", "error");
        }
      }
    } catch (e) {
      console.error("Error rejecting application via API:", e);
    }

    setApplications((prev) =>
      prev.map((a) =>
        a._id === appId
          ? {
            ...a,
            status: "rejected",
            rejection_reason: rejectionReason,
            review_notes: rejectionReason
          }
          : a
      )
    );
    showToast("Application Declined", "Marked as rejected.", "info");
  };

  const selectBoothForApplication = async (appId, boothId) => {
    try {
      const token = authService.getToken();
      if (token && appId && boothId) {
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/select-booth`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ booth_id: boothId })
        });
        const resData = await response.json();
        if (response.ok) {
          showToast("Booth Selected", "Your booth selection was submitted for organizer confirmation.", "success");
          fetchApplications();
          fetchExpos();
          return resData.application;
        } else {
          showToast("Selection Failed", resData.message || "Could not select booth.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error selecting booth for application via API:", e);
      return null;
    }

    setApplications((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, booth_id: boothId, booth_status: "selected" } : a))
    );
    setBooths((prev) =>
      prev.map((b) => (b._id === boothId ? { ...b, status: "reserved", exhibitor_id: currentUser._id, exhibitor_name: currentUser.company_name || currentUser.name } : b))
    );
    showToast("Booth Selected", "Your booth selection was registered.", "success");
    return true;
  };

  const confirmBoothAssignment = async (appId, action = "confirm", note = "") => {
    try {
      const token = authService.getToken();
      if (token && appId) {
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/confirm-booth`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ action, note })
        });
        const resData = await response.json();
        if (response.ok) {
          if (action === "reject" || action === "decline") {
            showToast("Booth Request Declined", "The booth request was declined. Exhibitor can choose another booth.", "info");
          } else {
            showToast("Booth Confirmed", "Exhibitor booth assignment has been confirmed and locked.", "success");
          }
          fetchApplications();
          fetchExpos();
          return resData.application;
        } else {
          showToast("Operation Error", resData.message || "Failed to process booth assignment.", "error");
        }
      }
    } catch (e) {
      console.error("Error updating booth assignment via API:", e);
    }

    if (action === "reject" || action === "decline") {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, booth_id: null, booth_status: "none" } : a))
      );
      showToast("Booth Request Declined", "Booth selection declined.", "info");
    } else {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, booth_status: "confirmed" } : a))
      );
      showToast("Booth Confirmed", "Booth assignment confirmed.", "success");
    }
  };

  const fetchSessionsForExpo = async (expoId) => {
    if (!expoId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/expos/${expoId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        if (data.sessions && Array.isArray(data.sessions)) {
          setSessions((prev) => {
            const filtered = prev.filter((s) => s.expo_id !== expoId && s.expo_id?._id !== expoId);
            return [...filtered, ...data.sessions];
          });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch sessions for expo ${expoId} from DB:`, e);
    }
  };

  const createSession = async (sessionData) => {
    const targetExpoId = sessionData.expo_id || sessionData.expoId;
    try {
      const token = authService.getToken();
      if (token && targetExpoId) {
        const response = await fetch(`${API_BASE_URL}/expos/${targetExpoId}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(sessionData)
        });
        const resData = await response.json();
        if (response.ok) {
          const createdSess = resData.session || resData;
          setSessions((prev) => [createdSess, ...prev]);
          showToast("Session Saved", `"${createdSess.title}" saved successfully.`, "success");
          fetchSessionsForExpo(targetExpoId);
          return createdSess;
        } else {
          showToast("Session Error", resData.message || "Failed to save session.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Error creating session via API:", e);
    }

    const newSession = {
      ...sessionData,
      _id: "sess_" + Date.now(),
      created_at: new Date().toISOString()
    };
    setSessions((prev) => [newSession, ...prev]);
    showToast("Session Created", `"${newSession.title}" added to schedule.`, "info");
    return newSession;
  };

  const updateSession = async (id, data) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await response.json();
        if (response.ok) {
          const updatedSess = resData.session || { _id: id, ...data };
          setSessions((prev) => prev.map((s) => (s._id === id ? { ...s, ...updatedSess } : s)));
          showToast("Session Updated", "Session updated successfully.", "success");
          return;
        }
      }
    } catch (e) {
      console.error("Error updating session via API:", e);
    }

    setSessions((prev) => prev.map((s) => (s._id === id ? { ...s, ...data } : s)));
    showToast("Session Updated", "Schedule details updated.", "info");
  };

  const deleteSession = async (id) => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          setSessions((prev) => prev.filter((s) => s._id !== id));
          showToast("Session Deleted", "Session removed successfully.", "info");
          return;
        }
      }
    } catch (e) {
      console.error("Error deleting session via API:", e);
    }

    setSessions((prev) => prev.filter((s) => s._id !== id));
    showToast("Session Deleted", "Programmed session removed.", "info");
  };

  const registerForExpo = async (expoId, badgeTier = "Standard Attendee Pass", extraData = {}) => {
    const expo = expos.find((e) => e._id === expoId || e.id === expoId);
    try {
      const token = authService.getToken();
      if (token && expoId) {
        const response = await fetch(`${API_BASE_URL}/registrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            expo_id: expoId,
            pass_tier: badgeTier,
            user_name: extraData.name || currentUser?.name,
            user_email: extraData.email || currentUser?.email,
            user_phone: extraData.phone || currentUser?.phone
          })
        });
        const data = await response.json();
        if (response.ok) {
          const regObj = data.registration || data;
          const formattedReg = {
            _id: regObj._id || "reg_" + Date.now(),
            user_id: currentUser?._id,
            user_name: extraData.name || currentUser?.name || "Attendee",
            user_email: extraData.email || currentUser?.email || "",
            expo_id: expoId,
            expo_title: expo?.title || "Exhibition",
            ticket_number: regObj.ticket_number || `EVT-${Math.floor(100000 + Math.random() * 900000)}`,
            pass_tier: badgeTier,
            registered_at: regObj.registered_at || new Date().toISOString()
          };
          setRegistrations((prev) => [formattedReg, ...prev.filter((r) => r._id !== formattedReg._id)]);
          showToast("Pass Reserved", `You are registered for "${expo?.title || "Exhibition"}".`, "success");
          fetchRegistrationsApi();
          return formattedReg;
        }
      }
    } catch (e) {
      console.error("Error registering for expo via API:", e);
    }

    const newReg = {
      _id: "reg_" + Date.now(),
      user_id: currentUser?._id,
      user_name: currentUser?.name || extraData.name || "Attendee",
      user_email: currentUser?.email || extraData.email || "",
      expo_id: expoId,
      expo_title: expo?.title || "Exhibition",
      ticket_number: `EVT-${Math.floor(100000 + Math.random() * 900000)}`,
      registered_at: new Date().toISOString(),
      pass_tier: badgeTier
    };
    setRegistrations((prev) => [newReg, ...prev]);
    showToast("Pass Reserved", `You are registered for "${expo?.title || "Exhibition"}".`, "success");
    return newReg;
  };

  const cancelRegistration = (regId) => {
    setRegistrations((prev) => prev.filter((r) => r._id !== regId));
    showToast("Registration Cancelled", "Your pass was released.", "info");
  };

  const fetchBookmarksApi = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/bookmarks/mine`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.bookmarks && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks);
          saveToStorage("bookmarks", data.bookmarks);
        }
      }
    } catch (e) {
      console.error("Failed to fetch bookmarks from DB:", e);
    }
  };

  const toggleBookmark = async (sessionId, expoId) => {
    if (!currentUser || currentUser.role === "public") {
      showToast("Authentication Required", "Please log in as an attendee to bookmark sessions.", "error");
      setActiveView("login");
      return;
    }

    const currentUserId = currentUser._id || currentUser.user_id;

    const existing = (bookmarks || []).find((b) => {
      const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
      const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
      return String(bSessId) === String(sessionId) && String(bUserId) === String(currentUserId);
    });

    let targetExpoId = expoId;
    if (!targetExpoId) {
      const sessObj = (sessions || []).find((s) => s._id === sessionId || s.id === sessionId);
      targetExpoId = sessObj?.expo_id?._id || sessObj?.expo_id;
    }

    if (!existing) {
      const hasPass = (registrations || []).some((r) => {
        const rExpoId = String(typeof r.expo_id === "object" ? r.expo_id?._id : r.expo_id || "");
        const rUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
        const rEmail = (r.user_email || r.email || "").toLowerCase();
        const uEmail = (currentUser?.email || "").toLowerCase();
        const matchExpo = targetExpoId ? rExpoId === String(targetExpoId) : true;
        const matchUser = (rUserId && rUserId === String(currentUserId)) || (uEmail && rEmail === uEmail);
        return matchExpo && matchUser;
      });

      if (!hasPass) {
        showToast(
          "Access Pass Required",
          "You can only bookmark sessions for summits where you hold an active verified Access Pass. Please claim your pass first!",
          "error"
        );
        return false;
      }
    }

    try {
      const token = authService.getToken();
      if (token) {
        if (existing) {
          const deleteId = existing._id || sessionId;
          const response = await fetch(`${API_BASE_URL}/bookmarks/${deleteId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            setBookmarks((prev) => {
              const updated = prev.filter((b) => {
                const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
                return b._id !== existing._id && String(bSessId) !== String(sessionId);
              });
              saveToStorage("bookmarks", updated);
              return updated;
            });
            showToast("Bookmark Removed", "Session unsaved from schedule.", "info");
            return;
          }
        } else {
          const response = await fetch(`${API_BASE_URL}/bookmarks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ session_id: sessionId })
          });
          const data = await response.json();
          if (response.ok) {
            const newBm = data.bookmark || {
              _id: "bm_" + Date.now(),
              user_id: currentUserId,
              session_id: sessionId,
              expo_id: expoId,
              created_at: new Date().toISOString()
            };
            setBookmarks((prev) => {
              const updated = [...prev, newBm];
              saveToStorage("bookmarks", updated);
              return updated;
            });
            showToast("Session Bookmarked", "Added to your personal schedule.", "success");
            return;
          } else {
            showToast("Bookmark Error", data.message || "Failed to bookmark session.", "error");
            return;
          }
        }
      }
    } catch (e) {
      console.error("Error toggling bookmark via API:", e);
    }

    if (existing) {
      setBookmarks((prev) => {
        const updated = prev.filter((b) => b._id !== existing._id);
        saveToStorage("bookmarks", updated);
        return updated;
      });
      showToast("Bookmark Removed", "Session unsaved.", "info");
    } else {
      const newBm = {
        _id: "bm_" + Date.now(),
        user_id: currentUserId,
        session_id: sessionId,
        expo_id: expoId,
        created_at: new Date().toISOString()
      };
      setBookmarks((prev) => {
        const updated = [...prev, newBm];
        saveToStorage("bookmarks", updated);
        return updated;
      });
      showToast("Session Bookmarked", "Added to your personal schedule.", "success");
    }
  };

  const updateShowcase = (exhibitorId, data) => {
    setShowcase((prev) => {
      const idx = prev.findIndex((s) => s.exhibitor_id === exhibitorId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...data };
        return updated;
      }
      return [{ exhibitor_id: exhibitorId, ...data }, ...prev];
    });
    showToast("Showcase Updated", "Digital booth profile saved.", "success");
  };

  const fetchInboxApi = async () => {
    try {
      const token = authService.getToken();
      if (!token) return [];
      const response = await fetch(`${API_BASE_URL}/messages/inbox`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-current-role": currentRole || currentUser?.role || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data.inbox || [];
      }
      return [];
    } catch (e) {
      console.error("Failed to fetch inbox:", e);
      return [];
    }
  };

  const fetchThreadApi = async (partnerId) => {
    try {
      const token = authService.getToken();
      if (!token || !partnerId) return [];
      const response = await fetch(`${API_BASE_URL}/messages/thread/${partnerId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.thread || [];
      }
      return [];
    } catch (e) {
      console.error(`Failed to fetch thread with ${partnerId}:`, e);
      return [];
    }
  };

  const sendMessageApi = async (receiverId, content) => {
    try {
      const token = authService.getToken();
      if (token && receiverId && content) {
        const response = await fetch(`${API_BASE_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ receiver_id: receiverId, content })
        });
        const data = await response.json();
        if (response.ok) {
          showToast("Message Sent", "Your message was delivered.", "success");
          return data.data;
        } else {
          showToast("Message Error", data.message || "Failed to send message.", "error");
          return null;
        }
      }
    } catch (e) {
      console.error("Failed to send message via API:", e);
      showToast("Message Error", "Failed to send message.", "error");
      return null;
    }
  };

  const deleteThreadApi = async (partnerId) => {
    try {
      const token = authService.getToken();
      if (token && partnerId) {
        const response = await fetch(`${API_BASE_URL}/messages/thread/${partnerId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          showToast("Conversation Deleted", "The chat thread has been removed.", "info");
          return true;
        } else {
          showToast("Delete Error", data.message || "Could not delete conversation.", "error");
          return false;
        }
      }
    } catch (e) {
      console.error("Failed to delete thread via API:", e);
      return false;
    }
  };

  const fetchMessagingContactsApi = async () => {
    try {
      const token = authService.getToken();
      if (!token) return [];
      const response = await fetch(`${API_BASE_URL}/messages/contacts`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-current-role": currentRole || currentUser?.role || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data.contacts || [];
      }
      return [];
    } catch (e) {
      console.error("Failed to fetch messaging contacts:", e);
      return [];
    }
  };

  const sendMessage = (receiverId, receiverName, content, expoId = "") => {
    sendMessageApi(receiverId, content);
  };

  const fetchFeedbackList = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.feedback && Array.isArray(data.feedback)) {
          setFeedbackList(data.feedback);
        }
      }
    } catch (e) {
      console.error("Failed to fetch feedback list:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const fetchRegistrationsApi = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const endpoint = currentRole === 'organizer' ? `${API_BASE_URL}/registrations` : `${API_BASE_URL}/registrations/mine`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.registrations && Array.isArray(data.registrations)) {
          const formatted = data.registrations.map((r) => ({
            _id: r._id,
            user_id: typeof r.user_id === 'object' ? r.user_id?._id : r.user_id,
            user_name: typeof r.user_id === 'object' ? r.user_id?.name : r.user_name || currentUser?.name || "Attendee",
            user_email: typeof r.user_id === 'object' ? r.user_id?.email : r.user_email || currentUser?.email || "",
            expo_id: typeof r.expo_id === 'object' ? r.expo_id?._id : r.expo_id,
            expo_title: typeof r.expo_id === 'object' ? r.expo_id?.title : "Exhibition",
            session_id: typeof r.session_id === 'object' ? r.session_id?._id : r.session_id,
            ticket_number: r.ticket_number || (r._id ? String(r._id).slice(-8).toUpperCase() : "PASS-9901"),
            pass_tier: r.pass_tier || "Standard Attendee Pass",
            registered_at: r.registered_at
          }));
          setRegistrations(formatted);
          saveToStorage("registrations", formatted);
        }
      }
    } catch (e) {
      console.error("Failed to fetch registrations:", e);
    }
  };

  useEffect(() => {
    fetchExpos();
    if (currentRole === "organizer" || currentRole === "exhibitor") {
      fetchApplications();
    }
    fetchFeedbackList();
    fetchNotifications();
    if (currentRole === "attendee" || currentRole === "organizer") {
      fetchRegistrationsApi();
    }
    if (currentRole === "attendee") {
      fetchBookmarksApi();
    }
  }, [currentUser, currentRole]);

  const markMessageRead = (msgId) => {
    setMessages((prev) => prev.map((m) => (m._id === msgId ? { ...m, read: true } : m)));
  };

  const submitFeedback = async (fbData) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify(fbData)
      });
      if (response.ok) {
        const data = await response.json();
        showToast("Inquiry Received", "Your message was sent to the event specialist successfully.", "success");
        if (token) {
          fetchFeedbackList();
        }
        return data.feedback || data.data || data;
      } else {
        const errData = await response.json().catch(() => ({}));
        showToast("Submission Note", errData.message || "Could not submit inquiry.", "error");
        return null;
      }
    } catch (e) {
      console.error("Failed to submit feedback:", e);
    }

    const newFb = {
      ...fbData,
      _id: "fb_" + Date.now(),
      user_id: currentUser?._id || null,
      user_name: currentUser?.name || fbData.name || "Guest",
      user_role: currentRole || "public",
      status: "open",
      created_at: new Date().toISOString()
    };
    setFeedbackList((prev) => [newFb, ...prev]);
    showToast("Inquiry Received", "Your message was recorded.", "success");
    return newFb;
  };

  const resolveFeedback = async (id, responseText = "") => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/feedback/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "resolved", response: responseText, replyText: responseText })
      });
      if (response.ok) {
        showToast("Feedback Resolved", "Response sent & status marked resolved.", "info");
        fetchFeedbackList();
        return;
      }
    } catch (e) {
      console.error("Failed to resolve feedback:", e);
    }

    setFeedbackList((prev) =>
      prev.map((f) => (f._id === id ? { ...f, status: "resolved", response: responseText } : f))
    );
    showToast("Feedback Resolved", "Response sent & status marked resolved.", "info");
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/notifications/read-all`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("Notifications Cleared", "All alerts marked as read.", "info");
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = authService.getToken();
      if (token && id) {
        await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error(`Failed to mark notification ${id} as read:`, e);
    }
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const resetAllData = () => {
    localStorage.clear();
    setExpos(INITIAL_EXPOS);
    setBooths(INITIAL_BOOTHS);
    setApplications(INITIAL_APPLICATIONS);
    setSessions(INITIAL_SESSIONS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setBookmarks(INITIAL_BOOKMARKS);
    setShowcase(INITIAL_SHOWCASE);
    setMessages(INITIAL_MESSAGES);
    setFeedbackList(INITIAL_FEEDBACK);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentRoleState("organizer");
    setActiveView("dashboard");
    showToast("System Reset", "Restored clean default state.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedExpoId,
        setSelectedExpoId,
        users,
        setUsers,
        expos,
        setExpos,
        fetchExpos,
        fetchExpoAnalyticsApi,
        createExpo,
        updateExpo,
        deleteExpo,
        uploadExpoBanner,
        booths,
        setBooths,
        fetchBoothsForExpo,
        addBooth,
        updateBooth,
        deleteBooth,
        updateMyBoothDetails,
        uploadBoothProductImage,
        applications,
        setApplications,
        applyForExpo,
        submitApplication: applyForExpo,
        updateApplicationStatus,
        approveApplication,
        rejectApplication,
        selectBoothForApplication,
        confirmBoothAssignment,
        fetchApplications,
        sessions,
        setSessions,
        fetchSessionsForExpo,
        createSession,
        updateSession,
        deleteSession,
        registrations,
        setRegistrations,
        fetchRegistrationsApi,
        registerForExpo,
        cancelRegistration,
        bookmarks,
        setBookmarks,
        fetchBookmarksApi,
        toggleBookmark,
        showcase,
        showcases: showcase || [],
        setShowcase,
        updateShowcase,
        messages,
        setMessages,
        sendMessage,
        fetchInboxApi,
        fetchThreadApi,
        sendMessageApi,
        deleteThreadApi,
        fetchMessagingContactsApi,
        markMessageRead,
        feedbackList,
        setFeedbackList,
        fetchFeedbackList,
        submitFeedback,
        resolveFeedback,
        notifications,
        setNotifications,
        fetchNotifications,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markAllNotificationsRead: markAllNotificationsAsRead,
        markNotificationRead: markNotificationAsRead,
        toasts,
        showToast,
        removeToast,
        loginAs,
        logout,
        updateUserProfile,
        updateCompanyProfile,
        changePassword,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppContextProvider = AppProvider;

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
