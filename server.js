const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== 这里替换成你自己的真实凭证 ==========
const ARK_API_KEY = "ark-6ef58606-9ed3-49a0-99a3-da7519f3aeaa-d7f5a";
const ENDPOINT_ID = "ep-20260722164651-j6znz";
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
// ==============================================

app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  try {
    const result = await axios.post(API_URL, {
      model: ENDPOINT_ID,
      messages: [
        {
          role: "system",
          content: "你是XX科技工业智能装备专业客服，仅回答自动化设备、产线、定制、质保、交付相关问题，回答简洁专业，不闲聊无关内容。"
        },
        { role: "user", content: question }
      ],
      temperature: 0.5,
      max_tokens: 600
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARK_API_KEY}`
      }
    })
    res.json({
      code: 200,
      reply: result.data.choices[0].message.content
    })
  } catch (err) {
    res.json({
      code: 500,
      reply: "AI客服暂时繁忙，请稍后重试"
    })
  }
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`豆包中转服务已启动：http://localhost:${PORT}`);
})