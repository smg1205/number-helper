// popup.js
document.getElementById('addBtn').addEventListener('click', async () => {
  const name = document.getElementById('nameInput').value.trim();
  const number = document.getElementById('numberInput').value.trim();

  if (!name || !number) {
    alert('名称和号码不能为空');
    return;
  }

  try {
    // 直接操作存储，无需通过content script
    const { phoneMap = {} } = await chrome.storage.local.get('phoneMap');
    const newMap = { ...phoneMap, [name]: number };
    
    await chrome.storage.local.set({ phoneMap: newMap });
    console.log('保存成功:', newMap);
    
    refreshList(); // 立即刷新本地列表
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请检查控制台');
  }
});

// 其余 refreshList 函数保持不变
  
function refreshList() {
  chrome.storage.local.get(['phoneMap'], (result) => {
    const list = document.getElementById('mappingList');
    list.innerHTML = '';

    // 修复点：添加空对象兜底
    const phoneMap = result.phoneMap || {};  // 当phoneMap不存在时使用空对象

    Object.entries(phoneMap).forEach(([name, number]) => {
      const div = document.createElement('div');
      div.className = 'mapping-item';
      div.textContent = `${name} → ${number}`;
      list.appendChild(div);
    });

    // 添加空状态提示
    if (Object.keys(phoneMap).length === 0) {
      const emptyTip = document.createElement('div');
      emptyTip.className = 'empty-tip';
      emptyTip.textContent = '暂无存储的号码映射';
      list.appendChild(emptyTip);
    }
  });
}
  
  // 初始化时加载列表
  refreshList();