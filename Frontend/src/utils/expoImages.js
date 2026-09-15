
export const EXPO_IMAGE_PRESETS = [
  {
    category: "technology",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    title: "Global Tech Innovation Summit",
    location: "Moscone Center, San Francisco"
  },
  {
    category: "ai",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    title: "World AI & Robotics Convention",
    location: "Tokyo Big Sight, Tokyo"
  },
  {
    category: "cybersecurity",
    url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=1200&q=80",
    title: "Cyber Shield Global Forum",
    location: "ExCeL London, United Kingdom"
  },
  {
    category: "cleanenergy",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    title: "EcoSmart & CleanTech World Expo",
    location: "Messe Frankfurt, Germany"
  },
  {
    category: "healthcare",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    title: "BioHealth & MedTech Expo",
    location: "Marina Bay Sands, Singapore"
  },
  {
    category: "trade",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    title: "International Trade & Commerce Expo",
    location: "Dubai World Trade Centre, UAE"
  }
];

export const getExpoImage = (expo, index = 0) => {
  if (!expo) return EXPO_IMAGE_PRESETS[index % EXPO_IMAGE_PRESETS.length].url;

  const rawImage = expo.banner_image || expo.image_url;
  if (rawImage && typeof rawImage === "string") {
    if (rawImage.startsWith("http") || rawImage.startsWith("data:") || rawImage.startsWith("blob:")) {
      return rawImage;
    }
    return `http://localhost:5000${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
  }

  const text = `${expo.title || ""} ${expo.category || ""} ${expo.theme || ""}`.toLowerCase();

  if (text.includes("ai") || text.includes("robot") || text.includes("intelligence") || text.includes("machine")) {
    return EXPO_IMAGE_PRESETS[1].url;
  }
  if (text.includes("cyber") || text.includes("security") || text.includes("shield") || text.includes("cloud")) {
    return EXPO_IMAGE_PRESETS[2].url;
  }
  if (text.includes("eco") || text.includes("green") || text.includes("energy") || text.includes("climate") || text.includes("solar")) {
    return EXPO_IMAGE_PRESETS[3].url;
  }
  if (text.includes("bio") || text.includes("health") || text.includes("med") || text.includes("pharma")) {
    return EXPO_IMAGE_PRESETS[4].url;
  }
  if (text.includes("trade") || text.includes("commerce") || text.includes("retail") || text.includes("business")) {
    return EXPO_IMAGE_PRESETS[5].url;
  }

  return EXPO_IMAGE_PRESETS[index % EXPO_IMAGE_PRESETS.length].url;
};
