import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { resolveMetadata } from "./subgraph";

describe("resolveMetadata", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves http metadata", async () => {
    const mockData = {
      name: "Test Agent",
      description: "A test agent",
      image: "http://example.com/image.png",
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockData),
    });

    const result = await resolveMetadata("http://example.com/metadata.json");

    expect(result).toEqual({
      name: "Test Agent",
      description: "A test agent",
      image: "http://example.com/image.png",
      mcpEndpoint: null,
      a2aEndpoint: null,
      supportedTrusts: null,
    });
    expect(global.fetch).toHaveBeenCalledWith("http://example.com/metadata.json");
  });

  it("resolves ipfs metadata", async () => {
    const mockData = {
      name: "IPFS Agent",
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockData),
    });

    const result = await resolveMetadata("ipfs://QmHash");

    expect(result).toEqual({
      name: "IPFS Agent",
      description: null,
      image: null,
      mcpEndpoint: null,
      a2aEndpoint: null,
      supportedTrusts: null,
    });
    expect(global.fetch).toHaveBeenCalledWith("https://ipfs.io/ipfs/QmHash");
  });

  it("resolves data uri metadata", async () => {
    const mockData = { name: "Data Agent" };
    const base64 = btoa(JSON.stringify(mockData));
    const uri = `data:application/json;base64,${base64}`;

    const result = await resolveMetadata(uri);

    expect(result).toEqual({
      name: "Data Agent",
      description: null,
      image: null,
      mcpEndpoint: null,
      a2aEndpoint: null,
      supportedTrusts: null,
    });
  });

  it("returns null on fetch failure", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
    });

    const result = await resolveMetadata("http://example.com/fail");
    expect(result).toBeNull();
  });
});
