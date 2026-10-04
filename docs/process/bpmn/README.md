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
- 分岐条件はExclusive Gateway、同時進行はParallel Gatewayで表現する。
- Process間の詳細はMarkdown文書で相互参照し、各BPMNは単独でも意味が閉じるようにする。
- Mermaid図はレビュー用プレビューであり、Process意味論の正本は `.bpmn` とする。

検討履歴や代替案はBPMNへ埋め込まずGitHub Issuesで管理する。
