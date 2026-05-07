#!/bin/bash

echo "=========================================="
echo "Power Coffee Investor Dashboard — GitHub Setup"
echo "=========================================="
echo ""

# 1. Configure Git identity
echo "Step 1: Configure Git Identity"
read -p "Enter your full name: " git_name
read -p "Enter your email: " git_email

git config --global user.name "$git_name"
git config --global user.email "$git_email"

echo "✅ Git configured: $git_name <$git_email>"
echo ""

# 2. Change to project directory
cd "/Users/lacerdareis/powercoffee-investor-dashboard"

# 3. Create GitHub repository instruction
echo "Step 2: Create GitHub Repository"
echo "1. Open: https://github.com/new"
echo "2. Repository name: powercoffee-investor-dashboard"
echo "3. Set to Private (recommended)"
echo "4. Do NOT check 'Add a README'"
echo "5. Click 'Create repository'"
echo ""
read -p "Press ENTER after creating the repo..."

# 4. Choose auth method
echo ""
echo "Step 3: Choose Authentication Method"
echo "  1) HTTPS (Personal Access Token)"
echo "  2) SSH (SSH key)"
read -p "Enter 1 or 2: " auth_choice

read -p "Enter your GitHub username: " github_username

if [ "$auth_choice" = "1" ]; then
    echo ""
    echo "To create a Personal Access Token (PAT):"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token' → 'Classic'"
    echo "3. Check 'repo' scope"
    echo "4. Generate and copy the token"
    echo ""
    read -sp "Enter your PAT: " pat
    echo ""
    
    git remote add origin "https://${github_username}:${pat}@github.com/${github_username}/powercoffee-investor-dashboard.git"
    echo "✅ Remote added (HTTPS with PAT)"
else
    echo ""
    echo "To set up SSH:"
    echo "1. If you don't have a key: ssh-keygen -t ed25519 -C "$git_email""
    echo "2. Add public key to GitHub: https://github.com/settings/keys"
    echo "   (paste contents of ~/.ssh/id_ed25519.pub)"
    echo ""
    read -p "Press ENTER when SSH key is added to GitHub..."
    
    git remote add origin "git@github.com:${github_username}/powercoffee-investor-dashboard.git"
    echo "✅ Remote added (SSH)"
fi

# 5. Push
echo ""
echo "Step 4: Push to GitHub"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
else
    echo "❌ Push failed. Check your authentication and try again."
    exit 1
fi

# 6. Print Pages instructions
echo ""
echo "Step 5: Enable GitHub Pages"
echo "1. Go to: https://github.com/${github_username}/powercoffee-investor-dashboard/settings/pages"
echo "2. Source: GitHub Actions"
echo "3. Workflow: Deploy to GitHub Pages"
echo "4. Click Save"
echo ""
echo "Site URL: https://${github_username}.github.io/powercoffee-investor-dashboard/"
echo ""
echo "=========================================="
echo "✅ Dashboard deployment complete!"
echo "=========================================="
