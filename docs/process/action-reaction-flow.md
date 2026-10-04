# Action / Reaction Flow

> Formal BPMN 2.0 model: [bpmn/action-reaction-flow.bpmn](bpmn/action-reaction-flow.bpmn)

## Purpose

Actionとして定義されたOperationに対するReaction処理とOperation完了条件を定義し、完了状態と更新後のGame StateをTurn Flowへ返す。

## Principle

- ActionだけがReaction Windowを発生させる。
- Attackは常にAction。それ以外はCardの当該操作・Abilityに`Action`が明記された場合だけActionで、同じCard内の別操作へ指定を波及させない。
- ActionではないOperationも合法性・Cost支払い可能性を検証し、合法ならReactionを挟まずCostを支払い解決する。不正なら副作用なしで未完了を返す。
- Reactionを受けたActionは成立しない。
- Reaction後、Gameが終了していなければ同じTurnを継続する。
- Reactionに対するReactionは発生させない。

## Review preview

~~~mermaid
flowchart TD
    S[Operation Selected] --> A{Is Action?}
    A -- No --> VN[Validate Non-Action Operation]
    VN --> NV{Non-Action valid?}
    NV -- No --> U([Operation Incomplete])
    NV -- Yes --> NC[Pay Non-Action Cost]
    NC --> N[Resolve Non-Action Operation]
    N --> GE{Game ended?}
    GE -- Yes --> ER([Game End Reported])
    GE -- No --> C([Operation Complete])

    A -- Yes --> D[Declare Action]
    D --> VA[Validate Action]
    VA --> AV{Action valid?}
    AV -- No --> D
    AV -- Yes --> R[Opponent chooses Reaction, targets or decline]
    R --> VR[Validate Reaction]
    VR --> RV{Reaction valid?}
    RV -- No --> R
    RV -- Yes --> G{Use Reaction?}
    G -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Declared Action]
    X --> U

    G -- No --> AC[Pay Action Cost]
    AC --> AR[Resolve Action]
    AR --> GE
~~~

Gameが継続する場合、`Operation Complete`は`operationCompleted = true`、`Operation Incomplete`は`operationCompleted = false`を更新後のGame Stateとともに[Turn Flow](turn-flow.md)へ返す。

解決中に勝敗条件が成立した場合は、その時点で結果を固定して残りの逐次Effectを停止する。`Game End Reported`は`gameEnded = true`と固定済みの結果、その時点までのStateをTurn Flowへ返す。Reactionによって終了した場合も元ActionのCancelを記録し、`Operation Incomplete`から同じ終了結果を返す。Turn Flowは勝敗を再評価せず、終了結果をOperation再選択より優先する。

## Effect resolution and Game end

非Action・Action・Reactionの解決Taskは、順番にEffectを適用し、勝敗条件が初めて成立した時点で結果を固定する。例えば先のDrawで敗北したPlayerに対して、後続EffectによるDeck補充やCore HPの変更は行わない。同時と定義された1つの処理は一括して適用し、その時点で両Playerの敗北条件が成立した場合だけDrawとする。

両PlayerへのDrawはActive Playerから処理する。必要なDrawに失敗した場合はその場で敗北を固定し、OpponentのDrawを含む後続の逐次処理を行わない。

すべてのEffectを解決済みなら従来のOperation完了記録を保持する。終了結果の返却に残りのEffect解決や新しいOperation完了判定を要求しない。ReactionによるCancelは報告上の記録であり、終了後の追加Effectや固定した勝敗の変更を伴わない。

## Selection and validation

- Active PlayerはActionのSource・Target等を宣言し、OpponentはReactionのSource・Target等を選択するか辞退する。
- 非Actionも、選択されたSource・Target・Zone Capacity等の合法性とCost支払い可能性をGame Systemが検証する。不正ならCost消費・Card移動・Effect解決なしで`Operation Incomplete`を返し、Game継続時はOperation選択へ戻る。
- Game SystemはAction宣言の合法性とCost支払い可能性を検証し、合法な宣言だけがReaction Windowを開く。
- Reactionの辞退は有効な選択として扱う。Reactionを選択した場合は、Game SystemがSource・Timing・Target・Cost支払い可能性を検証する。
- 不正なAction宣言は宣言へ、不正なReactionはReaction選択へ戻る。検証失敗ではCost消費・Effect解決・Action Cancelを行わない。

## Cost semantics

Action本体のEnergy CostはDeclaration時点では消費しない。

Cost支払いはGame SystemのService Taskとする。検証後に設定されたCostを引き、Momentumを使用した場合は同量をOpponentへ移転する。

Reactionが使用された場合:

- Reaction側Costは消費する。
- Reaction Effectを解決する。途中で勝敗が確定した場合は残りの逐次Effectを停止する。
- 元ActionをCancelする。
- 元Actionの未払いEnergy Costは消費しない。
- CancelそのものではActionに使用しようとしたHandのCardを移動させない。
- ReactionによるCard移動・状態変更は巻き戻さない。Reaction EffectでHandから移動したCardをCancelによってHandへ戻さない。

Gameが継続し合法であれば同じCardを再宣言でき、再宣言されたActionは新しいReaction Windowを発生させる。Reaction回数に一律のシステム上限は設けない。
