import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { SignedBlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.OpenSign)
class OpenSignPacket extends DataPacket {
  @Serialize(SignedBlockPosition)
  public position!: SignedBlockPosition;

  @Serialize(Bool)
  public isFrontSide!: boolean;
}

export { OpenSignPacket };
