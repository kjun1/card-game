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
- 分岐条件はExclusive Gateway、同時進行はParallel Gatewayで表現する。
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

勝敗条件が成立した最初の処理で結果を固定する。同時と定義された1つの処理で両Playerの敗北条件が成立した場合はDrawとし、逐次Effectは勝敗確定後に残りを適用しない。両PlayerへのDrawはActive Playerから処理する。これらは解決Task内部の意味規約であり、TaskがEffect全体を無条件に完走することを表さない。

Operation Flowの取消結果と非Actionの検証失敗は`Operation Incomplete`とする。致死ReactionのCancelや解決済みOperationの完了は報告記録として維持する。Turn / Game Flowは渡された終了結果を再評価せず、Game継続時だけOperation完了状態に従って再選択・Player切替へ進む。
