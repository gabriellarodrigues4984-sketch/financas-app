// Categorias padrão criadas automaticamente para cada novo usuário (ver supabase/schema.sql,
// função handle_new_user). Mantido aqui também para referência/reuso no front-end (ex: ícone de fallback).
export const DEFAULT_CATEGORIES = [
  { name: 'Mercado', icon: 'shopping_basket', color: '#377EC0' },
  { name: 'IFood/restaurante', icon: 'restaurant', color: '#F7891F' },
  { name: 'Uber/transporte', icon: 'local_taxi', color: '#12BAAA' },
  { name: 'Contas', icon: 'receipt_long', color: '#5460AC' },
  { name: 'Assinaturas', icon: 'subscriptions', color: '#9FD2D6' },
  { name: 'Saúde', icon: 'favorite', color: '#F04F52' },
  { name: 'Beleza', icon: 'face', color: '#FBDF54' },
  { name: 'Lazer', icon: 'sports_esports', color: '#12BAAA' },
  { name: 'Desenvolvimento', icon: 'school', color: '#377EC0' },
  { name: 'Roupa', icon: 'checkroom', color: '#5460AC' },
  { name: 'Eletrônicos', icon: 'devices', color: '#414754' },
  { name: 'Presentes', icon: 'card_giftcard', color: '#F04F52' },
  { name: 'Necessidades', icon: 'home', color: '#F7891F' },
  { name: 'Aluguel', icon: 'apartment', color: '#377EC0' },
  { name: 'Despesas eventuais', icon: 'event_repeat', color: '#727785' },
] as const
