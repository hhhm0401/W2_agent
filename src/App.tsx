import { useCallback, useEffect, useMemo, useState } from 'react'
import { GeometricPoster } from './components/GeometricPoster'
import { RecommendationPanel } from './components/RecommendationPanel'
import { SessionHistory } from './components/SessionHistory'
import { TimerDial } from './components/TimerDial'
import { usePrecisionTimer } from './hooks/usePrecisionTimer'
import { createRecommendation } from './lib/recommendation'
import { makeId } from './lib/time'
import { defaultSettings, storage, type AppSettings } from './services/storage'
import type { FocusSession, TimerSnapshot } from './types'

function App() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    typeof localStorage === 'undefined' ? defaultSettings : storage.loadSettings(),
  )
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    typeof localStorage === 'undefined' ? [] : storage.loadSessions(),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  const appendSession = useCallback((session: FocusSession) => {
    setSessions((current) => [session, ...current].slice(0, 30))
  }, [])

  const handleComplete = useCallback(
    (snapshot: TimerSnapshot) => {
      if (snapshot.mode !== 'focus') return
      const plannedMinutes = Math.round(snapshot.durationMs / 60_000)
      appendSession({
        id: makeId(),
        task: settings.task.trim(),
        plannedMinutes,
        actualMinutes: plannedMinutes,
        pauseCount: snapshot.pauseCount,
        completed: true,
        completedAt: new Date().toISOString(),
      })
    },
    [appendSession, settings.task],
  )

  const { timer, start, pause, reset, advance, updateDuration } = usePrecisionTimer({
    focusMinutes: settings.focusMinutes,
    breakMinutes: settings.breakMinutes,
    onComplete: handleComplete,
  })

  useEffect(() => storage.saveSessions(sessions), [sessions])
  useEffect(() => storage.saveSettings(settings), [settings])

  const recommendation = useMemo(
    () =>
      createRecommendation(
        sessions,
        settings.focusMinutes,
        settings.lastRecommendationAtCount,
      ),
    [sessions, settings.focusMinutes, settings.lastRecommendationAtCount],
  )

  const completedSessions = sessions.filter((session) => session.completed)
  const todayKey = new Date().toDateString()
  const todaySessions = completedSessions.filter(
    (session) => new Date(session.completedAt).toDateString() === todayKey,
  )
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.actualMinutes, 0)

  const changeSetting = (key: 'focusMinutes' | 'breakMinutes', value: number) => {
    setSettings((current) => ({ ...current, [key]: value }))
    updateDuration(key === 'focusMinutes' ? 'focus' : 'break', value)
  }

  const resetWithTrace = () => {
    if (timer.mode === 'focus' && (timer.phase === 'running' || timer.phase === 'paused')) {
      const actualMinutes = Math.max(
        1,
        Math.round((timer.durationMs - timer.remainingMs) / 60_000),
      )
      appendSession({
        id: makeId(),
        task: settings.task.trim(),
        plannedMinutes: Math.round(timer.durationMs / 60_000),
        actualMinutes,
        pauseCount: timer.pauseCount,
        completed: false,
        completedAt: new Date().toISOString(),
      })
    }
    reset()
  }

  const acceptRecommendation = () => {
    if (!recommendation) return
    changeSetting('focusMinutes', recommendation.suggestedMinutes)
    setSettings((current) => ({
      ...current,
      focusMinutes: recommendation.suggestedMinutes,
      lastRecommendationAtCount: sessions.length,
    }))
  }

  const keepRecommendation = () => {
    setSettings((current) => ({ ...current, lastRecommendationAtCount: sessions.length }))
  }

  return (
    <main className={`app app--${timer.mode}`}>
      <header className="masthead">
        <a className="brand" href="#timer" aria-label="番茄钟首页">
          <span className="brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>POMODORO<br />TIMER</span>
        </a>
        <div className="masthead__rule" aria-hidden="true" />
        <div className="masthead__status">
          <span>LOCAL-FIRST</span>
          <span>{new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
        </div>
        <button
          className="icon-button"
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
          aria-controls="settings-panel"
        >
          {settingsOpen ? '关闭设置' : '节奏设置'}
        </button>
      </header>

      <section className={`settings-panel ${settingsOpen ? 'is-open' : ''}`} id="settings-panel">
        <div>
          <label htmlFor="focus-duration">专注时长</label>
          <output>{settings.focusMinutes} 分钟</output>
          <input
            id="focus-duration"
            type="range"
            min="15"
            max="50"
            step="5"
            value={settings.focusMinutes}
            onChange={(event) => changeSetting('focusMinutes', Number(event.target.value))}
            disabled={timer.phase !== 'idle'}
          />
        </div>
        <div>
          <label htmlFor="break-duration">休息时长</label>
          <output>{settings.breakMinutes} 分钟</output>
          <input
            id="break-duration"
            type="range"
            min="5"
            max="15"
            step="5"
            value={settings.breakMinutes}
            onChange={(event) => changeSetting('breakMinutes', Number(event.target.value))}
            disabled={timer.phase !== 'idle'}
          />
        </div>
        <p>核心数据只保存在这台设备。计时期间锁定时长，避免误触。</p>
      </section>

      <section className="hero" id="timer">
        <div className="hero__intro">
          <div className="section-kicker">FORM FOLLOWS FOCUS</div>
          <h1>把时间<br />变成形状。</h1>
          <p>少一点干扰，多一段完整的专注。绝对时间校准让计时在后台也保持准确。</p>
          <div className="today-stats" aria-label="今日专注统计">
            <div><strong>{todaySessions.length}</strong><span>今日轮次</span></div>
            <div><strong>{todayMinutes}</strong><span>专注分钟</span></div>
          </div>
        </div>

        <div className="hero__timer">
          <label className="task-field" htmlFor="task-name">
            <span>NOW / 当前任务</span>
            <input
              id="task-name"
              value={settings.task}
              onChange={(event) => setSettings((current) => ({ ...current, task: event.target.value }))}
              placeholder="例如：完成实验报告"
              maxLength={48}
            />
          </label>

          <TimerDial {...timer} />

          <div className="timer-actions">
            {timer.phase === 'running' ? (
              <button className="button button--primary" onClick={pause}>暂停</button>
            ) : timer.phase === 'completed' ? (
              <button className="button button--primary" onClick={advance}>
                {timer.mode === 'focus' ? '进入休息' : '开始下一轮'}
              </button>
            ) : (
              <button className="button button--primary" onClick={start}>
                {timer.phase === 'paused' ? '继续' : '开始专注'}
              </button>
            )}
            <button className="button button--secondary" onClick={resetWithTrace}>重置</button>
          </div>

          <div className="precision-note">
            <span className="precision-note__mark" aria-hidden="true" />
            <p><strong>精准计时已启用</strong><br />刷新或切回页面时，按绝对结束时间自动校准。</p>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <GeometricPoster sessions={sessions} />
        <div className="lower-grid__stack">
          <RecommendationPanel
            recommendation={recommendation}
            sampleCount={sessions.length}
            onAccept={acceptRecommendation}
            onKeep={keepRecommendation}
          />
          <SessionHistory sessions={sessions} />
        </div>
      </section>

      <footer>
        <span>POMODORO TIMER · 2026</span>
        <span>FORM FOLLOWS FOCUS</span>
        <span>数据仅存本机</span>
      </footer>
    </main>
  )
}

export default App
