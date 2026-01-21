// services/emprestimo-service.ts

const API_URL = 'http://localhost:8000/api'; // Ajuste para a URL do seu backend PHP

export interface Emprestimo {
    id_emprestimo?: number;
    id_exemplar: number;
    id_pessoa: number;
    data_emprestimo: string;
    data_prevista: string;
    data_devolucao?: string | null;
}

export interface EmprestimoResponse {
    success: boolean;
    message?: string;
    data?: Emprestimo | Emprestimo[];
}
class EmprestimoService {
    // Buscar todos os empréstimos
    async getAll(): Promise<Emprestimo[]> {
        try {
            const response = await fetch(`${API_URL}/emprestimos.php`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar empréstimos');
            }

            const result: EmprestimoResponse = await response.json();
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Erro ao buscar empréstimos:', error);
            throw error;
        }
    }
    // Buscar empréstimo por ID
    async getById(id: number): Promise<Emprestimo | null> {
        try {
            const response = await fetch(`${API_URL}/emprestimos.php?id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar empréstimo');
            }

            const result: EmprestimoResponse = await response.json();
            return result.data as Emprestimo || null;
        } catch (error) {
            console.error('Erro ao buscar empréstimo:', error);
            throw error;
        }
    }
    // Criar novo empréstimo
    async create(emprestimo: Omit<Emprestimo, 'id_emprestimo'>): Promise<any> {
        try {
            console.log('Enviando dados:', emprestimo);
            
            const response = await fetch(`${API_URL}/emprestimos/emprestar.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emprestimo),
            });

            const result = await response.json();
            console.log('Resposta do servidor:', result);

            if (!response.ok || result.status === 'erro') {
                throw new Error(result.mensagem || 'Erro ao criar empréstimo');
            }

            return result.data || result;
        } catch (error) {
            console.error('Erro ao criar empréstimo:', error);
            throw error;
        }
    }

    // Realizar devolução de empréstimo
    async devolver(idEmprestimo: number): Promise<any> {
        try {
            console.log('Realizando devolução do empréstimo:', idEmprestimo);
            
            const response = await fetch(`${API_URL}/emprestimos/devolver.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_emprestimo: idEmprestimo }),
            });

            const result = await response.json();
            console.log('Resposta do servidor:', result);

            if (!response.ok || result.status === 'erro') {
                throw new Error(result.message || 'Erro ao realizar devolução');
            }

            return result;
        } catch (error) {
            console.error('Erro ao realizar devolução:', error);
            throw error;
        }
    }
}

export default new EmprestimoService();