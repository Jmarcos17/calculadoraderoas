// lib/pdf-export.ts
/**
 * Módulo de compatibilidade para exportação de PDF
 * Redireciona para o novo módulo de proposta comercial
 */
import { exportCommercialProposal as exportCommercialProposalNew } from './pdf-commercial-proposal';
import { ContractProjection, RoasInput } from './roas';

export function exportProjectionToPDF(
  projection: ContractProjection,
  input: RoasInput,
  organizationName?: string
) {
  // Redireciona para o novo módulo de proposta comercial
  exportCommercialProposalNew({
    projection,
    input,
    organizationName,
  });
}
