import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import ResendModule from "https://esm.sh/resend@3.2.0"

declare const Deno:
  | {
      env?: {
        get(name: string): string | undefined
      }
      serve?: (handler: (req: Request) => Response | Promise<Response>) => void
    }
  | undefined

interface InvitePayload {
  email: string
  name?: string
  role?: string
  roles?: string[]
  token: string
  artistName?: string
  invitedBy?: string
  ownerRoles?: string[]
  expiresAt?: string
}

const appUrl = Deno?.env?.get("NEXT_PUBLIC_APP_URL") ?? "https://gigrilla.com"
const fromEmail = Deno?.env?.get("RESEND_FROM_EMAIL") ?? "no-reply@gigrilla.com"

function buildInviteEmail(payload: InvitePayload) {
  const inviteUrl = `${appUrl}/invite/artist-member?token=${encodeURIComponent(payload.token)}`
  const previewText = `${payload.invitedBy ?? "A Gigrilla artist"} invited you to join their team.`

  const rolesLine = Array.isArray(payload.roles) && payload.roles.length > 0
    ? `<p style="margin:0 0 12px 0;line-height:1.5">They'd love to have you join as <strong>${payload.roles.join(', ')}</strong>.</p>`
    : payload.role
      ? `<p style="margin:0 0 12px 0;line-height:1.5">They'd love to have you join as <strong>${payload.role}</strong>.</p>`
      : ''

  const ownerRolesLine = Array.isArray(payload.ownerRoles) && payload.ownerRoles.length > 0
    ? `<p style="margin:0 0 16px 0;line-height:1.5">${payload.invitedBy ?? 'This artist'} currently leads as ${payload.ownerRoles.join(', ')}.</p>`
    : ''

  const expiryNote = payload.expiresAt
    ? `<p style="margin:16px 0 0 0;color:#6b7280;font-size:13px">This invitation expires on <strong>${new Date(payload.expiresAt).toLocaleString()}</strong>.</p>`
    : ""

  return {
    subject: `${payload.artistName ?? "A Gigrilla artist"} invited you to join their team`,
    html: `
      <div style="font-family:Inter,Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;padding:40px 24px">
        <div style="max-width:560px;margin:0 auto">
          <div style="text-align:center;margin-bottom:32px">
            <img src="https://gigrilla.com/logo.png" alt="Gigrilla" style="height:40px" />
          </div>
          <div style="background:#111827;border-radius:16px;padding:32px;border:1px solid #1f2937">
            <p style="margin:0 0 16px 0;color:#cbd5f5;font-size:14px">${previewText}</p>
            <h1 style="margin:0 0 16px 0;font-size:24px;color:#f8fafc">You're invited to join ${payload.artistName ?? "a Gigrilla artist"}</h1>
            ${rolesLine}
            ${ownerRolesLine}
            <p style="margin:0 0 32px 0">Use the secure link below to review the invitation and finish setting up your profile.</p>
            <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Review invitation</a>
            ${expiryNote}
            <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px">If you weren’t expecting this, you can ignore the email or let us know so we can revoke the invite.</p>
          </div>
          <p style="text-align:center;color:#64748b;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} Gigrilla. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `${previewText}

Join ${payload.artistName ?? "a Gigrilla artist"} as ${payload.roles?.join(', ') || payload.role || "a collaborator"}.

Review your invitation: ${inviteUrl}

This invitation may expire soon.`
  }
}

// @ts-ignore - Deno global available in Edge Function runtime
Deno.serve(async (request: Request) => {
  try {
    const payload = (await request.json()) as InvitePayload

    if (!payload?.email || !payload?.token) {
      return new Response(JSON.stringify({ error: "Missing email or token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const apiKey = Deno?.env?.get("RESEND_API_KEY")

    if (!apiKey) {
      console.warn("Resend API key not set; skipping email send.")
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    }

    const ResendCtor = (ResendModule as any).Resend ?? ResendModule
    const resend = new ResendCtor(apiKey)

    const emailContent = buildInviteEmail(payload)

    await resend.emails.send({
      from: fromEmail,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error('send-member-invite Edge Function error', error)
    return new Response(JSON.stringify({ error: 'Failed to send invitation email' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})

