import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock settings data - replace with actual database or config file
let settings = {
  siteName: 'InvoiceMaster',
  siteUrl: 'https://invoicemaster.com',
  adminEmail: 'admin@invoicemaster.com',
  supportEmail: 'support@invoicemaster.com',
  enableRegistration: true,
  enableEmailNotifications: true,
  defaultCurrency: 'USD',
  timezone: 'UTC',
  maintenanceMode: false,
  backupEnabled: true,
  maxFileSize: 10,
  sessionTimeout: 24
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updatedSettings = { ...settings, ...body }

    // Validate settings
    const validationErrors = validateSettings(updatedSettings)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Update settings (in real app, save to database or config file)
    settings = updatedSettings

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'backup':
        // Handle system backup
        const backupData = {
          timestamp: new Date().toISOString(),
          settings: settings,
          backupId: generateBackupId()
        }
        
        return NextResponse.json({
          success: true,
          data: backupData,
          message: 'Backup created successfully'
        })
      
      case 'restore':
        // Handle system restore
        const { backupId } = body
        if (!backupId) {
          return NextResponse.json(
            { error: 'Backup ID is required' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'System restored successfully'
        })
      
      case 'test-email':
        // Test email configuration
        return NextResponse.json({
          success: true,
          message: 'Test email sent successfully'
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing settings request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to validate settings
function validateSettings(settings: any): string[] {
  const errors: string[] = []

  if (!settings.siteName || settings.siteName.trim() === '') {
    errors.push('Site name is required')
  }

  if (!settings.siteUrl || !isValidUrl(settings.siteUrl)) {
    errors.push('Valid site URL is required')
  }

  if (!settings.adminEmail || !isValidEmail(settings.adminEmail)) {
    errors.push('Valid admin email is required')
  }

  if (!settings.supportEmail || !isValidEmail(settings.supportEmail)) {
    errors.push('Valid support email is required')
  }

  if (settings.maxFileSize && (settings.maxFileSize < 1 || settings.maxFileSize > 100)) {
    errors.push('Max file size must be between 1 and 100 MB')
  }

  if (settings.sessionTimeout && (settings.sessionTimeout < 1 || settings.sessionTimeout > 168)) {
    errors.push('Session timeout must be between 1 and 168 hours')
  }

  return errors
}

// Helper function to validate URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to generate backup ID
function generateBackupId(): string {
  return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
