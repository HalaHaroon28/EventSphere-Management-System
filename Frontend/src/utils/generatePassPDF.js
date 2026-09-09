import { jsPDF } from "jspdf";

export const generatePassPDF = (registration, expo) => {
  // Initialize PDF in wide landscape orientation (220mm x 100mm ticket format)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [220, 100]
  });

  const ticketNo = registration?.ticket_number || registration?._id?.slice(-8).toUpperCase() || "PASS-9901";
  const expoTitle = registration?.expo_title || expo?.title || "EventSphere International Expo";
  const userName = registration?.user_name || "Valued Attendee";
  const userEmail = registration?.user_email || "attendee@eventsphere.com";
  const userPhone = registration?.user_phone || registration?.phone || "N/A";
  const passTier = registration?.pass_tier || "Standard Attendee Pass";
  
  const venueStr = expo ? `${expo.venue || "Convention Center"}, ${expo.location || "Main City"}` : "Royal Pavilion Hall, Tech Center";
  const dateStr = expo?.date 
    ? new Date(expo.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Sep 20 - Sep 22, 2026";
  const priceStr = "FREE ENTRY";

  // 1. Main Slate Card Background (#0F172A)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 220, 100, "F");

  // Top Glowing Teal Accent Line
  doc.setFillColor(56, 178, 172); // #38B2AC
  doc.rect(0, 0, 220, 3, "F");

  // Outer Border Line
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.4);
  doc.rect(2, 2, 216, 96, "S");

  // 2. Left Main Section (Header & Branding)
  doc.setFillColor(30, 41, 59); // #1E293B
  doc.roundedRect(8, 8, 146, 16, 2, 2, "F");

  doc.setTextColor(56, 178, 172);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("EVENTSPHERE", 14, 18);

  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("GLOBAL EVENTS OS • OFFICIAL DIGITAL PASS", 54, 18);

  // Pass Tier Badge
  doc.setFillColor(20, 136, 166);
  doc.roundedRect(108, 11, 42, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(passTier.toUpperCase(), 111, 17.5);

  // 3. Expo Title & Venue Section
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  
  const splitTitle = doc.splitTextToSize(expoTitle, 140);
  doc.text(splitTitle[0], 10, 31);

  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Date: ${dateStr}`, 10, 37);
  doc.text(`Venue: ${venueStr}`, 10, 42);

  // 4. Passholder Details Grid
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(10, 47, 142, 45, 3, 3, "F");

  // Passholder Name
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text("PASSHOLDER NAME", 14, 53);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(userName.toUpperCase(), 14, 59);

  // Email & Phone
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Email: ${userEmail}`, 14, 66);
  doc.text(`Phone: ${userPhone}`, 14, 72);

  // Price & Gate info
  doc.setTextColor(56, 178, 172);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`TICKET PRICE: ${priceStr}`, 14, 80);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(7.5);
  doc.text(`ENTRY GATE: TURNSTILE GATE 1`, 14, 86);

  // 5. Vertical Perforated Dashed Line (Divider)
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(160, 4, 160, 96);
  doc.setLineDashPattern([], 0); // reset

  // 6. Right Ticket Stub (Turnstile & QR)
  doc.setFillColor(15, 23, 42);
  doc.rect(161, 4, 57, 92, "F");

  doc.setTextColor(56, 178, 172);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("TURNSTILE GATE STUB", 166, 12);

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(165, 15, 48, 7, 2, 2, "F");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(6.5);
  doc.text("SECURITY: VERIFIED GATE 1", 168, 20);

  // QR Code Graphic White Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(166, 26, 46, 46, 3, 3, "F");

  // Inner Simulated QR Blocks
  doc.setFillColor(15, 23, 42);
  doc.rect(170, 30, 12, 12, "F");
  doc.rect(196, 30, 12, 12, "F");
  doc.rect(170, 56, 12, 12, "F");

  doc.setFillColor(56, 178, 172);
  doc.rect(173, 33, 6, 6, "F");
  doc.rect(199, 33, 6, 6, "F");
  doc.rect(173, 59, 6, 6, "F");
  doc.rect(187, 44, 7, 7, "F");
  doc.rect(182, 37, 5, 5, "F");

  // Ticket Number below QR
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`#${ticketNo}`, 174, 69);

  // Barcode Lines
  doc.setFillColor(255, 255, 255);
  doc.rect(166, 75, 46, 10, "F");
  doc.setFillColor(15, 23, 42);
  // Barcode pattern
  const bars = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1, 2];
  let currentX = 168;
  bars.forEach((width, index) => {
    if (index % 2 === 0) {
      doc.rect(currentX, 76, width, 8, "F");
    }
    currentX += width + 1;
  });

  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("SCAN AT TURNSTILE ENTRANCE", 165, 91);

  // Save PDF
  const cleanFilename = `EventSphere_Pass_${ticketNo}.pdf`;
  doc.save(cleanFilename);
};
