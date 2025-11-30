export type PackSource = "geeknews" | "docs" | "notion";

export interface LearningPack {
  id: string;
  source: PackSource;
  sourceLabel: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  tags: string[];
  url?: string;
}

const BASE_PACKS: LearningPack[] = [
  {
    id: "gn-1",
    source: "geeknews",
    sourceLabel: "GeekNews",
    title: "React 19에서 바뀌는 것들 정리",
    summary:
      "올해 React 19 릴리즈에서 바뀌는 주요 포인트를 한 번에 정리한 글입니다. concurrent features, actions, form 처리 등 실제 업무에 영향을 줄 만한 내용을 빠르게 훑어볼 수 있어요.",
    estimatedMinutes: 7,
    tags: ["React", "업무연결"],
    url: "https://news.hada.io"
  },
  {
    id: "docs-1",
    source: "docs",
    sourceLabel: "Docs",
    title: "React 공식 문서 - Thinking in React",
    summary:
      "React 방식으로 컴포넌트를 쪼개고, 상태를 어디에 둘지 결정하는 과정을 단계별로 설명합니다. 실제로 지금 하고 있는 컴포넌트 구조를 떠올리면서 읽어보면 좋아요.",
    estimatedMinutes: 10,
    tags: ["React", "공식문서"],
    url: "https://react.dev/learn/thinking-in-react"
  },
  {
    id: "notion-1",
    source: "notion",
    sourceLabel: "업무 로그",
    title: "최근 작업한 i18n 이슈 복습",
    summary:
      "최근 Notion 업무일지에서 언급된 다국어(i18n) 관련 이슈를 기반으로, 다시 보면 좋을만한 레퍼런스와 체크리스트를 묶어둔 카드입니다. 다음 번 이슈 때 더 빠르게 대응할 수 있도록 돕습니다.",
    estimatedMinutes: 6,
    tags: ["i18n", "업무복습"]
  },
  {
    id: "docs-2",
    source: "docs",
    sourceLabel: "Docs",
    title: "TypeScript Handbook - Generics 개념 잡기",
    summary:
      "제네릭 타입의 기본 개념과 실제 코드에서 어떻게 사용하는지 예제로 설명합니다. 복잡한 유틸 타입을 읽을 때 막혔던 부분을 해소하는 데 도움이 됩니다.",
    estimatedMinutes: 8,
    tags: ["TypeScript", "기초다지기"],
    url: "https://www.typescriptlang.org/docs/handbook/2/generics.html"
  }
];

export function generateDummyPacks(
  availableMinutes: number
): LearningPack[] {
  const sorted = [...BASE_PACKS].sort(
    (a, b) => a.estimatedMinutes - b.estimatedMinutes
  );

  const result: LearningPack[] = [];
  let usedMinutes = 0;

  for (const pack of sorted) {
    if (usedMinutes + pack.estimatedMinutes <= availableMinutes) {
      result.push(pack);
      usedMinutes += pack.estimatedMinutes;
    }
  }

  if (result.length === 0) {
    return sorted.slice(0, 1);
  }

  return result;
}

// Notion API로부터 학습 팩 생성
export async function fetchNotionLearningPack(pageId: string): Promise<LearningPack | null> {
  try {
    const response = await fetch(`/api/notion?pageId=${pageId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch Notion data:', response.statusText);
      return null;
    }

    const notionData = await response.json();
    
    // Notion 데이터를 LearningPack 형태로 변환
    const learningPack: LearningPack = {
      id: `notion-${pageId}`,
      source: "notion",
      sourceLabel: "Notion",
      title: notionData.title,
      summary: notionData.summary,
      estimatedMinutes: notionData.estimatedMinutes,
      tags: notionData.tags,
      url: notionData.url
    };

    return learningPack;
  } catch (error) {
    console.error('Error fetching Notion learning pack:', error);
    return null;
  }
}

// 여러 Notion 페이지를 동시에 가져오기
export async function fetchMultipleNotionPacks(pageIds: string[]): Promise<LearningPack[]> {
  try {
    const promises = pageIds.map(pageId => fetchNotionLearningPack(pageId));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<LearningPack | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as LearningPack);
  } catch (error) {
    console.error('Error fetching multiple Notion packs:', error);
    return [];
  }
}

