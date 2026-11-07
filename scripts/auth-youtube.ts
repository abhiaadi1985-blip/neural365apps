/**
 * One-time YouTube OAuth Authorization Helper
 *
 * Lets you authorize ANY Google Account or YouTube Channel (personal, brand account,
 * or business channel) completely independently of your Antigravity login.
 *
 * Usage:
 *   1. Create an OAuth 2.0 Client ID (Desktop App or Web Application with redirect http://localhost:8085/oauth2callback)
 *      in Google Cloud Console (https://console.cloud.google.com/apis/credentials) with YouTube Data API v3 enabled.
 *   2. Add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET to .env.local
 *   3. Run: npx tsx scripts/auth-youtube.ts
 *   4. Select your desired YouTube Channel in the browser popup.
 *   5. The script captures your refresh token and saves it to .env.local automatically.
 */

import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}
loadEnv()

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
const PORT = 8085
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n[Error] Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env.local.')
  console.log('To set up:')
  console.log('1. Go to https://console.cloud.google.com/apis/credentials')
  console.log('2. Create an OAuth 2.0 Client ID (type: Web application)')
  console.log(`3. Add Authorized redirect URI: ${REDIRECT_URI}`)
  console.log('4. Add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET to your .env.local')
  console.log('5. Re-run: npx tsx scripts/auth-youtube.ts\n')
  process.exit(1)
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    access_type: 'offline',
    prompt: 'consent', // Ensures a refresh_token is returned
  }).toString()

console.log('\n======================================================')
console.log('      YouTube Channel OAuth Linker')
console.log('======================================================')
console.log('\n1. Open this link in your browser to authorize your YouTube Channel:')
console.log(`\n${authUrl}\n`)
console.log('👉 Tip: Sign in with WHICHEVER Google account or Brand Channel you want the videos uploaded to!')
console.log(`\nWaiting for authorization on ${REDIRECT_URI}...\n`)

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = url.parse(req.url || '', true)
    if (reqUrl.pathname === '/oauth2callback') {
      const code = reqUrl.query.code as string
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Missing code parameter.')
        return
      }

      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })

      const tokenData = await tokenRes.json()

      if (!tokenRes.ok || !tokenData.refresh_token) {
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(`<h2>Failed to get refresh token</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>`)
        console.error('Token exchange error:', tokenData)
        server.close()
        return
      }

      const refreshToken = tokenData.refresh_token

      // Automatically append or update in .env.local
      const envPath = path.resolve(process.cwd(), '.env.local')
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
      if (envContent.includes('YOUTUBE_REFRESH_TOKEN=')) {
        envContent = envContent.replace(/YOUTUBE_REFRESH_TOKEN=.*/, `YOUTUBE_REFRESH_TOKEN=${refreshToken}`)
      } else {
        envContent += `\nYOUTUBE_REFRESH_TOKEN=${refreshToken}\n`
      }
      fs.writeFileSync(envPath, envContent, 'utf8')

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; text-align: center;">
          <h2 style="color: #22c55e;">🎉 YouTube Authorization Successful!</h2>
          <p>Your channel is now linked. The <code>YOUTUBE_REFRESH_TOKEN</code> has been saved to your <code>.env.local</code> file.</p>
          <p>You can close this tab and return to the terminal.</p>
        </div>
      `)

      console.log('✅ Success! YOUTUBE_REFRESH_TOKEN acquired and saved to .env.local.')
      console.log('Your Stage 2 worker is now authorized to publish directly to that YouTube Channel.')
      server.close()
      process.exit(0)
    }
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal server error: ' + err.message)
    console.error('Server error:', err)
  }
})

server.listen(PORT)
