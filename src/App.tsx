import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const OrganizacoesList = lazy(() => import('./pages/organizacoes/OrganizacoesList').then(m => ({ default: m.OrganizacoesList })))
const OrganizacaoDetail = lazy(() => import('./pages/organizacoes/OrganizacaoDetail').then(m => ({ default: m.OrganizacaoDetail })))
const Agendamentos = lazy(() => import('./pages/metricas/Agendamentos').then(m => ({ default: m.Agendamentos })))
const Faturamento = lazy(() => import('./pages/metricas/Faturamento').then(m => ({ default: m.Faturamento })))
const Servicos = lazy(() => import('./pages/metricas/Servicos').then(m => ({ default: m.Servicos })))
const Funcionarios = lazy(() => import('./pages/metricas/Funcionarios').then(m => ({ default: m.Funcionarios })))
const Clientes = lazy(() => import('./pages/metricas/Clientes').then(m => ({ default: m.Clientes })))
const Instancias = lazy(() => import('./pages/metricas/Instancias').then(m => ({ default: m.Instancias })))
const Planos = lazy(() => import('./pages/metricas/Planos').then(m => ({ default: m.Planos })))
const PlanosList = lazy(() => import('./pages/planos/PlanosList').then(m => ({ default: m.PlanosList })))
const PlanoForm = lazy(() => import('./pages/planos/PlanoForm').then(m => ({ default: m.PlanoForm })))
const TemplatesList = lazy(() => import('./pages/templates/TemplatesList').then(m => ({ default: m.TemplatesList })))
const TemplateForm = lazy(() => import('./pages/templates/TemplateForm').then(m => ({ default: m.TemplateForm })))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#db6f57] dark:border-[#E07A62] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Carregando...</span>
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #ffffff)',
            color: 'var(--toast-color, #2a2420)',
            border: '1px solid var(--toast-border, #d8ccc4)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organizacoes" element={<OrganizacoesList />} />
            <Route path="/organizacoes/:id" element={<OrganizacaoDetail />} />
            <Route path="/metricas/agendamentos" element={<Agendamentos />} />
            <Route path="/metricas/faturamento" element={<Faturamento />} />
            <Route path="/metricas/servicos" element={<Servicos />} />
            <Route path="/metricas/funcionarios" element={<Funcionarios />} />
            <Route path="/metricas/clientes" element={<Clientes />} />
            <Route path="/metricas/instancias" element={<Instancias />} />
            <Route path="/metricas/planos" element={<Planos />} />
            <Route path="/planos" element={<PlanosList />} />
            <Route path="/planos/novo" element={<PlanoForm />} />
            <Route path="/planos/:id" element={<PlanoForm />} />
            <Route path="/templates" element={<TemplatesList />} />
            <Route path="/templates/novo" element={<TemplateForm />} />
            <Route path="/templates/:id" element={<TemplateForm />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
