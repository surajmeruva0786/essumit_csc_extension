Design a production-ready Chrome Extension side panel UI called "CSC Sahayak" — 
an AI-powered government form assistant for CSC (Common Service Centre) operators 
in India. This is a GovTech product used in rural districts like Rajnandgaon, 
Chhattisgarh.

---

## DESIGN IDENTITY

The aesthetic direction is: "Institutional Precision meets Accessible Warmth" — 
think India's national identity fused with a modern fintech app. NOT a generic 
chatbot. NOT a playful startup app. This is a trusted government-grade tool that 
must inspire confidence in a semi-literate rural operator handling 80+ applications 
per day.

Visual references to draw from:
- The gravitas of Aadhaar / UIDAI branding (navy blues, structured layouts)
- The warmth of India's saffron-green tricolor palette
- The precision of IRCTC / DigiLocker's clean institutional UI
- The chat flow of WhatsApp (familiar to operators)
- Ashoka Chakra geometry as a subtle motif — circular elements, 24-spoke patterns 
  used as decorative accents or loader animations

---

## PANEL DIMENSIONS

Width: 400px (fixed Chrome extension side panel)
Height: 100vh (full browser height, scrollable center)
Layout: Fixed header (56px) + scrollable chat body + fixed input bar (64px)

---

## COLOR SYSTEM

