import { type Note, type NoteResponse } from "../types/types";
import { getToken } from "@/utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class NoteService {
  static async getAllNotes(): Promise<Note[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Não autorizado. Faça login novamente.");
      throw new Error("Erro ao buscar notas.");
    }

    const data: NoteResponse = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }

  static async createNote(content: string): Promise<Note> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Não autorizado. Faça login novamente.");
      throw new Error("Erro ao criar nota.");
    }

    const data: NoteResponse = await response.json();
    return data.data as Note;
  }

  static async updateNote(id: string, content: string): Promise<Note> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Não autorizado. Faça login novamente.");
      throw new Error("Erro ao atualizar nota.");
    }

    const data: NoteResponse = await response.json();
    return data.data as Note;
  }

  static async deleteNote(id: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Não autorizado. Faça login novamente.");
      throw new Error("Erro ao deletar nota.");
    }
  }
}
