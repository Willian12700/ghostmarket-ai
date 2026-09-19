import { GoogleGenerativeAI } from '@google/generative-ai'

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake-key')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a test"
    })

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage("Hello")
    console.log("Success:", result.response.text())
  } catch (error) {
    console.error("Error:", error)
  }
}

run()
