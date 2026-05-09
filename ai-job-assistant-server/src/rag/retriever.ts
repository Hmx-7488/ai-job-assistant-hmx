import { interviewKnowledgeBase } from './interviewKnowledgeBase';

export interface RetrievedKnowledge {
  id: string;
  title: string;
  content: string;
  score: number;
  matchedKeywords: string[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，.。;；:：/\\|、()（）[\]【】"'“”]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function retrieveKnowledge(query: string, topK = 4): RetrievedKnowledge[] {
  const queryKeywords = Array.from(new Set(tokenize(query)));

  return interviewKnowledgeBase
    .map((item) => {
      const searchableText = `${item.title} ${item.content}`.toLowerCase();

      const matchedKeywords = queryKeywords.filter((keyword) =>
        searchableText.includes(keyword)
      );

      return {
        ...item,
        score: matchedKeywords.length,
        matchedKeywords,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function formatRetrievedKnowledge(items: RetrievedKnowledge[]): string {
  if (!items.length) {
    return '暂无检索到的补充知识。';
  }

  return items
    .map((item, index) => {
      return [
        `${index + 1}. ${item.title}`,
        `内容：${item.content}`,
        `命中关键词：${item.matchedKeywords.join('、') || '无'}`,
      ].join('\n');
    })
    .join('\n\n');
}
