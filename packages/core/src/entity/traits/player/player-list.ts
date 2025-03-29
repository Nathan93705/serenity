import {
  PlayerListAction,
  PlayerListPacket,
  PlayerListRecord
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { PlayerTrait } from "./trait";

class PlayerListTrait extends PlayerTrait {
  public static readonly identifier = "player_list";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The players that are being displayed in the player list.
   */
  public readonly players = new Set<string>();

  /**
   * Clears the player list.
   */
  public async clear(): Promise<void> {
    // Remove all the players from the player list
    const remove = new PlayerListPacket();
    remove.action = PlayerListAction.Remove;
    remove.records = [...this.players].map(
      (uuid) => new PlayerListRecord(uuid)
    );

    // Clear the player list
    this.players.clear();

    // Send the remove packet to the player
    return this.player.send(remove);
  }

  public async onTick(): Promise<void> {
    // Check if the player is spawned
    if (!this.player.isAlive) return;

    // Get the current tick of the world
    const currentTick = this.player.dimension.world.currentTick;

    // Check if the current tick is divisible by 20
    // We don't need this running every tick
    if (currentTick % 20n !== 0n) return;

    // Get all the players in the player's world
    const players = this.player.dimension.world.getPlayers();

    // Filter out the players that are already in the player list & if the player is spawned
    const adding = players.filter(
      (player) => !this.players.has(player.uuid) && player.isAlive
    );

    // Create a new player list packet for the players that need to be added to the player list
    const add = new PlayerListPacket();
    add.action = PlayerListAction.Add;
    add.records = adding.map((player) => ({
      uniqueId: player.uniqueId,
      uuid: player.uuid,
      xuid: player.xuid,
      username: player.username,
      skin: player.skin,
      platformBuild: player.device.os,
      platformChatIdentifier: "",
      isHost: false,
      isVisitor: false,
      isTeacher: false
    }));

    // Filter out the players that need to be removed from the player list
    const removing = [...this.players].filter(
      (uuid) => !players.some((x) => x.uuid === uuid)
    );

    // Create a new player list packet for the players that need to be removed from the player list
    const remove = new PlayerListPacket();
    remove.action = PlayerListAction.Remove;
    remove.records = removing.map((uuid) => new PlayerListRecord(uuid));

    // Send the player list packets to the player
    if (add.records.length > 0) await this.player.send(add);
    if (remove.records.length > 0) await this.player.send(remove);

    // Update the player list
    await Promise.all(
      adding.map(async (player) => {
        // Add the player to the player list
        this.players.add(player.uuid);

        // Update the player's metadata and abilities
        return Promise.all([
          player.metadata.update(),
          player.abilities.update()
          // player.abilities.update()
        ]);
      })
    );

    // Update the player list
    for (const uuid of removing) this.players.delete(uuid);
  }

  public async onDespawn(): Promise<void> {
    // Clear the player list
    return this.clear();
  }

  public onRemove(): Promise<void> {
    // Clear the player list
    return this.clear();
  }
}

export { PlayerListTrait };
