"use client";

import { useMemo, useState } from "react";
import {
  generateDummyPacks,
  type LearningPack
} from "../lib/learningPacks";

const MIN_MINUTES = 10;
const MAX_MINUTES = 60;
const STEP_MINUTES = 5;

export default function HomePage() {
  const [availableMinutes, setAvailableMinutes] = useState(25);

  const packs = useMemo<LearningPack[]>(() => {
    return generateDummyPacks(availableMinutes);
  }, [availableMinutes]);

  const today = useMemo(() => {
    const now = new Date();
    const date = now.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric"
    });
    const weekday = now.toLocaleDateString("ko-KR", {
      weekday: "short"
    });
    return { date, weekday };
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-title">Subway Time</div>
        <div className="app-header-date">
          <span>{today.date}</span>
          <span className="dot">·</span>
          <span>{today.weekday}</span>
        </div>
        <p className="app-header-sub">
          이동 시간을 <strong>학습 시간</strong>으로 바꿔보세요.
        </p>
      </header>

      <main className="app-main">
        <section className="section">
          <h2 className="section-title">오늘 이동 시간</h2>
          <p className="section-description">
            지하철/버스에서 공부에 쓸 수 있는 시간을 대략적으로 입력해 주세요.
          </p>

          <div className="time-selector">
            <input
              type="range"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step={STEP_MINUTES}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Number(e.target.value))}
            />
            <div className="time-display">
              <span className="time-value">{availableMinutes}분</span>
              <span className="time-label">오늘 사용할 수 있는 학습 시간</span>
            </div>
            <div className="time-preset-row">
              {[15, 20, 25, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={
                    "time-preset-button" +
                    (availableMinutes === m ? " time-preset-button--active" : "")
                  }
                  onClick={() => setAvailableMinutes(m)}
                >
                  {m}분
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">오늘의 학습팩</h2>
          <p className="section-description">
            지금 남은 {availableMinutes}분 안에 끝낼 수 있는 카드들이에요.
          </p>

          <div className="pack-list">
            {packs.map((pack) => (
              <article key={pack.id} className="pack-card">
                <header className="pack-card-header">
                  <span className={`pack-chip pack-chip--${pack.source}`}>
                    {pack.sourceLabel}
                  </span>
                  <span className="pack-duration">{pack.estimatedMinutes}분</span>
                </header>
                <h3 className="pack-title">{pack.title}</h3>
                <p className="pack-summary">{pack.summary}</p>
                <div className="pack-footer">
                  <div className="pack-tags">
                    {pack.tags.map((tag) => (
                      <span key={tag} className="pack-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="pack-button"
                    onClick={() => {
                      if (pack.url) {
                        window.open(pack.url, "_blank");
                      }
                    }}
                  >
                    지금 보기
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

