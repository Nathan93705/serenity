import { Color, EffectType } from "@serenityjs/protocol";

import { Entity, EntityInvisibilityTrait } from "../../entity";

import { Effect } from "./effect";

class InvisibilityEffect extends Effect {
  public static readonly type: EffectType = EffectType.Invisibility;

  public readonly color: Color = new Color(255, 127, 131, 146);

  public async onAdd(entity: Entity): Promise<void> {
    // Make the entity invisible.
    return entity.getTrait(EntityInvisibilityTrait)?.setInvisibility(true);
  }

  public async onRemove(entity: Entity): Promise<void> {
    // Make the entity visible again.
    return entity.getTrait(EntityInvisibilityTrait)?.setInvisibility(false);
  }
}

export { InvisibilityEffect };
