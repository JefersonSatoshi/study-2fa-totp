# Etapa 4 — Diagrama do fluxo de autenticação 2FA

## Fluxo de autenticação

O diagrama abaixo representa o fluxo de autenticação em duas etapas, incluindo a validação das credenciais, geração do token temporário (`preAuthToken`), validação do código TOTP e emissão do token definitivo.

![Diagrama do fluxo de autenticação 2FA](./imagens/redis.png)