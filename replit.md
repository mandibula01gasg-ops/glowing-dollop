# Site de Vendas de Açaí - Açaí Prime

## Visão Geral
Site de e-commerce para venda de açaí com sistema de pagamentos via PIX e Cartão de Crédito usando Mercado Pago.

## Estrutura do Projeto

### Frontend (React + TypeScript)
- **Página Inicial (`/`)**: Hero section, catálogo de produtos, carrinho lateral
- **Checkout (`/checkout`)**: Formulário de dados do cliente e seleção de pagamento
- **Confirmação (`/confirmation/:orderId`)**: Página de confirmação com QR Code PIX ou status de cartão

### Backend (Express + PostgreSQL)
- **Banco de Dados**: PostgreSQL com Drizzle ORM
  - Tabela `products`: Catálogo de produtos
  - Tabela `orders`: Pedidos dos clientes
  - Tabela `transactions`: Registro de pagamentos (PIX e Cartão)

### API Endpoints
- `GET /api/products` - Lista todos os produtos
- `POST /api/orders` - Cria novo pedido e processa pagamento
- `GET /api/orders/:id` - Busca pedido por ID
- `POST /api/seed-products` - Popula banco com produtos iniciais

## Integração de Pagamentos

### PIX (✅ Totalmente Funcional)
1. Cliente seleciona PIX no checkout
2. Backend cria pagamento no Mercado Pago
3. QR Code gerado automaticamente
4. Cliente pode copiar código PIX ou escanear QR Code
5. Timer de 15 minutos para pagamento

**Fallback**: Se Mercado Pago não configurado, gera QR Code mock para demonstração

### Cartão de Crédito (⚠️ Requer Configuração)
**Status Atual**: Estrutura implementada mas requer credenciais do Mercado Pago

**Para Habilitar**:
1. Configure as variáveis de ambiente:
   - `MERCADO_PAGO_ACCESS_TOKEN` - Token de acesso do Mercado Pago
   - `VITE_MERCADO_PAGO_PUBLIC_KEY` - Chave pública (frontend)

2. **IMPORTANTE - Segurança**: 
   - Dados de cartão são coletados mas NÃO são armazenados em texto puro
   - Apenas últimos 4 dígitos salvos para referência
   - Em produção, implementar tokenização via SDK do Mercado Pago

**Implementação Futura Recomendada**:
- Adicionar SDK do Mercado Pago no frontend
- Tokenizar cartão antes de enviar ao backend
- Processar pagamento com token ao invés de dados brutos

## Design

### Cores
- **Primária (Roxo)**: `hsl(280 50% 45%)` - Logo e elementos principais
- **Accent (Amarelo)**: `hsl(45 100% 62%)` - CTAs e destaques
- **Fonte**: Poppins (Google Fonts)

### Componentes
- Header com carrinho e contador de itens
- Cards de produto com hover effects
- Carrinho lateral slide-in
- Formulários com validação
- Badges de status e confiança

## Como Usar

### Desenvolvimento
```bash
npm run dev  # Inicia frontend e backend
```

### Banco de Dados
```bash
npm run db:push  # Sincroniza schema com banco
```

### Seed Inicial
```bash
curl -X POST http://localhost:5000/api/seed-products
```

## Produtos Iniciais
1. **Açaí 300ml** - R$ 12,90
2. **Açaí 500ml** - R$ 18,90
3. **Combo Quero+ Açaí** (2x 300ml) - R$ 22,90

## Variáveis de Ambiente Necessárias

### Banco de Dados (✅ Configurado)
- `DATABASE_URL` - String de conexão PostgreSQL
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Credenciais Postgres

### Mercado Pago (⚠️ Pendente Configuração)
- `MERCADO_PAGO_ACCESS_TOKEN` - Token privado para API
- `VITE_MERCADO_PAGO_PUBLIC_KEY` - Chave pública para frontend

## Próximos Passos Recomendados

1. **Configurar Mercado Pago**:
   - Obter credenciais em https://www.mercadopago.com.br/developers
   - Adicionar variáveis de ambiente
   - Testar pagamentos reais

2. **Melhorias de Segurança**:
   - Implementar tokenização de cartão no frontend
   - Adicionar webhook do Mercado Pago para confirmar pagamentos
   - Rate limiting nas rotas de API

3. **Funcionalidades Futuras**:
   - Painel administrativo para gerenciar produtos e pedidos
   - Notificações via WhatsApp/Email
   - Sistema de cupons de desconto
   - Tracking de entrega em tempo real

## Notas Técnicas

- Framework: React + Express + PostgreSQL
- ORM: Drizzle
- Validação: Zod + React Hook Form
- UI: Shadcn/ui + Tailwind CSS
- Pagamentos: Mercado Pago SDK
- QR Code: qrcode library
