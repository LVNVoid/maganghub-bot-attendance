import { describe, it, expect } from "vitest";
import { cleanCommitMessage, isUsefulCommit } from "./github";

describe("GitHub Helper Functions", () => {
  it("should extract only the first line of a multiline commit message", () => {
    const multiline = "feat: add user authentication\n\nDetailed explanation of auth flow";
    expect(cleanCommitMessage(multiline)).toBe("feat: add user authentication");
  });

  it("should filter out merge commits", () => {
    expect(isUsefulCommit("Merge branch 'main' of github.com")).toBe(false);
    expect(isUsefulCommit("Merge pull request #42 from fix/auth")).toBe(false);
  });

  it("should filter out bare wip commits", () => {
    expect(isUsefulCommit("wip")).toBe(false);
    expect(isUsefulCommit("WIP")).toBe(false);
  });

  it("should keep feature, fix, and refactor commits", () => {
    expect(isUsefulCommit("feat: implement AES-256 encryption")).toBe(true);
    expect(isUsefulCommit("fix: handle null credential state")).toBe(true);
    expect(isUsefulCommit("refactor: optimize database queries")).toBe(true);
  });
});
