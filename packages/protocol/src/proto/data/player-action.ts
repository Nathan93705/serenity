import { VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type PlayerActionType, Packet } from "../../enums";
import { SignedBlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerAction)
class PlayerActionPacket extends DataPacket {
  @Serialize(VarLong) public entityRuntimeId!: bigint;
  @Serialize(ZigZag) public action!: PlayerActionType;
  @Serialize(SignedBlockPosition) public blockPosition!: SignedBlockPosition;
  @Serialize(SignedBlockPosition) public resultPosition!: SignedBlockPosition;
  @Serialize(ZigZag) public face!: number;
}

export { PlayerActionPacket };
