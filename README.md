git status
git add .
git commit -m "wiris mod"
git push -u origin main

git rm -r --cached node_modules
git commit -m "Remove node_modules from repository and add to .gitignore"
git push origin main
