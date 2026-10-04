# Play-experience Requirements

## Purpose

ルールの正当性だけでなく、対戦中に提供する意思決定とテンポを要求として定義する。

## Requirements

| ID | Requirement |
| --- | --- |
| PER-001 | 一方のPlayerが長時間連続して操作する構造を避け、1 Operationごとに相手へ制御を渡さなければならない。 |
| PER-002 | 相手の行動を確認してから判断する機会を提供しつつ、すべてのOperationでReaction確認を発生させてはならない。 |
| PER-003 | Reactionの脅威は原則として事前にBoardへコミットされ、相手が存在を推測可能でなければならない。 |
| PER-004 | Energyは1 Turnの1 Operationで使用可能な基本出力を制約する予算として機能しなければならない。 |
| PER-005 | Momentumの使用は、現在の追加価値と相手へ渡す将来価値の交換を生まなければならない。 |
| PER-006 | 単一盤面を基本とし、複数の独立戦線を同時管理することによる状態把握負荷を増やさない。 |
| PER-007 | 防御ではCoreでDamageを受ける、Reactionで介入する、Momentum等を支払いBlockする、という異なる交換を選択できなければならない。 |
| PER-008 | Card能力は可能な限り既存のAbility / Effect / Stateの組み合わせで表現し、Card追加ごとに基本ルールを増やさない。 |
| PER-009 | PublicなBoard状態から、現在利用可能な主要な攻撃・防御能力を読み取れることを目指す。 |
| PER-010 | Reaction Chainを深くしないことで、相互作用を維持しながら応答待ち時間を抑えなければならない。 |

## Validation metrics

- 1 Operationあたりの判断時間
- Reaction Window発生率
- ReactionによるAction再選択回数
- Momentum分布の偏り
- Block使用率
- TurnあたりCore Damage
- Board上の選択肢数
