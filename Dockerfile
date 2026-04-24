FROM node:22.22.2-alpine AS base

# RUN yarn set version berry
# Copying repo resources
COPY ./packages ./packages
COPY ./apps ./apps
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json

EXPOSE 3000
EXPOSE 4000

# WARNING: This is not a production ready Dockerfile, it is only meant for local development and testing purposes.
# It installs ca-certificates without using TLS certificate verification, which is not secure and should not be used in production environments.
# It is necessary for local deployments as it allows the container to trust the Zscaler root CA certificate.
# It can be built by usinng docker build with the --target=local option.
FROM base AS local

COPY ./certs/zscaler-root-ca.pem /usr/local/share/ca-certificates/zscaler-root-ca.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler-root-ca.crt

RUN apk add --no-cache --no-check-certificate ca-certificates && \
    update-ca-certificates

CMD ["/usr/bin/tail", "-f", "/dev/null"]

# This image is intended for production.
# It can be built by explicitly using the --target=production option or by omitting the --target option as it is the default target (the last to appear in the Dockerfile).
FROM base AS production
CMD ["/usr/bin/tail", "-f", "/dev/null"]