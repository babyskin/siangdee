# Import decorators and classes to create an API endpoint using Django REST Framework
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Import the OpenAI client for using Whisper and GPT models
from openai import OpenAI

# Used to load environment variables from a .env file
from dotenv import load_dotenv

# Import Path for file operations and base64 for audio encoding
from pathlib import Path
import base64
import os

# Load environment variables
load_dotenv()

# Create an OpenAI client using the API key from the .env file
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Define an API endpoint that can be accessed via POST
@api_view(['POST'])
def transcribe_and_translate(request):
    """
    Endpoint complet : transcription + traduction + synthèse vocale
    Supporte les deux directions : FR→LO et LO→FR
    """
    # Check if an audio file was included in the request
    if 'audio' not in request.FILES:
        return Response(
            {'error': 'No audio file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Retrieve the uploaded audio file and translation parameters
    audio_file = request.FILES['audio']
    source_lang = request.POST.get('source_lang', 'fr')
    system_prompt = request.POST.get('system_prompt', '')
    translate_prompt_template = request.POST.get('translate_prompt', '')
    
    try:
        # STEP 1: Convert speech to text using Whisper
        # Convert Django uploaded file to a compatible file object
        audio_file.seek(0)  # Reset the file cursor to the beginning
        
        # Whisper doesn't support 'lo' (Lao) as a language code
        # For Lao, let Whisper auto-detect the language
        if source_lang == 'lo':
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=(audio_file.name, audio_file.read(), audio_file.content_type),
                # No language parameter - auto-detect
            )
        else:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=(audio_file.name, audio_file.read(), audio_file.content_type),
                language=source_lang
            )
        
        # Extract the transcribed text
        text_source = transcript.text
        
        # STEP 2: Translate text using GPT
        # Replace placeholder with actual text
        translate_prompt = translate_prompt_template.replace('__TEXT__', text_source)
        
        translation = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": translate_prompt}
            ]
        )
        # Extract the translated text
        text_target = translation.choices[0].message.content
        
        # STEP 3: Convert translated text to speech using OpenAI TTS
        # Create a temporary file path for the audio file
        speech_file_path = Path("/tmp") / f"speech_{os.urandom(8).hex()}.mp3"
        
        # Generate speech audio from the translated text
        response_tts = client.audio.speech.create(
            model="tts-1",
            voice="alloy",  
            input=text_target
        )
        
        # Save the audio to a temporary file
        response_tts.stream_to_file(speech_file_path)
        
        # Read the audio file and encode it in base64 to send to frontend
        with open(speech_file_path, "rb") as audio_file_read:
            audio_base64 = base64.b64encode(audio_file_read.read()).decode('utf-8')
        
        # Delete the temporary audio file
        os.remove(speech_file_path)
        
        # Return the transcription, translation, and audio
        return Response({
            'transcription': text_source,
            'translation': text_target,
            'audio_base64': audio_base64,
            'success': True
        })
        
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print("=" * 80)
        print("ERREUR DÉTAILLÉE:")
        print(error_traceback)
        print("=" * 80)
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
