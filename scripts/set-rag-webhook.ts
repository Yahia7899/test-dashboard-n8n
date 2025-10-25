#!/usr/bin/env tsx

/**
 * Script pour configurer l'URL du webhook RAG
 * Usage: npx tsx scripts/set-rag-webhook.ts
 */

import { updateSettings, getSettings } from '../lib/db'

const RAG_WEBHOOK_URL = 'https://n8n.srv971532.hstgr.cloud/webhook/8d037ba8-73a9-4d3a-af62-393e2a1084c2'

console.log('\n⚙️  Configuration du webhook RAG...\n')

try {
  // Mettre à jour les paramètres
  const settings = updateSettings({
    ragWebhookUrl: RAG_WEBHOOK_URL
  })

  console.log('✅ Webhook RAG configuré avec succès !')
  console.log('\nURL configurée :')
  console.log(`   ${settings.ragWebhookUrl}`)
  console.log('\nDernière mise à jour :')
  console.log(`   ${new Date(settings.updatedAt).toLocaleString('fr-FR')}`)
  console.log('\n💬 Vous pouvez maintenant utiliser le chat RAG sur /chat\n')
} catch (error) {
  console.error('❌ Erreur lors de la configuration :', error)
  process.exit(1)
}
