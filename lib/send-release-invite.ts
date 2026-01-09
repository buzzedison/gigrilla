import { Resend } from 'resend'

interface ReleaseInviteEmailPayload {
  email: string
  token: string
  invitationType: 'distributor' | 'pro' | 'mcs' | 'label' | 'publisher'
  organizationName: string
  contactName?: string | null
  customMessage?: string | null
  releaseTitle?: string | null
  artistName?: string | null
  invitedBy?: string
  expiresAt?: string
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gigrilla.vercel.app'
const resendApiKey = process.env.RESEND_API_KEY?.trim()

const verifiedDomain = 'updates.gigrilla.com'
const configuredFromEmail = process.env.RESEND_FROM_EMAIL?.trim()
const defaultFromEmail = `noreply@${verifiedDomain}`

const fromEmail = configuredFromEmail && configuredFromEmail.length > 0
  ? configuredFromEmail
  : defaultFromEmail

// Configuration for different invitation types
const invitationConfig = {
  distributor: {
    title: 'Music Distribution Collaboration',
    role: 'Distributor',
    description: 'handle digital distribution and master royalty collection',
    icon: '🚚',
    color: '#10b981'
  },
  pro: {
    title: 'Performing Rights Organization',
    role: 'PRO',
    description: 'collect performance royalties',
    icon: '🎭',
    color: '#6366f1'
  },
  mcs: {
    title: 'Mechanical Collection Society',
    role: 'MCS',
    description: 'collect mechanical royalties',
    icon: '🎵',
    color: '#f59e0b'
  },
  label: {
    title: 'Record Label',
    role: 'Label',
    description: 'manage master rights and distribution',
    icon: '🏢',
    color: '#a855f7'
  },
  publisher: {
    title: 'Music Publisher',
    role: 'Publisher',
    description: 'manage publishing rights and royalty collection',
    icon: '📄',
    color: '#3b82f6'
  }
}

function buildReleaseInviteEmail(payload: ReleaseInviteEmailPayload) {
  const config = invitationConfig[payload.invitationType]
  const inviteUrl = `${appUrl.replace(/\/$/, '')}/invite/release-collaborator?token=${encodeURIComponent(payload.token)}`

  const greeting = payload.contactName
    ? `Hi ${payload.contactName},`
    : `Hello,`

  const releaseInfo = payload.releaseTitle && payload.artistName
    ? `for the release <strong>"${payload.releaseTitle}"</strong> by ${payload.artistName}`
    : payload.releaseTitle
      ? `for the release <strong>"${payload.releaseTitle}"</strong>`
      : `for an upcoming music release`

  const customMessageSection = payload.customMessage
    ? `
      <div style="background:#1f2937;border-left:4px solid ${config.color};padding:16px;margin:24px 0;border-radius:8px">
        <p style="margin:0;color:#cbd5e1;font-size:14px;font-style:italic">"${payload.customMessage}"</p>
      </div>
    `
    : ''

  const expiryNote = payload.expiresAt
    ? `<p style="margin:16px 0 0 0;color:#6b7280;font-size:13px">This invitation expires on <strong>${new Date(payload.expiresAt).toLocaleString()}</strong>.</p>`
    : ''

  return {
    subject: `${payload.artistName ?? 'Gigrilla Artist'} invites ${payload.organizationName} to collaborate ${releaseInfo}`,
    html: `
      <div style="font-family:Inter,Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;padding:40px 24px">
        <div style="max-width:560px;margin:0 auto">
          <!-- Header -->
          <div style="text-align:center;margin-bottom:32px">
            <img src="https://gigrilla.com/logo.png" alt="Gigrilla" style="height:40px" />
          </div>

          <!-- Main Card -->
          <div style="background:#111827;border-radius:16px;padding:32px;border:1px solid #1f2937">
            <!-- Icon Badge -->
            <div style="text-align:center;margin-bottom:24px">
              <div style="display:inline-block;background:${config.color}15;border-radius:50%;padding:16px">
                <span style="font-size:32px">${config.icon}</span>
              </div>
            </div>

            <!-- Greeting -->
            <p style="margin:0 0 16px 0;color:#cbd5f5;font-size:14px">${greeting}</p>

            <!-- Title -->
            <h1 style="margin:0 0 16px 0;font-size:24px;color:#f8fafc;text-align:center">
              You're invited to collaborate on a music release
            </h1>

            <!-- Description -->
            <p style="margin:0 0 16px 0;line-height:1.6">
              <strong>${payload.artistName ?? 'An artist'}</strong> on Gigrilla would like to work with
              <strong>${payload.organizationName}</strong> as their <strong style="color:${config.color}">${config.role}</strong>
              ${releaseInfo}.
            </p>

            <p style="margin:0 0 24px 0;line-height:1.6;color:#cbd5e1">
              As the ${config.role}, you'll ${config.description} to ensure all rights holders are paid fairly
              and all music industry standards are met.
            </p>

            <!-- Custom Message -->
            ${customMessageSection}

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px">
                Review Invitation
              </a>
            </div>

            ${expiryNote}

            <!-- Footer Note -->
            <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px;line-height:1.5">
              If you weren't expecting this invitation or don't wish to collaborate, you can safely ignore this email.
              The invitation will expire automatically.
            </p>
          </div>

          <!-- Platform Features -->
          <div style="background:#111827;border-radius:16px;padding:24px;margin-top:24px;border:1px solid #1f2937">
            <h3 style="margin:0 0 16px 0;font-size:16px;color:#f8fafc">Why use Gigrilla?</h3>
            <ul style="margin:0;padding:0;list-style:none">
              <li style="margin:0 0 12px 0;padding-left:28px;position:relative;color:#cbd5e1;font-size:14px">
                <span style="position:absolute;left:0;color:#10b981">✓</span>
                100% royalty payouts where legally possible
              </li>
              <li style="margin:0 0 12px 0;padding-left:28px;position:relative;color:#cbd5e1;font-size:14px">
                <span style="position:absolute;left:0;color:#10b981">✓</span>
                Transparent rights management
              </li>
              <li style="margin:0 0 12px 0;padding-left:28px;position:relative;color:#cbd5e1;font-size:14px">
                <span style="position:absolute;left:0;color:#10b981">✓</span>
                Automated compliance with industry standards
              </li>
              <li style="margin:0;padding-left:28px;position:relative;color:#cbd5e1;font-size:14px">
                <span style="position:absolute;left:0;color:#10b981">✓</span>
                Fair compensation for all rights holders
              </li>
            </ul>
          </div>

          <!-- Copyright -->
          <p style="text-align:center;color:#64748b;font-size:12px;margin-top:32px">
            © ${new Date().getFullYear()} Gigrilla. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `${greeting}

You're invited to collaborate on a music release

${payload.artistName ?? 'An artist'} on Gigrilla would like to work with ${payload.organizationName} as their ${config.role} ${releaseInfo}.

As the ${config.role}, you'll ${config.description} to ensure all rights holders are paid fairly.

${payload.customMessage ? `Personal message:\n"${payload.customMessage}"\n\n` : ''}Review your invitation: ${inviteUrl}

${payload.expiresAt ? `This invitation expires on ${new Date(payload.expiresAt).toLocaleString()}.` : ''}

If you weren't expecting this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Gigrilla. All rights reserved.`
  }
}

export async function sendReleaseInviteEmail(payload: ReleaseInviteEmailPayload) {
  if (!resendApiKey) {
    const error = new Error('RESEND_API_KEY is not configured; skipping email send.')
    console.error('❌', error.message)
    throw error
  }

  const config = invitationConfig[payload.invitationType]

  console.log('📧 Sending release invite email to:', payload.email)
  console.log('📧 From:', fromEmail)
  console.log('📧 Type:', config.role)
  console.log('📧 Organization:', payload.organizationName)

  const resend = new Resend(resendApiKey)
  const emailContent = buildReleaseInviteEmail(payload)

  const result = await resend.emails.send({
    from: fromEmail,
    to: payload.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    headers: {
      'X-Entity-Ref-ID': payload.token,
      'X-Invitation-Type': payload.invitationType
    }
  })

  if (result?.error) {
    console.error('❌ Resend API error while sending release invite:', result.error)
    const error = new Error(result.error.message ?? 'Failed to send invite email via Resend')
    ;(error as Error & { cause?: unknown }).cause = result.error
    throw error
  }

  if (!result?.data?.id) {
    const error = new Error('Resend did not return a message id for release invite email')
    console.error('❌', error.message, result)
    throw error
  }

  console.log('✅ Release invite email sent successfully. Resend ID:', result.data.id)

  return { success: true, data: result.data }
}

export type { ReleaseInviteEmailPayload }
