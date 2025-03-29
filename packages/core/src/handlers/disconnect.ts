import { DisconnectPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerLeaveSignal } from "../events";

class DisconnectHandler extends NetworkHandler {
  public static readonly packet = Packet.Disconnect;

  public async handle(
    packet: DisconnectPacket,
    connection: Connection
  ): Promise<void> {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Create a PlayerLeaveSignal
    await new PlayerLeaveSignal(
      player,
      packet.reason,
      packet.message.message ?? String()
    ).emit();

    // Despawn the player
    await player.despawn();

    // Save the player's data
    player.world.provider.writePlayer(player.getDataEntry(), player.dimension);

    // Nullify the player's permissions
    player.permissions.player = null;

    // Log the leave event to the console
    player.world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player left the server.`
    );
  }
}

export { DisconnectHandler };
