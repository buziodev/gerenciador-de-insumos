/**
 * Administração GATTI — painel operacional de usuários e setores.
 * Design: superfícies claras e densas para tarefas administrativas, com tabelas legíveis e diálogos focados.
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sectorsService, usersService } from '@/services/api';
import { Sector, User, UserRole } from '@/types';

type UserDraft = { firstName: string; lastName: string; email: string; password: string; role: UserRole };
type SectorDraft = { name: string; description: string; costCenter: string; manager: string };

const EMPTY_USER: UserDraft = { firstName: '', lastName: '', email: '', password: '', role: UserRole.VIEWER };
const EMPTY_SECTOR: SectorDraft = { name: '', description: '', costCenter: '', manager: '' };
const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.VIEWER]: 'Visualizador',
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => usersService.list({ skip: 0, take: 100 }) });
  const sectorsQuery = useQuery({ queryKey: ['admin-sectors'], queryFn: () => sectorsService.list({ skip: 0, take: 100 }) });
  const users = usersQuery.data?.data ?? [];
  const sectors = sectorsQuery.data?.data ?? [];
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [userDraft, setUserDraft] = useState<UserDraft>(EMPTY_USER);
  const [sectorDraft, setSectorDraft] = useState<SectorDraft>(EMPTY_SECTOR);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] }),
    ]);
  };

  const openUserCreate = () => { setEditingUser(null); setUserDraft(EMPTY_USER); setUserDialogOpen(true); };
  const openUserEdit = (user: User) => {
    setEditingUser(user);
    setUserDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role });
    setUserDialogOpen(true);
  };
  const openSectorCreate = () => { setEditingSector(null); setSectorDraft(EMPTY_SECTOR); setSectorDialogOpen(true); };
  const openSectorEdit = (sector: Sector) => {
    setEditingSector(sector);
    setSectorDraft({ name: sector.name, description: sector.description ?? '', costCenter: sector.costCenter ?? '', manager: sector.manager ?? '' });
    setSectorDialogOpen(true);
  };

  const saveUser = async () => {
    if (!userDraft.firstName.trim() || !userDraft.lastName.trim() || !userDraft.email.trim() || (!editingUser && userDraft.password.length < 8)) {
      toast.error('Informe nome, sobrenome, email e uma senha de ao menos 8 caracteres para novos usuários.');
      return;
    }
    try {
      setSaving(true);
      const profile = {
        firstName: userDraft.firstName.trim(), lastName: userDraft.lastName.trim(), email: userDraft.email.trim(),
        ...(userDraft.password ? { password: userDraft.password } : {}),
      };
      if (editingUser) {
        await usersService.update(editingUser.id, profile);
        if (editingUser.role !== userDraft.role) await usersService.updateRole(editingUser.id, userDraft.role);
        toast.success('Usuário atualizado com sucesso.');
      } else {
        await usersService.create({ ...profile, password: userDraft.password, role: userDraft.role });
        toast.success('Usuário criado com sucesso.');
      }
      setUserDialogOpen(false);
      await refresh();
    } catch {
      toast.error('Não foi possível salvar o usuário. Verifique os dados e as permissões.');
    } finally { setSaving(false); }
  };

  const saveSector = async () => {
    if (!sectorDraft.name.trim()) { toast.error('Informe o nome do setor.'); return; }
    const payload = {
      name: sectorDraft.name.trim(), description: sectorDraft.description.trim() || undefined,
      costCenter: sectorDraft.costCenter.trim() || undefined, manager: sectorDraft.manager.trim() || undefined,
    };
    try {
      setSaving(true);
      if (editingSector) { await sectorsService.update(editingSector.id, payload); toast.success('Setor atualizado com sucesso.'); }
      else { await sectorsService.create(payload); toast.success('Setor criado com sucesso.'); }
      setSectorDialogOpen(false);
      await refresh();
    } catch {
      toast.error('Não foi possível salvar o setor. Verifique os dados e as permissões.');
    } finally { setSaving(false); }
  };

  const removeUser = async (user: User) => {
    if (!window.confirm(`Excluir o usuário “${user.email}”?`)) return;
    try { await usersService.delete(user.id); toast.success('Usuário removido com sucesso.'); await refresh(); }
    catch { toast.error('Não foi possível remover o usuário.'); }
  };
  const removeSector = async (sector: Sector) => {
    if (!window.confirm(`Excluir o setor “${sector.name}”?`)) return;
    try { await sectorsService.delete(sector.id); toast.success('Setor removido com sucesso.'); await refresh(); }
    catch { toast.error('Não foi possível remover o setor.'); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Administração</h1><p className="text-muted-foreground">Gerencie usuários e setores com operações vinculadas à API.</p></div>
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Usuários</TabsTrigger><TabsTrigger value="sectors"><Building2 className="mr-2 h-4 w-4" />Setores</TabsTrigger></TabsList>
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold">Gerenciar usuários</h2><p className="text-muted-foreground">Crie, edite papéis e remova acessos do sistema.</p></div><Button onClick={openUserCreate}><Plus className="mr-2 h-4 w-4" />Novo usuário</Button></div>
          <Card><CardHeader><CardTitle>Usuários cadastrados</CardTitle><CardDescription>{users.length} usuário(s) encontrado(s).</CardDescription></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Papel</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{usersQuery.isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Carregando…</TableCell></TableRow> : null}{!usersQuery.isLoading && users.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow> : null}{users.map((user) => <TableRow key={user.id}><TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell><TableCell>{user.email}</TableCell><TableCell>{ROLE_LABELS[user.role]}</TableCell><TableCell className="text-right"><Button aria-label={`Editar ${user.email}`} size="icon" variant="ghost" onClick={() => openUserEdit(user)}><Pencil className="h-4 w-4" /></Button><Button aria-label={`Excluir ${user.email}`} size="icon" variant="ghost" onClick={() => void removeUser(user)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="sectors" className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold">Gerenciar setores</h2><p className="text-muted-foreground">Cadastre setores e seus centros de custo.</p></div><Button onClick={openSectorCreate}><Plus className="mr-2 h-4 w-4" />Novo setor</Button></div>
          <Card><CardHeader><CardTitle>Setores cadastrados</CardTitle><CardDescription>{sectors.length} setor(es) encontrado(s).</CardDescription></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Centro de custo</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{sectorsQuery.isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Carregando…</TableCell></TableRow> : null}{!sectorsQuery.isLoading && sectors.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum setor encontrado.</TableCell></TableRow> : null}{sectors.map((sector) => <TableRow key={sector.id}><TableCell className="font-medium">{sector.name}</TableCell><TableCell>{sector.costCenter ?? '—'}</TableCell><TableCell>{sector.manager ?? '—'}</TableCell><TableCell className="text-right"><Button aria-label={`Editar ${sector.name}`} size="icon" variant="ghost" onClick={() => openSectorEdit(sector)}><Pencil className="h-4 w-4" /></Button><Button aria-label={`Excluir ${sector.name}`} size="icon" variant="ghost" onClick={() => void removeSector(sector)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingUser ? 'Editar usuário' : 'Novo usuário'}</DialogTitle><DialogDescription>O papel é aplicado pela rota administrativa protegida.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="user-first-name">Nome</Label><Input id="user-first-name" value={userDraft.firstName} onChange={(event) => setUserDraft({ ...userDraft, firstName: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="user-last-name">Sobrenome</Label><Input id="user-last-name" value={userDraft.lastName} onChange={(event) => setUserDraft({ ...userDraft, lastName: event.target.value })} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="user-email">Email</Label><Input id="user-email" type="email" value={userDraft.email} onChange={(event) => setUserDraft({ ...userDraft, email: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="user-password">{editingUser ? 'Nova senha (opcional)' : 'Senha'}</Label><Input id="user-password" type="password" value={userDraft.password} onChange={(event) => setUserDraft({ ...userDraft, password: event.target.value })} /></div><div className="space-y-2"><Label>Papel</Label><Select value={userDraft.role} onValueChange={(value) => setUserDraft({ ...userDraft, role: value as UserRole })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ROLE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancelar</Button><Button disabled={saving} onClick={() => void saveUser()}>{saving ? 'Salvando…' : 'Salvar'}</Button></div></DialogContent></Dialog>
      <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingSector ? 'Editar setor' : 'Novo setor'}</DialogTitle><DialogDescription>Campos alinhados ao modelo de setores do backend.</DialogDescription></DialogHeader><div className="grid gap-4"><div className="space-y-2"><Label htmlFor="sector-name">Nome</Label><Input id="sector-name" value={sectorDraft.name} onChange={(event) => setSectorDraft({ ...sectorDraft, name: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="sector-cost-center">Centro de custo</Label><Input id="sector-cost-center" value={sectorDraft.costCenter} onChange={(event) => setSectorDraft({ ...sectorDraft, costCenter: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="sector-manager">Responsável</Label><Input id="sector-manager" value={sectorDraft.manager} onChange={(event) => setSectorDraft({ ...sectorDraft, manager: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="sector-description">Descrição</Label><Input id="sector-description" value={sectorDraft.description} onChange={(event) => setSectorDraft({ ...sectorDraft, description: event.target.value })} /></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSectorDialogOpen(false)}>Cancelar</Button><Button disabled={saving} onClick={() => void saveSector()}>{saving ? 'Salvando…' : 'Salvar'}</Button></div></DialogContent></Dialog>
    </div>
  );
}
