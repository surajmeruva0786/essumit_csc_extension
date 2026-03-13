// FileTract Frontend JavaScript
// Connects to Flask backend API - Supports Multi-File Batch Processing

// Dynamically set API base URL based on environment
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

let currentJobIds = [];
let currentResults = null;
let statusCheckInterval = null;

// File upload handling - supports multiple files
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formData = new FormData();

    // Add all files
    if (files.length === 1) {
        formData.append('file', files[0]);
    } else {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            if (data.jobs) {
                // Multiple files
                currentJobIds = data.jobs.map(j => j.job_id);
                const filenames = data.jobs.map(j => j.filename).join(', ');
                document.getElementById('selectedFile').textContent = `${data.count} files selected`;
                document.getElementById('selectedFile').title = filenames;
            } else {
                // Single file
                currentJobIds = [data.job_id];
                document.getElementById('selectedFile').textContent = data.filename;
            }

            document.getElementById('selectedFile').style.color = 'var(--accent-primary)';

            // Show document preview for first file
            showDocumentPreview(files[0], files.length);
        } else {
            alert('Error uploading file(s): ' + data.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file(s)');
    }
});

// Show document preview
function showDocumentPreview(file, totalFiles = 1) {
    const preview = document.getElementById('previewContent');

    if (totalFiles > 1) {
        preview.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">ðŸ“š</div>
                <div style="color: var(--accent-primary); font-weight: 700;">${totalFiles} Documents</div>
                <div style="color: var(--text-dim); margin-top: 10px; font-size: 0.8rem;">Ready for batch processing</div>
            </div>
        `;
    } else if (file.type === 'application/pdf') {
        preview.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">ðŸ“„</div>
                <div style="color: var(--accent-primary); font-weight: 700;">${file.name}</div>
                <div style="color: var(--text-dim); margin-top: 10px; font-size: 0.8rem;">PDF Document</div>
            </div>
        `;
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}

// Process document(s)
async function processDocument(pipeline) {
    if (!currentJobIds || currentJobIds.length === 0) {
        alert('Please upload document(s) first');
        return;
    }

    const fieldsInput = document.getElementById('fieldsInput').value.trim();
    if (!fieldsInput) {
        alert('Please enter fields to extract');
        return;
    }

    const fields = fieldsInput.split(',').map(f => f.trim()).filter(f => f);

    try {
        // Reset UI
        resetPipelineSteps();
        document.getElementById('resultsContainer').innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-dim);">
                <div style="font-size: 2rem; margin-bottom: 15px;">âš™ï¸</div>
                <div>Processing ${currentJobIds.length} document(s)</div>
                <div style="font-size: 0.8rem; margin-top: 10px;">${pipeline === 'patent' ? 'Patent' : 'Standard'} Pipeline</div>
            </div>
        `;
        document.getElementById('jsonOutput').innerHTML = '<span style="color: #6a8759;">// Processing...</span>';

        // Show scanning animation
        document.getElementById('scanLine').style.display = 'block';
        if (pipeline === 'patent') {
            document.getElementById('heatmapOverlay').style.display = 'block';
            document.getElementById('reOcrStatus').textContent = 'ACTIVE';
            document.getElementById('reOcrStatus').style.color = 'var(--status-reliable)';
        }

        // Use batch endpoint if multiple files
        const endpoint = currentJobIds.length > 1 ? `${API_BASE}/extract/batch` : `${API_BASE}/extract`;
        const payload = currentJobIds.length > 1
            ? { job_ids: currentJobIds, fields, pipeline }
            : { job_id: currentJobIds[0], fields, pipeline };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // Start polling for status
            startStatusPolling(pipeline);
        } else {
            alert('Error starting extraction: ' + data.error);
            resetUI();
        }
    } catch (error) {
        console.error('Processing error:', error);
        alert('Failed to process document(s)');
        resetUI();
    }
}

// Poll job status
function startStatusPolling(pipeline) {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }

    statusCheckInterval = setInterval(async () => {
        try {
            // Check all jobs
            const statuses = await Promise.all(
                currentJobIds.map(jobId =>
                    fetch(`${API_BASE}/status/${jobId}`).then(r => r.json())
                )
            );

            const allComplete = statuses.every(s => s.status === 'complete');
            const anyError = statuses.some(s => s.status === 'error');
            const processing = statuses.filter(s => s.status === 'processing');

            if (processing.length > 0) {
                // Update to highest stage
                const maxStage = Math.max(...processing.map(s => s.current_stage || 0));
                updatePipelineStep(maxStage, pipeline);
            }

            if (allComplete) {
                clearInterval(statusCheckInterval);
                await fetchResults();
            } else if (anyError) {
                clearInterval(statusCheckInterval);
                const errorJob = statuses.find(s => s.status === 'error');
                alert('Processing error: ' + errorJob.error);
                resetUI();
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    }, 1000);
}

// Update pipeline step visualization
function updatePipelineStep(stage, pipeline) {
    const maxStages = pipeline === 'patent' ? 5 : 2;

    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        if (i < stage) {
            step.classList.add('complete');
            step.classList.remove('active');
        } else if (i === stage) {
            step.classList.add('active');
            step.classList.remove('complete');
        } else {
            step.classList.remove('active', 'complete');
        }
    }
}

// Fetch and display results
async function fetchResults() {
    try {
        // Fetch all results
        const results = await Promise.all(
            currentJobIds.map(jobId =>
                fetch(`${API_BASE}/result/${jobId}`).then(r => r.json())
            )
        );

        currentResults = results.length === 1 ? results[0] : { batch: results };

        // Hide scanning animation
        document.getElementById('scanLine').style.display = 'none';
        document.getElementById('heatmapOverlay').style.display = 'none';

        // Mark all steps complete
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`step${i}`).classList.add('complete');
            document.getElementById(`step${i}`).classList.remove('active');
        }

        // Display results
        if (results.length === 1) {
            const data = results[0];
            if (data.pipeline === 'patent') {
                displayPatentResults(data.results);
            } else {
                displayStandardResults(data.results);
            }
        } else {
            displayBatchResults(results);
        }

        // Show export button
        document.getElementById('exportBtn').style.display = 'block';
        document.getElementById('jsonStatus').style.display = 'inline-block';

    } catch (error) {
        console.error('Fetch results error:', error);
        alert('Failed to fetch results');
    }
}

// Display patent pipeline results
function displayPatentResults(results) {
    const container = document.getElementById('resultsContainer');
    const fields = results.extracted_fields;

    let html = '';
    for (const [fieldName, fieldData] of Object.entries(fields)) {
        const qualityClass = fieldData.quality_flag || 'uncertain';
        const isFused = fieldData.ocr_confidence > 0.8;

        html += `
            <div class="field-card ${qualityClass}">
                <div class="field-label">
                    ${fieldName}
                    ${isFused ? '<span class="fused-label">FUSED</span>' : ''}
                    <span style="float: right; font-size: 0.55rem; color: var(--text-dim);">✏️ Click to edit</span>
                </div>
                <div class="field-value editable" contenteditable="true" data-field="${fieldName}" spellcheck="false" style="cursor: text; padding: 4px; border-radius: 2px;" onfocus="this.style.background='rgba(0,242,255,0.1)'; this.style.outline='1px solid var(--accent-primary)';" onblur="this.style.background=''; this.style.outline=''; updateFieldValue('${fieldName}', this.textContent);">${fieldData.value || 'NOT DETECTED'}</div>
                <div class="metric-row" style="margin-top: 8px;">
                    <span style="color: var(--status-${qualityClass === 'reliable' ? 'reliable' : qualityClass === 'uncertain' ? 'uncertain' : 'low'}); font-size: 0.6rem;">
                        OCR: ${fieldData.ocr_confidence.toFixed(2)}
                    </span>
                    <span style="color: var(--accent-primary); font-size: 0.6rem;">
                        LLM: ${fieldData.llm_confidence}
                    </span>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Update quality metrics
    const stats = results.confidence_statistics;
    const fusion = results.fusion_metadata;

    document.getElementById('qualityMetrics').style.display = 'block';
    document.getElementById('meanConfBar').style.width = `${stats.mean_confidence * 100}%`;
    document.getElementById('reOcrBar').style.width = `${fusion.reocr_selection_rate}%`;
    document.getElementById('improvementBar').style.width = `${fusion.improvement_success_rate}%`;

    const overallScore = (stats.mean_confidence * 10).toFixed(1);
    document.getElementById('overallScore').textContent = `${overallScore} / 10`;

    // Update JSON output
    document.getElementById('jsonOutput').innerHTML = syntaxHighlight(JSON.stringify(results, null, 2));
}

// Display standard pipeline results
function displayStandardResults(results) {
    const container = document.getElementById('resultsContainer');

    let html = '';
    for (const [fieldName, value] of Object.entries(results)) {
        html += `
            <div class="field-card uncertain">
                <div class="field-label">
                    ${fieldName}
                    <span style="float: right; font-size: 0.55rem; color: var(--text-dim);">✏️ Click to edit</span>
                </div>
                <div class="field-value editable" contenteditable="true" data-field="${fieldName}" spellcheck="false" style="cursor: text; padding: 4px; border-radius: 2px;" onfocus="this.style.background='rgba(0,242,255,0.1)'; this.style.outline='1px solid var(--accent-primary)';" onblur="this.style.background=''; this.style.outline=''; updateFieldValue('${fieldName}', this.textContent);">${value || 'NOT DETECTED'}</div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Update JSON output
    document.getElementById('jsonOutput').innerHTML = syntaxHighlight(JSON.stringify(results, null, 2));
}

// Display batch results from multiple documents
function displayBatchResults(results) {
    const container = document.getElementById('resultsContainer');

    let html = '<div style="margin-bottom: 20px; color: var(--accent-primary); font-weight: 700; font-size: 0.9rem;">BATCH RESULTS: ' + results.length + ' Documents</div>';

    results.forEach((data, index) => {
        const isPat = data.pipeline === 'patent';
        const fields = isPat ? data.results.extracted_fields : data.results;

        html += `<div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--plate-edge);">`;
        html += `<div style="color: var(--text-dim); font-size: 0.65rem; margin-bottom: 10px; letter-spacing: 0.1em;">DOCUMENT ${index + 1} <span style="float: right;">✏️ Click values to edit</span></div>`;

        if (isPat) {
            for (const [fieldName, fieldData] of Object.entries(fields)) {
                const qualityClass = fieldData.quality_flag || 'uncertain';
                html += `
                    <div class="field-card ${qualityClass}" style="margin-bottom: 8px;">
                        <div class="field-label">${fieldName}</div>
                        <div class="field-value editable" contenteditable="true" data-doc="${index}" data-field="${fieldName}" spellcheck="false" style="font-size: 0.85rem; cursor: text; padding: 4px; border-radius: 2px;" onfocus="this.style.background='rgba(0,242,255,0.1)'; this.style.outline='1px solid var(--accent-primary)';" onblur="this.style.background=''; this.style.outline=''; updateBatchFieldValue(${index}, '${fieldName}', this.textContent);">${fieldData.value || 'NOT DETECTED'}</div>
                        <div class="metric-row" style="margin-top: 6px; font-size: 0.55rem;">
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
                        <div class="field-value editable" contenteditable="true" data-doc="${index}" data-field="${fieldName}" spellcheck="false" style="font-size: 0.85rem; cursor: text; padding: 4px; border-radius: 2px;" onfocus="this.style.background='rgba(0,242,255,0.1)'; this.style.outline='1px solid var(--accent-primary)';" onblur="this.style.background=''; this.style.outline=''; updateBatchFieldValue(${index}, '${fieldName}', this.textContent);">${value || 'NOT DETECTED'}</div>
                    </div>
                `;
            }
        }

        html += `</div>`;
    });

    container.innerHTML = html;

    // Update JSON output with all results
    document.getElementById('jsonOutput').innerHTML = syntaxHighlight(JSON.stringify(results, null, 2));

    // Hide quality metrics for batch
    document.getElementById('qualityMetrics').style.display = 'none';
}

