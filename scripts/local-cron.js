const cron = require('node-cron')
const axios = require('axios')

// Local cron service for development
// This will automatically generate questions every hour

const BASE_URL = 'http://localhost:3000'
const SECRET = process.env.QUESTION_GENERATION_SECRET || 'pythagoras'

console.log('🕐 Starting local cron service for question generation...')
console.log(`📡 Will call: ${BASE_URL}/api/generate-questions`)
console.log(`⏰ Schedule: Every hour`)
console.log('')

// Schedule question generation every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log(`🔄 [${new Date().toLocaleString()}] Generating questions automatically...`)
    
    const response = await axios.get(`${BASE_URL}/api/generate-questions?secret=${SECRET}`)
    
    if (response.data.success) {
      console.log(`✅ [${new Date().toLocaleString()}] Successfully generated ${response.data.questionCount || 'unknown number of'} questions`)
    } else {
      console.log(`⚠️  [${new Date().toLocaleString()}] Question generation completed but with warnings:`, response.data)
    }
    
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleString()}] Error generating questions:`, error.message)
  }
  
  console.log('')
})

// Also run once immediately on startup
setTimeout(async () => {
  try {
    console.log('🚀 Running initial question generation...')
    
    const response = await axios.get(`${BASE_URL}/api/generate-questions?secret=${SECRET}`)
    
    if (response.data.success) {
      console.log(`✅ Initial generation: ${response.data.questionCount || 'unknown number of'} questions created`)
    } else {
      console.log(`⚠️  Initial generation completed with warnings:`, response.data)
    }
    
  } catch (error) {
    console.error(`❌ Initial generation failed:`, error.message)
  }
  
  console.log('')
}, 2000) // Wait 2 seconds for the server to be ready

console.log('🎯 Local cron service is running!')
console.log('💡 Press Ctrl+C to stop')
console.log('') 