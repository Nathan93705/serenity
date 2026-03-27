import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
  Packet,
  type UpdateBlockFlagsType,
  type UpdateBlockLayerType
} from "../../enums";
import { SignedBlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateBlock)
class UpdateBlockPacket extends DataPacket {
  @Serialize(SignedBlockPosition) public position!: SignedBlockPosition;
  @Serialize(VarInt) public networkBlockId!: number;
  @Serialize(VarInt) public flags!: UpdateBlockFlagsType;
  @Serialize(VarInt) public layer!: UpdateBlockLayerType;
}

export { UpdateBlockPacket };
