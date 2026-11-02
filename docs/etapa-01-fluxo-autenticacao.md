# Etapa 1 — Análise do fluxo de autenticação e proposta de 2FA

## 1. Resumo do fluxo atual de login

No fluxo atual, o usuário envia suas credenciais, como login e senha, para a API. O sistema verifica se a senha informada corresponde à senha armazenada, utilizando o método `hasher.verify`.

Caso as credenciais sejam inválidas, a API retorna um erro de autenticação. Caso sejam válidas, a API emite um *access token* para o cliente.

Com esse token, o usuário pode acessar os recursos da API para os quais possui autorização.

## 2. Problema de segurança ao adicionar 2FA mantendo o retorno imediato do token

Entregar o *access token* definitivo logo após a validação da senha seria uma falha grave de segurança.

Primeiramente, isso comprometeria a finalidade do 2FA, que é adicionar uma segunda etapa de verificação para aumentar a segurança da conta. Se o token definitivo fosse emitido antes da validação do segundo fator, essa etapa poderia ser contornada.

Além disso, caso um atacante conseguisse obter esse token, poderia tentar acessar dados e recursos protegidos da conta sem concluir a autenticação de dois fatores, caso a API aceitasse o token normalmente.

Portanto, a API não deve emitir o *access token* definitivo antes da validação do segundo fator quando o 2FA estiver ativado.

## 3. Proposta conceitual da máquina de estados do novo login

O novo fluxo de autenticação deve separar a validação das credenciais da conclusão da autenticação de dois fatores.

### Etapas do fluxo

1. **Envio das credenciais:** o usuário informa seu login e sua senha.
2. **Validação das credenciais:** a API verifica se os dados são válidos. Se forem inválidos, o login é rejeitado.
3. **Verificação do estado do 2FA:** se o usuário não tiver o 2FA ativado, o sistema segue o fluxo convencional e emite o *access token* definitivo. Se o 2FA estiver ativado, será necessário validar o segundo fator.
4. **Sessão provisória:** após a validação da senha, o sistema fornece uma credencial temporária ou outro mecanismo de pré-autenticação, permitindo que o usuário conclua a verificação do segundo fator. Essa credencial não deve permitir acesso aos recursos normais do jogo.
5. **Validação do segundo fator:** o usuário informa o código temporário de seis dígitos gerado pelo aplicativo autenticador. A API verifica se o código TOTP é válido.
6. **Conclusão da autenticação:** se o código estiver incorreto, a tentativa é rejeitada. Se estiver correto, a API conclui a autenticação e emite o *access token* definitivo.
7. **Acesso aos recursos autorizados:** com o token definitivo, o usuário pode acessar os recursos da API conforme as permissões de sua conta.
