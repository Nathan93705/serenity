import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { WhitelistEntry, WhitelistProperty } from "./types";

/**
 * The default whitelist properties.
 */
const DefaultWhitelistProperties: WhitelistProperty = {
  enabled: false,
  path: "./whitelist.json",
  kickMessage: "You are not whitelisted on this server.",
};

/**
 * Represents a server whitelist.
 */
class Whitelist {
  public entries: Array<WhitelistEntry> = [];
  public enabled: boolean;
  public kickMessage: string;
  public path: string;

  public constructor(properties: Partial<WhitelistProperty>) {
    this.enabled = properties.enabled ?? DefaultWhitelistProperties.enabled;
    this.kickMessage =
      properties.kickMessage ?? DefaultWhitelistProperties.kickMessage;
    this.path = properties.path ?? DefaultWhitelistProperties.path;
  }

  /**
   * Checks if a player is whitelisted
   * @param entry The entry to check
   * @returns Whether the player is whitelisted
   */
  public isWhitelisted(entry: WhitelistEntry): boolean {
    if (!this.enabled) return true;
    return this.entries.some(
      (e) => e.xuid === entry.xuid || e.name === entry.name
    );
  }

  /**
   * Adds an entry to the whitelist
   * @param entry The entry to add
   */
  public addEntry(entry: WhitelistEntry): void {
    this.entries.push(entry);
    this.writeWhitelist(this.path);
  }

  /**
   * Removes an entry from the whitelist
   * @param entry The entry to remove
   */
  public removeEntry(entry: WhitelistEntry): void {
    this.entries = this.entries.filter(
      (e) => e.xuid !== entry.xuid && e.name !== entry.name
    );
    this.writeWhitelist(this.path);
  }

  /**
   * Updates an entry in the whitelist
   * @param searchEntry The entry to search for
   * @param newEntry The new entry to replace the old entry with
   */
  public updateEntry(
    searchEntry: WhitelistEntry,
    newEntry: WhitelistEntry
  ): void {
    this.entries = this.entries.map((e) => {
      if (e.xuid === searchEntry.xuid || e.name === searchEntry.name)
        return newEntry;
      return e;
    });
    this.writeWhitelist(this.path);
  }

  /**
   * Reads the whitelist from the specified path
   * @param path The path to read the whitelist from
   */
  public readWhitelist(path: string): Array<WhitelistEntry> {
    try {
      // Read the array from the file
      const buffer = readFileSync(resolve(path));

      // Parse the buffer as JSON
      const json = JSON.parse(buffer.toString());

      return json;
    } catch {
      // Return an empty whitelist array if the file could not be read
      return [];
    }
  }

  /**
   * Writes the whitelist to the specified path
   * @param path The path to write the whitelist to
   * @param entries The entries to write to the whitelist
   */
  public writeWhitelist(path: string) {
    try {
      // Write the whitelist to the file
      writeFileSync(resolve(path), JSON.stringify(this.entries, null, 2));
    } catch {
      return false;
    }
  }
}

export { Whitelist, DefaultWhitelistProperties };
