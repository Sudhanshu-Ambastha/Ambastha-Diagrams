#!/bin/bash

# 1. Find the absolute oldest commit ID in your entire repository history
ROOT_COMMIT=$(git rev-list --max-parents=0 HEAD)

echo "🔄 Soft resetting repository history back to initial root commit: $ROOT_COMMIT"

# 2. Reset the git commit history tracking pointer without touching your actual files
git reset --soft $ROOT_COMMIT

# 3. Stage any miscellaneous untracked or modified file adjustments
git add .

# 4. Overwrite and amend the root commit with your unified codebase state
git commit --amend -m "feat: complete initial diagram engine ecosystem setup"

echo "✅ Success! All commits compressed into a single clean commit."
echo "🚀 Run 'git push origin main --force-with-lease' to update GitHub."