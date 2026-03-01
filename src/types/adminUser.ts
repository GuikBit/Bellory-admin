export interface AdminUser {
  id: number
  username: string
  nomeCompleto: string
  email: string
  role: string
  ativo: boolean
  dtCriacao: string
}

export interface AdminUserCreate {
  username: string
  nomeCompleto: string
  password: string
  email: string
}

export interface AdminUserUpdate {
  username?: string
  nomeCompleto?: string
  password?: string
  email?: string
}
