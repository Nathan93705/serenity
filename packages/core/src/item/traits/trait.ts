import { ItemUseMethod } from "@serenityjs/protocol";
import { Awaitable } from "@serenityjs/emitter";

import { Player } from "../../entity";
import { ItemIdentifier } from "../../enums";
import { Trait } from "../../trait";
import {
  ItemUseOnBlockOptions,
  ItemUseOnEntityOptions,
  ItemUseOptions,
  JSONLikeObject
} from "../../types";
import { ItemStack } from "../stack";

class ItemTrait<T extends ItemIdentifier> extends Trait {
  /**
   * The item type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<ItemIdentifier> = [];

  /**
   * The item tag that this trait is compatible with by default.
   * If null, the trait will not attach to any item stack by default.
   */
  public static readonly tag: string | null = null;

  /**
   * The item component that this trait is compatible with by default.
   * If null, the trait will not attach to any item stack by default.
   */
  public static readonly component: string | null = null;

  /**
   * The item stack that this trait is attached to.
   */
  protected readonly item: ItemStack<T>;

  /**
   * Creates a new instance of the item trait.
   * @param item The item stack that this trait will be attached to.
   * @param options additional options for the item trait.
   */
  public constructor(item: ItemStack<T>, _options?: JSONLikeObject) {
    super();
    this.item = item;
  }

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   * @returns Whether the item use was successful; default is true
   */
  public onStartUse?(
    player: Player,
    options: ItemUseOptions
  ): Awaitable<boolean | void>;

  /**
   * Called when the item is stopped being used by a player.
   * @param player The player that stopped using the item.
   * @param options The additional options for the item use.
   */
  public onStopUse?(
    player: Player,
    options: ItemUseOptions
  ): Awaitable<boolean | void>;

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUse?(
    player: Player,
    options: ItemUseOptions
  ): Awaitable<boolean | ItemUseMethod | void>;

  /**
   * Called when the item is used on a block by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUseOnBlock?(
    player: Player,
    options: ItemUseOnBlockOptions
  ): Awaitable<boolean | ItemUseMethod | void>;

  /**
   * Called when the item is used on an entity by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUseOnEntity?(
    player: Player,
    options: ItemUseOnEntityOptions
  ): Awaitable<boolean | ItemUseMethod | void>;

  /**
   * Called when the release action is triggered by a player.
   * @param player The player that released the item.
   */
  public onRelease?(player: Player): Awaitable<void>;

  /**
   * Called when the container that the item is stored in is opened.
   * @param player The player that opened the container.
   */
  public onContainerOpen?(player: Player): Awaitable<void>;

  /**
   * Called when the container that the item is stored in is closed.
   * @param player The player that closed the container
   */
  public onContainerClose?(player: Player): Awaitable<void>;

  /**
   * Compares another item trait to this one.
   * @param other The other item trait to compare.
   * @returns Whether the item traits are equal.
   */
  public equals(other: ItemTrait<T>): boolean {
    return this.identifier === other.identifier;
  }

  /**
   * Clones the item trait to another item stack.
   * @param item The item stack to clone the component to.
   * @returns A new item trait.
   */
  public clone(item: ItemStack<T>): this {
    // Create a new instance of the trait
    const component = new (this.constructor as new (
      item: ItemStack<T>,
      identifier: string
    ) => ItemTrait<T>)(item, this.identifier) as this;

    // Copy the key-value pairs.
    for (const [key, value] of Object.entries(this)) {
      // Skip the item.
      if (key === "item") continue;

      // @ts-expect-error
      component[key] = value;
    }

    // Return the trait
    return component;
  }
}

export { ItemTrait };
