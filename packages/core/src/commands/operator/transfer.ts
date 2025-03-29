import { IntegerEnum, StringEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  world.commandPalette.register(
    "transfer",
    "Transfer a player to a different server",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      registry.overload(
        {
          target: TargetEnum,
          address: StringEnum,
          port: IntegerEnum
        },
        async (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Check if there are any targets
          if (targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Prepare the return message
          const message = [];

          // Get the address from the context
          const address = context.address.result as string;

          // Get the port from the context
          const port = context.port.result as number;

          // Loop through all the targets
          for (const target of targets) {
            // Check if the target is a player
            if (!target.isPlayer()) {
              // Append the message
              message.push(
                `§cEntity §4${target.uniqueId}§c is not a player.§r`
              );

              // Skip to the next target
              continue;
            }

            // Transfer the player to the new server
            await target.transfer(address, port);

            // Append the message
            message.push(
              `§aTransferred §2${target.username}§a to §2${address}:${port}§a.§r`
            );
          }

          // Return the message
          return { message: message.join("\n") };
        }
      );
    },
    () => {}
  );
};

export default register;
