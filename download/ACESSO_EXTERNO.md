# UPMM - Acesso Externo

## URL do Aplicativo
https://quantity-remark-every-remained.trycloudflare.com

## Informações
- O túnel Cloudflare está ativo e funcionando
- Esta URL é temporária e pode mudar se o servidor for reiniciado
- Para acesso permanente, considere deploy na Vercel ou outro serviço de hospedagem

## Como obter a API Key do Pexels
1. Acesse: https://www.pexels.com/api/
2. Crie uma conta gratuita
3. Solicite uma API key
4. Adicione a key no arquivo .env:
   PEXELS_API_KEY=sua_chave_aqui

## Próximos Passos para Deploy Permanente
1. **Vercel** (recomendado):
   - Conecte o repositório GitHub
   - Configure as variáveis de ambiente
   - Deploy automático

2. **Railway/Render**:
   - Conecte o repositório
   - Configure banco PostgreSQL (se necessário)
   - Deploy

3. **Docker**:
   - Use Dockerfile para containerização
   - Deploy em qualquer serviço que suporte Docker
