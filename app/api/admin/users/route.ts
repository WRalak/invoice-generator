import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock database - replace with actual database
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    joined: '2024-01-15',
    lastActive: '2024-01-20',
    invoiceCount: 23,
    totalSpent: 15420
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    joined: '2024-01-10',
    lastActive: '2024-01-19',
    invoiceCount: 45,
    totalSpent: 28900
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    status: 'inactive',
    joined: '2024-01-05',
    lastActive: '2024-01-12',
    invoiceCount: 12,
    totalSpent: 8750
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
    joined: '2023-12-01',
    lastActive: '2024-01-20',
    invoiceCount: 67,
    totalSpent: 45200
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'user',
    status: 'suspended',
    joined: '2024-01-08',
    lastActive: '2024-01-15',
    invoiceCount: 8,
    totalSpent: 3200
  }
]

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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Filter users based on search and status
    let filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                           user.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'all' || user.status === status
      return matchesSearch && matchesStatus
    })

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
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
    const { name, email, role, status } = body

    // Validate required fields
    if (!name || !email || !role || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      role,
      status,
      joined: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      invoiceCount: 0,
      totalSpent: 0
    }

    users.push(newUser)

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Error creating user:', error)
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
    const { id, name, email, role, status } = body

    // Validate required fields
    if (!id || !name || !email || !role || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find and update user
    const userIndex = users.findIndex(user => user.id === parseInt(id))
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      email,
      role,
      status,
      lastActive: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find and delete user
    const userIndex = users.findIndex(user => user.id === parseInt(id))
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    users.splice(userIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
