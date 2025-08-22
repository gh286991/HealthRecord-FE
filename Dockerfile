FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV={NODE_ENV}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 4321
CMD ["yarn", "start", "-p", "4321"]
