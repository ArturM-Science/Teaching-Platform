<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# next-mdx-remote: always set blockJS: false

`next-mdx-remote` strips JavaScript expressions by default (`blockJS: true`). This means inline JSX props like `options={[{...}]}` get silently removed, causing `undefined` prop errors at runtime. Our MDX is authored content (not user input), so always pass `blockJS: false` in `MDXRemote` options:

```tsx
<MDXRemote source={raw} components={mdxComponents} options={{ parseFrontmatter: true, blockJS: false }} />
```
