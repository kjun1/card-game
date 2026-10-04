# Interaction Requirements

## Purpose

相手の行動へ対応する戦略性を持たせながら、すべての処理で応答確認が発生することによる進行停滞を避ける。

## Requirements

| ID | Requirement |
| --- | --- |
| IR-001 | Reaction可能なOperationとReaction不可のOperationをルール上明確に区別しなければならない。 |
| IR-002 | Actionと定義されたOperationのみがReaction Windowを発生させなければならない。 |
| IR-003 | Reaction Sourceは原則として事前にBoardへコミットされていなければならない。 |
| IR-004 | Handそのものを通常のReaction Sourceとして扱ってはならない。 |
| IR-005 | Reactionが使用された場合、Reactionを解決した後に元ActionをCancelしなければならない。 |
| IR-006 | CancelされたActionの未払いEnergy Costを消費してはならない。 |
| IR-007 | Reaction側が実際に支払ったCostと状態変更は巻き戻してはならない。 |
| IR-008 | ActionがCancelされた場合、Operation未完了として扱い、Gameが継続する場合だけ行動側へ選択権を戻さなければならない。Game終了時は再選択してはならない。 |
| IR-009 | 再宣言されたActionには新しいReaction Windowを発生させなければならない。 |
| IR-010 | Reactionそのものに対するReactionを発生させてはならない。 |
| IR-011 | Attackは常にActionとして扱わなければならない。 |
| IR-012 | AttackにReactionがなかった場合のみBlock Stepへ進まなければならない。 |
| IR-013 | BlockはReactionではなくAttack Procedure内のAbilityとして扱わなければならない。 |
| IR-014 | 1回のAttackに対してBlockに使用できるUnitは最大1体でなければならない。 |
| IR-015 | Block AbilityはCoreへのAttackとUnitへのAttackの双方へ介入できなければならない。 |
| IR-016 | Blockの可否はReady / ExhaustedおよびDeploy直後かどうかとは独立していなければならない。 |
| IR-017 | Face-up SupportとSet Cardは同一のSupport Zone Capacityを競合して使用しなければならない。 |
| IR-018 | Set Cardは存在をPublic、内容をHiddenとして扱わなければならない。 |
| IR-019 | 基本ルールでActionとなるOperationはAttackだけとし、その他のOperationはCardの当該操作・Abilityに動作を規定するキーワードActionが明記された場合だけActionとして扱わなければならない。指定は操作・Ability単位とし、同じCardの別操作・Abilityへ波及させず、未指定は非Actionとしなければならない。 |
| IR-020 | CancelそのものによってActionに使用しようとしたHandのCardを移動させてはならない。Reaction EffectによるCard移動・状態変更は巻き戻さず、Gameが継続し合法であれば同じCardを再宣言できなければならない。 |

## Traceability

- Action / Reaction: ../process/action-reaction-flow.md
- Attack / Block: ../process/attack-flow.md
- Core interaction rules: ../rules/core-rules.md
- Combat rules: ../rules/combat-rules.md
- Action keyword / per-operation designation (IR-019): ../model/card-model.md
- Cancellation and Hand retention (IR-020): ../rules/core-rules.md
