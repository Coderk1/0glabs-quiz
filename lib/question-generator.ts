import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import axios from 'axios'
import { fallbackQuestions } from './fallback-questions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase client with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Supabase URL and service role key are required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const parser = new Parser()

// Updated to include all sources
const NEWS_SOURCES = [
  'https://0g.ai/blog',
  'https://0glabs.notion.site/0gknowledgebase',
  'https://x.com/0g_labs'
]

// Multiple RSS feed URLs to try for 0G
const feedUrls = [
  'https://0g.ai/blog/feed',
  'https://0g.ai/feed',
  'https://blog.0g.ai/feed',
  'https://0g.ai/rss'
]

// Comprehensive topic coverage for complex questions
const TOPIC_AREAS = [
  // Core Technology & Architecture
  '0G Modular Architecture and deAIOS stack design principles',
  '0G Storage mechanics including Log + KV layers and PoRA consensus',
  '0G Data Availability vs Celestia, EigenLayer, and other protocols',
  '0G Compute Network architecture and AI model serving',
  '0G Serving layer and decentralized AI inference',
  '0G sharding design and horizontal scaling mechanisms',
  
  // Advanced Technical Concepts
  '0G Storage PoRA (Proof of Random Access) implementation details',
  '0G DA layer performance benchmarks and TPS capabilities',
  '0G modular design philosophy and component interactions',
  '0G infrastructure overview and deployment architecture',
  '0G whitepaper technical specifications and incentive models',
  '0G consensus mechanisms and validator node operations',
  
  // Testnets & Development
  '0G Newton v2 testnet features and performance metrics',
  '0G Galileo v3 testnet capabilities and upgrade path',
  '0G testnet participation requirements and rewards',
  '0G RPC integration and developer tooling',
  '0G faucet mechanics and test token distribution',
  '0G testnet validator selection criteria and responsibilities',
  
  // Ecosystem & Partnerships
  '0G OnePiece Labs accelerator program structure',
  '0G Web3Labs Global Accelerator partnership details',
  '0G hackathon events (ETHGlobal Cannes, SuperAI, TOKEN2049)',
  '0G ecosystem growth fund allocation and criteria',
  '0G partnership with Alibaba Cloud APAC expansion',
  '0G collaboration with Lumoz and cross-chain integration',
  
  // Node Sale & Community
  '0G AI Alignment Node sale tiers and pricing structure',
  '0G node operator requirements and technical specifications',
  '0G community participation in node sale matching',
  '0G ambassador program selection and responsibilities',
  '0G Discord roles and community governance structure',
  '0G node sale purchasing guide and eligibility criteria',
  
  // Funding & Tokenomics
  '0G funding rounds: pre-seed, seed, and total capital raised',
  '0G token allocation strategy and distribution timeline',
  '0G tokenomics model and incentive alignment',
  '0G ecosystem growth fund utilization and impact',
  '0G token utility in governance and network operations',
  '0G economic model and validator reward mechanisms',
  
  // Advanced AI Concepts
  '0G decentralized AI operating system (dAIOS) architecture',
  '0G AI model fine-tuning on decentralized compute network',
  '0G intelligent agent learning and adaptation mechanisms',
  '0G AI ownership vs API access models',
  '0G onchain AI agent competition and evolution',
  '0G AI-native L1 blockchain design principles',
  
  // Performance & Benchmarks
  '0G performance benchmarking against traditional AI infrastructure',
  '0G high-frequency DeFi capabilities and latency optimization',
  '0G storage performance metrics and optimization',
  '0G compute network efficiency and cost analysis',
  '0G scalability benchmarks and TPS measurements',
  '0G network security and consensus finality guarantees',
  
  // Developer & Integration
  '0G developer documentation and API specifications',
  '0G integration with existing Web3 and AI frameworks',
  '0G SDK capabilities and developer tooling',
  '0G smart contract integration and cross-chain compatibility',
  '0G storage scan and chain scan monitoring tools',
  '0G developer ecosystem and third-party integrations',
  
  // Community & Events
  '0G community events and global roadshow highlights',
  '0G hackathon evolution and participant feedback integration',
  '0G meme contests and community engagement campaigns',
  '0G Twitter Spaces and AMA session topics',
  '0G community governance and decision-making processes',
  '0G global builder momentum and ecosystem growth'
]

