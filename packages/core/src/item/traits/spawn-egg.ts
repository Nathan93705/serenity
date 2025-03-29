import { ItemUseMethod, BlockPosition } from "@serenityjs/protocol";

import { Entity, Player } from "../../entity";
import { EntityIdentifier, ItemIdentifier } from "../../enums";
import { EntityEntry, ItemUseOnBlockOptions } from "../../types";

import { ItemTrait } from "./trait";

class ItemSpawnEggTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "spawn_egg";
  public static readonly tag = "minecraft:spawn_egg";

  /**
   * The entity type that this spawn egg will spawn.
   */
  public entityType: EntityIdentifier | null = null;

  public onAdd(): void {
    // Check if the item type ends with the spawn egg tag.
    if (!this.item.identifier.endsWith("_spawn_egg")) return;

    // Slice the item identifier to get the entity type.
    const entityType = this.item.identifier.slice(0, -10) as EntityIdentifier;

    // Set the entity type to the spawn egg trait.
    this.entityType = entityType;
  }

  public async onUseOnBlock(
    player: Player,
    options: ItemUseOnBlockOptions
  ): Promise<void> {
    // Check if the entity type is defined.
    if (options.method !== ItemUseMethod.Place || !this.entityType) return;

    // Calculate the position to spawn the entity.
    const position = BlockPosition.toVector3f(options.targetBlock.position)
      .add(options.clickPosition)
      .add({ x: 0, y: 1, z: 0 });

    // Check if any entity data should be added to the entity.
    const entry =
      this.item.getDynamicProperty<EntityEntry>("entity_data") ?? undefined;

    // Check if the entity data entry is defined.
    if (entry) {
      // Create the entity with the entity data.
      const entity = await Entity.create(player.dimension, this.entityType, {
        entry
      });

      // Increase the Y position by 1.
      position.y += 1;

      // Set the entity position.
      entity.position.set(position);

      // Spawn the entity in the player's dimension.
      await entity.spawn();
    } else {
      // Create the entity without the entity data.
      await player.dimension.spawnEntity(this.entityType, position);
    }
  }
}

export { ItemSpawnEggTrait };
