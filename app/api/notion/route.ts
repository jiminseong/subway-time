import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route  
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pageId = searchParams.get('pageId');
    const notionToken = process.env.NOTION_API_KEY;

    if (!notionToken) {
      return NextResponse.json(
        { error: 'Notion API key not found' },
        { status: 500 }
      );
    }

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Notion API를 통해 페이지 데이터 가져오기
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Notion page' },
        { status: response.status }
      );
    }

    const pageData = await response.json();

    // 페이지 블록 내용 가져오기
    const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!blocksResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Notion blocks' },
        { status: blocksResponse.status }
      );
    }

    const blocksData = await blocksResponse.json();

    // 제목 추출
    const title = extractTitle(pageData);
    
    // 블록 내용을 학습 카드 형태로 변환
    const learningContent = transformBlocksToLearningContent(blocksData.results);

    const result = {
      id: pageId,
      source: "notion" as const,
      sourceLabel: "Notion",
      title: title || "Untitled Page",
      summary: generateSummary(learningContent),
      estimatedMinutes: calculateEstimatedMinutes(learningContent),
      tags: extractTags(pageData, learningContent),
      url: getPageUrl(pageData),
      content: learningContent,
      lastModified: pageData.last_edited_time,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching Notion data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractTitle(pageData: any): string {
  // 페이지 제목 추출 로직
  const properties = pageData.properties;
  
  // 타이틀 속성 찾기
  const titleProperty = Object.values(properties).find((prop: any) => 
    prop.type === 'title'
  ) as any;

  if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
    return titleProperty.title.map((item: any) => item.plain_text).join('');
  }

  return "Untitled Page";
}

function transformBlocksToLearningContent(blocks: any[]): Array<{
  type: "section" | "code";
  title: string;
  items?: string[];
  content?: string;
}> {
  const content: Array<{
    type: "section" | "code";
    title: string;
    items?: string[];
    content?: string;
  }> = [];

  let currentSection: {
    type: "section" | "code";
    title: string;
    items?: string[];
    content?: string;
  } | null = null;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        // 현재 섹션이 있으면 저장
        if (currentSection) {
          content.push(currentSection);
        }
        
        // 새 섹션 시작
        currentSection = {
          type: "section",
          title: extractTextFromRichText(block[block.type].rich_text),
          items: []
        };
        break;

      case 'bulleted_list_item':
      case 'numbered_list_item':
        const text = extractTextFromRichText(block[block.type].rich_text);
        if (currentSection) {
          currentSection.items = currentSection.items || [];
          currentSection.items.push(text);
        } else {
          // 섹션 없이 리스트가 시작된 경우 기본 섹션 생성
          currentSection = {
            type: "section",
            title: "주요 내용",
            items: [text]
          };
        }
        break;

      case 'code':
        // 현재 섹션이 있으면 저장
        if (currentSection) {
          content.push(currentSection);
        }

        const codeContent = block.code.rich_text.map((item: any) => item.plain_text).join('');
        content.push({
          type: "code",
          title: block.code.caption.length > 0 
            ? extractTextFromRichText(block.code.caption)
            : "코드 예시",
          content: codeContent
        });

        currentSection = null;
        break;

      case 'paragraph':
        const paragraphText = extractTextFromRichText(block.paragraph.rich_text);
        if (paragraphText.trim()) {
          if (currentSection) {
            currentSection.items = currentSection.items || [];
            currentSection.items.push(paragraphText);
          } else {
            // 단독 문단의 경우 기본 섹션으로 처리
            currentSection = {
              type: "section", 
              title: "개요",
              items: [paragraphText]
            };
          }
        }
        break;
    }
  }

  // 마지막 섹션 저장
  if (currentSection) {
    content.push(currentSection);
  }

  return content;
}

function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map(item => item.plain_text).join('');
}

function generateSummary(content: any[]): string {
  // 첫 번째 섹션의 첫 번째 아이템을 요약으로 사용하거나 기본 요약 생성
  if (content.length > 0 && content[0].items && content[0].items.length > 0) {
    const firstItem = content[0].items[0];
    return firstItem.length > 150 ? firstItem.substring(0, 147) + '...' : firstItem;
  }
  return "Notion에서 가져온 학습 자료입니다. 실제 업무에 도움이 되는 내용들을 정리했어요.";
}

function calculateEstimatedMinutes(content: any[]): number {
  // 내용 길이에 따른 예상 소요 시간 계산 (대략적)
  let totalItems = 0;
  let totalCodeBlocks = 0;

  content.forEach(section => {
    if (section.type === 'section' && section.items) {
      totalItems += section.items.length;
    } else if (section.type === 'code') {
      totalCodeBlocks++;
    }
  });

  // 아이템 당 30초, 코드 블록 당 2분 가정
  const estimatedMinutes = Math.ceil((totalItems * 0.5) + (totalCodeBlocks * 2));
  return Math.max(3, Math.min(estimatedMinutes, 30)); // 3분~30분 범위
}

function extractTags(pageData: any, content: any[]): string[] {
  const tags = ["Notion", "업무자료"];
  
  // 페이지 속성에서 태그 추출
  const properties = pageData.properties;
  
  // Tags 또는 Select 속성 찾기
  Object.values(properties).forEach((prop: any) => {
    if (prop.type === 'multi_select' && prop.multi_select) {
      prop.multi_select.forEach((option: any) => {
        tags.push(option.name);
      });
    } else if (prop.type === 'select' && prop.select) {
      tags.push(prop.select.name);
    }
  });

  return Array.from(new Set(tags)); // 중복 제거
}

function getPageUrl(pageData: any): string {
  // Notion 페이지 URL 생성
  const pageId = pageData.id.replace(/-/g, '');
  return `https://notion.so/${pageId}`;
}