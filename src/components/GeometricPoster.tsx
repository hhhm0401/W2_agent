import type { FocusSession } from '../types'

interface GeometricPosterProps {
  sessions: FocusSession[]
}

export function GeometricPoster({ sessions }: GeometricPosterProps) {
  const completed = sessions.filter((session) => session.completed).slice(0, 8)
  const totalMinutes = completed.reduce((sum, session) => sum + session.actualMinutes, 0)

  return (
    <section className="poster" aria-labelledby="poster-title">
      <div className="section-kicker">TODAY / 今日构成</div>
      <div className="poster__header">
        <h2 id="poster-title">专注留下形状</h2>
        <span>{completed.length} 轮 · {totalMinutes} 分钟</span>
      </div>
      <div className="poster__canvas" aria-label={`今日完成 ${completed.length} 轮专注`}>
        <span className="shape shape--red shape--circle" />
        <span className="shape shape--blue shape--bar" />
        <span className="shape shape--yellow shape--square" />
        {completed.map((session, index) => (
          <span
            className={`shape shape--session shape--session-${index + 1}`}
            key={session.id}
            title={`${session.task || '未命名任务'} · ${session.actualMinutes} 分钟`}
          />
        ))}
        {completed.length === 0 && (
          <p className="poster__empty">完成第一轮后，几何海报会开始生长。</p>
        )}
      </div>
    </section>
  )
}
