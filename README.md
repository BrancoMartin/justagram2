# JustAgram

**Instagram, but *just a gram* at a time.**

JustAgram is a distraction-free wrapper for Instagram designed to kill the doomscroll. It allows you to toggle exactly what you want to see—hiding Reels, the Explore page, Stories, and the Home feed, or keeping what you need.

Why "JustAgram"? Because you should ideally use it *just a gram* at a time, not kilos of brainrot content per hour. 😉

## 📸 Screenshots
<p align="center">
  <img src="screenshots/feed.jpg" width="180" alt="Clean Feed">
  <img src="screenshots/menu.jpg" width="180" alt="Settings Menu">
  <img src="screenshots/search.jpg" width="180" alt="Clean Search">
</p>

## ✨ Features
- **Toggleable Filters:** Choose what to hide: Reels, Stories, Explore, Feed, Suggested Reels, or Threads.
- **Floating Settings:** Access preferences directly within the app via a floating menu button.
- **Persistent Settings:** Your preferences are saved automatically using `localStorage`.
- **Modular Design:** Modular CSS rules for easy maintenance and updates.

## 📥 Installation
If you find this useful, click ⭐ in the top-right of the page to support the project.

[![GitHub stars](https://img.shields.io/github/stars/AlexMatter1512/justagram?style=social)](https://github.com/AlexMatter1512/justagram)
### Android:
[**Download the latest APK from Releases**](../../releases) or build it yourself using the instructions below.
### iOS:
Currently you can only build it yourself using the instructions below.

---

## 🛠 How It Works
This application is a **CapacitorJS** container that loads the mobile Instagram website via [my fork of `cordova-plugin-inappbrowser`](https://github.com/AlexMatter1512/cordova-plugin-inappbrowser) that enables script injection.

It dynamically injects:
1.  **Modular CSS:** Individual filter rules are loaded from `www/css/rules/` based on your settings.
2.  **Interactive Menu:** A custom JavaScript bridge (`addmenu.js`) is injected to provide the floating settings interface and handle user preferences.

This ensures a fast, cross-platform experience while respecting Instagram's security policies (CSP).

## 💻 Development
Built with **Bun** and **Vanilla JS**.

### Prerequisites
- npm or [Bun](https://bun.sh/) for package management
- Node.js (for Capacitor CLI)
- Android Studio (for Android development)
- Xcode (for iOS development)

### Commands
```bash
# Install dependencies
bun install

# Sync web assets to native projects
bun run sync

# Run on Android emulator/device
bunx cap run android

# Open native project in IDE
bunx cap open android
bunx cap open ios
```

### Folder Structure
- [`www/`](www/): Web assets
    - [`css/rules/`](www/css/rules/): Individual CSS filter rules.
    - [`html/`](www/html/): UI components for the settings menu.
    - [`js/injected/`](www/js/injected/): Scripts injected into the Instagram webview.
- [`android/`](android/): Android native project.
- [`ios/`](ios/): iOS native project.
