import { BlockFace } from "@serenityjs/protocol";

import { BlockType } from "../identity";
import { Block } from "../block";
import { BlockPlacementOptions } from "../..";

import { BlockTrait } from "./trait";

class BlockSupportTrait extends BlockTrait {
  public static readonly identifier: string = "support";

  /**
   * The block type that provides support for this block.
   * If null, any solid block can provide support.
   */
  protected supportBlockType: BlockType | null = null;

  /**
   * The directions from which the block can be supported.
   * Only one of these directions will actively support the block at a time.
   */
  protected allowedSupportDirections: Array<BlockFace> = [
    BlockFace.Bottom,
    BlockFace.Top,
    BlockFace.North,
    BlockFace.South,
    BlockFace.East,
    BlockFace.West
  ];

  /**
   * The direction that is currently providing support.
   * This is set during placement and checked during updates.
   */
  protected activeSupportDirection: BlockFace | null = null;

  public constructor(block: Block) {
    super(block);

    // By default, support is provided from below
    if (this.allowedSupportDirections.length === 0)
      this.allowedSupportDirections.push(BlockFace.Bottom);
  }

  /**
   * Checks if a block in the given direction provides valid support.
   * @param direction The direction to check for support.
   * @returns True if the block in the given direction provides valid support, false otherwise.
   */
  protected isValidSupport(direction: BlockFace): boolean {
    const supportBlock = this.block.face(direction);

    if (!supportBlock) return false;

    // If a specific support block type is required, check for it
    if (this.supportBlockType !== null)
      return supportBlock.type === this.supportBlockType;

    // If no specific support block type is defined, any solid block can provide support
    return supportBlock.isSolid;
  }

  /**
   * Finds the first valid support direction from the allowed directions.
   * @returns The valid support direction or null.
   */
  protected findValidSupportDirection(): BlockFace | null {
    // Check each allowed support direction for validity
    for (const direction of this.allowedSupportDirections)
      if (this.isValidSupport(direction)) return direction;

    return null;
  }

  public onPlace(options: BlockPlacementOptions): boolean | void {
    // Find a valid support direction
    this.activeSupportDirection = this.findValidSupportDirection();

    if (this.activeSupportDirection === null)
      // No valid support found, cancel placement
      options.cancel = true;
  }

  public onUpdate(): void {
    // If no active support direction is set, try to find one
    if (this.activeSupportDirection === null)
      this.activeSupportDirection = this.findValidSupportDirection();

    // Check if the active support direction is still valid
    if (
      this.activeSupportDirection === null ||
      !this.isValidSupport(this.activeSupportDirection)
    )
      // Support was destroyed, destroy this block
      this.block.destroy({ dropLoot: true });
  }
}

/**
 * A trait for blocks that can only be supported from below.
 * Example: Grass blocks can only be placed on top of solid blocks.
 */
class FloorBlockSupportTrait extends BlockSupportTrait {
  public static readonly identifier = "floor_support";
  public static types = ["minecraft:short_grass"];

  protected allowedSupportDirections = [BlockFace.Bottom];
}

/**
 * A trait for blocks that can only be supported from above.
 * Example: Hanging lanterns can only be placed on the underside of solid blocks.
 */
class CeilingBlockSupportTrait extends BlockSupportTrait {
  public static readonly identifier = "ceiling_support";

  protected allowedSupportDirections = [BlockFace.Top];
}

/**
 * A trait for blocks that can only be supported from the sides.
 * Example: Wall-mounted torches can only be placed on the sides of solid blocks.
 */
class WallBlockSupportTrait extends BlockSupportTrait {
  public static readonly identifier = "wall_support";
  public static types = ["minecraft:ladder"];

  protected allowedSupportDirections = [
    BlockFace.North,
    BlockFace.South,
    BlockFace.East,
    BlockFace.West
  ];
}

/**
 * A trait for blocks that can be supported from both above and below.
 * Example: Lanterns that can hang from ceilings or sit on floors.
 */
class VerticalBlockSupportTrait extends BlockSupportTrait {
  public static readonly identifier = "vertical_support";
  public static types = ["minecraft:lantern"];

  protected allowedSupportDirections = [BlockFace.Top, BlockFace.Bottom];
}

export {
  BlockSupportTrait,
  FloorBlockSupportTrait,
  CeilingBlockSupportTrait,
  WallBlockSupportTrait,
  VerticalBlockSupportTrait
};
