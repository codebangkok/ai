using System.ClientModel;
using System.ClientModel.Primitives;

public class ApiKeyTokenProvider(string apiKey) : AuthenticationTokenProvider
{
    public override GetTokenOptions? CreateTokenOptions(IReadOnlyDictionary<string, object> properties) => new(properties);

    public override AuthenticationToken GetToken(GetTokenOptions options, CancellationToken cancellationToken) =>
        new(apiKey, "Bearer", DateTimeOffset.MaxValue);

    public override ValueTask<AuthenticationToken> GetTokenAsync(GetTokenOptions options, CancellationToken cancellationToken) =>
        new(GetToken(options, cancellationToken));
}