Primary Saffron:       #E8701A  (buttons, header gradient, active states)
Deep Saffron:          #C45E10  (hover states, pressed)
Saffron Light:         #FFF0E0  (backgrounds, tinted cards)
Saffron Gradient:      linear-gradient(135deg, #FF9933 0%, #E8701A 100%)

Government Green:      #1A7A38  (success, confirmed states, checkboxes)
Deep Green:            #0F5526  (hover on green elements)
Green Light:           #E6F5EC  (success backgrounds)
Green Gradient:        linear-gradient(135deg, #2E9E50 0%, #1A7A38 100%)

Navy Anchor:           #1C2B4A  (header text, primary labels)
Slate Text:            #3D4F6B  (body text)
Muted Text:            #7A8BA3  (secondary, timestamps, hints)

Background:            #EEF1F7  (chat area background)
Surface White:         #FFFFFF  (cards, bubbles)
Border:                #D8DDE8  (subtle dividers)

Risk Red:              #D93025  (rejection warnings)
Risk Amber:            #E8A020  (medium risk, warnings)
Risk Green:            #1A7A38  (approved, low risk)

---

## TYPOGRAPHY

Header / Display: "Baloo 2" (Google Fonts) — has built-in Devanagari support 
  — warm, institutional, distinctly Indian character
Body: "Noto Sans" with "Noto Sans Devanagari" fallback — for legibility of 
  Hindi at small sizes
Monospace (confidence scores): "Roboto Mono" — for extracted data values

Sizing:
  - Header title: 17px Bold
  - Card title (Hindi): 15px SemiBold  
  - Card title (English): 13px Regular, Muted
  - Body: 14px Regular
  - Small / meta: 11px Regular
  - Confidence numbers: 13px Mono

---

## SCREENS TO DESIGN (design all as separate frames, vertically stacked)

### SCREEN 1 — Welcome / Landing
State: No form detected, extension just opened.

Layout:
- Header: Saffron gradient | Ashoka Chakra-inspired circular icon (navy bg, 
  white 🏛️ emoji center) | "CSC सहायक" title | "ऑनलाइन" green pill badge
- Body: Centered card with subtle paper texture overlay (5% noise)
  - India map silhouette watermark (very faint, 4% opacity) in card background
  - "नमस्ते! / Welcome" greeting
  - Two stacked CTA buttons:
    1. PRIMARY: Full-width Green gradient button — "📝 नया आवेदन शुरू करें / Start Applying" — height 52px, border-radius 12px, Baloo 2 font
    2. SECONDARY: White card with saffron left-border (4px) and saffron icon — "🤖 AI सहायक / AI Assistant" — same size, outlined style
  - Version tag at bottom: "v1.0 | CHIPS Chhattisgarh" in muted tiny text

---

### SCREEN 2 — Citizen Details Entry
State: Start Applying was clicked. First chatbot message appears.

Layout:
- Bot message bubble (left-aligned):
  - Avatar: Small circular saffron background with 🏛️ emoji
  - Bubble: White, 12px radius (flat top-left), faint drop shadow
  - Content: "नागरिक का विवरण दें" (bold, 15px) / "Enter citizen details" (muted 13px)
- Below bot bubble: Inline form card (NOT a separate bubble — embedded widget):
  - Title row with small Indian flag 🇮🇳 icon
  - Input 1: "👤 नागरिक का नाम / Citizen Name" — rounded input, saffron focus ring
  - Input 2: "📱 मोबाइल नंबर / Mobile Number" — with +91 prefix badge inside field
  - Continue button: Full-width saffron gradient, "आगे बढ़ें →" 
- Input bar at bottom: HIDDEN (replaced by inline form widget)

---

### SCREEN 3 — Service Selection
State: After citizen info submitted. Service picker appears as bot message.

Layout:
- User message bubble (right-aligned): Shows entered name + phone in green bubble
- Bot message: "कौन सी सेवा चाहिए? / Which service is needed?"
- Below: 2-column service grid (embedded in chat):
  Each card (145px wide, white, 12px radius, thin border):
    - Top: Large emoji (32px)
    - Middle: Hindi name (14px SemiBold Navy)
    - Bottom: English name (11px Muted)
    - Selected state: Green border (2px), green tinted background, 
      green checkmark badge (top-right corner)
    - Hover: Saffron tinted background
  
  Services grid (2 columns × 5 rows):
  🎂 जन्म प्रमाण पत्र / Birth Certificate
  ☠️ मृत्यु प्रमाण पत्र / Death Certificate
  🏠 मूल निवास / Domicile Certificate
  💰 आय प्रमाण पत्र / Income Certificate
  🪪 जाति प्रमाण पत्र / Caste Certificate
  👴 वृद्धावस्था पेंशन / Old Age Pension
  👩 विधवा पेंशन / Widow Pension
  🌾 किसान पंजीयन / Kisan Registration
  🔧 राशन कार्ड / Ration Card
  📋 अन्य / Other

---

### SCREEN 4 — Document Checklist
State: Service selected. Document checklist appears.

Layout:
- User bubble: Shows selected service name
- Bot bubble: "इन दस्तावेज़ों की ज़रूरत है / These documents are required"
- Large checklist card (full-width, white, 16px radius):
  Header bar: Saffron gradient | "📋 दस्तावेज़ सूची" | right-aligned pill "0/3 अनिवार्य"
  
  Each checklist row (60px min-height, bottom border):
    Left: Custom square checkbox (green when checked, saffron border unchecked)
    Center: Document name Hindi (14px Bold) + English desc (12px Muted)
           Mandatory docs: Red asterisk * after name
    Right: Upload button — paperclip icon "📎" in saffron pill shape
    
    UPLOADED STATE (sub-row):
      Thumbnail (40×40px, rounded) OR document icon
      File name + size (12px mono, muted)
      Green "✅ अपलोड हो गया" badge
  
  Footer:
    Progress bar: Full width, 6px height, green fill, gray track
    Progress text: "2 / 3 दस्तावेज़ अपलोड" (right-aligned muted)
    CTA: Full-width saffron button "✅ आगे बढ़ें / Continue →" 
         DISABLED state: flat gray, "सभी अनिवार्य दस्तावेज़ अपलोड करें"

---

### SCREEN 5 — AI Extraction in Progress
State: Continue clicked. AI is reading documents.

Layout:
- Bot bubble: "AI दस्तावेज़ पढ़ रहा है... / AI is reading documents"
- Extraction loader card (centered):
  - Top: Ashoka Chakra spinner — 24-spoke wheel animating (CSS rotation, 
    saffron spokes on white background, 48px)
  - Status text cycling through:
    "📄 जन्म पर्ची पढ़ रहा है..."
    "🔍 फ़ील्ड्स खोज रहा है..."
    "🧠 AI विश्लेषण कर रहा है..."
  - Skeleton loading bars below (3 bars: 65%, 80%, 45% width, 
    pulsing gray animation)

---

### SCREEN 6 — Extracted Data Review
State: Extraction complete. Fields displayed for operator review.

Layout:
- Bot bubble: "AI ने यह जानकारी निकाली / AI extracted this information"
- Data review card:
  Header: Navy gradient | "📊 निकाली गई जानकारी" | right-aligned: 
    "4 फ़ील्ड्स / 1 चेतावनी" amber pill
  
  Each field row (48px, bottom border):
    Left label: Hindi field name (13px, muted slate)
    Center: Editable input showing extracted value (14px, navy)
    Right: Confidence indicator
      HIGH (≥85%): Green circle + checkmark + "94%"
      MEDIUM (60-84%): Amber circle + "!" + "71%"
      LOW (<60%): Red circle + "⚠" + "45%"
      Each with a thin colored left-border on the row
  
  Fields to show:
    बच्चे का नाम / Child Name — Rahul Kumar — 94% GREEN
    पिता का नाम / Father Name — Suresh Kumar — 87% GREEN
    माँ का नाम / Mother Name — Priya Devi — 91% GREEN
    जन्म तिथि / Date of Birth — 12/03/2024 — 71% AMBER
    जन्म स्थान / Place of Birth — Rajnandgaon — 88% GREEN
    अस्पताल का नाम / Hospital — [Empty] — 0% RED
  
  Mismatch warning (if present):
    Orange alert box: ⚠️ "दस्तावेज़ों में अंतर मिला / Mismatch detected"
    Body: "पिता का नाम: जन्म पर्ची में 'Suresh Kumar', आधार में 'S. Kumar'"
    Button: "📋 सुधार फॉर्म पर जाएं / Go to Correction Form" — outlined amber
  
  Footer button: "🖊️ फॉर्म ऑटो-फिल करें / Auto-Fill Form →" — saffron gradient

---

### SCREEN 7 — AI Validation Result (HIGH RISK state)
State: AI has analyzed the application and flagged issues.

Layout:
- Bot bubble with special 🔴 red left border: "AI ने समस्याएं पाई / AI found issues"
- Risk assessment card:
  Header: Red gradient (subtle, not alarming) | "🔴 उच्च जोखिम / HIGH RISK" | 
    "82% अस्वीकृति संभावना / Rejection Probability"
  
  Risk meter: Horizontal bar 0–100%, filled to 82%, 
    gradient green→amber→red, marker at 82%
  
  Issues list:
    Each issue row (60px, left-colored border):
      CRITICAL (red border): "⛔ आवेदन 21 दिन बाद — विलंब शुल्क आवश्यक"
                              "Application after 21 days — late fee required"
                              Suggestion chip: "📎 Affidavit संलग्न करें"
      WARNING (amber border): "⚠️ अस्पताल का नाम खाली है"
                               "Hospital name is empty"
  
  Operator decision section:
    Divider with text: "आप क्या करना चाहते हैं? / What would you like to do?"
    Two equal buttons side by side:
      LEFT: White button, red border/text — "🚫 आवेदन रद्द करें / Cancel"
      RIGHT: Saffron gradient — "✅ फिर भी जमा करें / Submit Anyway"
    
    Small disclaimer below: "निर्णय आपका है — डेटा सुरक्षित है / Your decision — data is secure"

---

### SCREEN 8 — Submission Success
State: Application submitted.

Layout:
- Centered success animation frame:
  - Large green circle (80px) with white checkmark — Ashoka Chakra ring border
  - "🎉 आवेदन जमा हो गया!" (20px, Baloo 2, Green)
  - "Application Submitted Successfully" (14px, muted)
  - Reference ID pill: "REF: CG-BC-2024-78432" (mono font, navy background, 
    white text)
- SMS confirmation row:
  "📱 SMS भेजा गया: +91 98XXX XXXXX" — green pill
- Action links:
  "नया आवेदन / New Application" — saffron button
  "इतिहास देखें / View History" — text link

---

## COMPONENT NOTES

Progress Stepper (persistent inside chat body, sticky below header):
  ① नागरिक → ② सेवा → ③ दस्तावेज़ → ④ निकालें → ⑤ जांचें → ⑥ जमा करें
  Horizontal, 6 steps, saffron fill for completed, navy circle for active, 
  gray for upcoming. Use connecting lines between circles.

Empty/Error States:
  "📡 इंटरनेट नहीं / Offline Mode" — amber banner pinned below header
  Offline badge should replace "ऑनलाइन" with "ऑफलाइन" in amber color

---

## FIGMA STRUCTURE GUIDANCE

- Use Auto Layout everywhere (vertical for chat, horizontal for buttons/rows)
- Create components for: ChatBubble (bot/user variants), ServiceCard, 
  DocumentRow, FieldRow, RiskBadge, ConfidencePill, ActionButton (primary/secondary/danger)
- Use Variants for: Button (primary/secondary/disabled/danger), 
  FieldRow (high/medium/low/empty confidence), DocumentRow (unchecked/checked/uploaded)
- Apply 8px base grid throughout
- All text styles should be named: Header/Primary, Body/Hindi, Body/English, 
  Caption, Mono
- Color styles: Brand/Saffron, Brand/Green, Brand/Navy, Status/Success, 
  Status/Warning, Status/Error, Neutral/Background, Neutral/Surface

---

## FEEL & FINISH

The final design should feel like:
"What if UIDAI (Aadhaar) designed a WhatsApp chatbot — trusted, warm, 
impossibly clear, built for someone who has 30 seconds per screen."

Every screen must pass the "glance test" — the operator should understand 
what action to take within 2 seconds of seeing each screen.

Avoid: Drop shadows that are too heavy, colors that are too saturated, 
English-only labels, any Western SaaS aesthetic, generic blue color schemes.