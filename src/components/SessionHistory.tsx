import type { FocusSession } from '../types'

interface SessionHistoryProps {
  sessions: FocusSession[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  return (
    <section className="history" aria-labelledby="history-title">
      <div className="history__heading">
        <div>
          <div className="section-kicker">TRACE / 专注记录</div>
          <h2 id="history-title">最近的节奏</h2>
        </div>
        <span>本机保存</span>
      </div>

      {sessions.length === 0 ? (
        <p className="history__empty">还没有记录。写下任务，开始第一轮专注。</p>
      ) : (
        <ol className="history__list">
          {sessions.slice(0, 6).map((session, index) => (
            <li key={session.id}>
              <span className="history__index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{session.task || '未命名任务'}</strong>
                <small>
                  {new Date(session.completedAt).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </div>
              <span className={session.completed ? 'tag tag--done' : 'tag tag--open'}>
                {session.completed ? `${session.actualMinutes} min` : '未完成'}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
