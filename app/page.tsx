"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Clock4,
  Edit3,
  History,
  Home,
  Info,
  MapPin,
  NotebookPen,
  Pencil,
  RefreshCcw,
  Search,
  Settings,
  Sun,
  Target,
  Timer,
  Trash2,
  Wand2,
} from "lucide-react";
import { generateDummyPacks, type LearningPack } from "../lib/learningPacks";

type TimeMode = "manual" | "route";
type Tab = "home" | "record" | "settings";

const MIN_MINUTES = 10;
const MAX_MINUTES = 90;
const QUICK_MINUTES = [20, 25, 30, 35, 40];

const FREQUENT_ROUTES = [
  { id: "home-office", label: "집 → 회사", minutes: 45 },
  { id: "office-gym", label: "회사 → 헬스장", minutes: 20 },
];

const HISTORY = [
  {
    id: "oct-26-morning",
    date: "10월 26일 토요일",
    minutes: 35,
    mood: "집중도 높음",
    items: [
      { title: "JavaScript 비동기 처리 마스터하기", minutes: 25, source: "Docs" },
      { title: "CSS Flexbox 실전 레이아웃", minutes: 15, source: "Docs" },
    ],
  },
  {
    id: "oct-25-evening",
    date: "10월 25일 금요일",
    minutes: 20,
    mood: "출퇴근 지하철",
    items: [
      { title: "React 상태 관리 기초", minutes: 12, source: "GeekNews" },
      { title: "TypeScript 제네릭 스낵", minutes: 8, source: "Docs" },
    ],
  },
];

