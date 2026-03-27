import { Proto, Serialize } from "@serenityjs/raknet";
import { ZigZag } from "@serenityjs/binarystream";

import { SignedBlockPosition } from "../types";
import { Packet, SpawnType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetSpawnPosition)
class SetSpawnPositionPacket extends DataPacket {
  @Serialize(ZigZag) public spawnType!: SpawnType;
  @Serialize(SignedBlockPosition) public playerPosition!: SignedBlockPosition;
  @Serialize(ZigZag) public dimension!: number;
  @Serialize(SignedBlockPosition) public worldPosition!: SignedBlockPosition;
}

export { SetSpawnPositionPacket };
