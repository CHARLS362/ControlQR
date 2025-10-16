# **App Name**: QRAttendance

## Core Features:

- QR Code Generation: Generate unique QR codes for each student/employee containing encrypted ID.
- Course/Event Management: Allow administrators to create, edit, and delete courses/events.
- Student/Participant Management: Register new students manually or via bulk upload (Excel/CSV).
- Attendance Scanning: Scan QR codes (using camera or ZKTeco ZKB207) to automatically record attendance, with visual/sound notification on success and prevention of multiple registrations.
- Attendance Reporting: Generate and export attendance reports by course and date in PDF or Excel format, including attendance statistics.
- Admin Authentication: Secure access to admin functions using login validation from the database.
- Reasoning tool: This is a tool for helping an administrator remove any incorrect check-in records. It asks an LLM for whether the information present justifies deleting the check in event.

## Style Guidelines:

- Primary color: Deep Indigo Blue (#1E3A8A) - A deeper, more elegant tone that reinforces trust, ideal for headers and main bars.
- Secondary color: Vibrant Blue (#3B82F6) - Complements the primary for buttons, active icons, and interactive links.
- Accent color: Warm Amber (#F59E0B) - A more balanced orange, less aggressive than #D97706, but equally energetic. Ideal for CTA (Call To Action) buttons.
- Background color: Very light gray (#F9FAFB) - A very soft white-gray that maintains cleanliness and modernity without dazzling.
- Surface / Cards: White (#FFFFFF) - For panels, forms, and main containers. Adds depth on the background.
- Text (Primary): Charcoal Gray (#1F2937) - High contrast on light backgrounds, softer than pure black.
- Text (Secondary): Cool Gray (#6B7280) - For subtitles, labels, or descriptions.
- Success / Confirmation: Emerald Green (#10B981) - Indicates successful actions or confirmations.
- Error / Alert: Soft Red (#EF4444) - For warnings or errors, without being visually aggressive.
- Font Family: `Inter`, sans-serif
- Headlines (H1–H3): Bold or SemiBold, 1.4–2.2rem.
- Body Text: Regular weight, 1rem–1.1rem, line-height 1.6.
- Buttons & Labels: Uppercase or medium weight for emphasis.
- Use a consistent icon set such as **Lucide**, **Feather**, or **Material Symbols Rounded**.
- Keep icons line-based with 1.5–2px stroke for visual balance.
- Color icons using Secondary Blue (#3B82F6) or Gray (#6B7280) depending on context.
- Structure: Grid or card-based dashboard for clarity.
- Navigation: Top bar in Primary Blue (#1E3A8A) with active items in Accent Amber (#F59E0B).
- Cards/Sections: Rounded corners (`border-radius: 1rem`) and subtle shadows (`box-shadow: 0 4px 10px rgba(0,0,0,0.05)`).
- Spacing: Use generous padding (`1.5rem–2rem`) for breathable design.
- Hover: Soft scale-up or background fade (0.2–0.3s).
- Button Clicks: Ripple or color-darken animation for feedback.
- Notifications: Fade-in/out transitions for system messages.