import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";
import { SignedBlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BlockActorData)
class BlockActorDataPacket extends DataPacket {
  @Serialize(SignedBlockPosition) public position!: SignedBlockPosition;
  @Serialize(CompoundTag, { varint: true }) public nbt!: CompoundTag;
}

export { BlockActorDataPacket };
