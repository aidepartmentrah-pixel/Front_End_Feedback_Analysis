# Multi-stage build: compile the React app, then serve the static build with
# nginx. No Node.js is needed on the host or in the final image -- the build
# stage brings its own via the node base image.

FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --omit=dev skips msw/playwright (test-only tooling, not needed for the
# production build) -- also avoids playwright's browser-download postinstall.
RUN npm ci --omit=dev

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 127.0.0.1, not localhost: nginx's default `listen 80;` binds IPv4 only,
# but Alpine/musl's getaddrinfo resolves "localhost" to ::1 (IPv6) first --
# wget then hits a refused IPv6 connection and the healthcheck fails
# permanently, even though real traffic through the container's IPv4 port
# mapping works fine the whole time. Confirmed via `netstat -tlnp` showing
# nginx listening only on 0.0.0.0:80.
#
# /healthz specifically, not "/": port 80 now 301-redirects everything else
# to HTTPS (see nginx.conf) so the mic/getUserMedia secure-context
# requirement is met -- wget doesn't trust the self-signed cert and
# following that redirect would fail the healthcheck. /healthz is exempted
# from the redirect for exactly this reason.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
