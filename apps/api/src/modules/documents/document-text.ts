import React from "react";

/**
 * Collects the text of a document by walking the React tree, invoking function
 * components as it goes.
 *
 * Deliberately not via pdf-parse: it bundles a pdf.js build that throws
 * "bad XRef entry" on some of our generated buffers regardless of retries
 * (the same failure behind the pre-existing watermark test failures). Walking
 * the tree asserts the same wording deterministically. Watermark coverage of
 * actual PDF rendering lives in watermark.test.ts.
 */
export function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");

  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  if (!element.type) return "";

  // Function component: call it to get its output, then keep walking.
  if (typeof element.type === "function") {
    const Component = element.type as (props: unknown) => React.ReactNode;
    return textOf(Component(element.props));
  }

  return textOf(element.props?.children);
}

/** PDF text nodes are split across lines; collapse before matching. */
export function flat(text: string): string {
  return text.replace(/\s+/g, " ");
}

/**
 * Renders a document component to collapsed plain text.
 *
 * Generic over the component's props so a mistyped or missing prop in a test
 * is still a compile error — the point of these tests is that the wording is
 * right, which is worth nothing if the props never reached the template.
 */
export function documentText<P extends object>(
  component: (props: P) => React.ReactNode,
  props: P = {} as P
): string {
  const Component = component as React.FunctionComponent<P>;
  return flat(textOf(React.createElement(Component, props)));
}
