// Simple API test script
const testAPI = async () => {
  console.log('Testing API endpoints...')
  
  try {
    // Test dashboard API
    console.log('1. Testing /api/dashboard endpoint...')
    const dashboardResponse = await fetch('http://localhost:3003/api/dashboard')
    console.log('Dashboard status:', dashboardResponse.status)
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json()
      console.log('Dashboard data:', data)
    } else {
      const error = await dashboardResponse.json()
      console.log('Dashboard error:', error)
    }
  } catch (error) {
    console.log('Dashboard fetch error:', error.message)
  }

  try {
    // Test invoice API
    console.log('\n2. Testing /api/invoice endpoint...')
    const invoiceResponse = await fetch('http://localhost:3003/api/invoice')
    console.log('Invoice status:', invoiceResponse.status)
    if (invoiceResponse.ok) {
      const data = await invoiceResponse.json()
      console.log('Invoice data:', data)
    } else {
      const error = await invoiceResponse.json()
      console.log('Invoice error:', error)
    }
  } catch (error) {
    console.log('Invoice fetch error:', error.message)
  }
}

testAPI()
