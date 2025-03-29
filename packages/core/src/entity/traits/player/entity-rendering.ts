import {
  AbilityLayerType,
  AbilitySet,
  AddEntityPacket,
  AddItemActorPacket,
  AddPlayerPacket,
  CommandPermissionLevel,
  EquipmentSlot,
  MobArmorEquipmentPacket,
  NetworkItemStackDescriptor,
  PermissionLevel,
  PropertySyncData,
  RemoveEntityPacket,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityInventoryTrait } from "../inventory";
import { ItemStack } from "../../../item";
import { EntityItemStackTrait } from "../item-stack";
import { EntityEquipmentTrait } from "../equipment";
import { Entity } from "../../entity";
import { EntityDespawnOptions, EntitySpawnOptions } from "../../..";

import { PlayerTrait } from "./trait";
import { PlayerChunkRenderingTrait } from "./chunk-rendering";

class PlayerEntityRenderingTrait extends PlayerTrait {
  public static readonly identifier = "entity_rendering";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * A collective list of all the entities that have been rendered for the player.
   */
  public readonly entities: Set<bigint> = new Set();

  /**
   * A collective list of all the entities that have been hidden from the player.
   */
  public readonly hidden: Set<bigint> = new Set();

  public async onTick(): Promise<void> {
    // Check if the player is spawned
    if (!this.player.isAlive) return;

    // Check if the player has a chunk rendering component
    const component = this.player.getTrait(PlayerChunkRenderingTrait);
    if (!component) return;

    // Get the player's view distance
    const viewDistance = component.viewDistance << 4;

    // Get all the entities in the player's dimension
    const entities = this.player.dimension.entities;

    // Iterate over the entities
    for (const [unique, entity] of entities) {
      // Check if the entity is the player or if the entity has already been rendered
      if (this.entities.has(unique) || entity === this.player) continue;

      // Check if the entity is hidden
      if (this.hidden.has(unique)) continue;

      // Check if the entity is alive
      if (!entity.isAlive) continue;

      // Check if the entity is within the player's view distance
      if (this.distance(entity.position, this.player.position) > viewDistance)
        continue;

      // Create a new MobArmorEquipmentPacket
      const armor = new MobArmorEquipmentPacket();

      // Check if the entity has an equipment component
      if (entity.hasTrait(EntityEquipmentTrait)) {
        // Get the equipment component
        const trait = entity.getTrait(EntityEquipmentTrait);

        // Set the head, chest, legs, and feet armor
        const head =
          trait.getEquipment(EquipmentSlot.Head) ?? ItemStack.empty();
        const chest =
          trait.getEquipment(EquipmentSlot.Chest) ?? ItemStack.empty();
        const legs =
          trait.getEquipment(EquipmentSlot.Legs) ?? ItemStack.empty();
        const feet =
          trait.getEquipment(EquipmentSlot.Feet) ?? ItemStack.empty();

        // Assign the packet properties
        armor.runtimeId = entity.runtimeId;
        armor.helmet = ItemStack.toNetworkStack(await head);
        armor.chestplate = ItemStack.toNetworkStack(await chest);
        armor.leggings = ItemStack.toNetworkStack(await legs);
        armor.boots = ItemStack.toNetworkStack(await feet);
        armor.body = ItemStack.toNetworkStack(await ItemStack.empty());
      }

      // Add the entity to the rendered entities
      this.entities.add(unique);

      // Check if the entity is a player
      if (entity.isPlayer()) {
        // Create a new AddPlayerPacket
        const packet = new AddPlayerPacket();

        // Get the players inventory
        const inventory = entity.getTrait(EntityInventoryTrait);

        // Get the players held item
        const heldItem = inventory.getHeldItem();

        // Set the packet properties
        packet.uuid = entity.uuid;
        packet.username = entity.username;
        packet.runtimeId = entity.runtimeId;
        packet.platformChatId = String(); // TODO: Not sure what this is
        packet.position = entity.position;
        packet.velocity = entity.velocity;
        packet.pitch = entity.rotation.pitch;
        packet.yaw = entity.rotation.yaw;
        packet.headYaw = entity.rotation.headYaw;
        packet.heldItem =
          heldItem === null
            ? new NetworkItemStackDescriptor(0)
            : ItemStack.toNetworkStack(heldItem);
        packet.gamemode = entity.gamemode;
        packet.data = [...entity.metadata.values()];
        packet.properties = new PropertySyncData([], []);
        packet.uniqueEntityId = entity.uniqueId;
        packet.premissionLevel = entity.isOp
          ? PermissionLevel.Operator
          : PermissionLevel.Member;

        packet.commandPermission = entity.isOp
          ? CommandPermissionLevel.Operator
          : CommandPermissionLevel.Normal;

        packet.abilities = [
          {
            type: AbilityLayerType.Base,
            abilities: [...entity.abilities.entries()].map(
              ([ability, value]) => new AbilitySet(ability, value)
            ),
            walkSpeed: 0.1,
            verticalFlySpeed: 1.0,
            flySpeed: 0.05
          }
        ];
        packet.links = [];
        packet.deviceId = entity.device.identifier;
        packet.deviceOS = entity.device.os;

        // Adjust the player's position for rendering
        packet.position.y -= entity.hitboxHeight; // Adjust the y position for the player

        // Send the packet to the player
        await this.player.send(packet);
        if (entity.hasTrait(EntityEquipmentTrait))
          await this.player.send(armor);

        // Continue to the next entity
        continue;
      }

      // Adjust the entity's position
      const position = new Vector3f(
        entity.position.x,
        entity.position.y - entity.hitboxHeight,
        entity.position.z
      );

      // Check if the entity is an item
      if (entity.isItem()) {
        // Get the item component
        const itemComponent = entity.getTrait(EntityItemStackTrait);
        if (!itemComponent.isReady()) continue;

        // Create a new AddItemActorPacket
        const packet = new AddItemActorPacket();

        // Set the packet properties
        packet.uniqueId = entity.uniqueId;
        packet.runtimeId = entity.runtimeId;
        packet.item = ItemStack.toNetworkStack(itemComponent.itemStack);
        packet.position = position;
        packet.velocity = entity.velocity;
        packet.data = [...entity.metadata.values()];
        packet.fromFishing = false;

        // Send the packet to the player
        await this.player.send(packet);
        if (entity.hasTrait(EntityEquipmentTrait))
          await this.player.send(armor);

        // Continue to the next entity
        continue;
      }

      // Create a new AddEntityPacket
      const packet = new AddEntityPacket();

      // Set the packet properties
      packet.uniqueEntityId = entity.uniqueId;
      packet.runtimeId = entity.runtimeId;
      packet.identifier = entity.type.identifier;
      packet.position = position;
      packet.velocity = entity.velocity;
      packet.pitch = entity.rotation.pitch;
      packet.yaw = entity.rotation.yaw;
      packet.headYaw = entity.rotation.headYaw;
      packet.bodyYaw = entity.rotation.yaw;
      packet.attributes = [];
      packet.data = [...entity.metadata.values()];
      packet.properties = new PropertySyncData([], []);
      packet.links = [];

      // Send the packet to the player
      await this.player.send(packet);
      if (entity.hasTrait(EntityEquipmentTrait)) await this.player.send(armor);
    }

    // Iterate over the entities
    for (const unique of this.entities) {
      // Check if the entity is still in the player's dimension
      if (this.player.dimension.entities.has(unique)) {
        // Get the entity
        const entity = this.player.dimension.entities.get(unique);
        if (!entity) continue;

        // Calculate the distance from the player to the entity
        const distance = this.distance(entity.position, this.player.position);

        // Check if the entity is in the player's view distance
        // And that the entity is alive
        if (
          distance <= viewDistance &&
          entity.isAlive === true // Ensure the entity is alive
        )
          continue;

        // Create a new remove entity packet
        const packet = new RemoveEntityPacket();

        // Set the unique entity id
        packet.uniqueEntityId = unique;

        // Send the packet to the player
        await this.player.send(packet);

        // Remove the entity from the rendered entities
        this.entities.delete(unique);
      } else {
        // Create a new remove entity packet
        const packet = new RemoveEntityPacket();
        packet.uniqueEntityId = unique;

        // Send the packet to the player
        await this.player.send(packet);

        // Remove the entity from the rendered entities
        this.entities.delete(unique);
      }
    }
  }

