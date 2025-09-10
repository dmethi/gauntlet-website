import requests, json

url = "https://api.sleeper.app/v1/players/nfl"
players = requests.get(url).json()

# Extract only what we need
mapping = {
    pid: {
        "name": p.get("full_name"),
        "pos": p.get("position"),
        "team": p.get("team")
    }
    for pid, p in players.items()
}

with open("sleeper_mapping.json", "w") as f:
    json.dump(mapping, f)