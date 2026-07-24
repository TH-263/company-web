// 主脚本：轮播逻辑已从 index.html 提取
document.addEventListener("DOMContentLoaded", function () {
  const box = document.getElementById("bannerBox");
  if (!box) return;

  const slideCount = 3; // 真实3张轮播图
  let index = 0;
  const delayTime = 3000; // 每张停留3秒

  function getSlideWidth() {
    return box.children[0].getBoundingClientRect().width;
  }

  // 更新位移
  function setTranslate() {
    box.style.transition = "transform 0.7s ease-in-out";
    box.style.transform = `translateX(-${index * getSlideWidth()}px)`;
  }

  // 无缝重置逻辑
  function autoLoop() {
    index++;
    setTranslate();
    // 滑到复制的第4张（和第一张一样）时，瞬间切回真正第一张，无动画
    if (index === slideCount) {
      setTimeout(() => {
        box.style.transition = "none";
        index = 0;
        box.style.transform = `translateX(0)`;
      }, 700); // 和动画时长同步
    }
  }

  // 自动轮播定时器
  let timer = setInterval(autoLoop, delayTime);

  // 上一张（暴露到全局，供 onclick 使用）
  window.prev = function () {
    clearInterval(timer);
    box.style.transition = "transform 0.7s ease-in-out";
    index = index - 1 < 0 ? slideCount - 1 : index - 1;
    setTranslate();
    timer = setInterval(autoLoop, delayTime);
  };

  // 下一张（暴露到全局，供 onclick 使用）
  window.next = function () {
    clearInterval(timer);
    autoLoop();
    timer = setInterval(autoLoop, delayTime);
  };
});

const filterBtns = document.querySelectorAll(".filter-btn");
const items = document.querySelectorAll(".product-item");
filterBtns.forEach((btn) => {
  btn.onclick = () => {
    filterBtns.forEach((b) => {
      b.classList.remove("bg-blue-500", "text-white");
      b.classList.add("bg-white", "text-gray-600");
    });
    btn.classList.remove("bg-white", "text-gray-600");
    btn.classList.add("bg-blue-500", "text-white");
    const type = btn.dataset.filter;
    items.forEach((item) => {
      if (type === "all" || item.dataset.cat.includes(type)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  };
});

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const suggestBtns = document.querySelectorAll(".suggest-btn");

let currentThinkingEl = null;

// 渲染对话气泡（仅用于用户或无思考占位的直接追加）
function appendMsg(text, isUser) {
  const div = document.createElement("div");
  div.className = `flex my-3 ${isUser ? "justify-end" : "justify-start"}`;
  div.innerHTML = `
    <div class="${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} px-4 py-3 rounded-xl max-w-[75%]">
      ${text}
    </div>
  `;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 显示“小润正在思考中…”气泡并返回该元素引用
function showThinking() {
  // 如果已有思考气泡，则重用
  if (currentThinkingEl) return currentThinkingEl;
  const wrapper = document.createElement("div");
  wrapper.className = "flex my-3 justify-start";
  wrapper.style.opacity = "1";
  wrapper.style.transition = "opacity 0.48s ease";
  wrapper.innerHTML = `
    <div class="bg-gray-100 text-gray-800 px-4 py-3 rounded-xl max-w-[75%] thinking-bubble">
      小润正在思考中<span class="dots"></span>
    </div>
  `;
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  currentThinkingEl = wrapper;
  return wrapper;
}

// 将思考气泡淡出并替换为正式回复（若不存在思考气泡则直接追加）
function replaceThinkingWithReply(text) {
  if (!currentThinkingEl) {
    appendMsg(text, false);
    return;
  }

  const bubble = currentThinkingEl.querySelector("div");
  if (!bubble) {
    appendMsg(text, false);
    currentThinkingEl = null;
    return;
  }

  bubble.style.transition = "opacity 0.24s ease";
  bubble.style.opacity = "0";
  setTimeout(() => {
    bubble.innerHTML = text;
    bubble.style.opacity = "1";
    currentThinkingEl = null;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 250);
}

// 胶囊建议点击（使用思考气泡与替换）
suggestBtns.forEach((btn) => {
  btn.onclick = () => {
    const q = btn.dataset.question;
    appendMsg(q, true);
    showThinking();
    // 此处为模拟回复，正式环境替换为豆包API请求
    setTimeout(() => {
      let reply = "";
      if (q === "设备是否支持个性化定制？")
        reply = "支持定制开发，可按照产线工况、尺寸、产能进行个性化改造。";
      if (q === "设备质保周期多久？")
        reply = "整机质保1年，核心零部件质保2年，终身提供技术维护支持。";
      if (q === "设备交付周期大概多久？")
        reply = "标准机型7～15个工作日，定制机型15～30个工作日。";
      if (q === "是否提供上门安装调试？")
        reply = "全国范围可提供上门安装、调试、操作人员培训服务。";
      if (q === "设备能否对接工厂MES系统？")
        reply = "设备支持对接MES、ERP等工厂管理系统，实现数据互通远程监控。";
      replaceThinkingWithReply(reply);
    }, 400);
  };
});

// 手动输入发送（显示思考占位并在拿到回复后进行替换）
async function sendMessage() {
  const txt = userInput.value.trim();
  if (!txt) return;
  appendMsg(txt, true);
  userInput.value = "";

  // 显示思考占位
  showThinking();

  // 向后端中转接口请求豆包AI回答
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: txt }),
    });
    const data = await res.json();
    replaceThinkingWithReply(data.reply);
  } catch (err) {
    replaceThinkingWithReply("AI客服服务异常，请确认后端服务已启动");
  }
}
sendBtn.onclick = sendMessage;
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
