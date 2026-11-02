# Etapa 3 — Payloads JSON e Schemas Zod do fluxo de autenticação 2FA

## 1. Payloads JSON

### 1.1. POST `/auth/login`

**Request — corpo enviado pelo cliente**

```json
{
  "email": "jogador@email.com",
  "password": "Senha123"
}
```

**Response A — login normal, com 2FA desativado**

```json
{
  "accessToken": "eyAccessTokenExample",
  "characters": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bard",
      "level": 12
    }
  ]
}
```

**Response B — conta com 2FA ativado**

```json
{
  "requires2FA": true,
  "preAuthToken": "pre-auth-token-exemplo"
}
```

### 1.2. POST `/auth/2fa/setup`

**Request — sem corpo JSON**

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

**Response — dados para configurar o autenticador**

```json
{
  "secret": "1Q2W3E4R5T",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

### 1.3. POST `/auth/2fa/confirm`

**Request — código usado para confirmar a configuração**

```json
{
  "code": "123456"
}
```

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

**Response — configuração confirmada**

```json
{
  "message": "Autenticação de dois fatores ativada com sucesso."
}
```

### 1.4. POST `/auth/2fa/verify`

**Request — validação do segundo fator durante o login**

```json
{
  "preAuthToken": "pre-auth-token-exemplo",
  "code": "123456"
}
```

**Response — autenticação concluída**

```json
{
  "accessToken": "eyAccessTokenExample",
  "characters": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bard",
      "level": 12
    }
  ]
}
```

### 1.5. POST `/auth/2fa/disable`

**Request — senha atual e código TOTP**

```json
{
  "password": "Senha123",
  "code": "123456"
}
```

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

**Response — 2FA desativado**

```json
{
  "message": "Autenticação de dois fatores desativada com sucesso."
}
```

---

## 2. Schemas e DTOs de resposta

Arquivo de referência: `auth-response.dto.ts`

```typescript
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Resposta de autenticação concluída
export const LoginSuccessSchema = z.object({
  accessToken: z.string(),
  characters: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      level: z.number().int(),
    }),
  ),
});

// Resposta de login quando o segundo fator é necessário
export const LoginRequires2faSchema = z.object({
  requires2FA: z.literal(true),
  preAuthToken: z.string(),
});

// O login pode retornar uma autenticação concluída
// ou solicitar a validação do segundo fator
export const LoginResponseSchema = z.union([
  LoginSuccessSchema,
  LoginRequires2faSchema,
]);

// Resposta da configuração do autenticador
export const Setup2faResponseSchema = z.object({
  secret: z.string(),
  qrCode: z.string().regex(
    /^data:image\/png;base64,/,
    "QR Code deve ser uma imagem PNG em Base64",
  ),
});

// Estrutura compartilhada pelas respostas com mensagem
export const MessageResponseSchema = z.object({
  message: z.string(),
});

// Respostas dos endpoints de confirmação e desativação
export const Confirm2faResponseSchema = MessageResponseSchema;
export const Disable2faResponseSchema = MessageResponseSchema;

// A verificação TOTP retorna os mesmos dados de uma autenticação concluída
export const Verify2faResponseSchema = LoginSuccessSchema;

// DTOs de resposta
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class Setup2faResponseDto extends createZodDto(Setup2faResponseSchema) {}
export class Confirm2faResponseDto extends createZodDto(Confirm2faResponseSchema) {}
export class Verify2faResponseDto extends createZodDto(Verify2faResponseSchema) {}
export class Disable2faResponseDto extends createZodDto(Disable2faResponseSchema) {}
```

---

## 3. Schemas e DTOs de entrada

Arquivo de referência: `auth-request.dto.ts`

```typescript
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Dados enviados no login
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Código utilizado para confirmar a configuração do 2FA
export const Confirm2faSchema = z.object({
  code: z.string().regex(
    /^\d{6}$/,
    "O código deve conter exatamente 6 dígitos",
  ),
});

// Dados enviados para validar o segundo fator durante o login
export const Verify2faSchema = z.object({
  preAuthToken: z.string().min(1),
  code: z.string().regex(
    /^\d{6}$/,
    "O código deve conter exatamente 6 dígitos",
  ),
});

// Dados necessários para desativar o 2FA
export const Disable2faSchema = z.object({
  password: z.string().min(6),
  code: z.string().regex(
    /^\d{6}$/,
    "O código deve conter exatamente 6 dígitos",
  ),
});

// DTOs de entrada
export class LoginDto extends createZodDto(LoginSchema) {}
export class Confirm2faDto extends createZodDto(Confirm2faSchema) {}
export class Verify2faDto extends createZodDto(Verify2faSchema) {}
export class Disable2faDto extends createZodDto(Disable2faSchema) {}
```

---
**Objetivo da etapa:** definir os contratos de entrada e saída da API para o fluxo de autenticação em duas etapas, utilizando Zod e `createZodDto` para estruturar os schemas e DTOs.
