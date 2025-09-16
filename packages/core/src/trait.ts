import { JSONLikeObject } from "./types";

interface TraitOnTickDetails {
  /**
   * The current tick of the world.
   */
  currentTick: bigint;

  /**
   * The time between the current tick and the last tick.
   */
  deltaTick: number;
}

class Trait {
  /**
   * The identifier of the trait.
   */
  public static readonly identifier: string;

  /**
   * The type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<string>;

  /**
   * The identifier of the trait.
   */
  public readonly identifier = (this.constructor as typeof Trait).identifier;

  /**
   * Creates a new instance of the trait.
   * @param options additional options for the trait.
   */
  public constructor(_options?: JSONLikeObject) {
    return this;
  }

  /**
   * Called when the trait is added to an object.
   */
  public onAdd?(): void;

  /**
   * Called when the trait is removed from an object.
   */
  public onRemove?(): void;

  /**
   * Called when the trait is ticked by the dimension.
   * @param details The details about the tick event.
   */
  public onTick?(details: TraitOnTickDetails): void;

  /**
   * Called when the trait is random ticked by the dimension.
   */
  public onRandomTick?(): void;

  /**
   * Clones the trait with the specified arguments.
   * @param arguments The arguments to clone the trait with.
   */
  public clone(..._arguments: Array<unknown>): Trait {
    throw new Error(`${this.identifier}.clone() is not implemented`);
  }
}

export { TraitOnTickDetails, Trait };
