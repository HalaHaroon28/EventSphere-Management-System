/**
 * Generates and downloads a high-resolution vertical conference lanyard pass as a PNG image.
 * Styled to match official event badges with lanyard slot, deep purple gradient, title hierarchy,
 * clean QR code, and bottom participant banner.
 */
export const generatePassImage = (registration, expo) => {
  const width = 600;
  const height = 900;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const ticketNo = registration?.ticket_number || registration?._id?.slice(-8).toUpperCase() || "PASS-9901";
  const expoTitle = registration?.expo_title || expo?.title || "EventSphere Summit 2026";
  const userName = registration?.user_name || "Valued Attendee";
  const userEmail = registration?.user_email || "attendee@eventsphere.com";
  const userPhone = registration?.user_phone || registration?.phone || "";
  const passTier = (registration?.pass_tier || "PARTICIPANT").toUpperCase();

  const dateStr = expo?.date 
    ? new Date(expo.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "20 Sep - 22 Sep 2026";

  // 1. Deep Purple to Navy Tech Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0F0C20");
  gradient.addColorStop(0.4, "#1D1035");
  gradient.addColorStop(0.8, "#0B192E");
  gradient.addColorStop(1, "#070E1B");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative Glowing Radial Orbs (Background Tech Waves)
  const orb1 = ctx.createRadialGradient(150, 200, 10, 150, 200, 300);
  orb1.addColorStop(0, "rgba(56, 178, 172, 0.18)");
  orb1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, width, height);

  const orb2 = ctx.createRadialGradient(450, 550, 10, 450, 550, 250);
  orb2.addColorStop(0, "rgba(147, 51, 234, 0.2)");
  orb2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, width, height);

  // Subtle Wave lines
  ctx.strokeStyle = "rgba(56, 178, 172, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(300, 450, 280, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(300, 450, 340, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Top Lanyard Acrylic Bar & Hole Slot
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(0, 0, width, 55);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.lineTo(width, 55);
  ctx.stroke();

  // Lanyard Punch Hole (Centered Oval Slot)
  ctx.fillStyle = "#090614";
  ctx.beginPath();
  ctx.roundRect(240, 18, 120, 18, 9);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.stroke();

  // 3. Brand Logo (9-Dot Matrix + EVENTSPHERE)
  const dotX = 275;
  const dotY = 95;
  ctx.fillStyle = "#38B2AC";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(dotX + c * 10, dotY + r * 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 13px 'Inter', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("EVENTSPHERE", width / 2, 142);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "600 9px 'Inter', monospace";
  ctx.fillText("GLOBAL EVENTS OS", width / 2, 155);

  // 4. Conference / Event Header Text
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "800 12px 'Inter', sans-serif";
  ctx.fillText((expo?.category || "GLOBAL EXHIBITION").toUpperCase(), width / 2, 195);

  // Split Expo Title into Main & Highlight
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 24px 'Inter', sans-serif";
  
  const words = expoTitle.split(" ");
  let line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  let line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
  if (!line2) {
    line1 = expoTitle;
    line2 = "CONFERENCE 2026";
  }

  ctx.fillText(line1.toUpperCase(), width / 2, 230);

  // Highlight line in cyan
  ctx.fillStyle = "#00D2FF";
  ctx.font = "900 26px 'Inter', sans-serif";
  ctx.fillText(line2.toUpperCase(), width / 2, 265);

  // Date Pill Badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(190, 285, 220, 26, 13);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 210, 255, 0.4)";
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 11px 'Inter', monospace";
  ctx.fillText(dateStr, width / 2, 302);

  // 5. Passholder Information
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "600 12px 'Inter', sans-serif";
  ctx.fillText("Passholder", width / 2, 355);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 28px 'Inter', sans-serif";
  ctx.fillText(userName, width / 2, 392);

  if (userEmail) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "500 12px 'Inter', monospace";
    ctx.fillText(userEmail, width / 2, 415);
  }

  // 6. High-Contrast Vector QR Code Matrix
  const qrX = 210;
  const qrY = 445;
  const qrSize = 180;

  // White QR Card Container
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrSize, qrSize, 16);
  ctx.fill();

  // Draw crisp QR Code Matrix blocks inside
  ctx.fillStyle = "#0F172A";
  
  // Outer finder patterns (top-left, top-right, bottom-left)
  ctx.fillRect(qrX + 15, qrY + 15, 42, 42);
  ctx.fillRect(qrX + qrSize - 57, qrY + 15, 42, 42);
  ctx.fillRect(qrX + 15, qrY + qrSize - 57, 42, 42);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(qrX + 22, qrY + 22, 28, 28);
  ctx.fillRect(qrX + qrSize - 50, qrY + 22, 28, 28);
  ctx.fillRect(qrX + 22, qrY + qrSize - 50, 28, 28);

  ctx.fillStyle = "#0F172A";
  ctx.fillRect(qrX + 29, qrY + 29, 14, 14);
  ctx.fillRect(qrX + qrSize - 43, qrY + 29, 14, 14);
  ctx.fillRect(qrX + 29, qrY + qrSize - 43, 14, 14);

  // Random data modules to simulate real QR
  const seed = ticketNo.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      // Skip finder zones
      if ((row < 4 && col < 4) || (row < 4 && col > 7) || (row > 7 && col < 4)) continue;
      if ((row * 12 + col + seed) % 3 === 0 || (row + col * 2) % 5 === 0) {
        ctx.fillRect(qrX + 20 + col * 12, qrY + 20 + row * 12, 10, 10);
      }
    }
  }

  // Ticket No Below QR
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "800 13px 'Inter', monospace";
  ctx.fillText(`#${ticketNo}`, width / 2, 652);

  // Venue location info
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "500 11px 'Inter', sans-serif";
  ctx.fillText(expo?.venue || "Main Convention Center", width / 2, 675);

  // 7. Solid White Bottom Participant Banner
  const bannerY = 780;
  const bannerHeight = 120;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, bannerY, width, bannerHeight);

  // Big Bold Black Participant Text
  ctx.fillStyle = "#0A0A0A";
  ctx.font = "900 36px 'Inter', sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText(passTier.toUpperCase(), width / 2, bannerY + 70);

  // Trigger browser download as PNG
  const cleanFilename = `EventSphere_Badge_${ticketNo}.png`;
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = cleanFilename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
