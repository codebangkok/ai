#pragma warning disable CS8321, OPENAI002 

using OpenAI;
using OpenAI.Chat;
using Azure.AI.OpenAI;
using OpenAI.Images;
using OpenAI.RealtimeConversation;
using System.ClientModel;

DotNetEnv.Env.Load();

var OPENAI_KEY = Environment.GetEnvironmentVariable("OPENAI_KEY") ?? "";
var AZURE_OPENAI_KEY = Environment.GetEnvironmentVariable("AZURE_OPENAI_KEY") ?? "";
var AZURE_OPENAI_ENDPOINT = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT") ?? "";

// OpenAIClient client = new(apiKey: OPENAI_KEY);
AzureOpenAIClient client = new(endpoint: new(AZURE_OPENAI_ENDPOINT), credential: new ApiKeyCredential(AZURE_OPENAI_KEY));

void Chat() {
    var chatClient = client.GetChatClient("gpt-4o-mini");
    ChatCompletionOptions options = new() {
        MaxOutputTokenCount = 1000,
        Temperature = 0.7f
    };

    List<ChatMessage> messages = [
        new SystemChatMessage("You're personal AI assistant"),
    ];

    Console.WriteLine("=== Chat ===");
    while (true) {
        Console.Write("User: ");
        var prompt = Console.ReadLine();
        UserChatMessage userMessage = new(prompt);
        messages.Add(userMessage);
        
        ChatCompletion completion = chatClient.CompleteChat(messages, options);
        Console.WriteLine($"Assistant: {completion.Content[0].Text}");

        AssistantChatMessage assistantMessage = new(completion);
        messages.Add(assistantMessage);
    }
}

async Task ChatStreaming() {
    var chatClient = client.GetChatClient("gpt-4o-mini");

    Console.WriteLine("=== Chat Streaming ===");
    while (true) {
        Console.Write("User: ");
        var prompt = Console.ReadLine();        
        var completionUpdates = chatClient.CompleteChatStreamingAsync(prompt);

        Console.Write("Assistant: ");
        await foreach (var update in completionUpdates) {
            if (update.ContentUpdate.Count > 0) {
                Console.Write(update.ContentUpdate[0].Text);
            }
        }
        Console.WriteLine();
    }
}

void Vision() {
    var chatClient = client.GetChatClient("gpt-4o");
    ChatCompletionOptions options = new() {
        MaxOutputTokenCount = 1000,
        Temperature = 0.7f
    };

    List<ChatMessage> messages = [
        new SystemChatMessage("You're personal AI assistant"),
    ];

    Console.WriteLine("=== Vision ===");
    while (true) {
        Console.Write("Image: ");
        var imagePath = Path.Combine("vision", Console.ReadLine() ?? "");
        using var imageStream = File.OpenRead(imagePath);
        var imageBytes = BinaryData.FromStream(imageStream);

        Console.Write("User: ");
        var prompt = Console.ReadLine();
        UserChatMessage userMessage = new(
            ChatMessageContentPart.CreateImagePart(imageBytes, "image/png"),
            ChatMessageContentPart.CreateTextPart(prompt)
        );

        messages.Add(userMessage);
        ChatCompletion completion = chatClient.CompleteChat(messages, options);
        Console.WriteLine($"Assistant: {completion.Content[0].Text}");

        AssistantChatMessage assistantMessage = new(completion);
        messages.Add(assistantMessage);
    }
}

void TextToImage() {
    var imageClient = client.GetImageClient("dall-e-3");
    var options = new ImageGenerationOptions {
        Quality = GeneratedImageQuality.High,
        Size = GeneratedImageSize.W1792xH1024,
        Style = GeneratedImageStyle.Vivid,
        ResponseFormat = GeneratedImageFormat.Bytes,
    };

    Console.WriteLine("== Image ==");
    while (true) {
        Console.Write("Prompt: ");
        var prompt = Console.ReadLine();
        var image = imageClient.GenerateImage(prompt, options);
        var imageBytes = image.Value.ImageBytes;
        var imagePath = Path.Combine("image", $"{Guid.NewGuid()}.png");
        using var stream = File.OpenWrite(imagePath);
        imageBytes.ToStream().CopyTo(stream);

        Console.WriteLine($"File: {imagePath}");
    }
}

void TextToSpeech() {
    var audioClient = client.GetAudioClient("tts");

    Console.WriteLine("== Text To Speech ==");
    while (true) {
        Console.Write("Text: ");
        var text = Console.ReadLine();
        var audio = audioClient.GenerateSpeech(text, OpenAI.Audio.GeneratedSpeechVoice.Nova);
        var audioPath = Path.Combine("audio", $"{Guid.NewGuid()}.mp3");
        using var audioStream = File.OpenWrite(audioPath);
        audio.Value.ToStream().CopyTo(audioStream);
        Console.WriteLine($"File: {audioPath}");
    }
}

void SpeechToText() {
    var audioClient = client.GetAudioClient("whisper");

    Console.WriteLine("== Speech To Text (Whisper) ==");
    while (true) {
        Console.Write("Audio: ");
        var audioPath = Path.Combine("whisper", Console.ReadLine() ?? "audio.mp3");
        var transcribe = audioClient.TranscribeAudio(audioPath);
        Console.WriteLine($"Transcribe: ${transcribe.Value.Text}");
    }
}

async Task RealtimeChat() {
    var realtimeClient = client.GetRealtimeConversationClient("gpt-4o-realtime-preview");
    using var session = await realtimeClient.StartConversationSessionAsync();    

    ConversationSessionOptions options = new() {
        Voice = ConversationVoice.Shimmer,
    };

    await session.ConfigureSessionAsync(options);

    SpeakerOutput speaker = new();

    await foreach (var update in session.ReceiveUpdatesAsync()) {        
        switch (update) {
            case ConversationSessionStartedUpdate:
                Console.Write($"== Realtime Chat ==");
                _ = Task.Run(async () =>
                {
                    using var mic = MicrophoneAudioStream.Start();
                    await session.SendInputAudioAsync(mic);
                });
                break;
            
            case ConversationInputSpeechStartedUpdate:
                speaker.ClearPlayback();
                break;

            case ConversationItemStreamingStartedUpdate:
                Console.Write("\n\n>> ");  
                break;

            case ConversationItemStreamingPartDeltaUpdate deltaUpdate:
                Console.Write(deltaUpdate.AudioTranscript); 

                if (deltaUpdate.AudioBytes is not null) {
                    speaker.EnqueueForPlayback(deltaUpdate.AudioBytes);
                }

                break;
        }   
    }
}