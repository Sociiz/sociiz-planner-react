import { type Note, type NoteResponse } from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class NoteService {
  static async getAllNotes(): Promise<Note[]> {
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    const data: NoteResponse = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }

  static async createNote(content: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to create note");
    const data: NoteResponse = await response.json();
    return data.data as Note;
  }

  static async updateNote(id: string, content: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to update note");
    const data: NoteResponse = await response.json();
    return data.data as Note;
  }

  static async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete note");
  }
}
