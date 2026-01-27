import type { CSSRules, JustagramData, Settings } from '../../types';
import { SettingsService } from './SettingsService';

export class AssetService {
  private static addMenuJS = "";

  private static readonly CSS_RULES: (keyof Settings)[] = [
    "hideReels",
    "hideStories",
    "hideExplore",
    "hideFeed",
    "hideSuggestedReels",
    "hideThreads",
  ];

  public static getAddMenuJS(): string {
    return this.addMenuJS;
  }

  public static async loadAssets(): Promise<JustagramData | null> {
    try {
      console.log("[JustAgram] Loading assets...");

      // Load HTML and JS assets
      const [menuBtnRes, menuRes, scriptRes] = await Promise.all([
        fetch("injected/html/menuButton.html"),
        fetch("injected/html/menu.html"),
        fetch("injected/js/addmenu.js"),
      ]);

      if (!menuBtnRes.ok || !menuRes.ok || !scriptRes.ok) {
        throw new Error("Failed to load one or more assets");
      }

      const menuButtonHTML = await menuBtnRes.text();
      const menuHTML = await menuRes.text();
      this.addMenuJS = await scriptRes.text();

      // Load CSS rule files in parallel
      const cssResponses = await Promise.all(
        this.CSS_RULES.map((name) => fetch(`injected/css/rules/${name}.css`))
      );

      // Build cssRules object
      const cssRules: CSSRules = {} as CSSRules;
      for (let i = 0; i < this.CSS_RULES.length; i++) {
        const ruleName = this.CSS_RULES[i];
        const response = cssResponses[i];

        if (ruleName && response?.ok) {
          cssRules[ruleName] = await response.text();
        } else {
          console.warn(`[JustAgram] Failed to load ${ruleName}.css`);
          if (ruleName) {
            cssRules[ruleName] = "";
          }
        }
      }

      console.log("[JustAgram] Assets loaded successfully");

      return {
        menuButtonHTML,
        menuHTML,
        cssRules,
        settings: SettingsService.load(),
      };

    } catch (e) {
      console.error("[JustAgram] Failed to load assets", e);
      alert("Failed to load JustAgram assets. The app may not function correctly.");
      return null;
    }
  }
}
