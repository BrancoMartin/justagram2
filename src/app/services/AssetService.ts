import type { CSSRules, JustagramData, LoadedAssets, Settings } from "../../types";
import { SettingsService } from "./SettingsService";
import { AssetManifest } from "../generated/AssetManifest";

export class AssetService {
  public static async loadAssets(): Promise<LoadedAssets | null> {
    try {
      console.log("[JustAgram] Loading assets...");

      // Load HTML templates
      const htmlPromises = AssetManifest.htmlTemplates.map(async (fileName) => {
        const res = await fetch(`injected/html/${fileName}`);
        if (!res.ok) throw new Error(`Failed to load ${fileName}`);
        return { name: fileName, content: await res.text() };
      });

      // Load Injected Scripts
      const scriptPromises = AssetManifest.injectedScripts.map(async (fileName) => {
        const res = await fetch(`injected/js/${fileName}`);
        if (!res.ok) throw new Error(`Failed to load ${fileName}`);
        return await res.text();
      });

      // Load CSS rules
      const cssPromises = AssetManifest.cssRules.map(async (fileName) => {
        const res = await fetch(`injected/css/rules/${fileName}`);
        if (!res.ok) {
           console.warn(`[JustAgram] Failed to load ${fileName}`);
           return { name: fileName, content: "" };
        }
        return { name: fileName, content: await res.text() };
      });

      const [htmlFiles, scripts, cssFiles] = await Promise.all([
        Promise.all(htmlPromises),
        Promise.all(scriptPromises),
        Promise.all(cssPromises),
      ]);

      // Map HTML to JustagramData properties
      const menuHTML = htmlFiles.find((f) => f.name === "menu.html")?.content || "";
      const menuButtonHTML = htmlFiles.find((f) => f.name === "menuButton.html")?.content || "";

      // Build cssRules object
      const cssRules: CSSRules = {} as CSSRules;
      cssFiles.forEach((file) => {
        const key = file.name.replace('.css', '') as keyof Settings;
        cssRules[key] = file.content;
      });

      console.log("[JustAgram] Assets loaded successfully");

      return {
        menuButtonHTML,
        menuHTML,
        cssRules,
        settings: SettingsService.load(),
        injectedScripts: scripts,
      };
    } catch (e) {
      console.error("[JustAgram] Failed to load assets", e);
      alert(
        "Failed to load JustAgram assets. The app may not function correctly."
      );
      return null;
    }
  }
}
