ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine
ARG PNPM_VERSION=11.1.1

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV CI=true
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY cima-contracts ./cima-contracts
RUN pnpm install --frozen-lockfile
RUN pnpm --prefix cima-contracts build
COPY . .
# Same-origin contract. Route constants already include /api/v1.
ENV VITE_API_BASE_URL=
RUN pnpm build

FROM ${NGINX_IMAGE}
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY snippets/ /etc/nginx/snippets/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
