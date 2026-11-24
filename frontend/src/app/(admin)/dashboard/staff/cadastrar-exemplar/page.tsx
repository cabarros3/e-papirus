'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ExemplaresService,
  LivroComExemplares,
  ExemplarAgrupado,
  EstadoFisico,
  TipoCirculacao,
  TipoAquisicao,
} from '@/services/exemplar-service';
import { BookService } from '@/services/book-service';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Edit3,
  X,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Book,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

// --- CONSTANTES DE OPÇÕES (ENUMs) ---
const ESTADOS_FISICOS = [
  { value: 'bom', label: 'Bom' },
  { value: 'danificado', label: 'Danificado' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'em_restauracao', label: 'Em Restauração' },
];

const TIPOS_CIRCULACAO = [
  { value: 'emprestavel', label: 'Emprestável' },
  { value: 'consulta_local', label: 'Consulta Local' },
];

const TIPOS_AQUISICAO = [
  { value: 'compra', label: 'Compra' },
  { value: 'doacao', label: 'Doação' },
  { value: 'permuta', label: 'Permuta' },
];

export default function GerenciarExemplares() {
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
  const [livrosComExemplares, setLivrosComExemplares] = useState<LivroComExemplares[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const bookService = useMemo(() => new BookService(), []);

  // --- ESTADOS DO FORMULÁRIO DE CADASTRO ---
  const [idLivro, setIdLivro] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [estadoFisico, setEstadoFisico] = useState<EstadoFisico>('bom');
  const [tipoCirculacao, setTipoCirculacao] = useState<TipoCirculacao>('emprestavel');
  const [tipoAquisicao, setTipoAquisicao] = useState<TipoAquisicao | ''>('');
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [observacaoAquisicao, setObservacaoAquisicao] = useState('');

  // --- ESTADOS DO MODAL DE EDIÇÃO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExemplar, setEditingExemplar] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este exemplar?')) return;

    try {
      await ExemplaresService.deleteExemplar(id);
      toast.success('Exemplar excluído com sucesso!');
      await loadExemplares();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir exemplar');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [livrosData, livrosComExemplaresData] = await Promise.all([
        bookService.getAllBooks(),
        ExemplaresService.getLivrosComExemplares(),
      ]);
      setLivrosDisponiveis(livrosData);
      setLivrosComExemplares(livrosComExemplaresData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadExemplares = async () => {
    try {
      const livrosData = await ExemplaresService.getLivrosComExemplares();
      setLivrosComExemplares(livrosData);
    } catch (error) {
      toast.error('Erro ao carregar exemplares');
    }
  };

  const toggleBook = (idLivro: number) => {
    const newExpanded = new Set(expandedBooks);
    newExpanded.has(idLivro) ? newExpanded.delete(idLivro) : newExpanded.add(idLivro);
    setExpandedBooks(newExpanded);
  };

  const handleAdd = async () => {
    if (!idLivro || !localizacao) {
      toast.error('Preencha pelo menos a obra e a localização');
      return;
    }

    try {
      await ExemplaresService.createExemplar({
        id_livro: parseInt(idLivro),
        localizacao: localizacao,
        disponibilidade: 'disponivel',
        estado_fisico: estadoFisico,
        tipo_circulacao: tipoCirculacao,
        tipo_aquisicao: tipoAquisicao || null,
        data_aquisicao: dataAquisicao || null,
        numero_nota_fiscal: numeroNotaFiscal || null,
        fornecedor: fornecedor || null,
        observacao_aquisicao: observacaoAquisicao || null,
      });

      toast.success('Exemplar cadastrado com sucesso!');
      
      // Limpar formulário
      setIdLivro('');
      setLocalizacao('');
      setEstadoFisico('bom');
      setTipoCirculacao('emprestavel');
      setTipoAquisicao('');
      setDataAquisicao('');
      setNumeroNotaFiscal('');
      setFornecedor('');
      setObservacaoAquisicao('');
      
      await loadExemplares();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar');
    }
  };

  const handleOpenEdit = (exemplar: ExemplarAgrupado, idLivro: number) => {
    setEditingExemplar({ ...exemplar, id_livro: idLivro });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingExemplar) return;

    try {
      await ExemplaresService.updateExemplar({
        id_exemplar: editingExemplar.id_exemplar,
        id_livro: editingExemplar.id_livro,
        localizacao: editingExemplar.localizacao,
        disponibilidade: editingExemplar.disponibilidade,
        estado_fisico: editingExemplar.estado_fisico,
        tipo_circulacao: editingExemplar.tipo_circulacao,
        tipo_aquisicao: editingExemplar.tipo_aquisicao,
        data_aquisicao: editingExemplar.data_aquisicao,
        numero_nota_fiscal: editingExemplar.numero_nota_fiscal,
        fornecedor: editingExemplar.fornecedor,
        observacao_aquisicao: editingExemplar.observacao_aquisicao,
      });
      
      toast.success('Exemplar atualizado!');
      setIsModalOpen(false);
      await loadExemplares();
    } catch (error) {
      toast.error('Erro ao atualizar exemplar');
    }
  };

  // --- HELPERS DE UI ---
  const getDisponibilidadeColor = (disp: string) => {
    switch (disp) {
      case 'disponivel': return 'text-green-600 bg-green-50 border-green-200';
      case 'emprestado': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reservado': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'quarentena': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEstadoFisicoLabel = (estado: string) => {
    return ESTADOS_FISICOS.find((e) => e.value === estado)?.label || estado;
  };

  const getCirculacaoLabel = (tipo: string) => {
    return TIPOS_CIRCULACAO.find((t) => t.value === tipo)?.label || tipo;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-gray-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-8 font-sans text-gray-700 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/staff" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-poppins font-bold text-gray-900 tracking-tight">
              Gerenciar Exemplares
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Categorização de acervo, controle de localização e estado físico.
            </p>
          </div>
        </div>

        {/* --- FORMULÁRIO DE CADASTRO --- */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-100 flex flex-col gap-8">
          
          {/* Seção 1: Identificação */}
          <div>
            <h2 className="text-xs font-poppins font-bold text-gray-400 uppercase tracking-widest mb-6">
              Identificação do Exemplar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Nome da Obra</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl appearance-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    value={idLivro}
                    onChange={(e) => setIdLivro(e.target.value)}
                  >
                    <option value="">Selecione uma obra</option>
                    {livrosDisponiveis.map((livro) => (
                      <option key={livro.id_livro} value={livro.id_livro}>{livro.titulo}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Localização</label>
                <input
                  type="text"
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: Estante A3"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Estado e Circulação */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-poppins font-bold text-gray-400 uppercase tracking-widest mb-6">
              Estado e Circulação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Estado Físico</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl appearance-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    value={estadoFisico}
                    onChange={(e) => setEstadoFisico(e.target.value as EstadoFisico)}
                  >
                    {ESTADOS_FISICOS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Tipo de Circulação</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl appearance-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    value={tipoCirculacao}
                    onChange={(e) => setTipoCirculacao(e.target.value as TipoCirculacao)}
                  >
                    {TIPOS_CIRCULACAO.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Dados de Aquisição */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-poppins font-bold text-gray-400 uppercase tracking-widest mb-6">
              Dados de Aquisição <span className="text-gray-300 normal-case font-normal">(Opcional)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Tipo</label>
                <select
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={tipoAquisicao}
                  onChange={(e) => setTipoAquisicao(e.target.value as TipoAquisicao | '')}
                >
                  <option value="">Não informado</option>
                  {TIPOS_AQUISICAO.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Data</label>
                <input
                  type="date"
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={dataAquisicao}
                  onChange={(e) => setDataAquisicao(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Nota Fiscal</label>
                <input
                  type="text"
                  placeholder="Ex: NF-00123"
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={numeroNotaFiscal}
                  onChange={(e) => setNumeroNotaFiscal(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Fornecedor</label>
                <input
                  type="text"
                  placeholder="Ex: Distribuidora SP"
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                />
              </div>
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Observações</label>
                <textarea
                  placeholder="Ex: Doação da Editora X"
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[80px]"
                  value={observacaoAquisicao}
                  onChange={(e) => setObservacaoAquisicao(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botão Adicionar */}
          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <button
              onClick={handleAdd}
              className="h-11 px-8 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Exemplar
            </button>
          </div>
        </div>

        {/* --- LISTAGEM DE EXEMPLARES --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {livrosComExemplares.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-400">Nenhum registro encontrado.</div>
          ) : (
            livrosComExemplares.map((livro) => (
              <div key={livro.id_livro} className="border-b border-gray-100 last:border-b-0">
                <div
                  className="flex items-center gap-4 px-8 py-5 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => toggleBook(livro.id_livro)}
                >
                  {expandedBooks.has(livro.id_livro) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-gray-800 tracking-tight">{livro.titulo}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">{livro.editora}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-bold">
                    {livro.exemplares.length} {livro.exemplares.length === 1 ? 'Exemplar' : 'Exemplares'}
                  </span>
                </div>

                {expandedBooks.has(livro.id_livro) && (
                  <div className="overflow-x-auto border-t border-gray-50">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/50">
                        <tr className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                          <th className="px-8 py-4 text-left">Nº Exemplar</th>
                          <th className="px-8 py-4 text-left">Localização</th>
                          <th className="px-8 py-4 text-left">Estado Físico</th>
                          <th className="px-8 py-4 text-left">Circulação</th>
                          <th className="px-8 py-4 text-left">Status</th>
                          <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {livro.exemplares.map((exemplar) => (
                          <tr key={exemplar.id_exemplar} className="group hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-4 font-mono text-xs text-gray-500">
                              #{exemplar.numero_exemplar}
                            </td>
                            <td className="px-8 py-4 text-gray-600">{exemplar.localizacao}</td>
                            
                            {/* NOVO CAMPO: Estado Físico */}
                            <td className="px-8 py-4">
                              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                {getEstadoFisicoLabel(exemplar.estado_fisico)}
                              </span>
                            </td>

                            {/* NOVO CAMPO: Circulação */}
                            <td className="px-8 py-4">
                              <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                                exemplar.tipo_circulacao === 'emprestavel' 
                                  ? 'text-emerald-700 bg-emerald-50' 
                                  : 'text-purple-700 bg-purple-50'
                              }`}>
                                {getCirculacaoLabel(exemplar.tipo_circulacao)}
                              </span>
                            </td>

                            <td className="px-8 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${getDisponibilidadeColor(exemplar.disponibilidade)}`}>
                                {exemplar.disponibilidade}
                              </span>
                            </td>
                            
                            <td className="px-8 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEdit(exemplar, livro.id_livro)}
                                  className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar exemplar"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(exemplar.id_exemplar)}
                                  className="text-gray-500 p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Excluir exemplar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {isModalOpen && editingExemplar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-poppins font-bold text-gray-900">Editar Exemplar #{editingExemplar.numero_exemplar}</h2>
                <p className="text-sm text-gray-500">Atualize os dados do acervo.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-8 flex flex-col gap-8">
              
              {/* Alerta se for Consulta Local ou Quarentena */}
              {(editingExemplar.tipo_circulacao === 'consulta_local' || editingExemplar.disponibilidade === 'quarentena') && (
                <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Atenção:</strong> Este exemplar não pode ser emprestado no momento. 
                    {editingExemplar.tipo_circulacao === 'consulta_local' && " Ele é restrito para Consulta Local."}
                    {editingExemplar.disponibilidade === 'quarentena' && " Ele está em período de Quarentena."}
                  </div>
                </div>
              )}

              {/* Identificação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Localização</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    value={editingExemplar.localizacao || ''}
                    onChange={(e) => setEditingExemplar({ ...editingExemplar, localizacao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Disponibilidade</label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    value={editingExemplar.disponibilidade || ''}
                    onChange={(e) => setEditingExemplar({ ...editingExemplar, disponibilidade: e.target.value })}
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="emprestado">Emprestado</option>
                    <option value="reservado">Reservado</option>
                    <option value="quarentena">Quarentena</option>
                  </select>
                </div>
              </div>

              {/* Estado e Circulação */}
              <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Estado Físico</label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    value={editingExemplar.estado_fisico || 'bom'}
                    onChange={(e) => setEditingExemplar({ ...editingExemplar, estado_fisico: e.target.value })}
                  >
                    {ESTADOS_FISICOS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Tipo de Circulação</label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    value={editingExemplar.tipo_circulacao || 'emprestavel'}
                    onChange={(e) => setEditingExemplar({ ...editingExemplar, tipo_circulacao: e.target.value })}
                  >
                    {TIPOS_CIRCULACAO.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aquisição */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-poppins font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Dados de Aquisição
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Tipo</label>
                    <select
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                      value={editingExemplar.tipo_aquisicao || ''}
                      onChange={(e) => setEditingExemplar({ ...editingExemplar, tipo_aquisicao: e.target.value })}
                    >
                      <option value="">Não informado</option>
                      {TIPOS_AQUISICAO.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Data</label>
                    <input
                      type="date"
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      value={editingExemplar.data_aquisicao || ''}
                      onChange={(e) => setEditingExemplar({ ...editingExemplar, data_aquisicao: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Nota Fiscal</label>
                    <input
                      type="text"
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      value={editingExemplar.numero_nota_fiscal || ''}
                      onChange={(e) => setEditingExemplar({ ...editingExemplar, numero_nota_fiscal: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Fornecedor</label>
                    <input
                      type="text"
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      value={editingExemplar.fornecedor || ''}
                      onChange={(e) => setEditingExemplar({ ...editingExemplar, fornecedor: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Observações</label>
                    <textarea
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[80px]"
                      value={editingExemplar.observacao_aquisicao || ''}
                      onChange={(e) => setEditingExemplar({ ...editingExemplar, observacao_aquisicao: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={18} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}