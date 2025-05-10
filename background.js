// 初始化存储
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['phoneMap'], (result) => {
      if (!result.phoneMap) {
        chrome.storage.local.set({ phoneMap: {} });
      }
    });
  });
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`[${location.href}] 收到消息:`, msg);
    return true;
  });  
  // 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.phoneMap) {
    console.log('存储更新:', changes.phoneMap.newValue);
  }
});
  // 当存储更新时主动通知内容脚本

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.phoneMap) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'forceRefresh'
        }).catch(() => {}); // 忽略未注入脚本的标签页
      });
    });
  }
});
  // 接收来自popup的添加请求
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addMapping') {
      chrome.storage.local.get(['phoneMap'], (result) => {
        const newMap = { ...result.phoneMap, [request.name]: request.number };
        chrome.storage.local.set({ phoneMap: newMap });
      });
    }
  });
  // background.js 添加
chrome.runtime.onStartup.addListener(() => {
  console.log('Service Worker被唤醒');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'keepAlive') {
    sendResponse('alive');
  }
});