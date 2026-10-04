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
| Game Flow | Setup、Player切替、Game結果の確定と終了 | Turnの終了報告に従って終了または次のTurnを開始 |
| Turn Flow | Turn Start、Operation選択、勝敗評価、Operation完了判定 | `gameEnded`と勝敗またはDrawの結果をGameへ返す |
| Action / Reaction Flow | Action成立またはCancel、CostとEffectの適用 | `operationCompleted`と更新後のStateをTurnへ返す |
| Attack Flow | Attack宣言、Reaction、Block、Combat、Destroy Check | `operationCompleted`と更新後のStateをTurnへ返す |

Operation Flowの取消結果は`Operation Incomplete`とする。再選択を行うかは、結果を受け取ったTurn FlowがGame終了を評価した後に決定する。
