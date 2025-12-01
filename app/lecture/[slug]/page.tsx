"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Tag,
  CheckCircle,
  Circle,
  Bookmark,
  Share,
  Eye,
  Timer,
  Target,
} from "lucide-react";
import { type LearningPack } from "../../../lib/learningPacks";

interface ContentSection {
  type: "section" | "code";
  title: string;
  items?: string[];
  content?: string;
}

interface LectureContent {
  id: string;
  source: string;
  sourceLabel: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  tags: string[];
  url?: string;
  content: ContentSection[];
}

// 더미 데이터에서 실제 학습 내용들
const LECTURE_CONTENT: Record<string, LectureContent> = {
  "gn-1": {
    id: "gn-1",
    source: "geeknews",
    sourceLabel: "GeekNews",
    title: "React 19에서 바뀌는 것들 정리",
    summary:
      "올해 React 19 릴리즈에서 바뀌는 주요 포인트를 한 번에 정리한 글입니다. concurrent features, actions, form 처리 등 실제 업무에 영향을 줄 만한 내용을 빠르게 훑어볼 수 있어요.",
    estimatedMinutes: 7,
    tags: ["React", "업무연결"],
    url: "https://news.hada.io",
    content: [
      {
        type: "section",
        title: "주요 변경사항 개요",
        items: [
          "React Compiler 정식 출시",
          "Server Components 안정화",
          "Concurrent Features 개선",
          "Actions API 정식 도입",
        ],
      },
      {
        type: "section",
        title: "실무에서 바로 적용 가능한 기능들",
        items: [
          "useActionState로 form 상태 관리 간소화",
          "Server Actions를 통한 데이터 변경",
          "Suspense boundary 개선",
          "자동 최적화를 위한 컴파일러 활용",
        ],
      },
      {
        type: "code",
        title: "Actions 사용 예시",
        content: `// 기존 방식
const [pending, setPending] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (formData) => {
  setPending(true);
  try {
    await submitForm(formData);
  } catch (err) {
    setError(err);
  } finally {
    setPending(false);
  }
};

// React 19 방식
const [state, submitAction] = useActionState(async (prevState, formData) => {
  try {
    await submitForm(formData);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}, { success: false });`,
      },
      {
        type: "section",
        title: "마이그레이션 체크리스트",
        items: [
          "기존 form 핸들링 코드 점검",
          "Server Components 도입 계획 수립",
          "React Compiler 적용 준비",
          "의존성 업데이트 일정 조율",
        ],
      },
    ],
  },
  "docs-1": {
    id: "docs-1",
    source: "docs",
    sourceLabel: "Docs",
    title: "React 공식 문서 - Thinking in React",
    summary:
      "React 방식으로 컴포넌트를 쪼개고, 상태를 어디에 둘지 결정하는 과정을 단계별로 설명합니다. 실제로 지금 하고 있는 컴포넌트 구조를 떠올리면서 읽어보면 좋아요.",
    estimatedMinutes: 10,
    tags: ["React", "공식문서"],
    url: "https://react.dev/learn/thinking-in-react",
    content: [
      {
        type: "section",
        title: "1단계: UI를 컴포넌트 계층으로 나누기",
        items: [
          "단일 책임 원칙 적용하기",
          "정보 구조에 따라 컴포넌트 분리",
          "재사용성을 고려한 경계 설정",
          "컴포넌트 이름 정하기",
        ],
      },
      {
        type: "section",
        title: "2단계: 정적 버전 만들기",
        items: [
          "상호작용 없이 UI만 렌더링",
          "props를 통한 데이터 전달",
          "state 사용하지 않기",
          "하향식 vs 상향식 개발",
        ],
      },
      {
        type: "code",
        title: "컴포넌트 구조 예시",
        content: `// 제품 목록 앱의 컴포넌트 구조
function ProductTable({ products, filterText, inStockOnly }) {
  const rows = [];
  let lastCategory = null;

  products.forEach((product) => {
    if (product.name.toLowerCase().indexOf(filterText.toLowerCase()) === -1) {
      return;
    }
    if (inStockOnly && !product.stocked) {
      return;
    }
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category} />
      );
    }
    rows.push(
      <ProductRow
        product={product}
        key={product.name} />
    );
    lastCategory = product.category;
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}`,
      },
      {
        type: "section",
        title: "3단계: 최소한의 완전한 UI 상태 찾기",
        items: [
          "시간이 지나도 변하지 않는다면 state가 아님",
          "props로 전달된다면 state가 아님",
          "기존 state나 props로 계산 가능하다면 state가 아님",
          "DRY 원칙 적용하기",
        ],
      },
      {
        type: "section",
        title: "4단계: state가 어디에 있어야 하는지 결정하기",
        items: [
          "해당 state를 기반으로 렌더링하는 모든 컴포넌트 찾기",
          "공통 부모 컴포넌트 찾기",
          "적절한 위치에 state 배치",
          "필요시 새로운 컴포넌트 생성",
        ],
      },
    ],
  },
  "notion-1": {
    id: "notion-1",
    source: "notion",
    sourceLabel: "업무 로그",
    title: "최근 작업한 i18n 이슈 복습",
    summary:
      "최근 Notion 업무일지에서 언급된 다국어(i18n) 관련 이슈를 기반으로, 다시 보면 좋을만한 레퍼런스와 체크리스트를 묶어둔 카드입니다. 다음 번 이슈 때 더 빠르게 대응할 수 있도록 돕습니다.",
    estimatedMinutes: 6,
    tags: ["i18n", "업무복습"],
    url: "https://notion.so/workspace",
    content: [
      {
        type: "section",
        title: "지난주 이슈 요약",
        items: [
          "한국어 폰트 깨짐 현상 (fallback 설정 누락)",
          "날짜 형식 locale 별 차이 처리",
          "RTL 언어 지원을 위한 CSS 수정",
          "번역 키 네이밍 컨벤션 정리",
        ],
      },
      {
        type: "section",
        title: "해결 방법 체크리스트",
        items: [
          "font-family에 적절한 fallback 추가",
          "Intl.DateTimeFormat 사용하여 날짜 포맷팅",
          "CSS logical properties로 방향성 대응",
          "i18n 키는 feature.component.element 구조로 통일",
        ],
      },
      {
        type: "code",
        title: "폰트 fallback 설정",
        content: `/* 개선 전 */
.title {
  font-family: 'Pretendard';
}

/* 개선 후 */ 
.title {
  font-family: 
    'Pretendard', 
    -apple-system, 
    BlinkMacSystemFont, 
    system-ui, 
    sans-serif;
}`,
      },
      {
        type: "code",
        title: "날짜 로케일 처리",
        content: `// 로케일별 날짜 포맷팅
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }).format(date);
};

// 사용 예시
formatDate(new Date(), 'ko-KR'); // 2024년 12월 1일
formatDate(new Date(), 'en-US'); // December 1, 2024`,
      },
      {
        type: "section",
        title: "다음 작업 시 주의사항",
        items: [
          "새로운 텍스트 추가 시 바로 i18n 키로 등록",
          "이미지나 아이콘에도 alt 텍스트 다국어 지원",
          "CSS에서 하드코딩된 width 값 확인",
          "QA 단계에서 다른 언어로도 테스트",
        ],
      },
    ],
  },
  "docs-2": {
    id: "docs-2",
    source: "docs",
    sourceLabel: "Docs",
    title: "TypeScript Handbook - Generics 개념 잡기",
    summary:
      "제네릭 타입의 기본 개념과 실제 코드에서 어떻게 사용하는지 예제로 설명합니다. 복잡한 유틸 타입을 읽을 때 막혔던 부분을 해소하는 데 도움이 됩니다.",
    estimatedMinutes: 8,
    tags: ["TypeScript", "기초다지기"],
    url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
    content: [
      {
        type: "section",
        title: "제네릭이 필요한 이유",
        items: [
          "타입의 재사용성 확보",
          "any 타입 사용으로 인한 타입 안전성 손실 방지",
          "컴파일 타임 타입 체킹 활용",
          "코드의 가독성과 유지보수성 향상",
        ],
      },
      {
        type: "code",
        title: "기본 제네릭 함수",
        content: `// 제네릭 없이 (any 사용)
function identity(arg: any): any {
  return arg;
}

// 제네릭 사용
function identity<T>(arg: T): T {
  return arg;
}

// 사용 예시
let output = identity<string>("myString");  // 타입: string
let output2 = identity("myString");         // 타입 추론: string`,
      },
      {
        type: "section",
        title: "제네릭 제약 조건 (Generic Constraints)",
        items: [
          "extends 키워드로 타입 제한",
          "keyof 연산자와 조합",
          "조건부 타입과의 연계",
          "실용적인 제약 조건 패턴들",
        ],
      },
      {
        type: "code",
        title: "제네릭 제약 조건 예시",
        content: `// 기본 제약 조건
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);  // .length 프로퍼티 존재 보장
  return arg;
}

// keyof 제약 조건
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person = { name: "John", age: 30 };
let name = getProperty(person, "name"); // 타입: string
let age = getProperty(person, "age");   // 타입: number`,
      },
      {
        type: "section",
        title: "실무에서 자주 사용하는 제네릭 패턴",
        items: [
          "Promise<T>와 비동기 처리",
          "Array<T> 조작 함수들",
          "React의 Component<Props> 타입",
          "API 응답 타입 정의",
        ],
      },
      {
        type: "code",
        title: "실무 활용 예시",
        content: `// API 응답 래퍼
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 사용
type UserResponse = ApiResponse<User>;
type ProductListResponse = ApiResponse<Product[]>;

// React 컴포넌트 props
interface ListProps<T> {
  items: T[];
  onItemClick: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, onItemClick, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index} onClick={() => onItemClick(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}`,
      },
    ],
  },
};

