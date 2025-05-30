import type { CommandRegistry } from "./registry";
import type { CommandCallback } from "../types";

class Command<T = unknown> {
  /**
   * The name of the command.
   */
  public readonly name: string;

  /**
   * The description of the command.
   */
  public readonly description: string;

  /**
   * The registry of the command.
   */
  public readonly registry: CommandRegistry;

  /**
   * The callback of the command.
   */
  public readonly callback: CommandCallback<T>;

  /**
   * Creates a new command.
   * @param name The name of the command.
   * @param description The description of the command.
   * @param registry The registry of the command.
   * @param callback The callback of the command.
   */
  public constructor(
    name: string,
    description: string,
    registry: CommandRegistry,
    callback: CommandCallback<T>
  ) {
    // Assign the properties of the command

    this.name = name;
    this.description = description;
    this.registry = registry;
    this.callback = callback;
  }
}

export { Command };
