gh repo set-default kholia/kholia.github.io

gh run list --limit 1000 --json databaseId --jq '.[].databaseId' | xargs -I{} gh run delete {}
