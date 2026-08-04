chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_PAGE') {
    const assignments = []
    const notices = []
    document.querySelectorAll('.assignment, .notice, .event').forEach((el) => {
      assignments.push({
        title: el.innerText,
        date: el.getAttribute('data-date') || new Date().toISOString()
      })
    })
    sendResponse({ assignments, notices })
  }
  return true
})
