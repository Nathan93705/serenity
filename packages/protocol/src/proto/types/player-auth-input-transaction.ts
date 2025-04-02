import { DataType } from "@serenityjs/raknet";

import { InputData } from "../../enums";

import { InputTransaction } from "./input-transaction";
import { PlayerAuthInputData } from "./player-auth-input-data";

import type { BinaryStream } from "@serenityjs/binarystream";

export class PlayerAuthInputTransaction extends DataType {
  public inputTransaction: InputTransaction;

  public constructor(inputTransaction: InputTransaction) {
    super();
    this.inputTransaction = inputTransaction;
  }

  public static write(
    stream: BinaryStream,
    value: InputTransaction,
    _: unknown,
    data: PlayerAuthInputData
  ) {
    if (!PlayerAuthInputData.hasFlag(data, InputData.PerformItemInteraction))
      return;

    InputTransaction.write(stream, value);
  }

  public static read(
    stream: BinaryStream,
    _: unknown,
    data: PlayerAuthInputData
  ): InputTransaction | null {
    if (!PlayerAuthInputData.hasFlag(data, InputData.PerformItemInteraction))
      return null;

    return InputTransaction.read(stream);
  }
}