interface LecturePageProps {
  params: { slug: string };
}

export default function LecturePage({ params }: LecturePageProps) {
  const router = useRouter();
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBookmarked, setIsBookmarked] = useState(false);

  const lecture = LECTURE_CONTENT[params.slug as keyof typeof LECTURE_CONTENT];

  useMemo(() => {
    if (!startTime) {
      setStartTime(new Date());
    }
  }, [startTime]);

  useMemo(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!lecture) {
    return (
      <div className="lecture-page">
        <div className="lecture-error">
          <h1 className="lecture-error-title">강의를 찾을 수 없습니다</h1>
          <button
            onClick={() => router.back()}
            className="lecture-error-btn"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const elapsedTime = startTime
    ? Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60)
    : 0;

  const progress = (completedSections.size / (lecture.content?.length || 1)) * 100;

  const toggleSection = (index: number) => {
    const newCompleted = new Set(completedSections);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSections(newCompleted);
  };



  return (
    <div className="lecture-page">
      {/* Header */}
      <div className="lecture-header">
        <div className="lecture-header-content">
          <div className="lecture-header-row">
            <div className="lecture-nav">
              <button
                onClick={() => router.back()}
                className="lecture-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="lecture-meta">
                <span className={`lecture-source lecture-source--${lecture.source}`}>
                  {lecture.sourceLabel}
                </span>
                <div className="lecture-time">
                  <Timer className="w-4 h-4" />
                  <span>
                    {elapsedTime}분 / {lecture.estimatedMinutes}분
                  </span>
                </div>
              </div>
            </div>
            <div className="lecture-actions">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`lecture-action-btn ${isBookmarked ? 'lecture-action-btn--bookmarked' : ''}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
              <button className="lecture-action-btn">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="lecture-progress-bar">
        <div className="lecture-progress-content">
          <div className="lecture-progress-row">
            <div className="lecture-progress-track-container">
              <div className="lecture-progress-track">
                <motion.div
                  className="lecture-progress-fill"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <span className="lecture-progress-text">{Math.round(progress)}% 완료</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lecture-content">
        {/* Title Section */}
        <div className="lecture-title-section">
          <div className="lecture-tags">
            {lecture.tags?.map((tag) => (
              <span key={tag} className="lecture-tag">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
          <h1 className="lecture-title">{lecture.title}</h1>
          <p className="lecture-summary">{lecture.summary}</p>
          <div className="lecture-info-row">
            <div className="lecture-meta-info">
              <span className="lecture-duration">
                <Clock className="w-4 h-4" />약 {lecture.estimatedMinutes}분 소요
              </span>
              <span className="lecture-completion">
                <Target className="w-4 h-4" />
                {completedSections.size} / {lecture.content?.length || 0} 완료
              </span>
            </div>
            {lecture.url && (
              <a
                href={lecture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lecture-external-link"
              >
                원문 보기
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {lecture.content?.map((section, index) => (
            <motion.div
              key={index}
              className="lecture-section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="lecture-section-content">
                <div className="lecture-section-row">
                  <button
                    onClick={() => toggleSection(index)}
                    className="lecture-section-toggle"
                  >
                    {completedSections.has(index) ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="lecture-section-title">{section.title}</h3>

                    {section.type === "section" && section.items && (
                      <ul className="lecture-section-list">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <div className="lecture-section-bullet" />
                            <span className="lecture-section-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.type === "code" && section.content && (
                      <div className="lecture-code-block">
                        <pre>
                          <code>{section.content}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Completion */}
        {progress === 100 && (
          <motion.div
            className="lecture-completion-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="lecture-completion-title">학습 완료!</h3>
            <p className="lecture-completion-text">
              총 {elapsedTime}분 동안 학습하셨습니다. 수고하셨어요! 🎉
            </p>
            <button
              onClick={() => router.back()}
              className="lecture-completion-btn"
            >
              돌아가기
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