// Syntax highlighting for JSON
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }

        const colors = {
            'key': '#6a8759',
            'string': '#cc7832',
            'number': '#6897bb',
            'boolean': '#cc7832',
            'null': '#808080'
        };

        return `<span style="color: ${colors[cls]};">${match}</span>`;
    });
}

// Update field value when edited (single document)
function updateFieldValue(fieldName, newValue) {
    if (!currentResults || currentResults.batch) return;

    // Update in currentResults
    if (currentResults.pipeline === 'patent') {
        if (currentResults.results.extracted_fields[fieldName]) {
            currentResults.results.extracted_fields[fieldName].value = newValue.trim();
        }
    } else {
        currentResults.results[fieldName] = newValue.trim();
    }

    console.log(`Updated ${fieldName} to: ${newValue.trim()}`);
}

// Update field value when edited (batch documents)
function updateBatchFieldValue(docIndex, fieldName, newValue) {
    if (!currentResults || !currentResults.batch) return;

    const doc = currentResults.batch[docIndex];
    if (!doc) return;

    // Update in currentResults
    if (doc.pipeline === 'patent') {
        if (doc.results.extracted_fields[fieldName]) {
            doc.results.extracted_fields[fieldName].value = newValue.trim();
        }
    } else {
        doc.results[fieldName] = newValue.trim();
    }

    console.log(`Updated Document ${docIndex + 1}, ${fieldName} to: ${newValue.trim()}`);
}

