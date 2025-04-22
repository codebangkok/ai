import asyncio
from autogenstudio.teammanager import TeamManager

async def main():
    manager = TeamManager()

    response = await manager.run(
        team_config="team.json",
        task="Write a short story about cat.",
    )
    print(response)

asyncio.run(main())