import type { FocusRecommendation } from '../types'

interface RecommendationPanelProps {
  recommendation: FocusRecommendation | null
  sampleCount: number
  onAccept: () => void
  onKeep: () => void
}

export function RecommendationPanel({
  recommendation,
  sampleCount,
  onAccept,
  onKeep,
}: RecommendationPanelProps) {
  if (!recommendation) {
    return (
      <section className="recommendation recommendation--waiting" aria-labelledby="recommendation-title">
        <div className="recommendation__number">{Math.min(sampleCount, 3)}/3</div>
        <div>
          <div className="section-kicker">ADAPT / 自适应</div>
          <h2 id="recommendation-title">先观察，再建议</h2>
          <p>完成至少三轮后，我们会依据完成率和暂停次数给出可解释的专注时长建议。</p>
        </div>
      </section>
    )
  }

  return (
    <section className="recommendation" aria-labelledby="recommendation-title">
      <div className="recommendation__accent" aria-hidden="true" />
      <div>
        <div className="section-kicker">ADAPT / 节奏建议</div>
        <h2 id="recommendation-title">
          下一轮 {recommendation.suggestedMinutes} 分钟
        </h2>
        <p>{recommendation.reason}</p>
        <div className="recommendation__metrics">
          <span>完成率 {Math.round(recommendation.completionRate * 100)}%</span>
          <span>平均暂停 {recommendation.averagePauses.toFixed(1)} 次</span>
        </div>
        <div className="recommendation__actions">
          <button className="button button--blue" onClick={onAccept}>采用建议</button>
          <button className="button button--text" onClick={onKeep}>保持当前</button>
        </div>
      </div>
    </section>
  )
}