// Export results as CSV (uses edited values)
function exportResults() {
    if (!currentResults) return;

    let csvContent = '';

    // Check if batch results
    if (currentResults.batch) {
        const results = currentResults.batch;
        const isPat = results[0].pipeline === 'patent';

        if (isPat) {
            csvContent = 'Document,Field,Value,OCR Confidence,LLM Confidence,Quality Flag\n';
            results.forEach((data, index) => {
                const fields = data.results.extracted_fields;
                for (const [fieldName, fieldData] of Object.entries(fields)) {
                    const row = [
                        `Document ${index + 1}`,
                        fieldName,
                        fieldData.value || 'NOT DETECTED',
                        fieldData.ocr_confidence.toFixed(3),
                        fieldData.llm_confidence,
                        fieldData.quality_flag
                    ];
                    csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
                }
            });
        } else {
            csvContent = 'Document,Field,Value\n';
            results.forEach((data, index) => {
                const fields = data.results;
                for (const [fieldName, value] of Object.entries(fields)) {
                    const row = [
                        `Document ${index + 1}`,
                        fieldName,
                        value || 'NOT DETECTED'
                    ];
                    csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
                }
            });
        }
    } else {
        if (currentResults.pipeline === 'patent') {
            csvContent = 'Field,Value,OCR Confidence,LLM Confidence,Quality Flag\n';
            const fields = currentResults.results.extracted_fields;
            for (const [fieldName, fieldData] of Object.entries(fields)) {
                const row = [
                    fieldName,
                    fieldData.value || 'NOT DETECTED',
                    fieldData.ocr_confidence.toFixed(3),
                    fieldData.llm_confidence,
                    fieldData.quality_flag
                ];
                csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
            }

            csvContent += '\n--- Quality Statistics ---\n';
            const stats = currentResults.results.confidence_statistics;
            csvContent += `Mean Confidence,${stats.mean_confidence.toFixed(3)}\n`;
            csvContent += `Min Confidence,${stats.min_confidence.toFixed(3)}\n`;
            csvContent += `Max Confidence,${stats.max_confidence.toFixed(3)}\n`;

            csvContent += '\n--- Fusion Metadata ---\n';
            const fusion = currentResults.results.fusion_metadata;
            csvContent += `Re-OCR Selection Rate,${fusion.reocr_selection_rate.toFixed(1)}%\n`;
            csvContent += `Improvement Success Rate,${fusion.improvement_success_rate.toFixed(1)}%\n`;
        } else {
            csvContent = 'Field,Value\n';
            const fields = currentResults.results;
            for (const [fieldName, value] of Object.entries(fields)) {
                const row = [
                    fieldName,
                    value || 'NOT DETECTED'
                ];
                csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
            }
        }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `filetract_results_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Reset UI
function resetUI() {
    document.getElementById('scanLine').style.display = 'none';
    document.getElementById('heatmapOverlay').style.display = 'none';
    document.getElementById('reOcrStatus').textContent = 'STANDBY';
    document.getElementById('reOcrStatus').style.color = 'var(--text-dim)';
    resetPipelineSteps();
}

function resetPipelineSteps() {
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`step${i}`).classList.remove('active', 'complete');
    }
}
