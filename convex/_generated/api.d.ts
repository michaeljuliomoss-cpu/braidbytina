/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as appointments from "../appointments.js";
import type * as content from "../content.js";
import type * as emails from "../emails.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as seedGallery from "../seedGallery.js";
import type * as services from "../services.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  appointments: typeof appointments;
  content: typeof content;
  emails: typeof emails;
  gallery: typeof gallery;
  http: typeof http;
  products: typeof products;
  seed: typeof seed;
  seedGallery: typeof seedGallery;
  services: typeof services;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
