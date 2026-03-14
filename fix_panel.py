#!/usr/bin/env python3
"""Surgically patch handleOfflineSync in panel.js using byte-level replacement."""
import os

with open('panel.js', 'rb') as f:
    data = f.read()

# Find the section to replace by searching for the unique bad logic
old_fragment = b'if (!data.success || !data.applications || data.applications.length === 0)'
new_fragment_start_marker = b"const data = await res.json();"
new_section = b"""const data = await res.json();
        
        // API returns { status: 'success', data: {...} } or { status: 'empty' }
        if (data.status !== 'success' || !data.data) {
          addBotMessage(
            "\\u26a0\\ufe0f \\u0915\\u094b\\u0908 \\u0928\\u092f\\u093e \\u0938\\u093f\\u0902\\u0915 \\u0921\\u0947\\u091f\\u093e \\u0928\\u0939\\u0940\\u0902 \\u092e\\u093f\\u0932\\u093e\\u0964 \\u0915\\u0943\\u092a\\u092f\\u093e \\u0921\\u0947\\u0938\\u094d\\u0915\\u091f\\u0949\\u092a \\u090f\\u092a \\u092e\\u0947\\u0902 '\\u0938\\u093f\\u0902\\u0915' \\u092c\\u091f\\u0928 \\u0926\\u092c\\u093e\\u090f\\u0902\\u0964",
            "No new sync data found. Please press 'Sync' in the desktop app.",
            { error: true }
          );
          setTimeout(showLandingCard, 3000);
          return;
        }

        const appData = data.data;
        const fieldsJson = JSON.parse(appData.data_json || appData.fields_json || "[]");
        
        addBotMessage(
          `\\u2705 1 \\u0906\\u0935\\u0947\\u0926\\u0928 \\u0938\\u093f\\u0902\\u0915 \\u0915\\u093f\\u092f\\u093e \\u0917\\u092f\\u093e (${escapeHTML(appData.name || appData.citizen_name || '')}).\\n\\u0921\\u0947\\u091f\\u093e \\u092b\\u0949\\u0930\\u094d\\u092e \\u092e\\u0947\\u0902 \\u092d\\u0930\\u093e \\u091c\\u093e \\u0930\\u0939\\u093e \\u0939\\u0948...`,
          `1 application synced (${escapeHTML(appData.name || appData.citizen_name || '')}).\\nFilling form data...`
        );

        // Send raw fields to content script - content.js handles the deep fuzzy mapping
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "FILL_FORM_DESKTOP",
                data: fieldsJson
              });
            }
          });
        }

        // Clear staged data on backend
        await fetch('http://127.0.0.1:5000/api/sync/clear', { method: 'POST' });

        setTimeout(showLandingCard, 3000);"""

# Find and replace the old fragment
old_idx = data.find(old_fragment)
if old_idx == -1:
    print("ERROR: Could not find the old check logic! Searching for alternatives...")
    # Find the pattern differently - search for data.success check
    alt = b'data.success'
    alt_idx = data.find(alt)
    print(f"'data.success' found at byte: {alt_idx}")
    print("Context:", repr(data[alt_idx-100:alt_idx+200]))
    exit(1)

print(f"Found old fragment at byte: {old_idx}")

# Find the start of the section from "const data = await res.json();" to the auto-fill part
section_start_byte = data.rfind(new_fragment_start_marker, 0, old_idx)
print(f"Section start at byte: {section_start_byte}")

# Find the end marker: "// Clear staged data on backend" -> always comes after auto-fill
end_marker = b'// Clear staged data on backend\r\n        await fetch'
section_end_byte = data.find(end_marker, old_idx)
if section_end_byte == -1:
    end_marker = b'// Clear staged data on backend\n        await fetch'
    section_end_byte = data.find(end_marker, old_idx)
if section_end_byte == -1:
    print("ERROR: Could not find end marker!")
    print("Context around old fragment:", repr(data[old_idx:old_idx+500]))
    exit(1)

# Find end of the clear fetch line
clear_end = data.find(b"'POST' });", section_end_byte)
if clear_end == -1:
    clear_end = data.find(b"'POST'});", section_end_byte)
if clear_end == -1:
    print("ERROR: Could not find end of clear fetch!")
    exit(1)
clear_end += len(b"'POST' });")

print(f"Replacing bytes {section_start_byte} to {clear_end}")
print(f"Replacing: {repr(data[section_start_byte:section_start_byte+50])}...")

new_data = data[:section_start_byte] + new_section + data[clear_end:]

with open('panel.js', 'wb') as f:
    f.write(new_data)

print(f"SUCCESS! panel.js patched. New size: {len(new_data)} bytes (was {len(data)} bytes)")
