gh repo set-default kholia/kholia.github.io

gh run list --limit 1000 --json databaseId --jq '.[].databaseId' | xargs -I{} gh run delete {}

gh api --paginate \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/{owner}/{repo}/deployments \
  --jq '.[].id' |
  while read -r deployment_id; do
    echo "..."
    gh api \
      --method DELETE \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "/repos/{owner}/{repo}/deployments/${deployment_id}"
  done
