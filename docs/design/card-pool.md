# Card-pool Architecture

## Purpose

Card Pool設計は、全Card集合から各Deckがどの範囲へアクセスでき、その制約によってどのような差異と組み合わせが生まれるかを定義する。

Gameplay中のEnergy / Momentum経済とは分離する。

## Architecture

~~~text
Card Pool
│
├─ Pool Identity
├─ Access Rule
├─ Affinity
└─ Format
     ↓
Deck Construction
     ↓
Deck
~~~

## Pool Identity

Card Poolを大きく分類する上位属性。

表現候補:

- Class
- Faction
- Color
- Region
- Hero
- Leader

Pool Identityは一つのDeck Archetypeそのものではない。同一Identity内部に複数の戦略を許容する。

## Access Rule

特定DeckがCard PoolのどのCardを採用できるかを決定する。

~~~text
AvailableCards(Deck) ⊆ CardPool
~~~

方式候補:

- 使用可能 / 使用不可
- 条件付き使用
- 採用枚数制限
- 構築上の追加Cost

具体方式は固定しない。

## Affinity

~~~text
Access Rule = Deckへ入れられるか
Affinity    = 一緒に入れる意味があるか
~~~

AffinityはTag、Mechanic、Resource利用、Card Type、状態参照等から形成できる。

## Format

~~~text
LegalCards ⊆ CardPool
DeckCards  ⊆ AvailableCards ∩ LegalCards
~~~

## Separation from runtime resources

~~~text
Deck Construction
- Pool Identity
- Access Rule
- Affinity
- Format

Gameplay
- Energy
- Momentum
- Hand
- Board
- Operation / Action / Reaction
~~~

Card Pool制約のためだけにEnergy / Momentumの責任を拡張しない。

## Classification boundary

~~~text
Pool Identity
→ Deck Construction上のアクセスに影響

Tag
→ Card間の参照・Affinityに影響
~~~