  public async onRemove(): Promise<void> {
    // Clear the entities
    return this.clear();
  }

  /**
   * Clears all the entities that have been rendered for the player.
   */
  public async clear(): Promise<void> {
    // Iterate over the entities
    for (const unique of this.entities) {
      // Create a new remove entity packet
      const packet = new RemoveEntityPacket();
      packet.uniqueEntityId = unique;

      // Send the packet to the player
      await this.player.send(packet);
    }

    // Clear the entities
    this.entities.clear();
  }

  public distance(a: Vector3f, b: Vector3f): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
    );
  }

  /**
   * Hides an entity from the player.
   * @param entity The entity to hide from the target player.
   */
  public async hideEntity(entity: Entity | bigint): Promise<void> {
    // Get the unique entity id
    const unique = typeof entity === "bigint" ? entity : entity.uniqueId;

    // Check if the entity is already hidden
    if (this.hidden.has(unique)) return;

    // Add the entity to the hidden entities
    this.hidden.add(unique);

    // Create a new remove entity packet
    const packet = new RemoveEntityPacket();
    packet.uniqueEntityId = unique;

    // Send the packet to the player
    return this.player.send(packet);
  }

  /**
   * Unhides an entity from the target player.
   * @param entity The entity to unhide from the target player.
   */
  public unhideEntity(entity: Entity | bigint): void {
    // Get the unique entity id
    const unique = typeof entity === "bigint" ? entity : entity.uniqueId;

    // Check if the entity is hidden
    if (!this.hidden.has(unique)) return;

    // Remove the entity from the hidden entities
    this.hidden.delete(unique);
  }

  public async onDespawn(options: EntityDespawnOptions): Promise<void> {
    // Clear the entities from the player's view if the entity has not died
    if (!options.hasDied) await this.clear();
  }

  public async onSpawn(details: EntitySpawnOptions): Promise<void> {
    // Clear the entities if the spawn details indicate that the dimensions have changed
    if (details.changedDimensions) await this.clear();
  }
}

export { PlayerEntityRenderingTrait };
