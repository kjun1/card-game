# Card-pool Architecture

この文書はCard PoolとDeck Constructionの概念モデルを定義する。具体的なClass / Faction / Color等の方式はまだ固定しない。

## 1. Purpose

Card Pool設計の責任は、

> 全Card集合から、各Deckがどの範囲へアクセスでき、その制約によってどのような差異と組み合わせが生まれるか

を定義することである。

ゲーム中のEnergy / Momentum経済とは分離する。

## 2. Architecture

```text
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
```

## 3. Pool Identity

Card Poolを大きく分類する上位属性。

候補となる表現方式にはClass、Faction、Color、Region、Hero、Leader等がある。

Pool Identityは一つのDeck Archetypeそのものではない。同じIdentity内部に複数の戦略を許容する。

## 4. Access Rule

特定DeckがCard PoolのどのCardを採用できるかを決定する。

```text
AvailableCards(Deck) ⊆ CardPool
```

制約方式は以下を取り得る。

- 使用可能 / 使用不可
- 条件付き使用
- 採用枚数制限
- 構築上の追加Cost

具体方式は別途定義する。

## 5. Affinity

使用可能なCard同士を組み合わせる価値を形成する。

```text
Access Rule = Deckへ入れられるか
Affinity    = 一緒に入れる意味があるか
```

AffinityはTag、Mechanic、Resource利用、Card Type、状態参照等から形成できる。

## 6. Format

特定環境でLegalなCard集合を定義する。

```text
LegalCards ⊆ CardPool
```

Deck Cardは概念的に以下を満たす。

```text
DeckCards ⊆ AvailableCards ∩ LegalCards
```

## 7. Separation from runtime resources

Card Poolへのアクセス制御と、Game中のResource制約を同一視しない。

```text
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
```

Card Pool制約のためだけにEnergy / Momentumの責任を拡張しない。

## 8. Card classification

CardはCard Pool設計上の分類とは別に、以下を持つ。

- Card Type: Unit / Support / Tactic
- Tag: 意味分類・Affinity参照
- Ability / Effect

Pool IdentityとTagは責任を分ける。

```text
Pool Identity
→ Deck Construction上のアクセスに影響

Tag
→ Card間の参照・Affinityに影響
```
