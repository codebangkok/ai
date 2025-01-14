## Ollama Local LLM

### วิธีติดตั้งโปรแกรมสำหรับ MacOS (M1,M2,M3,M4)
1) ดาวน์โหลด [Ollama](https://ollama.com/download/Ollama-darwin.zip)
2) ติดตั้ง Ollama
3) เปิดโปรแกรม Terminal
4) ดาวน์โหลดโมเดล
```
ollama pull llama3.2
ollama pull llama3.2-vision
ollama pull codegemma
ollama pull codegemma:2b
ollama pull nomic-embed-text
```
5) ดาวน์โหลด [Docker Desktop](https://desktop.docker.com/mac/main/arm64/Docker.dmg)
6) ติดตั้ง Docker Desktop
7) เปิดโปรแกรม Terminal
8) ดาวน์โหลด open-webui
```
docker pull ghcr.io/open-webui/open-webui:main
```
9) ดาวน์โหลดไฟล์ [docker-compose.yaml](https://github.com/codebangkok/ai/blob/main/tester/docker-compose.yaml)
10) ติดตั้งโปรแกรม [Enchanted LLM](https://apps.apple.com/us/app/enchanted-llm/id6474268307)