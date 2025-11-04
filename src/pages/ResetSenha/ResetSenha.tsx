import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetSenha() {
    const [email, setEmail] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !novaSenha || !confirmar) {
            setErro("Preencha todos os campos.");
            setMsg(null);
            return;
        }

        if (novaSenha !== confirmar) {
            setErro("As senhas não coincidem.");
            setMsg(null);
            return;
        }
        // fazendo a requisição
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/reset-senha`, {
                email,
                novaSenha,
            });

            setErro(null);
            setMsg(res.data.message || "Senha redefinida com sucesso!");

            // redireciona para /login já
            setTimeout(() => navigate("/login"), 2000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErro(err.response?.data?.message || "Erro ao redefinir senha.");
            setMsg(null);
        }
    };

    // Criando o form pra resetar a senha
    return (
        <div className="flex items-center justify-center h-screen bg-muted/20 px-4">
            <Card className="w-full max-w-md p-6 shadow-lg border border-border">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">
                        Redefinir Senha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label className="mb-1" htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seuemail@exemplo.com"
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="senha">Nova senha</Label>
                            <Input
                                id="senha"
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                placeholder="Digite sua nova senha"
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="confirmar">Confirmar senha</Label>
                            <Input
                                id="confirmar"
                                type="password"
                                value={confirmar}
                                onChange={(e) => setConfirmar(e.target.value)}
                                placeholder="Confirme sua nova senha"
                            />
                        </div>

                        {/* Alertas */}
                        {erro && (
                            <Alert className="bg-red-400" >
                                <AlertDescription className="text-black font-bold justify-center">{erro}</AlertDescription>
                            </Alert>
                        )}

                        {msg && (
                            <Alert className="bg-green-400">
                                <AlertDescription className="text-black font-bold justify-center">{msg}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full text-white">
                            Redefinir Senha
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
