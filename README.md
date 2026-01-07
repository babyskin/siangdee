# Siangdee

### Project Idea
**Siangdee** is a web application for **voice translation**.  
It allows users to **record an audio message**, **automatically transcribe it using the OpenAI Whisper API**, and then **translate it from French to Lao** using an **GPT-4**.

### Technologies
- **Frontend:** [Next.js](https://nextjs.org/) + [shadcn/ui](https://ui.shadcn.com)
- **Backend:** [Django REST Framework](https://www.django-rest-framework.org/)
- **AI Services:** [OpenAI Whisper API](https://platform.openai.com/docs/models/whisper-1) & [GPT-4](https://openai.com/index/gpt-4/)

### Architecture
```
[Frontend : Next.js + shadcn]
↓ ↑
[Backend : Django REST API]
↓ ↑
[OpenAI Whisper API + GPT-4 / Translation]
```

### How It Works
- 1. The user records or uploads an **audio message** from the web interface.  
- 2. The audio is sent to the **backend**, which forwards it to the **OpenAI Whisper API** for transcription.  
- 3. Once transcribed, the **text** is sent to a **GPT-4** that converts it from **French to Lao**.  
- 4. The translated text is then **returned to the user interface** for display or download.

### Modularity
By default, Siangdee is configured for **French → Lao** translation.  
However, the system is **modular and extensible**, meaning it can easily support **any language pair** by adjusting configuration files or translation parameters.  

See the README in the `/frontend` directory for more details on how to customize language pairs.

### What it looks like
<p align="center">
  <img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/e05b1ad7-9775-44ee-b847-58e87ac49ae8" />
</p>
