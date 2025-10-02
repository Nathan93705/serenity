interface WhitelistEntry {
  /**
   * The XUID of the whitelisted player.
   */
  xuid?: string;
  /**
   * The name of the whitelisted player.
   */
  name?: string;
}

interface WhitelistProperty {
  /**
   * Whether the whitelist is enabled.
   */
  enabled: boolean;
  /**
   * The path to the whitelist file.
   */
  path: string;
  /**
   * The message to display when a non-whitelisted player attempts to join.
   */
  kickMessage: string;
}

export { WhitelistEntry, WhitelistProperty };
