# 📤 Instruções para Push no GitHub

## Opção 1: Usando Token de Acesso Pessoal (Recomendado)

### 1. Gerar Token no GitHub

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: `GATTI-Push`
4. Selecione escopos: `repo` (acesso completo ao repositório)
5. Clique em "Generate token"
6. **Copie o token** (você não verá novamente)

### 2. Fazer Push com Token

```bash
cd /tmp/gatti-project

# Configure o git para usar o token
git config --global credential.helper store

# Faça o push (será pedido o token)
git push -u origin main

# Quando pedir "Username": digite seu nome de usuário do GitHub
# Quando pedir "Password": cole o token que você gerou
```

## Opção 2: Usando SSH

### 1. Gerar Chave SSH

```bash
ssh-keygen -t ed25519 -C "dev@gatti.com"
# Pressione Enter para aceitar o local padrão
# Pressione Enter para não usar passphrase
```

### 2. Adicionar Chave ao GitHub

```bash
# Copie a chave pública
cat ~/.ssh/id_ed25519.pub
```

1. Acesse https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave pública
4. Clique em "Add SSH key"

### 3. Fazer Push com SSH

```bash
cd /tmp/gatti-project

# Mude a URL do remote para SSH
git remote remove origin
git remote add origin git@github.com:buziodev/gerenciador-de-insumos.git

# Faça o push
git push -u origin main
```

## Opção 3: Usando HTTPS com Credenciais

```bash
cd /tmp/gatti-project

# Faça o push (será pedido usuário e senha)
git push -u origin main

# Quando pedir "Username": seu nome de usuário do GitHub
# Quando pedir "Password": sua senha do GitHub
```

## ✅ Verificar Push

Após fazer o push, verifique no GitHub:

```bash
# Ver status
git status

# Ver branches remotas
git branch -r

# Ver log
git log --oneline -5
```

## 🔍 Troubleshooting

### Erro: "fatal: could not read Username for 'https://github.com'"

**Solução**: Use Token de Acesso Pessoal (Opção 1)

### Erro: "Permission denied (publickey)"

**Solução**: Verifique se a chave SSH foi adicionada ao GitHub

### Erro: "Repository not found"

**Solução**: Verifique se o repositório existe e se você tem permissão de acesso

## 📋 Checklist

- [ ] Gerei token ou configurei SSH
- [ ] Adicionei a autenticação ao GitHub
- [ ] Executei `git push -u origin main`
- [ ] Verifiquei no GitHub se os arquivos foram enviados
- [ ] Confirmei que a branch é `main`

## 🎉 Sucesso!

Se tudo correu bem, você verá:

```
Enumerating objects: ...
Counting objects: ...
Delta compression using up to X threads
Compressing objects: ...
Writing objects: ...
remote: Resolving deltas: ...
To https://github.com/buziodev/gerenciador-de-insumos.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

**Dúvidas?** Consulte a [documentação oficial do GitHub](https://docs.github.com/pt/authentication)
