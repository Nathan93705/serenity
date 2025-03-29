import {
  ActorDamageCause,
  Color,
  EffectType,
  Gamemode
} from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class WitherEffect extends Effect {
  public static readonly type: EffectType = EffectType.Wither;
  public readonly color: Color = new Color(255, 53, 42, 39);

  public async onTick(entity: Entity): Promise<void> {
    const ticksPerSecond = Math.max(40 / Math.pow(2, this.amplifier - 1), 10);

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
      return;
    if (entity.isPlayer() && entity.gamemode == Gamemode.Creative) return;
    const healthTrait = entity.getTrait(EntityHealthTrait);

    await healthTrait.applyDamage(1, undefined, ActorDamageCause.Magic);
  }
}

export { WitherEffect };
