import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'
import { useDocumentosSuporte, useUploadDocumento, useExcluirDocumento } from '../../queries/useSuporte'
import {
  Upload,
  Search,
  FileText,
  File,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Download,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { DocumentoBase } from '../../types/suporte'

const tipoIcones: Record<string, React.ElementType> = {
  pdf: FileText,
  txt: File,
  xlsx: FileSpreadsheet,
  json: FileJson,
  docx: FileText,
  md: FileCode,
}

const tipoColors: Record<string, string> = {
  pdf: 'text-red-500',
  txt: 'text-blue-500',
  xlsx: 'text-green-500',
  json: 'text-amber-500',
  docx: 'text-indigo-500',
  md: 'text-violet-500',
}

export function BaseConhecimento() {
  const { data: documentos = [], isLoading } = useDocumentosSuporte()
  const uploadMutation = useUploadDocumento()
  const excluirMutation = useExcluirDocumento()

  const [search, setSearch] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState<DocumentoBase | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<DocumentoBase | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const filteredDocs = documentos.filter(d =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  )

  const totalChunks = documentos.filter(d => d.status === 'processado').reduce((acc, d) => acc + d.chunks, 0)
  const totalDocs = documentos.filter(d => d.status === 'processado').length

  const handleUpload = (files: FileList | null) => {
    if (!files) return
    const allowedTypes = ['.pdf', '.txt', '.json', '.xlsx', '.docx', '.md']

    Array.from(files).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(ext)) {
        toast.error(`Tipo de arquivo não suportado: ${ext}`)
        return
      }
      uploadMutation.mutate(file)
    })

    setShowUploadModal(false)
  }

  const handleDelete = (doc: DocumentoBase) => {
    excluirMutation.mutate(doc.filename, {
      onSuccess: () => setShowDeleteModal(null),
    })
  }

  const handleDownload = (doc: DocumentoBase) => {
    toast.success(`Download de "${doc.filename}" — funcionalidade será implementada via webhook`)
  }

  return (
    <div className="space-y-6">
      {/* Métricas da Base */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Documentos</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <HardDrive size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Chunks Indexados</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{totalChunks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Processados</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                  {totalDocs > 0 ? Math.round((totalDocs / documentos.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Buscar documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button
              leftIcon={<Upload size={16} />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload de Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Documentos da Base</h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Documento</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Tipo</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Tamanho</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Data</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Chunks</th>
                      <th className="text-right text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d8ccc4] dark:divide-[#2D2925]">
                    {filteredDocs.map((doc) => {
                      const IconComp = tipoIcones[doc.tipo] || File
                      return (
                        <tr key={doc.id} className="hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <IconComp size={18} className={tipoColors[doc.tipo] || 'text-gray-500'} />
                              <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{doc.filename}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="default">{doc.tipo.toUpperCase()}</Badge>
                          </td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{doc.tamanho || '-'}</td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                            {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-3">
                            {doc.status === 'processado' && (
                              <Badge variant="success">
                                <CheckCircle size={10} className="mr-1" /> Processado
                              </Badge>
                            )}
                            {doc.status === 'processando' && (
                              <Badge variant="info">
                                <Clock size={10} className="mr-1 animate-spin" /> Processando
                              </Badge>
                            )}
                            {doc.status === 'erro' && (
                              <Badge variant="danger">
                                <AlertCircle size={10} className="mr-1" /> Erro
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{doc.chunks || '-'}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setShowPreviewModal(doc)}
                                className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                                title="Visualizar"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                                title="Baixar"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(doc)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
                  <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                    {documentos.length === 0 ? 'Nenhum documento na base de conhecimento' : 'Nenhum documento encontrado'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Upload de Documento</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                  dragActive
                    ? 'border-[#db6f57] bg-[#db6f57]/5 dark:border-[#E07A62] dark:bg-[#E07A62]/5'
                    : 'border-[#d8ccc4] dark:border-[#2D2925] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files) }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload size={32} className="mx-auto text-[#db6f57] dark:text-[#E07A62] mb-3" />
                <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                  Formatos aceitos: PDF, TXT, JSON, XLSX, DOCX, MD
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.json,.xlsx,.docx,.md"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-4">
                Os arquivos serão enviados para processamento via n8n e indexados na base de conhecimento do agente (PGVector).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <div className="flex items-center gap-2">
                {(() => { const Icon = tipoIcones[showPreviewModal.tipo] || File; return <Icon size={18} className={tipoColors[showPreviewModal.tipo] || 'text-gray-500'} /> })()}
                <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.filename}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(null)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Tipo</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.tipo.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Tamanho</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.tamanho || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Data Upload</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                    {new Date(showPreviewModal.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Chunks</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.chunks || 'Não processado'}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" leftIcon={<Download size={16} />} onClick={() => handleDownload(showPreviewModal)}>
                  Baixar
                </Button>
                <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => { setShowPreviewModal(null); setShowDeleteModal(showPreviewModal) }}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Excluir Documento</h3>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-6">
                Tem certeza que deseja excluir <strong>"{showDeleteModal.filename}"</strong> da base de conhecimento?
                Esta ação irá remover o documento e todos os seus chunks indexados no PGVector.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowDeleteModal(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => handleDelete(showDeleteModal)}
                  isLoading={excluirMutation.isPending}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
