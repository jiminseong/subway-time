"use client";

import { useMemo, useState } from "react";
import {
  generateDummyPacks,
  type LearningPack
} from "../lib/learningPacks";

type TimeMode = "manual" | "route";

const MIN_MINUTES = 10;
const MAX_MINUTES = 90;
const QUICK_MINUTES = [20, 25, 30, 35, 40];

const FREQUENT_ROUTES = [
  { id: "home-office", label: "집 → 회사", minutes: 45 },
  { id: "office-gym", label: "회사 → 헬스장", minutes: 20 }
];

function clampMinutes(value: number) {
  return Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, Math.round(value)));
}

export default function HomePage() {
  const [availableMinutes, setAvailableMinutes] = useState(35);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>("manual");
  const [draftMinutes, setDraftMinutes] = useState(availableMinutes);
  const [manualTimes, setManualTimes] = useState({
    morning: "45",
    evening: "65"
  });
  const [locations, setLocations] = useState({
    start: "",
    destination: ""
  });

  const packs = useMemo<LearningPack[]>(() => {
    return generateDummyPacks(availableMinutes);
  }, [availableMinutes]);

  const today = useMemo(() => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "long"
    });
    return { dateLabel };
  }, []);

  const greeting =
    availableMinutes >= 35
      ? "오늘도 즐거운 학습!"
      : "지금 할 수 있는 만큼만, 꾸준히!";

  const getManualCandidate = () => {
    const parsed = [manualTimes.morning, manualTimes.evening]
      .map((value) => Number(value))
      .filter((num) => Number.isFinite(num) && num > 0);

    if (!parsed.length) return null;
    return clampMinutes(parsed[0]);
  };

  const calculateRouteMinutes = () => {
    const base =
      Math.max(locations.start.trim().length, 3) +
      Math.max(locations.destination.trim().length, 3);
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
          <header className="top-bar">
            <div>
              <div className="date-chip">{today.dateLabel}</div>
              <h1 className="greeting">{greeting}</h1>
            </div>
            <button className="icon-button" aria-label="설정 열기">
              <span aria-hidden>⚙️</span>
            </button>
          </header>

          <section className="time-banner">
            <div className="time-banner-row">
              <div className="time-badge">
                <span className="icon-circle icon-circle--muted" aria-hidden>
                  ⏱
                </span>
                <span>현재 이동 시간</span>
              </div>
              <button className="ghost-button" type="button" onClick={openSheet}>
                시간 변경
              </button>
            </div>
            <div className="time-number">
              <strong>{availableMinutes}</strong>분
            </div>
            <p className="time-caption">
              지하철/버스에서 딱 이만큼 집중해봐요.
            </p>
            <div className="quick-chips">
              {QUICK_MINUTES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    "quick-chip" +
                    (availableMinutes === value ? " quick-chip--active" : "")
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
                <article
                  key={pack.id}
                  className={`pack-card pack-card--${pack.source}`}
                >
                  <div className="pack-meta">
                    <span className="pack-chip">{pack.sourceLabel}</span>
                    <span className="pack-time">
                      예상 {pack.estimatedMinutes}분
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
              ))}
            </div>
          </section>
        </div>

        <nav className="bottom-nav">
          <button className="nav-item nav-item--active" type="button">
            <span className="nav-icon" aria-hidden>
              ⌂
            </span>
            <span className="nav-label">홈</span>
          </button>
          <button className="nav-item" type="button">
            <span className="nav-icon" aria-hidden>
              ⟳
            </span>
            <span className="nav-label">기록</span>
          </button>
          <button className="nav-item" type="button">
            <span className="nav-icon" aria-hidden>
              ⚙️
            </span>
            <span className="nav-label">설정</span>
          </button>
        </nav>
      </div>

      {sheetOpen && (
        <div className="sheet-backdrop" role="dialog" aria-modal>
          <div className="sheet">
            <header className="sheet-header">
              <button
                className="icon-circle"
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="이동 시간 설정 닫기"
              >
                ←
              </button>
              <div>
                <p className="sheet-sub">이동 시간 설정</p>
                <h3 className="sheet-title">출퇴근 시간을 입력해 주세요</h3>
              </div>
            </header>

            <div className="sheet-tabs">
              <button
                type="button"
                className={
                  "sheet-tab" + (timeMode === "manual" ? " sheet-tab--active" : "")
                }
                onClick={() => setTimeMode("manual")}
              >
                이동 시간 직접 입력
              </button>
              <button
                type="button"
                className={
                  "sheet-tab" + (timeMode === "route" ? " sheet-tab--active" : "")
                }
                onClick={() => setTimeMode("route")}
              >
                지도에서 소요 시간 계산
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
                        ⏳
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="예: 45분"
                        value={manualTimes.morning}
                        onChange={(e) =>
                          setManualTimes((prev) => ({
                            ...prev,
                            morning: e.target.value
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
                        🕑
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="예: 65분"
                        value={manualTimes.evening}
                        onChange={(e) =>
                          setManualTimes((prev) => ({
                            ...prev,
                            evening: e.target.value
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
                        📍
                      </span>
                      <input
                        type="text"
                        placeholder="현재 위치"
                        value={locations.start}
                        onChange={(e) =>
                          setLocations((prev) => ({
                            ...prev,
                            start: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">목적지</label>
                    <div className="input-shell">
                      <span className="input-icon" aria-hidden>
                        🎯
                      </span>
                      <input
                        type="text"
                        placeholder="목적지 입력"
                        value={locations.destination}
                        onChange={(e) =>
                          setLocations((prev) => ({
                            ...prev,
                            destination: e.target.value
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
                            <span>✏️</span>
                            <span>🗑️</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
