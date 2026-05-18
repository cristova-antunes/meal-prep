// app/actions/recipe-thumbnail.ts
"use server";

import { put } from "@vercel/blob";
import { chromium } from "playwright";

export async function processAndStoreThumbnail(
  instagramUrl: string,
  recipeId: string,
): Promise<string | null> {
  const cleanUrl = instagramUrl.split("?")[0];
  let igImageUrl: string | null = null;

  try {
    // 1. Scrape the temporary Instagram image URL
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });
    const page = await context.newPage();
    await page.goto(cleanUrl, { waitUntil: "domcontentloaded" });

    igImageUrl = await page.evaluate(() => {
      const ogImage = document.querySelector('meta[property="og:image"]');
      return ogImage ? ogImage.getAttribute("content") : null;
    });

    await context.close();
    await browser.close();

    if (!igImageUrl) return null;

    // 2. Fetch the actual image data as an ArrayBuffer
    const imageResponse = await fetch(igImageUrl);
    if (!imageResponse.ok)
      throw new Error("Failed to download image from Instagram CDN");

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Vercel Blob
    // We name the file using the recipeId to keep things organized
    const blob = await put(`recipes/thumbnail-${recipeId}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    // 4. Return the permanent Vercel Blob URL
    return blob.url;
  } catch (error) {
    console.error("Error processing thumbnail:", error);
    return null;
  }
}
