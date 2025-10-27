import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "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",
});

// 从 Supabase 读取名人队列
async function getCelebritiesQueue(): Promise<string[]> {
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化，环境变量缺失');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('celebrities_queue')
      .select('queue_data')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('读取名人队列失败:', error);
      return [];
    }
    
    return data?.queue_data || [];
  } catch (error) {
    console.error('读取名人队列异常:', error);
    return [];
  }
}

// 保存名人队列到 Supabase
async function saveCelebritiesQueue(queue: string[]): Promise<void> {
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化，无法保存队列');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('celebrities_queue')
      .upsert({ id: 1, queue_data: queue }, { onConflict: 'id' });
    
    if (error) {
      console.error('保存名人队列失败:', error);
    }
  } catch (error) {
    console.error('保存名人队列异常:', error);
  }
}

// 从 Supabase 读取已使用名人列表
async function getUsedCelebrities(): Promise<string[]> {
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化，无法读取已使用名人');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('used_celebrities')
      .select('celebrity_name')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('读取已使用名人失败:', error);
      return [];
    }
    
    return data.map(row => row.celebrity_name);
  } catch (error) {
    console.error('读取已使用名人异常:', error);
    return [];
  }
}

// 添加已使用名人对 Supabase
async function addUsedCelebrity(celebrity: string): Promise<void> {
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化，无法添加已使用名人');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('used_celebrities')
      .insert({ celebrity_name: celebrity });
    
    if (error && error.code !== '23505') { // 23505 = unique violation
      console.error('添加已使用名人失败:', error);
    } else {
      console.log(`✅ 添加已使用名人: ${celebrity}`);
    }
  } catch (error) {
    console.error('添加已使用名人异常:', error);
  }
}

// 检查两个名字是否重复
function isDuplicateName(name1: string, name2: string): boolean {
  // 直接匹配
  if (name1 === name2) return true;
  
  // 包含关系检查
  if (name1.includes(name2) || name2.includes(name1)) return true;
  
  // 核心名字检查
  const extractCoreName = (name: string) => {
    return name.replace(/[·\s\-]/g, '').replace(/夫人|先生|博士|教授|大师|先生|女士|皇帝|大帝|帝|王|后|太后/g, '');
  };
  
  const core1 = extractCoreName(name1);
  const core2 = extractCoreName(name2);
  
  if (core1.length >= 2 && core2.length >= 2 && 
      (core1.includes(core2) || core2.includes(core1))) {
    return true;
  }
  
  // 变体匹配检查
  const nameVariants = {
    '李白': ['李太白', '青莲居士'],
    '杜甫': ['杜子美', '少陵野老'],
    '苏轼': ['苏东坡', '苏子瞻'],
    '王羲之': ['王右军'],
    '张衡': ['张平子'],
    '祖冲之': ['祖文远'],
    '李时珍': ['李东璧'],
    '岳飞': ['岳鹏举'],
    '贝多芬': ['路德维希·范·贝多芬', '贝多芬'],
    '爱因斯坦': ['阿尔伯特·爱因斯坦', '爱因斯坦'],
    '牛顿': ['艾萨克·牛顿', '牛顿'],
    '莎士比亚': ['威廉·莎士比亚', '莎士比亚'],
    '达芬奇': ['列奥纳多·达·芬奇', '达·芬奇', '达芬奇', '列奥纳多·达芬奇'],
    '居里夫人': ['玛丽·居里', '玛丽亚·居里', '居里夫人', '玛丽·斯克沃多夫斯卡-居里'],
    '莫扎特': ['沃尔夫冈·阿马德乌斯·莫扎特', '莫扎特', '沃尔夫冈·莫扎特'],
    '柴可夫斯基': ['彼得·伊里奇·柴可夫斯基', '柴可夫斯基', '彼得·柴可夫斯基'],
    '达尔文': ['查尔斯·达尔文', '达尔文', '查尔斯·罗伯特·达尔文'],
    '拿破仑': ['拿破仑·波拿巴', '拿破仑'],
    '甘地': ['圣雄甘地', '甘地'],
    '马丁·路德·金': ['马丁路德金', '马丁·路德·金'],
    '伏尔泰': ['伏尔泰'],
    '阿基米德': ['阿基米德'],
    '弗朗茨·卡夫卡': ['卡夫卡', '弗朗茨·卡夫卡'],
    '唐太宗': ['李世民', '唐太宗', '太宗'],
    '康熙皇帝': ['康熙', '康熙皇帝', '康熙帝'],
    '秦始皇': ['嬴政', '秦始皇', '始皇帝'],
    '汉武帝': ['刘彻', '汉武帝', '武帝'],
    '孙中山': ['孙文', '孙中山', '孙逸仙'],
    '毛泽东': ['毛泽东', '毛主席'],
    '周恩来': ['周恩来', '周总理'],
    '希特勒': ['阿道夫·希特勒', '希特勒'],
    '丘吉尔': ['温斯顿·丘吉尔', '丘吉尔'],
    '华盛顿': ['乔治·华盛顿', '华盛顿'],
    '林肯': ['亚伯拉罕·林肯', '林肯']
  };
  
  for (const [mainName, variants] of Object.entries(nameVariants)) {
    const name1InVariants = variants.includes(name1) || name1 === mainName;
    const name2InVariants = variants.includes(name2) || name2 === mainName;
    
    if (name1InVariants && name2InVariants) {
      return true;
    }
  }
  
  return false;
}

