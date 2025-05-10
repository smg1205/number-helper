
document.addEventListener('input', (e) => {
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      handleTextReplacement(target);
    }
  });
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`[${location.href}] 收到消息:`, msg);
    return true;
  });
  // content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ContentScript] 收到消息:', request);
  
  if (request.action === 'refreshMappings') {
    // 执行实际刷新操作（例如重新读取存储）
    sendResponse({ status: 'ready' });
    return true; // 保持消息通道开放
  }
});
  
  async function handleTextReplacement(element) {
    const text = element.value;
    const lastSlashIndex = text.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const inputText = text.slice(lastSlashIndex + 1);
      const { phoneMap } = await chrome.storage.local.get(['phoneMap']);
      
      if (phoneMap[inputText]) {
        const newText = text.replace(`/${inputText}`, phoneMap[inputText]);
        element.value = newText;
        
        // 保持光标位置
        const newCursorPos = lastSlashIndex + phoneMap[inputText].length;
        element.setSelectionRange(newCursorPos, newCursorPos);
      }
    }
  }
  // content-script.js 新增
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshMappings') {
    // 执行刷新操作
    sendResponse({ status: 'ready' });
  }
});

// content-script.js
let isInitialized = false;

function init() {
  if (isInitialized) return;
  isInitialized = true;
  
  // 原有的DOM监听逻辑
  document.addEventListener('input', handleInput);
}

// 收到强制刷新指令时重新初始化
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'forceRefresh') {
    init();
  }
});

// 初始注入时立即执行
init();