import { Awaitable } from "@serenityjs/emitter";

import { Trait } from "../../trait";
import { EntityIdentifier, EntityInteractMethod } from "../../enums";
import { Entity } from "../entity";
import { Player } from "../player";
import { CommandExecutionState } from "../../commands";
import { Container } from "../../container";
import {
  EntityDeathOptions,
  EntityDespawnOptions,
  EntityFallOnBlockTraitEvent,
  EntitySpawnOptions,
  JSONLikeObject
} from "../../types";
import { Dimension } from "../../world";

class EntityTrait extends Trait {
  /**
   * The entity type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<EntityIdentifier> = [];

  /**
   * The entity that this trait is attached to.
   */
  protected readonly entity: Entity;

  /**
   * The dimension that the entity is in.
   */
  protected get dimension(): Dimension {
    return this.entity.dimension;
  }

  /**
   * Creates a new instance of the entity trait.
   * @param entity The entity that this trait will be attached to.
   * @param options additional options for the entity trait.
   */
  public constructor(entity: Entity, _options?: JSONLikeObject) {
    super();

    // Assign the properties of the entity trait.
    this.entity = entity;
  }

  /**
   * Called then the entity that this trait is attached to is spawned into a dimension.
   * @param details The details of the entity spawn.
   */
  public onSpawn?(details: EntitySpawnOptions): Awaitable<void>;

  /**
   * Called when the entity that this trait is attached to is despawned from a dimension.
   * @param details The details of the entity despawn.
   */
  public onDespawn?(details: EntityDespawnOptions): Awaitable<void>;

  /**
   * Called when the entity that this trait is attached to is killed.
   * @param details The details of the entity death.
   */
  public onDeath?(details: EntityDeathOptions): Awaitable<void>;

  /**
   * Called when the entity that this trait is attached to is interacted with by a player.
   * @param player The player that interacted with the entity.
   * @param method The method that the player used to interact with the entity.
   */
  public onInteract?(
    player: Player,
    method: EntityInteractMethod
  ): Awaitable<void>;

  /**
   * Called when the entity that this trait is attached executes a command.
   * @param state The command execution state.
   * @returns Whether the command was successful; default is true.
   */
  public onCommand?(state: CommandExecutionState): Awaitable<boolean | void>;

  /**
   * Called when a container that is attached to the entity is updated.
   * @param container The container that was updated.
   */
  public onContainerUpdate?(container: Container): Awaitable<void>;

  /**
   * Called when the entity that this trait is attached to falls on a block.
   * @param event The event properties of the entity falling on a block.
   * @note This event requires the entity to have `EntityGravityTrait` attached.
   */
  public onFallOnBlock?(event: EntityFallOnBlockTraitEvent): Awaitable<void>;

  /**
   * Clones the entity trait.
   * @param entity The entity to clone the trait to.
   * @returns A new entity trait.
   */
  public clone(entity: Entity): this {
    // Create a new instance of the trait.
    const trait = new (this.constructor as new (entity: Entity) => this)(
      entity
    );

    // Copy the key-value pairs.
    for (const [key, value] of Object.entries(this)) {
      // Skip the entity.
      if (key === "entity") continue;

      // Set the key-value pair.
      trait[key as keyof this] = value;
    }

    // Return the trait.
    return trait;
  }
}

export { EntityTrait };
