'use client'

import { useState, useRef } from 'react' 
import { Button } from '@/components/ui/button' 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card' 
import { Badge } from '@/components/ui/badge' 
import { Mic, Square, Volume2, Loader2, ArrowLeftRight } from 'lucide-react' 

export default function Home() {
  // State variables for recording, processing, transcription, translation, audio, and errors
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState('')
  
  // Translation direction: 'fr-lo' or 'lo-fr'
  const [direction, setDirection] = useState('fr-lo')

  // Refs for MediaRecorder and audio chunks
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  // Get language configuration based on direction
  const getLanguageConfig = () => {
    if (direction === 'fr-lo') {
      return {
        sourceFlag: '🇫🇷',
        targetFlag: '🇱🇦',
        whisperLang: 'fr',
        systemPrompt: `
        You are a native Lao translator, specialized in translating from French into natural, everyday Lao.
        Your goal is to produce simple, smooth, and natural sentences —
        the way a real Lao speaker would say or write them in daily life.
        Use clear and natural language, avoiding overly literal, polite, or formal phrasing,
        unless the context specifically requires it.
        Prioritize natural understanding and fluency over word-for-word translation.
        Keep proper names in their most natural Lao form.`,
        translatePrompt: (text) =>
          `Translate the following text from French to Lao. Use a natural and simple tone, as if you were a native Lao speaker speaking normally: "${text}"`
      }
    } else {
      return {
        sourceFlag: '🇱🇦',
        targetFlag: '🇫🇷',
        whisperLang: 'lo',
        systemPrompt: `
        You are a native French translator, specialized in translating from Lao into natural, idiomatic French.
        Your goal is to produce clear, fluent, and idiomatic sentences —
        the way a real French speaker would say or write them in everyday life.
        Avoid overly literal or overly formal translations unless the context requires it.
        Prioritize natural understanding and fluency in French.
        Keep proper names in their most natural French form.`,
        translatePrompt: (text) =>
          `Translate the following text from Lao to French. Use a natural and fluent tone, as if you were a native French speaker speaking normally: "${text}"`
      }
    }
  }
  
  const langConfig = getLanguageConfig()

  // Toggle translation direction
  const toggleDirection = () => {
    setDirection(prev => prev === 'fr-lo' ? 'lo-fr' : 'fr-lo')
    // Reset results when changing direction
    setTranscription('')
    setTranslation('')
    setAudioUrl(null)
    setError('')
  }

  // Starts audio recording
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

  // Stops audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop() 
      setIsRecording(false)
    }
  }

  // Sends recorded audio to backend for transcription and translation
  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true)
    setError('')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('source_lang', langConfig.whisperLang)
    formData.append('system_prompt', langConfig.systemPrompt)
    formData.append('translate_prompt', langConfig.translatePrompt('__TEXT__'))

    try {
      const response = await fetch('http://IP:8000/api/transcribe/', {
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

  // Converts base64 string to Blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Plays the translated audio
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">SIANGDEE</h1>
        
        {/* Language selector with flags and swap button */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-1">{langConfig.sourceFlag}</div>
            <p className="text-sm text-gray-600">{langConfig.sourceName}</p>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDirection}
            className="rounded-full h-12 w-12 hover:bg-indigo-100 transition-all"
            title="Inverser la direction"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <div className="text-4xl mb-1">{langConfig.targetFlag}</div>
            <p className="text-sm text-gray-600">{langConfig.targetName}</p>
          </div>
        </div>

        {/* Recording section without Card wrapper */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <p className="text-sm text-gray-600 text-center">{langConfig.recordPrompt}</p>
          
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isProcessing}
              className="w-32 h-32 rounded-full"
            >
              <Mic className="w-12 h-12" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="w-32 h-32 rounded-full animate-pulse"
            >
              <Square className="w-12 h-12" />
            </Button>
          )}

          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              Enregistrement...
            </Badge>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Traitement...</span>
            </div>
          )}
        </div>

        {/* Display errors */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardContent className="pt-6 text-red-600">
               {error}
            </CardContent>
          </Card>
        )}

        {/* Display transcription and translation */}
        {transcription && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {langConfig.sourceFlag} {langConfig.sourceName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{transcription}</p>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {langConfig.targetFlag} {langConfig.targetName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-indigo-700">{translation}</p>
              </CardContent>
            </Card>

            {audioUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Audio traduit</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={playAudio} className="w-full">
                    <Volume2 className="mr-2" />
                    Écouter la traduction
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}
