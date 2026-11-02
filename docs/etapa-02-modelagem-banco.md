# Etapa 2 — Modelagem e segurança do 2FA

## 1. Alterações no modelo `Accounts`

```prisma
model Accounts {
  id                   String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email                String                 @unique @db.VarChar(255)
  passwordHash         String                 @map("password_hash") @db.VarChar(255)
  createdAt            DateTime               @default(now()) @db.Timestamptz(6) @map("created_at")
  accountType          Int                    @default(1) @db.SmallInt @map("account_type")
  accountCoinsLedger   account_coins_ledger[]
  players              players[]

  twoFactorSecret      String?                @map("two_factor_secret") @db.Text
  twoFactorEnabled     Boolean                @default(false) @map("two_factor_enabled")
  twoFactorEnabledAt   DateTime?              @map("two_factor_enabled_at") @db.Timestamptz(6)

  backupCodes          AccountsBackupCodes[]

  @@map("accounts")
}
```

Foram adicionados três campos ao modelo `Accounts`:

- `twoFactorEnabled`: indica se a autenticação em dois fatores está ativa.
- `twoFactorEnabledAt`: registra a data e hora da ativação.
- `twoFactorSecret`: destinado ao armazenamento do segredo TOTP criptografado.

O estado inicial é desativado, e a data de ativação permanece nula até que o recurso seja habilitado.

## 2. Modelo `AccountsBackupCodes`

```prisma
model AccountsBackupCodes {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codeHash  String   @unique @db.VarChar(255) @map("code_hash")
  isUsed    Boolean  @default(false) @map("is_used")

  accountId String   @map("account_id") @db.Uuid
  account   Accounts @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@map("accounts_backup_codes")
}
```

Foi criada uma tabela separada para permitir que cada conta possua vários códigos de recuperação. Cada registro está relacionado a uma conta por meio de uma chave estrangeira e possui um hash do código e um indicador de utilização. O índice sobre a chave estrangeira facilita a consulta dos códigos associados à conta.

## 3. Justificativa técnica de segurança

O segredo TOTP deve ser armazenado utilizando criptografia reversível, como AES-256-GCM, pois o backend precisa recuperar seu valor original para validar os códigos de autenticação enviados pelo usuário. A chave criptográfica deve ser armazenada separadamente do banco de dados, preferencialmente em um gerenciador de segredos ou serviço de gerenciamento de chaves (KMS), reduzindo o risco de exposição em caso de comprometimento do banco.

Os códigos de recuperação (*backup codes*) devem ser gerados por um gerador de números aleatórios criptograficamente seguro (CSPRNG), garantindo imprevisibilidade e entropia suficiente para dificultar ataques de adivinhação. Como o backend não precisa recuperar os códigos originais, seus hashes podem ser armazenados utilizando um algoritmo como SHA-256, desde que os códigos tenham tamanho e entropia adequados. Durante a validação, o backend calcula o hash do código informado e o compara com os valores armazenados. Cada código deve permitir apenas um uso, e o backend deve garantir seu consumo de forma atômica, impedindo reutilizações, inclusive em requisições simultâneas.