// 批量获取50个名人
async function getBatchCelebrities(usedCelebrities: string[]): Promise<string[]> {
  console.log('=== 开始批量获取50个名人 ===');
    console.log('API Key 存在:', !!process.env.OPENROUTER_API_KEY);
    console.log('OpenRouter API URL:', "https://openrouter.ai/api/v1");
    console.log('已使用名人数量:', usedCelebrities.length);
  
  try {
    console.log('📡 正在调用 OpenRouter API 批量获取名人...');
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1",
      messages: [
        {
          role: "user",
          content: `请一次性提供50个人类历史上的著名人物，要求：

1. 必须是历史上真实存在的著名人物
2. 必须返回中文姓名（包括外国人也要翻译成中文名字）
3. 不能包含以下已使用的人物：${usedCelebrities.length > 0 ? usedCelebrities.join(', ') : '无'}
4. 50个名人必须完全不同，不能有任何重复
5. 请用JSON数组格式返回，只包含人物姓名

示例格式：
["孔子", "李白", "贝多芬", "爱因斯坦", "莎士比亚", "牛顿", "达芬奇", "拿破仑", "甘地", "马丁·路德·金", ...]

请确保返回50个不同的名人，涵盖不同时代、不同领域的历史人物。`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error('AI返回内容为空');
    }
    console.log('✅ AI API 调用成功，返回名人列表');
    console.log('AI返回的名人列表:', response);
    
    // 解析JSON数组
    let celebrities: string[] = [];
    try {
      // 清理响应
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 提取JSON数组
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        celebrities = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法找到JSON数组格式');
      }
    } catch (parseError) {
      console.error('解析名人列表失败:', parseError);
      throw new Error('AI返回格式错误');
    }
    
    // 验证和去重
    const validCelebrities: string[] = [];
    const seenNames = new Set<string>();
    
    for (const celebrity of celebrities) {
      if (typeof celebrity === 'string' && celebrity.trim()) {
        const trimmedName = celebrity.trim();
        
        // 检查是否与已使用名人重复
        const isUsed = usedCelebrities.some(used => isDuplicateName(used, trimmedName));
        if (isUsed) {
          console.log(`跳过已使用名人: ${trimmedName}`);
          continue;
        }
        
        // 检查是否与当前批次重复
        const isDuplicate = Array.from(seenNames).some(seen => isDuplicateName(seen, trimmedName));
        if (isDuplicate) {
          console.log(`跳过重复名人: ${trimmedName}`);
          continue;
        }
        
        validCelebrities.push(trimmedName);
        seenNames.add(trimmedName);
      }
    }
    
    console.log(`✅ 成功获取 ${validCelebrities.length} 个有效名人`);
    return validCelebrities;
    
  } catch (error) {
    console.error('❌ 批量获取名人失败:');
    console.error('错误类型:', error?.constructor?.name);
    console.error('错误信息:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    throw error;
  }
}

// 获取单个名人的名言
async function getCelebrityQuote(celebrity: string): Promise<{
  quote: string;
  context: string;
  background: string;
  achievements: string;
  author: string;
}> {
  console.log(`--- 获取${celebrity}的名言 ---`);
  console.log('📡 正在调用 OpenRouter API 获取名言...');
  
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1",
      messages: [
        {
          role: "user",
          content: `请提供${celebrity}说过的最振聋发聩的名言，要求：

1. 名言必须是${celebrity}真实说过的话
2. 出处要具体（时间、地点或作品）
3. 背景描述要详细（至少100字），说明名人当时说这句话的背景和意义
4. 生平成就要简洁（控制在200字以内），概述该名人的主要成就和贡献
5. 请用JSON格式返回，包含以下字段：quote, context, background, achievements
6. 名言内容用中文引号「」包围

示例格式：
{
  "quote": "「我要扼住命运的咽喉，它决不能使我完全屈服。」",
  "context": "1801年写给友人韦格勒的信",
  "background": "这句话诞生于他耳聋初现的绝望时期。当医生宣判他将逐渐失去听觉时，贝多芬在信中写道：'我时常诅咒我的生命…… 但艺术留住了我，在完成使命前我不能离开。' 他用音乐对抗生理的崩坏，在《命运交响曲》中以雷霆般的节奏诠释了这句宣言 —— 即便命运如重锤落下，也要以意志的利刃劈开困局。",
  "achievements": "路德维希·范·贝多芬（1770-1827），德国作曲家，古典音乐向浪漫主义过渡的关键人物。创作了9部交响曲、32首钢琴奏鸣曲、16首弦乐四重奏等不朽作品。代表作包括《命运交响曲》《月光奏鸣曲》《第九交响曲》等。尽管晚年失聪，仍坚持创作，其音乐作品深刻影响了后世音乐发展，被誉为音乐史上最伟大的作曲家之一。"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI返回内容为空');
    }
    console.log('AI返回的名言:', response);
    
    // 解析JSON
    try {
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonMatches = cleanedResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonMatches && jsonMatches.length > 0) {
        const jsonStr = jsonMatches[0];
        const quoteData = JSON.parse(jsonStr);
        quoteData.author = celebrity;
        
        // 验证必要字段
        if (!quoteData.quote || !quoteData.context || !quoteData.background || !quoteData.achievements) {
          throw new Error('AI返回数据不完整');
        }
        
        console.log('✅ 成功获取名言');
        return quoteData;
      } else {
        throw new Error('无法找到JSON格式');
      }
    } catch (parseError) {
      console.error('解析名言失败:', parseError);
      throw new Error('AI返回格式错误');
    }
    
  } catch (error) {
    console.error(`获取${celebrity}名言失败:`, error);
    throw error;
  }
}

// 名人名言数据库 (作为AI生成失败的备用方案)
const quotesDatabase = [
  {
    author: "贝多芬",
    quote: "我要扼住命运的咽喉，它决不能使我完全屈服。",
    context: "1801年写给友人韦格勒的信",
    background: "这句话诞生于他耳聋初现的绝望时期。当医生宣判他将逐渐失去听觉时，贝多芬在信中写道：'我时常诅咒我的生命…… 但艺术留住了我，在完成使命前我不能离开。' 他用音乐对抗生理的崩坏，在《命运交响曲》中以雷霆般的节奏诠释了这句宣言 —— 即便命运如重锤落下，也要以意志的利刃劈开困局。",
    achievements: "路德维希·范·贝多芬（1770-1827），德国作曲家，古典音乐向浪漫主义过渡的关键人物。创作了9部交响曲、32首钢琴奏鸣曲、16首弦乐四重奏等不朽作品。代表作包括《命运交响曲》《月光奏鸣曲》《第九交响曲》等。尽管晚年失聪，仍坚持创作，其音乐作品深刻影响了后世音乐发展，被誉为音乐史上最伟大的作曲家之一。"
  },
  {
    author: "爱因斯坦",
    quote: "想象力比知识更重要，因为知识是有限的，而想象力概括着世界的一切。",
    context: "1929年接受采访时所说",
    background: "爱因斯坦在普林斯顿大学任教期间，经常强调创造性思维的重要性。他认为，正是想象力推动着科学的发展，从相对论到量子力学，每一个重大发现都源于对未知世界的想象。这句话激励了无数科学家和普通人，要敢于突破常规思维，用想象力探索无限可能。",
    achievements: "阿尔伯特·爱因斯坦（1879-1955），德裔美国物理学家，现代物理学之父。创立了狭义相对论和广义相对论，解释了光电效应并因此获得1921年诺贝尔物理学奖。其质能方程E=mc²成为最著名的科学公式。爱因斯坦的贡献不仅改变了物理学，更深刻影响了人类对宇宙的认知，被誉为20世纪最伟大的科学家。"
  },
  {
    author: "达芬奇",
    quote: "学习永远不会使心灵疲倦。",
    context: "出自《达芬奇手稿》",
    background: "达芬奇一生都在学习，从绘画到解剖学，从工程学到天文学。他认为学习是生命中最美好的事情，能够不断充实心灵。这句话体现了文艺复兴时期人文主义的精神，鼓励人们终身学习，永远保持对世界的好奇心和探索欲。",
    achievements: "列奥纳多·达·芬奇（1452-1519），意大利文艺复兴时期的天才艺术家、科学家、发明家。创作了《蒙娜丽莎》《最后的晚餐》等不朽画作，在解剖学、工程学、天文学等领域都有重要发现。其手稿包含飞行器、潜水艇等超前设计，体现了人类历史上罕见的跨领域天才，被誉为文艺复兴时期最杰出的代表人物。"
  },
  {
    author: "莎士比亚",
    quote: "生存还是毁灭，这是一个值得考虑的问题。",
    context: "《哈姆雷特》第三幕第一场",
    background: "这是哈姆雷特王子在思考人生意义时的独白。面对父亲的死亡和母亲的背叛，哈姆雷特陷入了深刻的哲学思考。这句话不仅是对个人命运的思考，更是对人类存在意义的终极追问，成为文学史上最著名的独白之一。",
    achievements: "威廉·莎士比亚（1564-1616），英国文学史上最伟大的剧作家和诗人。创作了37部戏剧和154首十四行诗，代表作包括《哈姆雷特》《罗密欧与朱丽叶》《麦克白》等。其作品深刻探讨人性、爱情、权力等永恒主题，语言优美，影响深远。莎士比亚被誉为英语文学之父，其作品被翻译成多种语言，至今仍在全球范围内演出和研究。"
  },
  {
    author: "牛顿",
    quote: "如果我看得更远，那是因为我站在巨人的肩膀上。",
    context: "1676年写给胡克的信",
    background: "牛顿在信中谦逊地表达了对前人的敬意。尽管他与胡克在光学理论上有分歧，但他承认自己的成就是建立在伽利略、开普勒等前辈的基础之上。这句话体现了科学精神的传承性，提醒我们要尊重前人的贡献，同时也要为后人铺路。",
    achievements: "艾萨克·牛顿（1643-1727），英国物理学家、数学家、天文学家。创立经典力学，提出万有引力定律和牛顿运动定律，发明微积分，并对光学做出卓越贡献。著有《自然哲学的数学原理》，被誉为人类历史上最伟大的科学家之一，其理论体系深刻影响了科学和哲学发展。"
  }
];

// 获取随机名人名言，确保不重复
function getRandomQuote(usedQuotesFromClient: string[] = []): typeof quotesDatabase[0] {
  // 过滤掉已使用的名言
  const availableQuotes = quotesDatabase.filter(quote => {
    return !usedQuotesFromClient.some(usedAuthor => isDuplicateName(usedAuthor, quote.author));
  });
  
  // 如果没有可用的名言了，重置
  if (availableQuotes.length === 0) {
    const randomIndex = Math.floor(Math.random() * quotesDatabase.length);
    return quotesDatabase[randomIndex];
  }

  // 随机选择一个可用的名言
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  return availableQuotes[randomIndex];
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求体中的已使用名言信息
    const body = await request.json();
    const usedQuotesFromClient = body.usedQuotes || [];
    
    console.log('=== API请求开始 ===');
    console.log('请求时间:', new Date().toISOString());
    
    // 获取服务器端已使用名人列表
    const serverUsedCelebrities = await getUsedCelebrities();
    console.log('服务器端已使用名人列表:', serverUsedCelebrities);
    console.log('服务器端已使用名人数量:', serverUsedCelebrities.length);
    
    // 合并客户端和服务器端的已使用名人列表
    const allUsedCelebrities = Array.from(new Set([...usedQuotesFromClient, ...serverUsedCelebrities]));
    console.log('合并后已使用名人列表:', allUsedCelebrities);
    console.log('合并后已使用名人数量:', allUsedCelebrities.length);
    
    // 获取当前名人队列
    let celebritiesQueue = await getCelebritiesQueue();
    console.log('当前名人队列长度:', celebritiesQueue.length);
    
    // 如果队列为空或不足，批量获取新名人
    if (celebritiesQueue.length === 0) {
      console.log('名人队列为空，开始批量获取...');
      
      let batchAttemptCount = 0;
      const maxBatchAttempts = 2;
      
      while (batchAttemptCount < maxBatchAttempts && celebritiesQueue.length === 0) {
        batchAttemptCount++;
        console.log(`\n--- 第${batchAttemptCount}次批量获取名人 ---`);
        
        try {
          celebritiesQueue = await getBatchCelebrities(allUsedCelebrities);
          await saveCelebritiesQueue(celebritiesQueue);
          console.log(`✅ 成功获取 ${celebritiesQueue.length} 个名人`);
          break;
        } catch (batchError) {
          const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
          console.error(`❌ 批量获取名人失败 (尝试 ${batchAttemptCount}/${maxBatchAttempts}):`, errorMessage);
          
          if (batchAttemptCount >= maxBatchAttempts) {
            console.log('❌ 批量获取名人达到最大重试次数，将使用备用方案');
            break;
          }
          
          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // 如果批量获取失败，使用备用方案
    if (celebritiesQueue.length === 0) {
      console.log('\n=== 使用备用方案 ===');
      
      try {
        const quoteData = getRandomQuote(allUsedCelebrities);
        const quote = {
          id: Date.now().toString(),
          quote: quoteData.quote,
          author: quoteData.author,
          context: quoteData.context,
          background: quoteData.background,
          achievements: quoteData.achievements,
          timestamp: Date.now(),
          index: -1
        };
        
        // 将备用方案的名人也添加到已使用列表
        await addUsedCelebrity(quoteData.author);
        
        console.log('备用方案成功:', quote);
        return NextResponse.json(quote);
      } catch (fallbackError) {
        console.error('备用方案也失败:', fallbackError);
        
        // 最后的备用方案
        const fallbackQuote = {
          id: Date.now().toString(),
          quote: "失败是成功之母",
          author: "爱迪生",
          context: "出自爱迪生的实验室笔记",
          background: "爱迪生在发明电灯泡的过程中经历了数千次失败。当被问及如何看待这些失败时，他说出了这句名言。这句话体现了爱迪生对失败的积极态度，认为每一次失败都是向成功迈进的一步。这种坚持不懈的精神激励了无数后来者，成为面对挫折时的座右铭。",
          achievements: "托马斯·爱迪生（1847-1931），美国发明家、企业家。拥有1093项专利，被誉为'发明大王'。主要发明包括电灯泡、留声机、电影摄影机等，深刻改变了人类生活。他建立了世界上第一个工业研究实验室，开创了现代研发模式。爱迪生的创新精神和坚持不懈的品质成为企业家和发明家的典范。",
          timestamp: Date.now(),
          index: -1
        };
        
        console.log('使用最终备用方案:', fallbackQuote);
        return NextResponse.json(fallbackQuote);
      }
    }
    
    // 从队列中取出第一个名人
    const selectedCelebrity = celebritiesQueue.shift();
    
    if (!selectedCelebrity) {
      throw new Error('名人队列为空');
    }
    
    await saveCelebritiesQueue(celebritiesQueue);
    console.log(`选择名人: ${selectedCelebrity}`);
    
    // 将选中的名人添加到服务器端已使用列表
    await addUsedCelebrity(selectedCelebrity);
    
    // 更新合并后的已使用名人列表
    const updatedUsedQuotes = [...allUsedCelebrities, selectedCelebrity];
    console.log('更新已使用名人列表:', updatedUsedQuotes);
    
    // 获取该名人的名言
    let quoteData = null;
    let quoteAttemptCount = 0;
    const maxQuoteAttempts = 3;
    
    while (quoteAttemptCount < maxQuoteAttempts && !quoteData) {
      quoteAttemptCount++;
      
      try {
        quoteData = await getCelebrityQuote(selectedCelebrity);
        break; // 成功获取，跳出循环
      } catch (quoteError) {
        const errorMessage = quoteError instanceof Error ? quoteError.message : String(quoteError);
        console.error(`❌ 获取名言失败 (尝试 ${quoteAttemptCount}/${maxQuoteAttempts}):`, errorMessage);
        
        if (quoteAttemptCount >= maxQuoteAttempts) {
          console.log('❌ 获取名言达到最大重试次数');
          break;
        }
        
        // 等待一段时间再重试
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 如果获取名言成功，返回结果
    if (quoteData) {
      const quote = {
        id: Date.now().toString(),
        quote: quoteData.quote,
        author: quoteData.author,
        context: quoteData.context,
        background: quoteData.background,
        achievements: quoteData.achievements,
        timestamp: Date.now(),
        index: -1
      };

      console.log('=== API请求成功 ===');
      console.log('最终返回结果:', quote);
      return NextResponse.json(quote);
    }
    
    // 如果获取名言失败，使用备用方案
    console.log('\n=== 名言获取失败，使用备用方案 ===');
    
    try {
      const quoteData = getRandomQuote(updatedUsedQuotes);
      const quote = {
        id: Date.now().toString(),
        quote: quoteData.quote,
        author: quoteData.author,
        context: quoteData.context,
        background: quoteData.background,
        achievements: quoteData.achievements,
        timestamp: Date.now(),
        index: -1
      };
      
      console.log('备用方案成功:', quote);
      return NextResponse.json(quote);
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError);
      
      // 最后的备用方案
      const fallbackQuote = {
        id: Date.now().toString(),
        quote: "失败是成功之母",
        author: "爱迪生",
        context: "出自爱迪生的实验室笔记",
        background: "爱迪生在发明电灯泡的过程中经历了数千次失败。当被问及如何看待这些失败时，他说出了这句名言。这句话体现了爱迪生对失败的积极态度，认为每一次失败都是向成功迈进的一步。这种坚持不懈的精神激励了无数后来者，成为面对挫折时的座右铭。",
        achievements: "托马斯·爱迪生（1847-1931），美国发明家、企业家。拥有1093项专利，被誉为'发明大王'。主要发明包括电灯泡、留声机、电影摄影机等，深刻改变了人类生活。他建立了世界上第一个工业研究实验室，开创了现代研发模式。爱迪生的创新精神和坚持不懈的品质成为企业家和发明家的典范。",
        timestamp: Date.now(),
        index: -1
      };
      
      console.log('使用最终备用方案:', fallbackQuote);
      return NextResponse.json(fallbackQuote);
    }
    
  } catch (error) {
    console.error('=== API请求出错 ===');
    console.error('错误详情:', error);
    
    // 最后的备用方案
    const fallbackQuote = {
      id: Date.now().toString(),
      quote: "失败是成功之母",
      author: "爱迪生",
      context: "出自爱迪生的实验室笔记",
      background: "爱迪生在发明电灯泡的过程中经历了数千次失败。当被问及如何看待这些失败时，他说出了这句名言。这句话体现了爱迪生对失败的积极态度，认为每一次失败都是向成功迈进的一步。这种坚持不懈的精神激励了无数后来者，成为面对挫折时的座右铭。",
      achievements: "托马斯·爱迪生（1847-1931），美国发明家、企业家。拥有1093项专利，被誉为'发明大王'。主要发明包括电灯泡、留声机、电影摄影机等，深刻改变了人类生活。他建立了世界上第一个工业研究实验室，开创了现代研发模式。爱迪生的创新精神和坚持不懈的品质成为企业家和发明家的典范。",
      timestamp: Date.now(),
      index: -1
    };
    
    console.log('使用最终备用方案:', fallbackQuote);
    return NextResponse.json(fallbackQuote);
  }
}