/**
 * 構造検証済みの Card Definition だけを入力にする静的意味検証。
 * 条件と Effect の互換候補が空の場合だけ拒否する。実際の対象・状態・
 * Effect の実行順による変化・Cost・Timing・Visibility は評価しない。
 */
const pointerToken = (value) => value.replaceAll('~', '~0').replaceAll('/', '~1');

// 現版の Card Type / Operation と Board / Set state が許す組合せ。
// 候補を列挙するだけで、対戦中にその個体が存在するとは判断しない。
const cardKinds = [
  { type: 'card', cardType: 'unit', zone: 'hand' },
  { type: 'card', cardType: 'support', zone: 'hand' },
  { type: 'card', cardType: 'tactic', zone: 'hand' },
  { type: 'card', cardType: 'unit', zone: 'unit_zone', state: 'face_up' },
  { type: 'card', cardType: 'support', zone: 'support_zone', state: 'face_up' },
  { type: 'card', cardType: 'tactic', zone: 'support_zone', state: 'set' },
  { type: 'card', cardType: 'tactic', zone: 'support_zone', state: 'face_up' },
];

function selectionKinds(selection) {
  if (selection.type === 'core') return [{ type: 'core' }];
  return cardKinds.filter((kind) => kind.zone === selection.zone
    && (!selection.cardType || kind.cardType === selection.cardType)
    && (!selection.state || kind.state === selection.state));
}

function sourceKinds(card, definition) {
  // set_card は利用元の分類。使用時の Reveal を実行したり、現在の Set 状態を
  // 保証したりしない。現在の状態は Engine が検証する。
  const zone = card.cardType === 'unit' ? 'unit_zone'
    : card.cardType === 'support' || definition.activation?.source === 'set_card' ? 'support_zone'
      : 'hand';
  return cardKinds.filter((kind) => kind.cardType === card.cardType && kind.zone === zone);
}

function acceptsTarget(effectType, kind) {
  const boardUnit = kind.type === 'card' && kind.cardType === 'unit' && kind.zone === 'unit_zone';
  switch (effectType) {
    case 'damage': return kind.type === 'core' || boardUnit;
    case 'draw': return kind.type === 'player';
    case 'move_card': return kind.type === 'card';
    case 'destroy':
    case 'ready':
    case 'exhaust':
    case 'change_final_target': return boardUnit;
    case 'reveal': return kind.type === 'card' && kind.zone === 'support_zone' && kind.state === 'set';
    default: throw new Error(`Unsupported structurally validated Effect: ${effectType}`);
  }
}

/**
 * documents: [{ file, card, instancePath? }]
 * 全 Card が現版 Schema を通過した後に呼ぶ。配列 fixture の場合は instancePath に
 * /0 等を指定する。ファイル・JSON Pointer 付き診断を返し、入力は変更しない。
 */
export function validateCardSemantics(documents) {
  const errors = [];
  const cardIds = new Map();
  for (const { file, card, instancePath = '' } of documents) {
    const report = (suffix, keyword, message, params = {}) => errors.push({
      file, instancePath: `${instancePath}${suffix}`, keyword: `semantic/${keyword}`, message, params,
    });
    const previousCard = cardIds.get(card.id);
    if (previousCard) {
      report('/id', 'duplicate-card-id', `Card id ${JSON.stringify(card.id)} is already defined`, previousCard);
    } else {
      cardIds.set(card.id, { firstFile: file, firstInstancePath: `${instancePath}/id` });
    }

    const abilityIds = new Map();
    for (const [index, ability] of card.abilities.entries()) {
      if (abilityIds.has(ability.id)) {
        report(`/abilities/${index}/id`, 'duplicate-ability-id', `Ability id ${JSON.stringify(ability.id)} is already defined in this Card`, {
          firstInstancePath: `${instancePath}/abilities/${abilityIds.get(ability.id)}/id`,
        });
      } else {
        abilityIds.set(ability.id, index);
      }
    }

    const scopes = [
      ...Object.entries(card.operations).map(([name, definition]) => [`/operations/${pointerToken(name)}`, definition]),
      ...card.abilities.map((definition, index) => [`/abilities/${index}`, definition]),
    ];
    for (const [scopePath, definition] of scopes) {
      const selections = new Map();
      for (const [symbol, selection] of Object.entries(definition.targets ?? {})) {
        const kinds = selectionKinds(selection);
        selections.set(symbol, kinds);
        if (kinds.length === 0) {
          report(`${scopePath}/targets/${pointerToken(symbol)}`, 'impossible-selection', 'Selection constraints have no compatible Card kind', {
            zone: selection.zone, ...(selection.cardType && { cardType: selection.cardType }), ...(selection.state && { state: selection.state }),
          });
        }
      }

      function checkEffect(effect, effectPath) {
        const target = effect.target;
        let kinds;
        if (target.type === 'selected') {
          if (!selections.has(target.selection)) {
            report(`${effectPath}/target/selection`, 'unresolved-selection', 'Selection must be defined in the same Operation or Ability', { selection: target.selection });
            return;
          }
          kinds = selections.get(target.selection);
          // 既に矛盾した Selection 自体を診断しているので派生エラーは重ねない。
          if (kinds.length === 0) return;
        } else if (target.type === 'source') {
          kinds = sourceKinds(card, definition);
        } else if (target.type === 'declared_action_source') {
          if (definition.activation?.type !== 'reaction') {
            report(`${effectPath}/target`, 'reference-scope', 'declared_action_source is available only in a Reaction Ability', { reference: target.type });
            return;
          }
          kinds = [{ type: 'card', cardType: 'tactic', zone: 'hand' }];
        } else {
          kinds = [{ type: target.type }];
        }
        if (!kinds.some((kind) => acceptsTarget(effect.type, kind))) {
          report(`${effectPath}/target`, 'effect-target-type', `Target cannot satisfy ${effect.type}`, { effect: effect.type, target: target.type });
        }
      }

      for (const [index, step] of (definition.resolution ?? []).entries()) {
        const stepPath = `${scopePath}/resolution/${index}`;
        if (step.type === 'effect') checkEffect(step.effect, `${stepPath}/effect`);
        else step.effects.forEach((effect, effectIndex) => checkEffect(effect, `${stepPath}/effects/${effectIndex}`));
      }
    }
  }
  return errors;
}
