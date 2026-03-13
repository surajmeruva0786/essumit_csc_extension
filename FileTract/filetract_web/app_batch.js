// Add batch results display function after displayStandardResults

// Display batch results from multiple documents
function displayBatchResults(results) {
    const container = document.getElementById('resultsContainer');

    let html = '<div style="margin-bottom: 20px; color: var(--accent-primary); font-weight: 700;">BATCH RESULTS: ' + results.length + ' Documents</div>';

    results.forEach((data, index) => {
        const isPat = data.pipeline === 'patent';
        const fields = isPat ? data.results.extracted_fields : data.results;

        html += `<div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--plate-edge);">`;
        html += `<div style="color: var(--text-dim); font-size: 0.7rem; margin-bottom: 10px;">DOCUMENT ${index + 1}</div>`;

        if (isPat) {
            for (const [fieldName, fieldData] of Object.entries(fields)) {
                const qualityClass = fieldData.quality_flag || 'uncertain';
                html += `
                    <div class="field-card ${qualityClass}" style="margin-bottom: 8px;">
                        <div class="field-label">${fieldName}</div>
                        <div class="field-value">${fieldData.value || 'NOT DETECTED'}</div>
                        <div class="metric-row" style="margin-top: 8px; font-size: 0.55rem;">
                            <span>OCR: ${fieldData.ocr_confidence.toFixed(2)}</span>
                            <span>LLM: ${fieldData.llm_confidence}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            for (const [fieldName, value] of Object.entries(fields)) {
                html += `
                    <div class="field-card uncertain" style="margin-bottom: 8px;">
                        <div class="field-label">${fieldName}</div>
                        <div class="field-value">${value || 'NOT DETECTED'}</div>
                    </div>
                `;
            }
        }

        html += `</div>`;
    });

    container.innerHTML = html;

    // Update JSON output with all results
    document.getElementById('jsonOutput').innerHTML = syntaxHighlight(JSON.stringify(results, null, 2));

    // Hide quality metrics for batch (or show aggregate)
    document.getElementById('qualityMetrics').style.display = 'none';
}
