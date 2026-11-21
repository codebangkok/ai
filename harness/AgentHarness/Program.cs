#pragma warning disable OPENAI001, MAAI001, IDE0059, CS0219

using Azure.AI.Projects;
using Harness.Shared.Console;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Tools.Shell;
using Microsoft.Extensions.AI;

var endpoint = Environment.GetEnvironmentVariable("ENDPOINT") ?? "";
var apiKey = Environment.GetEnvironmentVariable("API_KEY") ?? "";
var deploymentName = "gpt-6.1-sol";

await using var shell = new LocalShellExecutor(new()
{
    WorkingDirectory = "working",
    Timeout = LocalShellExecutor.DefaultTimeout,
});

var agent = new AIProjectClient(
    new Uri(endpoint),
    new ApiKeyTokenProvider(apiKey)
).GetProjectOpenAIClient()
.GetResponsesClient()
.AsIChatClient(deploymentName)
.AsHarnessAgent(
    new()
    {
        Name = "BondClaw",
        FileMemoryStore = new FileSystemAgentFileStore("memory"),
        FileAccessStore = new FileSystemAgentFileStore("working"),
        AgentSkillsSource = new AgentFileSkillsSource(".agents/skills"),
        ChatOptions = new()
        {
            Tools = [
                shell.AsAIFunction(requireApproval: true),
            ]
        }
    }
);

// var response = await agent.RunAsync("Who's prime minister of Thailand now?");
// Console.WriteLine(response.Text);

await HarnessConsole.RunAgentAsync(agent, "Ask me anything");