function clampMinutes(value: number) {
  return Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, Math.round(value)));
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [availableMinutes, setAvailableMinutes] = useState(35);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>("manual");
  const [draftMinutes, setDraftMinutes] = useState(availableMinutes);
  const [manualTimes, setManualTimes] = useState({
    morning: "45",
    evening: "65",
  });
  const [locations, setLocations] = useState({
    start: "",
    destination: "",
  });
  const [settingsState, setSettingsState] = useState({
    push: true,
    darkMode: true,
    reminder: true,
  });
  const [notionPageId, setNotionPageId] = useState("");
  const [isLoadingNotion, setIsLoadingNotion] = useState(false);

  const packs = useMemo<LearningPack[]>(() => {
    return generateDummyPacks(availableMinutes);
  }, [availableMinutes]);

  const today = useMemo(() => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    return { dateLabel };
  }, []);

  const greeting =
    availableMinutes >= 35 ? "오늘도 즐거운 학습!" : "지금 할 수 있는 만큼만, 꾸준히!";

  const getManualCandidate = () => {
    const parsed = [manualTimes.morning, manualTimes.evening]
      .map((value) => Number(value))
      .filter((num) => Number.isFinite(num) && num > 0);

    if (!parsed.length) return null;
    return clampMinutes(parsed[0]);
  };

  const calculateRouteMinutes = () => {
    const base =
      Math.max(locations.start.trim().length, 3) + Math.max(locations.destination.trim().length, 3);
    const estimated = clampMinutes(15 + base * 1.6);
    setDraftMinutes(estimated);
  };

  const openSheet = () => {
    setDraftMinutes(availableMinutes);
    setSheetOpen(true);
  };

  const handleSaveSheet = () => {
    let nextMinutes = draftMinutes;

    if (timeMode === "manual") {
      const manual = getManualCandidate();
      if (manual) {
        nextMinutes = manual;
        setDraftMinutes(manual);
      }
    }

    setAvailableMinutes(nextMinutes);
    setSheetOpen(false);
  };

  return (
    <div className="page">
      <div className="app-shell">
        <div className="app-screen">
          {activeTab === "home" && (
            <>
              <header className="top-bar">
                <div>
                  <div className="date-chip">
                    <CalendarDays size={16} aria-hidden />
                    <span>{today.dateLabel}</span>
                  </div>
                  <h1 className="greeting">{greeting}</h1>
                </div>
                <button
                  className="icon-button"
                  aria-label="설정 열기"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={18} aria-hidden />
                </button>
              </header>

              <section className="time-banner">
                <div className="time-banner-row">
                  <div className="time-badge">
                    <span className="icon-circle icon-circle--muted" aria-hidden>
                      <Timer size={16} />
                    </span>
                    <span>현재 이동 시간</span>
                  </div>
                  <button className="ghost-button" type="button" onClick={openSheet}>
                    <Wand2 size={16} aria-hidden />
                    <span>시간 변경</span>
                  </button>
                </div>
                <div className="time-number">
                  <strong>{availableMinutes}</strong>분
                </div>
                <p className="time-caption">지하철/버스에서 딱 이만큼 집중해봐요.</p>
                <div className="quick-chips">
                  {QUICK_MINUTES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        "quick-chip" + (availableMinutes === value ? " quick-chip--active" : "")
                      }
                      onClick={() => setAvailableMinutes(value)}
                    >
                      {value}분
                    </button>
                  ))}
                </div>
              </section>

              <section className="section">
                <div className="section-header">
                  <div>
                    <p className="section-eyebrow">오늘의 추천 학습팩</p>
                    <h2 className="section-title">지금 시간에 딱 맞는 카드들</h2>
                    <p className="section-description">
                      {availableMinutes}분 안에 끝낼 수 있는 콘텐츠만 골랐어요.
                    </p>
                  </div>
                </div>

                <div className="pack-grid">
                  {packs.map((pack) => (
                    <Link key={pack.id} href={`/lecture/${pack.id}`} className="pack-card-link">
                      <article className={`pack-card pack-card--${pack.source}`}>
                        <div className="pack-meta">
                          <span className="pack-chip">{pack.sourceLabel}</span>
                          <span className="pack-time">
                            <Clock4 size={14} aria-hidden /> 예상 {pack.estimatedMinutes}분
                          </span>
                        </div>
                        <h3 className="pack-title">{pack.title}</h3>
                        <p className="pack-summary">{pack.summary}</p>
                        <div className="pack-tags">
                          {pack.tags.map((tag) => (
                            <span key={tag} className="pack-tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "record" && (
            <div className="record-screen">
              <header className="top-bar">
                <div>
                  <div className="date-chip">
                    <History size={16} aria-hidden />
                    <span>기록</span>
                  </div>
                  <h1 className="greeting">최근 학습을 돌아봐요</h1>
                </div>
                <button className="icon-button" aria-label="새로고침">
                  <RefreshCcw size={18} aria-hidden />
                </button>
              </header>

              <div className="record-list">
                {HISTORY.map((entry) => (
                  <article key={entry.id} className="record-card">
                    <div className="record-head">
                      <div>
                        <p className="record-date">{entry.date}</p>
                        <div className="record-pill">
                          <Timer size={14} aria-hidden />
                          <span>{entry.minutes}분 학습</span>
                        </div>
                      </div>
                      <span className="record-mood">{entry.mood}</span>
                    </div>
                    <div className="record-items">
                      {entry.items.map((item, idx) => (
                        <div key={item.title + idx} className="record-item">
                          <div>
                            <p className="record-title">{item.title}</p>
                            <p className="record-meta">
                              <Clock3 size={12} aria-hidden /> {item.minutes}분 · {item.source}
                            </p>
                          </div>
                          <button className="ghost-button small" type="button">
                            <Edit3 size={14} aria-hidden /> 메모
                          </button>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-screen">
              <header className="top-bar">
                <div>
                  <div className="date-chip">
                    <Settings size={16} aria-hidden />
                    <span>설정</span>
                  </div>
                  <h1 className="greeting">내 학습 루틴 맞춤 설정</h1>
                </div>
              </header>

              <div className="settings-panel">
                <div className="settings-row">
                  <div>
                    <p className="settings-title">
                      <Bell size={14} aria-hidden /> 알림
                    </p>
                    <p className="settings-sub">매일 아침 학습팩 알림을 받아요.</p>
                  </div>
                  <button
                    className={"toggle" + (settingsState.push ? " toggle--on" : "")}
                    type="button"
                    onClick={() => setSettingsState((prev) => ({ ...prev, push: !prev.push }))}
                    aria-pressed={settingsState.push}
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <p className="settings-title">
                      <Clock4 size={14} aria-hidden /> 일일 리마인더
                    </p>
                    <p className="settings-sub">매일 {availableMinutes}분 학습 목표 리마인드.</p>
                  </div>
                  <button
                    className={"toggle" + (settingsState.reminder ? " toggle--on" : "")}
                    type="button"
                    onClick={() =>
                      setSettingsState((prev) => ({
                        ...prev,
                        reminder: !prev.reminder,
                      }))
                    }
                    aria-pressed={settingsState.reminder}
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <p className="settings-title">
                      <Sun size={14} aria-hidden /> 테마
                    </p>
                    <p className="settings-sub">어두운 화면에서 눈 피로를 줄여요.</p>
                  </div>
                  <button
                    className={"toggle" + (settingsState.darkMode ? " toggle--on" : "")}
                    type="button"
                    onClick={() =>
                      setSettingsState((prev) => ({
                        ...prev,
                        darkMode: !prev.darkMode,
                      }))
                    }
                    aria-pressed={settingsState.darkMode}
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="settings-panel">
                <div className="settings-row">
                  <div className="settings-notion">
                    <p className="settings-title">
                      <NotebookPen size={14} aria-hidden /> Notion 연동
                    </p>
                    <p className="settings-sub">Notion 페이지 ID를 입력하여 학습 자료로 가져오세요.</p>
                    <div className="notion-input-group">
                      <input
                        type="text"
                        placeholder="Notion 페이지 ID 입력"
                        value={notionPageId}
                        onChange={(e) => setNotionPageId(e.target.value)}
                        className="notion-input"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!notionPageId.trim()) return;
                          setIsLoadingNotion(true);
                          try {
                            const response = await fetch(`/api/notion?pageId=${notionPageId.trim()}`);
                            if (response.ok) {
                              const data = await response.json();
                              alert(`성공적으로 가져왔습니다: ${data.title}`);
                            } else {
                              alert('페이지를 가져올 수 없습니다. 페이지 ID와 권한을 확인해주세요.');
                            }
                          } catch (error) {
                            alert('연결 중 오류가 발생했습니다.');
                          } finally {
                            setIsLoadingNotion(false);
                          }
                        }}
                        disabled={!notionPageId.trim() || isLoadingNotion}
                        className={`notion-test-btn ${isLoadingNotion ? 'loading' : ''}`}
                      >
                        {isLoadingNotion ? '연결 중...' : '테스트'}
                      </button>
                    </div>
                    <p className="settings-help">
                      💡 Notion 페이지 URL에서 마지막 32자리 ID를 복사하세요.
                      <br />예: notion.so/workspace/페이지이름-<strong>32자리ID</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="settings-panel">
                <button className="settings-action" type="button">
                  <Search size={16} aria-hidden />
                  GeekNews 즐겨찾기 관리
                </button>
                <button className="settings-action" type="button">
                  <Info size={16} aria-hidden />
                  도움말 및 피드백
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="bottom-nav">
          <button
            className={"nav-item" + (activeTab === "home" ? " nav-item--active" : "")}
            type="button"
            onClick={() => setActiveTab("home")}
          >
            <Home size={16} aria-hidden className="nav-icon" />
            <span className="nav-label">홈</span>
          </button>
          <button
            className={"nav-item" + (activeTab === "record" ? " nav-item--active" : "")}
            type="button"
            onClick={() => setActiveTab("record")}
          >
            <History size={16} aria-hidden className="nav-icon" />
            <span className="nav-label">기록</span>
          </button>
          <button
            className={"nav-item" + (activeTab === "settings" ? " nav-item--active" : "")}
            type="button"
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} aria-hidden className="nav-icon" />
            <span className="nav-label">설정</span>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="sheet-backdrop"
            role="dialog"
            aria-modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              className="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="sheet-header">
                <button
                  className="icon-circle"
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="이동 시간 설정 닫기"
                >
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <div>
                  <p className="sheet-sub">이동 시간 설정</p>
                  <h3 className="sheet-title">출퇴근 시간을 입력해 주세요</h3>
                </div>
              </header>

              <div className="sheet-tabs">
                <button
                  type="button"
                  className={"sheet-tab" + (timeMode === "manual" ? " sheet-tab--active" : "")}
                  onClick={() => setTimeMode("manual")}
                >
                  이동 시간 직접 입력
                </button>
                <button
                  type="button"
                  className={"sheet-tab" + (timeMode === "route" ? " sheet-tab--active" : "")}
                  onClick={() => setTimeMode("route")}
                >
                  지도로 시간 계산
                </button>
              </div>

              <div className="sheet-content">
                {timeMode === "manual" ? (
                  <div className="field-stack">
                    <div className="field">
                      <label className="field-label">
                        출근 소요 시간
                        <span className="field-helper">예: 45분</span>
                      </label>
                      <div className="input-shell">
                        <span className="input-icon" aria-hidden>
                          <Clock3 size={16} />
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="예: 45분"
                          value={manualTimes.morning}
                          onChange={(e) =>
                            setManualTimes((prev) => ({
                              ...prev,
                              morning: e.target.value,
                            }))
                          }
                        />
                        <span className="input-suffix">분</span>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">
                        퇴근 소요 시간
                        <span className="field-helper">예: 1시간 5분</span>
                      </label>
                      <div className="input-shell">
                        <span className="input-icon" aria-hidden>
                          <Timer size={16} />
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="예: 65분"
                          value={manualTimes.evening}
                          onChange={(e) =>
                            setManualTimes((prev) => ({
                              ...prev,
                              evening: e.target.value,
                            }))
                          }
                        />
                        <span className="input-suffix">분</span>
                      </div>
                    </div>

                    <div className="field">
                      <p className="field-label">자주 쓰는 시간</p>
                      <div className="quick-chips">
                        {QUICK_MINUTES.map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={
                              "quick-chip quick-chip--ghost" +
                              (draftMinutes === value ? " quick-chip--active" : "")
                            }
                            onClick={() => setDraftMinutes(value)}
                          >
                            {value}분
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="sheet-hint">
                      선택된 이동 시간: <strong>{draftMinutes}분</strong>
                    </p>
                  </div>
                ) : (
                  <div className="field-stack">
                    <div className="field">
                      <label className="field-label">출발 위치</label>
                      <div className="input-shell">
                        <span className="input-icon" aria-hidden>
                          <MapPin size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="현재 위치"
                          value={locations.start}
                          onChange={(e) =>
                            setLocations((prev) => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">목적지</label>
                      <div className="input-shell">
                        <span className="input-icon" aria-hidden>
                          <Target size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="목적지 입력"
                          value={locations.destination}
                          onChange={(e) =>
                            setLocations((prev) => ({
                              ...prev,
                              destination: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={calculateRouteMinutes}
                    >
                      소요 시간 계산
                    </button>

                    <div className="field">
                      <p className="field-label">자주 가는 경로</p>
                      <div className="route-list">
                        {FREQUENT_ROUTES.map((route) => (
                          <button
                            key={route.id}
                            type="button"
                            className="route-card"
                            onClick={() => setDraftMinutes(route.minutes)}
                          >
                            <div>
                              <p className="route-label">{route.label}</p>
                              <p className="route-minutes">{route.minutes}분</p>
                            </div>
                            <div className="route-actions" aria-hidden>
                              <Pencil size={14} />
                              <Trash2 size={14} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="sheet-hint">
                      예상 이동 시간: <strong>{draftMinutes}분</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="sheet-footer">
                <button type="button" className="primary-button" onClick={handleSaveSheet}>
                  저장하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
