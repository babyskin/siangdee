'use client'

import { useState, useRef } from 'react' 
import { Button } from '@/components/ui/button' 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' 
import { Badge } from '@/components/ui/badge' 
import { Mic, Square, Volume2, Loader2, ArrowLeftRight } from 'lucide-react' 

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState('')
  const [direction, setDirection] = useState('fr-lo')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(null)
  
  const getLanguageConfig = () => {
    if (direction === 'fr-lo') {
      return {
        sourceFlag: '🇫🇷',
        targetFlag: '🇱🇦',
        sourceName: 'Français',
        targetName: 'Lao',
        whisperLang: 'fr',
        recordPrompt: 'Appuyez pour enregistrer en français',
        systemPrompt: `You are an expert French-to-Lao translator. 
CRITICAL INSTRUCTIONS:
- Output ONLY romanized Lao (using Latin alphabet), NOT Lao script
- Use standard romanization: "sabaidi" not "ສະບາຍດີ"
- Translate naturally, as a native Lao speaker would say it
- Keep it conversational and simple
- Examples: 
  * "Bonjour" → "Sabaidi" (NOT ສະບາຍດີ)
  * "Comment allez-vous ?" → "Sabaidee bor?" (NOT ສະບາຍດີບໍ່)
  * "Merci" → "Khop chai" (NOT ຂອບໃຈ)`,
        translatePrompt: (text) => `Translate this French text to romanized Lao (using Latin alphabet ONLY, no Lao script): "${text}"

Remember: Output must be in Latin letters (sabaidi, khop chai, etc.), NOT Lao script!`
      }
    } else {
      return {
        sourceFlag: '🇱🇦',
        targetFlag: '🇫🇷',
        sourceName: 'Lao',
        targetName: 'Français',
        whisperLang: 'lo',
        recordPrompt: 'Appuyez pour enregistrer en Lao',
        systemPrompt: `You are an expert Lao-to-French translator.
CRITICAL INSTRUCTIONS:
- The Lao input may be in Lao script (ສະບາຍດີ) or romanized (sabaidi)
- Translate it into natural, fluent, idiomatic French
- Make it sound like a native French speaker would say it
- Keep it conversational and natural
- If the Lao text is unclear, use context to provide the best translation`,
        translatePrompt: (text) => `Translate this Lao text (which may be in Lao script or romanized) into natural French: "${text}"

Provide a clear, fluent French translation as a native speaker would say it.`
      }
    }
  }
  
  const langConfig = getLanguageConfig()

  const toggleDirection = () => {
    setDirection(prev => prev === 'fr-lo' ? 'lo-fr' : 'fr-lo')
    setTranscription('')
    setTranslation('')
    setAudioUrl(null)
    setError('')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendAudioToBackend(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setError('')
    } catch (err) {
      setError('Erreur d\'accès au microphone')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop() 
      setIsRecording(false)
    }
  }

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true)
    setError('')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('source_lang', langConfig.whisperLang)
    formData.append('system_prompt', langConfig.systemPrompt)
    formData.append('translate_prompt', langConfig.translatePrompt('__TEXT__'))

    try {
      const response = await fetch(`${API_URL}/api/transcribe/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la requête')
      }
 
      const data = await response.json()
      console.log('Données reçues:', data)

      setTranscription(data.transcription)
      setTranslation(data.translation)

      if (data.audio_base64) {
        const audioBlob = base64ToBlob(data.audio_base64, 'audio/mpeg')
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
      }

    } catch (err) {
      setError('Erreur de communication avec le serveur') 
      console.error('Erreur:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  const playAudio = () => {
    if (audioUrl) {
     
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-red-500">
          SIANGDEE
        </h1>
        
        {/* Language selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="text-center">
            <div className="text-5xl mb-2">{langConfig.sourceFlag}</div>
            <p className="text-sm font-medium text-gray-300">{langConfig.sourceName}</p>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDirection}
            className="rounded-full h-14 w-14 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all shadow-md"
            title="Inverser la direction"
          >
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
          </Button>
          
          <div className="text-center">
            <div className="text-5xl mb-2">{langConfig.targetFlag}</div>
            <p className="text-sm font-medium text-gray-300">{langConfig.targetName}</p>
          </div>
        </div>

        {/* Recording section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <p className="text-sm text-gray-400 text-center px-4">{langConfig.recordPrompt}</p>
          
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isProcessing}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Mic className="w-14 h-14" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="w-32 h-32 rounded-full animate-pulse bg-red-500 hover:bg-red-600 shadow-lg"
            >
              <Square className="w-12 h-12" />
            </Button>
          )}

          {isRecording && (
            <div className="flex items-center gap-3 text-gray-300">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Enregistrement en cours...</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 text-gray-300">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Traitement en cours...</span>
            </div>
          )}
        </div>

        {/* Display errors */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center font-medium">⚠️ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Display results */}
        {transcription && (
          <div className="space-y-4">
            {/* Transcription originale */}
            <Card className="border-blue-700 bg-gray-800 shadow-md">
              <CardHeader className="bg-blue-900/30">
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <span className="text-2xl">{langConfig.sourceFlag}</span>
                  <span>{langConfig.sourceName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg text-gray-200 leading-relaxed">{transcription}</p>
              </CardContent>
            </Card>

            {/* Traduction avec couleurs du Laos */}
            <Card className="border-red-700 bg-gray-800 shadow-md">
              <CardHeader className="bg-red-900/30">
                <CardTitle className="flex items-center gap-2 text-red-300">
                  <span className="text-2xl">{langConfig.targetFlag}</span>
                  <span>{langConfig.targetName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-xl text-red-400 leading-relaxed font-medium">{translation}</p>
              </CardContent>
            </Card>

            {/* Audio player */}
            {audioUrl && (
              <Card className="border-gray-700 bg-gray-800 shadow-md">
                <CardContent className="pt-6">
                  <Button 
                    onClick={playAudio} 
                    className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                  >
                    <Volume2 className="mr-2 h-5 w-5" />
                    Écouter la traduction
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  )
}