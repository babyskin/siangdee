# Siangdee - Backend

Django REST API for voice transcription and translation using OpenAI Whisper and GPT APIs.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Django 5.2](https://www.djangoproject.com/) | Web framework |
| [Django REST Framework](https://www.django-rest-framework.org/) | API framework |
| [OpenAI Python SDK](https://github.com/openai/openai-python) | AI services integration |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | Environment variable management |
| [django-cors-headers](https://github.com/adamchainz/django-cors-headers) | CORS handling |

---

## Project Structure
```
backend/
├── api/                    # Main API application
│   ├── views.py            # API endpoints logic
│   ├── urls.py             # API URL routing
│   ├── models.py           # Database models
│   └── migrations/         # Database migrations
├── config/                 # Django configuration
│   ├── settings.py         # Project settings
│   ├── urls.py             # Root URL configuration
│   ├── wsgi.py             # WSGI configuration
│   └── asgi.py             # ASGI configuration
├── templates/              # HTML templates
├── .gitignore              # Git ignore rules
├── manage.py               # Django management script
└── README.md                
```

---

## Installation

### Prerequisites

- Python 3.10 or higher
- pip package manager
- Virtual environment tool (venv)

### Steps
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Configure environment variables
nano .env  # Edit with your API keys

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000`

## Configuration

### Environment Variables

Create a `.env` file in the backend root directory with the following variables:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-openai-api-key

# Django Secret Key (required)
DJANGO_SECRET_KEY=your-django-secret-key
```

### Generating a Django Secret Key
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### CORS Configuration

By default, CORS is enabled for all origins in development mode. For production, update `config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
]
```

---

## API Endpoints

### POST `/api/transcribe/`

Transcribes audio, translates text, and generates speech output.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audio` | File | Yes | Audio file (webm, mp3, wav, etc.) |
| `source_lang` | String | Yes | Source language code (e.g., 'fr', 'lo') |
| `system_prompt` | String | Yes | Translation system instructions |
| `translate_prompt` | String | Yes | Translation prompt template |

**Response:**
```json
{
  "transcription": "Hi, this is my web app.",
  "translation": "ມັນ ເປັນ ສິ່ງ ເບື່ອ ຫນ່າຍ ທີ່ ຈະ ເຮັດ ເອກະສານ.",
  "audio_base64": "//uQxAAA...(base64 encoded audio)",
  "success": true
}
```

## How It Works

### Request Flow
```
1. Client uploads audio file
         ↓
2. Django receives multipart/form-data request
         ↓
3. Audio sent to OpenAI Whisper API for transcription
         ↓
4. Transcribed text sent to GPT-4 for translation
         ↓
5. Translated text sent to OpenAI TTS API for speech synthesis
         ↓
6. Audio encoded in base64 and returned to client
```

### Translation Process

The backend supports two translation engines:

#### 1. OpenAI GPT-4 (Default)
```python
translation = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": translate_prompt}
    ]
)
```

## Deployment

### Development Server
```bash
python manage.py runserver 0.0.0.0:8000 --verbosity 3
```

## Troubleshooting

### OpenAI API Errors

**Error:** `Language 'lo' is not supported`

**Solution:** Remove the `language` parameter to enable auto-detection for unsupported languages.

### CORS Errors

**Error:** `CORS request did not succeed`

**Solution:** Verify `django-cors-headers` is installed and properly configured in `INSTALLED_APPS` and `MIDDLEWARE`.

### File Upload Size Limits

**Error:** File too large

**Solution:** Increase upload limits in `config/settings.py`:
```python
DATA_UPLOAD_MAX_MEMORY_SIZE = 26214400  # 25 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400  # 25 MB
```
