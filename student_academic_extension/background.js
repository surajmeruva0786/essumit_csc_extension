import { browser } from 'webextension-polyfill'

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('academicReminders', { periodInMinutes: 60 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'academicReminders') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_REMINDERS' }).catch(() => {})
      }
    })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: message.title,
      message: message.body,
      priority: 2
    })
  }
  sendResponse({ success: true })
  return true
})
