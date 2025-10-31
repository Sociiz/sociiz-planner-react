import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Clipboard } from 'lucide-react';
import { type Note, type User } from '../../types/types';
import { NoteService } from '../../services/noteService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import MarkdownViewer from '../MarkDownViewer';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface PostItSidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

const colors = [
    'bg-yellow-100',
    'bg-pink-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-purple-100'
];

export const PostItSidebar: React.FC<PostItSidebarProps> = ({
    isOpen = true,
    // onToggle
}) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({
        open: false,
        id: undefined
    });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await NoteService.getAllNotes();
            setNotes(data);
        } catch (err) {
            setError('Erro ao carregar notas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            setLoading(true);
            await NoteService.createNote(newNote);
            await loadNotes();
            setNewNote('');
            setError(null);
        } catch (err) {
            setError('Erro ao criar nota');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNote = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            setLoading(true);
            const updatedNote = await NoteService.updateNote(id, editContent);
            setNotes(notes.map((n) => (n._id === id ? updatedNote : n)));
            setEditingId(null);
            setEditContent('');
            setError(null);
        } catch (err) {
            setError('Erro ao atualizar nota');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await NoteService.deleteNote(id);
            setNotes(notes.filter((n) => n._id !== id));
            setConfirmDelete({ open: false });
            setError(null);
        } catch (err) {
            setError('Erro ao deletar nota');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (note: Note) => {
        setEditingId(note._id);
        setEditContent(note.content);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleAddNote();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="h-screen w-96 bg-gray-50 border-l border-gray-200 shadow-xl flex flex-col shrink-0">
                <div className="bg-gradient-to-r from-yellow-300 via-orange-300 to-orange-400 p-6 flex items-center justify-between rounded-b-lg shadow-md">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        📌 Anotações
                    </h2>
                </div>

                {/* Erro */}
                {error && (
                    <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setError(null)}
                            className="h-6 w-6 text-red-600 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Nova nota */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua nota..."
                        rows={3}
                        disabled={loading}
                        className="mb-3 rounded-lg border-gray-300 shadow-sm placeholder:text-black text-black"
                    />
                    <Button
                        onClick={handleAddNote}
                        disabled={loading || !newNote.trim()}
                        className="w-full gap-2 bg-yellow-200 hover:bg-yellow-300 text-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Nota
                    </Button>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading && notes.length === 0 ? (
                        <div className="text-center text-gray-400 py-8 animate-pulse">
                            Carregando...
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <p className="text-lg">Nenhuma nota ainda</p>
                            <p className="text-sm mt-2">Crie sua primeira anotação!</p>
                        </div>
                    ) : (
                        notes.map((note, index) => (
                            <div
                                key={note._id}
                                className={`${colors[index % colors.length]} p-4 rounded-lg shadow-md relative transform rotate-[${(index % 5 - 2) * 1.5}deg] hover:rotate-0 transition-transform duration-300`}
                            >
                                {editingId === note._id ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={4}
                                            autoFocus
                                            disabled={loading}
                                            className="rounded-lg border-gray-300 shadow-sm text-black"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleUpdateNote(note._id)}
                                                disabled={loading || !editContent.trim()}
                                                size="sm"
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                Salvar
                                            </Button>
                                            <Button
                                                onClick={cancelEditing}
                                                disabled={loading}
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2 justify-end mb-2">
                                            <Button
                                                // onClick={() => startEditing(note)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-black/10 text-black"
                                                title="Converter em tarefa"
                                            >
                                                <Clipboard className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => startEditing(note)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-black/10 text-black"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setConfirmDelete({ open: true, id: note._id })
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-black/10 text-red-700"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <MarkdownViewer className="bg-transparent text-gray-800 text-sm leading-relaxed pr-2">
                                            {note.content}
                                        </MarkdownViewer>

                                        <div className="flex text-xs text-gray-500 mt-3 justify-between">
                                            <div className='font-medium'>
                                                <span>Criado por: {(note.createdBy as User).username} </span>
                                            </div>
                                            {new Date(note.timestamp).toLocaleString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de exclusão */}
            <ConfirmDeleteModal
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false })}
                onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                itemName="nota"
            />
        </>
    );
};
