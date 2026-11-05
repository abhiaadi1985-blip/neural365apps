import { Config } from '@remotion/cli/config'

// Avoid port 3000 conflict with Next.js dev server
Config.setPort(3333)

// Point to the bundled ffmpeg installer
try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
  if (ffmpegInstaller.path) {
    ;(Config as any).setFfmpegExecutable?.(ffmpegInstaller.path)
  }
} catch (e) {
  // fallback if not available
}

Config.setOverwriteOutput(true)
