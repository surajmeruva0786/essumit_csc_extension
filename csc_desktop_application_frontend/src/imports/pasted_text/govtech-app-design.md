Design a **production-ready GovTech web application UI** called **“CSC Sahayak”**.

This is an **AI-powered government form assistant platform** used by **CSC (Common Service Centre) operators in rural India** to process citizen service applications such as:

Birth Certificate
Death Certificate
Income Certificate
Caste Certificate
Residence Certificate
Marriage Registration
Pension Schemes

The system helps operators:

• upload citizen documents
• extract form data using AI
• validate eligibility
• autofill government portals
• submit applications
• monitor submission analytics

The design must feel like a **trusted government platform**, not a startup SaaS tool.

Target users: **CSC operators handling 70–90 applications per day in rural districts like Rajnandgaon, Chhattisgarh.**

---

# Design Direction

Design theme:

**Institutional Precision + Accessible Warmth**

Blend:

• Aadhaar / UIDAI style authority
• DigiLocker / IRCTC institutional clarity
• WhatsApp-like chat workflow
• Indian tricolor palette
• Ashoka Chakra geometric motifs

The UI should look like a **modern Indian government digital service portal**.

---

# Layout

Responsive desktop-first design.

Main layout structure:

Header (72px)
Left Sidebar Navigation (260px)
Main Workspace
Right AI Assistant Panel (optional collapsible)

Grid system:

12 column grid
8px spacing base

---

# Color System

Primary saffron

#E8701A

Hover saffron

#C45E10

Light saffron

#FFF0E0

Government green

#1A7A38

Green light

#E6F5EC

Navy anchor

#1C2B4A

Body text

#3D4F6B

Muted text

#7A8BA3

Background

#EEF1F7

Card surface

#FFFFFF

Border

#D8DDE8

Risk colors

Red #D93025
Amber #E8A020
Green #1A7A38

Gradients

Saffron gradient

linear-gradient(135deg,#FF9933,#E8701A)

Green gradient

linear-gradient(135deg,#2E9E50,#1A7A38)

---

# Typography

Headers

Baloo 2

Body

Noto Sans + Noto Sans Devanagari

Monospace values

Roboto Mono

Sizes

Page titles

24px bold

Section titles

18px semibold

Card titles Hindi

15px semibold

English subtitles

13px muted

Body

14px

Meta

11px

Confidence score

13px mono

---

# Pages to Design

Create separate frames for each page.

---

# Page 1 — Login Screen

Government-style login portal.

Left panel

Illustration of CSC operator assisting citizen

Right panel login card

Title

CSC सहायक

Fields

Operator ID
Password

Button

लॉगिन करें / Login

Footer

Powered by CHIPS Chhattisgarh

---

# Page 2 — Dashboard

Operator overview screen.

Top statistics cards

Applications Today
Applications Submitted
Acceptance Rate
AI Warnings

Charts

Applications over time
Top services used
Rejection reasons

Recent activity table

Citizen Name
Service Type
Status
Submitted Time

---

# Page 3 — New Application Workspace

Main application workflow page.

Three-column layout

Left

Citizen information panel

Center

Application workflow

Right

AI assistant panel

Citizen panel fields

Citizen Name
Phone Number
Address

Service selection grid

Birth Certificate
Death Certificate
Income Certificate
Caste Certificate
Residence Certificate
Marriage Registration

Cards with emoji icons.

Selected card highlighted with green border.

---

# Page 4 — Document Upload

Checklist interface.

Header

📋 Required Documents

Document rows

Checkbox
Document name
Upload button

Uploaded state

Thumbnail preview
File name
Green uploaded badge

Progress bar

Upload progress

Button

Continue

---

# Page 5 — AI Extraction

Loader screen.

Ashoka Chakra animated spinner.

Status text rotation

Reading document
Extracting fields
Analyzing data

Skeleton loading fields.

---

# Page 6 — Extracted Data Review

Editable data table.

Columns

Field Name
Extracted Value
Confidence Score

Confidence styles

Green high confidence
Amber medium
Red low

Mismatch warning card.

Button

Go to Correction Form

Primary action

Auto-fill form

---

# Page 7 — AI Validation Result

Risk analysis screen.

Risk card

High Risk / Medium Risk / Low Risk

Probability meter

0–100%

Issues list

Missing document
Income mismatch
Eligibility failure

Buttons

Cancel application
Submit anyway

---

# Page 8 — Submission Success

Success confirmation page.

Large green check icon.

Message

Application submitted successfully.

Reference ID card.

Buttons

Start new application
View submission history

---

# Additional Page — History

Table view of all submissions.

Columns

Citizen Name
Service
Submission Date
Status
AI Risk Score

Filters

Service type
Status
Date range

---

# Components

Create reusable components

Buttons (primary secondary danger)
Service cards
Document upload rows
Data review rows
Confidence indicators
Risk badges
Chat bubbles

Use variants for states.

---

# Special Design Motifs

Use subtle **Ashoka Chakra inspired circular geometry** in:

Loaders
Icons
Decorative backgrounds

Include **Hindi + English labels everywhere**.

---

# UX Principle

The operator should be able to complete an application **within 60 seconds per screen**.

The UI must pass the **2-second glance test**:

Users should instantly understand what action is required.

Avoid:

• playful startup aesthetics
• overly bright colors
• generic SaaS dashboards