export async function generateQuestions(): Promise<void> {
  try {
    console.log('Starting question generation...')
    
    // Fetch content from all sources
    const newsContent = await scrape0GContent()
    
    if (!newsContent || newsContent.length === 0) {
      console.log('No news content found, skipping generation (500 questions already in database)')
      return
    }

    // Generate only 20 questions per hour when API is working
    const questionsToGenerate = 20
    const batchSize = 10 // Generate in smaller batches
    
    for (let i = 0; i < questionsToGenerate; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, questionsToGenerate - i)
      
      try {
        const questions = await generateQuestionBatch(
          newsContent, 
          currentBatchSize, 
          []
        )
        
        if (questions.length > 0) {
          await saveQuestionsToDatabase(questions)
          console.log(`Generated and saved batch ${Math.floor(i/batchSize) + 1}: ${questions.length} questions`)
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, error)
        continue
      }
    }
    
    console.log(`Successfully generated ${questionsToGenerate} questions`)
    
  } catch (error) {
    console.error('Error generating questions:', error)
    // Fallback to basic questions if everything fails
    await generateFallbackQuestions([])
  }
}

async function generateQuestionBatch(
  newsContent: string[], 
  count: number, 
  existingQuestions: string[]
): Promise<any[]> {
  const systemPrompt = `You are an expert on 0G (Zero Gravity) - the world's first decentralized AI operating system. Generate ${count} extremely complex and challenging multiple-choice questions about 0G technology, architecture, ecosystem, and developments.

IMPORTANT REQUIREMENTS:
1. Questions must be VERY DIFFICULT and COMPLEX - suitable for experts in blockchain and AI
2. Cover ALL these topic areas: ${TOPIC_AREAS.join(', ')}
3. Questions should test deep technical knowledge, not basic facts
4. Each question must have 4 options (A, B, C, D) with only ONE correct answer
5. Include questions about specific technical implementations, performance metrics, and advanced concepts
6. Questions should reference specific 0G features, testnets, partnerships, and technical specifications
7. Make questions challenging enough that even experts might struggle
8. Focus on practical applications, technical details, and advanced ecosystem knowledge

Use this recent content as context: ${newsContent.slice(0, 10).join('\n\n')}

Generate questions in this exact JSON format:
[
  {
    "question": "Complex technical question about 0G",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "source_url": "https://0g.ai/blog"
  }
]

Make questions extremely challenging and cover the full spectrum of 0G technology and ecosystem.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} extremely complex questions about 0G technology and ecosystem.` }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    const questions = JSON.parse(response)
    
    // Filter out duplicates and validate
    const uniqueQuestions = questions.filter((q: any) => {
      const questionLower = q.question.toLowerCase()
      return !existingQuestions.includes(questionLower) && 
             q.question && 
             q.options && 
             q.options.length === 4 &&
             typeof q.correct_answer === 'number' &&
             q.correct_answer >= 0 && 
             q.correct_answer <= 3
    })

    return uniqueQuestions

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback to GPT-3.5-turbo if GPT-4 fails
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${count} complex questions about 0G technology.` }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      const questions = JSON.parse(response)
      
      const uniqueQuestions = questions.filter((q: any) => {
        const questionLower = q.question.toLowerCase()
        return !existingQuestions.includes(questionLower) && 
               q.question && 
               q.options && 
               q.options.length === 4 &&
               typeof q.correct_answer === 'number' &&
               q.correct_answer >= 0 && 
               q.correct_answer <= 3
      })

      return uniqueQuestions

    } catch (fallbackError) {
      console.error('Both GPT-4 and GPT-3.5-turbo failed:', fallbackError)
      return []
    }
  }
}

async function scrape0GContent(): Promise<string[]> {
  const content: string[] = []
  
  try {
    // Try RSS feeds first
    for (const feedUrl of feedUrls) {
      try {
        const feed = await parser.parseURL(feedUrl)
        feed.items.forEach(item => {
          if (item.title && item.contentSnippet) {
            content.push(`${item.title}: ${item.contentSnippet}`)
          }
        })
        console.log(`Successfully parsed RSS feed: ${feedUrl}`)
        break // Use first successful feed
      } catch (error) {
        console.log(`Failed to parse RSS feed ${feedUrl}:`, error)
        continue
      }
    }

    // Scrape 0G.ai blog directly
    try {
      const response = await axios.get('https://0g.ai/blog', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      // Extract article titles and content
      const html = response.data
      const titleMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g)
      const contentMatches = html.match(/<p[^>]*>([^<]+)<\/p>/g)
      
      if (titleMatches) {
        titleMatches.slice(0, 20).forEach(match => {
          const title = match.replace(/<[^>]+>/g, '').trim()
          if (title.length > 10) content.push(title)
        })
      }
      
      if (contentMatches) {
        contentMatches.slice(0, 30).forEach(match => {
          const text = match.replace(/<[^>]+>/g, '').trim()
          if (text.length > 20) content.push(text)
        })
      }
      
      console.log('Successfully scraped 0G.ai blog')
    } catch (error) {
      console.log('Failed to scrape 0G.ai blog:', error)
    }

    // Add hardcoded content from X/Twitter and knowledge base
    content.push(
      '0G launches $88.88M Ecosystem Program to accelerate AI apps on 0G',
      '0G introduces ERC-7857 for enhanced token standards',
      '0G Newton Testnet RPC Integration Guide released',
      '0G Storage: Built for the AI Era with PoRA consensus',
      '0G Galileo Testnet: Early Adoption Report shows strong community growth',
      '0G & Web3Labs Global Accelerator: Launchpad for Decentralized AI',
      'Guild on 0G: Euclid, MeetLinkAI, QuillAI showcase ecosystem diversity',
      '0G Compute Network revolutionizes AI fine-tuning',
      '0G V3 Testnet: Galileo introduces advanced features',
      'True AI Ownership vs API Access: 0G returns power to builders',
      'AI Evolution: Intelligent agents learn, adapt, and compete in Web3 on 0G',
      '0G Foundation AI Alignment Node Sale 101: Key details and participation guide',
      '0G DA vs Celestia and EigenLayer: Technical comparison and advantages',
      '0G Storage mechanics: Log + KV layers with PoRA consensus',
      '0G modular architecture: Compute Network, Storage, Data Availability, Serving layer',
      '0G testnet performance: Newton v2 and Galileo v3 benchmarks',
      '0G ecosystem partnerships: OnePiece Labs, Web3Labs, and global accelerators',
      '0G tokenomics: Funding rounds and token allocation strategy',
      '0G community programs: Ambassador initiatives and hackathon evolution',
      '0G technical deep dive: AI-native L1 blockchain design principles'
    )

  } catch (error) {
    console.error('Error scraping content:', error)
  }

  return content
}

async function generateFallbackQuestions(existingQuestions: string[]): Promise<void> {
  // Use the imported fallback questions
  console.log('=== FALLBACK QUESTIONS FUNCTION CALLED ===')
  console.log('Total fallback questions available:', fallbackQuestions.length)
  
  // Add first 1 fallback question (minimal batch for testing)
  const questionsToAdd = fallbackQuestions.slice(0, 1)
  
  console.log(`Adding ${questionsToAdd.length} fallback questions to database...`)
  console.log('Sample question:', questionsToAdd[0])
  await saveQuestionsToDatabase(questionsToAdd)
  console.log(`Generated ${questionsToAdd.length} fallback questions`)
  console.log('=== FALLBACK QUESTIONS FUNCTION COMPLETED ===')
}

async function saveQuestionsToDatabase(questions: any[]): Promise<void> {
  try {
    console.log(`Attempting to save ${questions.length} questions to database...`)
    console.log('Supabase URL:', process.env.SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.SUPABASE_ANON_KEY)
    console.log('First question sample:', questions[0])
    
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select()

    if (error) {
      console.error('Error saving questions to database:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log(`Successfully saved ${questions.length} questions to database`)
      console.log('Inserted data count:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('First inserted question:', data[0])
      }
    }
  } catch (error) {
    console.error('Error saving questions:', error)
    console.error('Full error details:', JSON.stringify(error, null, 2))
  }
} 