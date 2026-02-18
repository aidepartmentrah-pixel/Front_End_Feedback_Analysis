// PHASE G — G-F1 — Drawer Notes API Wrapper Tests
// src/api/__tests__/drawerNotesApi.test.js

import {
  listDrawerNotes,
  getDrawerNote,
  createDrawerNote,
  updateDrawerNoteText,
  updateDrawerNoteLabels,
  deleteDrawerNote,
  exportDrawerNotesWord,
} from "../drawerNotesApi";
import apiClient from "../apiClient";

// Mock apiClient
jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Drawer Notes API - G-F1 Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs in tests
  });

  // ============================================================================
  // listDrawerNotes
  // ============================================================================

  describe("listDrawerNotes", () => {
    test("calls correct endpoint with default limit and offset", async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      apiClient.get.mockResolvedValue(mockResponse);

      await listDrawerNotes({});

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v2/drawer-notes?limit=50&offset=0"
      );
    });

    test("calls correct endpoint with custom limit and offset", async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      apiClient.get.mockResolvedValue(mockResponse);

      await listDrawerNotes({ limit: 100, offset: 50 });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v2/drawer-notes?limit=100&offset=50"
      );
    });

    test("builds repeated label_ids query params for AND filtering", async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      apiClient.get.mockResolvedValue(mockResponse);

      await listDrawerNotes({ labelIds: [1, 3, 5], limit: 50, offset: 0 });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v2/drawer-notes?label_ids=1&label_ids=3&label_ids=5&limit=50&offset=0"
      );
    });

    test("handles empty labelIds array", async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      apiClient.get.mockResolvedValue(mockResponse);

      await listDrawerNotes({ labelIds: [], limit: 20, offset: 10 });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v2/drawer-notes?limit=20&offset=10"
      );
    });

    test("returns response data", async () => {
      const mockData = { items: [{ id: 1, note_text: "Test" }], total: 1 };
      apiClient.get.mockResolvedValue({ data: mockData });

      const result = await listDrawerNotes({});

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Network error");
      apiClient.get.mockRejectedValue(mockError);

      await expect(listDrawerNotes({})).rejects.toThrow("Network error");
    });
  });

  // ============================================================================
  // getDrawerNote
  // ============================================================================

  describe("getDrawerNote", () => {
    test("calls correct endpoint with note ID", async () => {
      const mockResponse = { data: { id: 10, note_text: "Sample note" } };
      apiClient.get.mockResolvedValue(mockResponse);

      await getDrawerNote(10);

      expect(apiClient.get).toHaveBeenCalledWith("/api/v2/drawer-notes/10");
    });

    test("returns response data", async () => {
      const mockData = { id: 10, note_text: "Sample note", label_ids: [1, 2] };
      apiClient.get.mockResolvedValue({ data: mockData });

      const result = await getDrawerNote(10);

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Note not found");
      apiClient.get.mockRejectedValue(mockError);

      await expect(getDrawerNote(999)).rejects.toThrow("Note not found");
    });
  });

  // ============================================================================
  // createDrawerNote
  // ============================================================================

  describe("createDrawerNote", () => {
    test("posts correct body to endpoint", async () => {
      const mockResponse = { data: { id: 1, note_text: "New note" } };
      apiClient.post.mockResolvedValue(mockResponse);

      const payload = {
        note_text: "New note",
        label_ids: [1, 2, 3],
      };

      await createDrawerNote(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/api/v2/drawer-notes", {
        note_text: "New note",
        label_ids: [1, 2, 3],
      });
    });

    test("returns response data", async () => {
      const mockData = { id: 5, note_text: "Created note", label_ids: [2] };
      apiClient.post.mockResolvedValue({ data: mockData });

      const result = await createDrawerNote({
        note_text: "Created note",
        label_ids: [2],
      });

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Validation error");
      apiClient.post.mockRejectedValue(mockError);

      await expect(
        createDrawerNote({ note_text: "", label_ids: [] })
      ).rejects.toThrow("Validation error");
    });
  });

  // ============================================================================
  // updateDrawerNoteText
  // ============================================================================

  describe("updateDrawerNoteText", () => {
    test("puts correct body to text endpoint", async () => {
      const mockResponse = { data: { id: 5, note_text: "Updated text" } };
      apiClient.put.mockResolvedValue(mockResponse);

      await updateDrawerNoteText(5, "Updated text");

      expect(apiClient.put).toHaveBeenCalledWith("/api/v2/drawer-notes/5/text", {
        note_text: "Updated text",
      });
    });

    test("returns response data", async () => {
      const mockData = { id: 3, note_text: "Changed content" };
      apiClient.put.mockResolvedValue({ data: mockData });

      const result = await updateDrawerNoteText(3, "Changed content");

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Not found");
      apiClient.put.mockRejectedValue(mockError);

      await expect(updateDrawerNoteText(999, "text")).rejects.toThrow(
        "Not found"
      );
    });
  });

  // ============================================================================
  // updateDrawerNoteLabels
  // ============================================================================

  describe("updateDrawerNoteLabels", () => {
    test("puts correct body to labels endpoint", async () => {
      const mockResponse = { data: { id: 8, label_ids: [4, 5] } };
      apiClient.put.mockResolvedValue(mockResponse);

      await updateDrawerNoteLabels(8, [4, 5]);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/v2/drawer-notes/8/labels",
        {
          label_ids: [4, 5],
        }
      );
    });

    test("returns response data", async () => {
      const mockData = { id: 2, label_ids: [1, 3, 7] };
      apiClient.put.mockResolvedValue({ data: mockData });

      const result = await updateDrawerNoteLabels(2, [1, 3, 7]);

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Invalid labels");
      apiClient.put.mockRejectedValue(mockError);

      await expect(updateDrawerNoteLabels(5, [])).rejects.toThrow(
        "Invalid labels"
      );
    });
  });

  // ============================================================================
  // deleteDrawerNote
  // ============================================================================

  describe("deleteDrawerNote", () => {
    test("calls delete on correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      await deleteDrawerNote(12);

      expect(apiClient.delete).toHaveBeenCalledWith("/api/v2/drawer-notes/12");
    });

    test("returns response data", async () => {
      const mockData = { success: true, deleted_id: 7 };
      apiClient.delete.mockResolvedValue({ data: mockData });

      const result = await deleteDrawerNote(7);

      expect(result).toEqual(mockData);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Delete failed");
      apiClient.delete.mockRejectedValue(mockError);

      await expect(deleteDrawerNote(999)).rejects.toThrow("Delete failed");
    });
  });

  // ============================================================================
  // exportDrawerNotesWord
  // ============================================================================

  describe("exportDrawerNotesWord", () => {
    test("calls export endpoint with blob responseType", async () => {
      const fakeBlob = new Blob(["fake docx content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      apiClient.get.mockResolvedValue({ data: fakeBlob });

      await exportDrawerNotesWord();

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v2/drawer-notes/export/word",
        {
          responseType: "blob",
        }
      );
    });

    test("returns blob data from response", async () => {
      const fakeBlob = new Blob(["fake docx content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      apiClient.get.mockResolvedValue({ data: fakeBlob });

      const result = await exportDrawerNotesWord();

      expect(result).toBe(fakeBlob);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Export failed");
      apiClient.get.mockRejectedValue(mockError);

      await expect(exportDrawerNotesWord()).rejects.toThrow("Export failed");
    });
  });
});
