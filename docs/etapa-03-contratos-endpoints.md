# Etapa 3 — Payloads JSON do fluxo de autenticação 2FA

## 1. POST `/auth/login`

### Request — corpo enviado pelo cliente

```json
{
  "email": "jogador@email.com",
  "password": "Senha123"
}
```

### Response A — login normal, com 2FA desativado

```json
{
  "accessToken": "eyAccessTokenExemple",
  "characters": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bard",
      "level": 12
    }
  ]
}
```

### Response B — conta com 2FA ativado

```json
{
  "requires2FA": true,
  "preAuthToken": "pre-auth-token-exemplo"
}
```

## 2. POST `/auth/2fa/setup`

### Request — sem corpo JSON

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

### Response — dados para configurar o autenticador

```json
{
  "secret": "1Q2W3E4R5T",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

## 3. POST `/auth/2fa/confirm`

### Request — código usado para confirmar a configuração

```json
{
  "code": "123456"
}
```

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

### Response — configuração confirmada

```json
{
  "message": "Autenticação de dois fatores ativada com sucesso."
}
```

## 4. POST `/auth/2fa/verify`

### Request — validação do segundo fator durante o login

```json
{
  "preAuthToken": "pre-auth-token-exemplo",
  "code": "123456"
}
```

### Response — autenticação concluída

```json
{
  "accessToken": "eyAccessTokenExemple",
  "characters": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bard",
      "level": 12
    }
  ]
}
```

## 5. POST `/auth/2fa/disable`

### Request — senha atual e código TOTP

```json
{
  "password": "Senha123",
  "code": "123456"
}
```

O JWT é enviado no cabeçalho HTTP `Authorization: Bearer <token>`.

### Response — 2FA desativado

```json
{
  "message": "Autenticação de dois fatores desativada com sucesso."
}
```