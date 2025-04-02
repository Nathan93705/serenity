import {
  BlockActorDataPacket,
  ChunkCoords,
  LevelChunkPacket,
  NetworkChunkPublisherUpdatePacket,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { Chunk } from "../../../world/chunk";
import { EntityDespawnOptions, EntitySpawnOptions } from "../../..";

import { PlayerTrait } from "./trait";

class PlayerChunkRenderingTrait extends PlayerTrait {
  public static readonly identifier = "chunk_rendering";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The current chunk hashes that have been sent to the player.
   */
  public readonly chunks = new Set<bigint>();

  /**
   * The view distance of the player.
   */
  public viewDistance = this.player.dimension.viewDistance;

  /**
   * Sends a chunk to the player.
   * @param chunks The chunks to send to the player.
   */
  public send(...chunks: Array<Chunk>): void {
    // Get the amount of chunks to send
    const amount = chunks.length;

    // We want to send the chunks in batches of 8
    const batches = Math.ceil(amount / 8);

    // Iterate over the batches
    for (let index = 0; index < batches; index++) {
      // Get the start and end index of the batch
      const start = index * 8;
      const end = Math.min(start + 8, amount);

      // Get the chunks to send
      const batch = chunks.slice(start, end);
      const levelChunks = batch.map((chunk) => {
        // Add the chunk to the player's view
        this.chunks.add(chunk.hash);

        // Create a new LevelChunkPacket
        const packet = new LevelChunkPacket();

        // Assign the chunk data to the packet
        packet.x = chunk.x;
        packet.z = chunk.z;
        packet.dimension = chunk.type;
        packet.subChunkCount = chunk.getSubChunkSendCount();
        packet.cacheEnabled = false;
        packet.data = Chunk.serialize(chunk);

        // Return the packet
        return packet;
      });

      // Send the packets to the player
      this.player.send(...levelChunks);
    }

    // Iterate over the blocks in the dimension
    for (const [, block] of this.player.dimension.blocks) {
      // Check if the block has NBT data
      if (block.nbt.size === 0) continue;

      // Check if the block is in the chunks
      if (chunks.some((chunk) => block.getChunk() === chunk)) {
        // Create a new BlockActorData packet
        const packet = new BlockActorDataPacket();

        // Assign the packet values
        packet.position = block.position;
        packet.nbt = block.nbt.toCompound();

        // Send the packet to the player
        this.player.send(packet);
      }
    }
  }

  /**
   * Checks if a chunk has been sent to the player.
   * @param hash The hash of the chunk to check.
   * @returns True if the chunk has been sent, false otherwise.
   */
  public sent(hash: bigint): boolean {
    return this.chunks.has(hash);
  }

  /**
   * Gets the distance between the player and a chunk.
   * @param chunk The hash of the chunk to get the distance to.
   * @returns The distance between the player and the chunk.
   */
  public distance(hash: bigint): number {
    // Convert the chunk hash to a chunk position
    const { x: cx, z: cz } = ChunkCoords.unhash(hash);

    // Get the player's chunk position
    const px = this.player.position.x >> 4;
    const pz = this.player.position.z >> 4;

    // Calculate the Euclidean distance between the player and the chunk
    return Math.hypot(cx - px, cz - pz);
  }

  /**
   * Gets the next set of chunk hashes to send to the player.
   * @note This method obtains the chunks that are within the player's view distance.
   * @param distance The distance to calculate the chunks for.
   * @returns An array of chunk hashes to send to the player.
   */
  public next(distance?: number): Array<Chunk> {
    // Calculate the chunk position of the entity
    const cx = this.player.position.x >> 4;
    const cz = this.player.position.z >> 4;

    // Calculate the distance or use the simulation distance of the dimension
    const d = distance ?? this.viewDistance;

    // Prepare an array to store the chunks that need to be sent to the player.
    const hashes: Array<bigint> = [];

    // Get the chunks to render, we want to get the chunks from the inside out
    for (let dx = -d; dx <= d; dx++) {
      for (let dz = -d; dz <= d; dz++) {
        // Get the hash of the chunk
        const hash = ChunkCoords.hash({ x: cx + dx, z: cz + dz });

        // Check if the chunk is already rendered
        if (this.chunks.has(hash)) continue;

        // Calculate the distance between the player and the chunk
        const distance = Math.hypot(dx, dz);

        // Check if the chunk is within the view distance
        if (distance <= d + 0.5) hashes.push(hash);
      }
    }

    // Convert the hashes to coordinates
    const coords = hashes.map((hash) => ChunkCoords.unhash(hash));

    // Get the chunks to send
    const chunks = coords
      .map((coord) => {
        // Get the chunk from the dimension
        const chunk = this.player.dimension.getChunk(coord.x, coord.z);

        // Check if the chunk is ready
        if (!chunk.ready) return null;

        // Return the chunk
        return chunk;
      })
      .filter((chunk) => chunk !== null) as Array<Chunk>;

    // Return the chunks
    return chunks;
  }

  /**
   * Clears the chunks from the player's view.
   * @param position The position of the chunk to clear.
   */
  public clear(position?: ChunkCoords): void {
    // Convert the hashes to coordinates
    const coords = position
      ? [position]
      : [...this.chunks].map((hash) => ChunkCoords.unhash(hash));

    // Create an empty chunk
    const empty = new Chunk(0, 0, this.player.dimension.type);

    // Iterate over the coordinates
    for (const coord of coords) {
      // Create a new LevelChunkPacket
      const packet = new LevelChunkPacket();

      // Assign the chunk data to the packet
      packet.x = coord.x;
      packet.z = coord.z;
      packet.dimension = this.player.dimension.type;
      packet.subChunkCount = empty.getSubChunkSendCount();
      packet.cacheEnabled = false;
      packet.data = Chunk.serialize(empty);

      // Send the packet to the player
      this.player.send(packet);

      // Remove the chunk from the player's view
      this.chunks.delete(ChunkCoords.hash(coord));
    }
  }

  public onTick(): void {
    // Check if the player is spawned
    if (!this.player.isAlive) return;

    // Get the next chunks to send to the player
    const chunks = this.next();

    // Check if there are any chunks to send
    if (chunks.length > 0) {
      // Send the chunks to the player
      this.send(...chunks);

      // Create a new NetworkChunkPublisherUpdatePacket
      const update = new NetworkChunkPublisherUpdatePacket();

      // Assign the values to the packet
      update.radius = this.viewDistance << 4;
      update.coordinate = Vector3f.floor(this.player.position);
      update.savedChunks = [...this.chunks].map((hash) =>
        ChunkCoords.unhash(hash)
      );

      // Send the packets to the player
      this.player.send(update);
    } else {
      // Check if any chunks need to be removed from the player's view
      for (const hash of this.chunks) {
        // Get the distance between the player and the chunk
        const distance = this.distance(hash);

        // Check if the chunk is outside of the player's view distance
        if (distance > this.viewDistance + 0.5) {
          // Get the chunk position
          const { x, z } = ChunkCoords.unhash(hash);

          // Clear the chunk from the player's view
          this.clear({ x, z });
        }
      }
    }
  }

  public onRemove(): void {
    // Clear the chunks from the player's view
    this.clear();
  }

  public onDespawn(options: EntityDespawnOptions): void {
    // Clear the chunks from the player's view if the player has not died
    if (!options.hasDied) this.clear();
  }

  public onSpawn(details: EntitySpawnOptions): void {
    if (details.changedDimensions) this.clear();
  }
}

export { PlayerChunkRenderingTrait };
