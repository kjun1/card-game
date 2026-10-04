# BPMN 2.0 Models

このディレクトリの `.bpmn` ファイルをProcessの機械可読な正本とする。

- [game-flow.bpmn](game-flow.bpmn)
- [turn-flow.bpmn](turn-flow.bpmn)
- [action-reaction-flow.bpmn](action-reaction-flow.bpmn)
- [attack-flow.bpmn](attack-flow.bpmn)

## Modeling policy

- BPMN 2.0 XMLを使用する。
- 1つのGameを1 Poolとして扱い、責任主体はLaneで分離する。
- Playerによる選択はUser Task、Game Systemによる規則処理はService TaskまたはTaskとして表現する。
- 合法性・Cost支払い可能性の検証、Cost消費、Momentum移転、Damage適用はGame Systemが行う。検証失敗はCostやEffectを適用せず対応する選択へ戻す。
- 分岐条件はExclusive Gateway、参加者の並行進行はParallel Gatewayで表現する。Effectの一括適用を表すSimultaneousGroupとは区別し、同時Damageを別々の逐次Effectへ分割しない。
- Process間の詳細はMarkdown文書で相互参照し、各BPMNは単独でも意味が閉じるようにする。
- Mermaid図はレビュー用プレビューであり、Process意味論の正本は `.bpmn` とする。

検討履歴や代替案はBPMNへ埋め込まずGitHub Issuesで管理する。

## Process responsibilities

| Process | Responsibility | Result |
| --- | --- | --- |
| Game Flow | Opening Draw前のShuffle、Setup、Player切替、固定済みGame結果の記録と終了 | Turnの終了報告に従って終了または次のTurnを開始 |
| Turn Flow | Turn Start、Operation選択、固定済み終了結果の伝播、継続時のOperation完了判定 | Draw不能はその場で敗北を固定。`gameEnded`と固定済みの勝敗またはDrawをGameへ返す |
| Action / Reaction Flow | 非Actionの検証、Action成立またはCancel、CostとEffectの適用、条件成立時の勝敗固定と後続Effect停止 | `gameEnded`・固定済み結果・適用済みStateを返す。継続時は`operationCompleted`で完了を報告 |
| Attack Flow | Attack宣言、Reaction、Block、Combat、Destroy Check、条件成立時の勝敗固定と後続Effect停止 | `gameEnded`・固定済み結果・適用済みStateを返す。継続時は`operationCompleted`で完了を報告 |

解決Task内部の共通規約は[Effect Resolution Model](../../model/effect-resolution-model.md)を参照する。ResolutionのEffectStepを順番に処理し、逐次Step後または明示SimultaneousGroupの一括適用後に勝敗を判定する。成立した結果を固定して残りのEffectStepを停止し、適用済みCost / Effectは巻き戻さない。

両Playerへ逐次適用するEffectは共通の[Player order](../../model/effect-resolution-model.md#player-order)に従い、Active Playerから処理する。これは個別Stepの並び順・Target選択・Setupの並行進行を変更する規則ではなく、非対象Playerを処理へ追加しない。明示SimultaneousGroupにも適用しない。

Card移動時の閲覧権と過去の観測は[Information Model](../../model/information-model.md)の別責任として扱う。Discard内容を現在確認できないことは、過去にPublicだったCardの情報を忘れることを意味しない。

Operation Flowの取消結果と非Actionの検証失敗は`Operation Incomplete`とする。致死ReactionのCancelや解決済みOperationの完了は報告記録として維持する。Turn / Game Flowは渡された終了結果を再評価せず、Game継続時だけOperation完了状態に従って再選択・Player切替へ進む。
