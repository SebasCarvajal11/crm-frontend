FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Same-origin contract. Route constants already include /api/v1.
ENV VITE_API_BASE_URL=
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY snippets/ /etc/nginx/snippets/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
