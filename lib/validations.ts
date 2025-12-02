import { z } from 'zod';
import { NicheId } from './niches';

export const roasFormSchema = z.object({
  investment: z.coerce.number().min(0.01, 'Investimento deve ser maior que zero'),
  targetRoas: z.coerce.number().min(0.01, 'ROAS deve ser maior que zero').optional(),
  ticket: z.coerce.number().min(0.01, 'Ticket médio deve ser maior que zero').optional(),
  cpl: z.coerce.number().min(0.01, 'Custo por lead deve ser maior que zero').optional(),
  conversionRate: z.coerce.number().min(0, 'Taxa de conversão não pode ser negativa').max(100, 'Taxa de conversão máxima é 100%').optional(),
  period: z.enum(['monthly', 'daily']),
  niche: z.string().optional(),
  contractMonths: z.preprocess(
    (val) => (val === '' || val === 0 ? undefined : val),
    z.coerce.number().int().min(1, 'Mínimo de 1 mês').max(60, 'Máximo de 60 meses').optional()
  ),
  growthRate: z.coerce.number().min(0).optional(),
  scenario: z.enum(['optimistic', 'realistic', 'pessimistic']).optional().default('realistic'),
  agencyFee: z.coerce.number().min(0).optional(),
  userAgencyFee: z.coerce.number().min(0).optional(),
  targetRevenue: z.coerce.number().min(0).optional(),
});

export type RoasFormData = z.infer<typeof roasFormSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
