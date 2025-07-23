# EHPR: Emergency Health Provider Registry

[![Lifecycle:Stable](https://img.shields.io/badge/Lifecycle-Stable-97ca00)](https://ehpr.gov.bc.ca/)

## Background
The EHPR is an online registry which was first developed to support deployment of Health Authority-employed health care providers during the 2017-2018 wildfire season and was later updated for use during the COVID-19 pandemic. Activation of the EHPR is a proactive step towards ensuring BC’s health care system is best prepared to respond to emergencies of a varied nature, including pandemics, wildfires and floods. It is an online registry of health care professionals who are willing and able to be deployed or hired to support B.C.’s health system response.

## Users

All health care providers or health care staff are invited to register. This includes:

- Health authority (HA) employees – both clinical and non-clinical (i.e., trades,
administrative, etc.);
- Health care providers in good standing (meet fitness to practice requirements) with their health profession regulatory college or credentialing body, who usually work in private practice and would like to be deployed to work in a HA setting;
- Students, including medical residents and employed student nurses;
- Retired health care providers who are:
  - registered on a temporary emergency basis with their health profession regulatory college or credentialing body and are willing to work in a HA; or,
  - unregistered but are able to support an emergency response by providing
  non-clinical care; or,
  - unregistered but who meet the requirements outlined in the [Provincial Health
  Officer (PHO) Order](https://www2.gov.bc.ca/gov/content/health/about-bc-s-health-care-system/office-of-the-provincial-health-officer/current-health-topics/covid-19-novel-coronavirus#orders) to provide or support COVID-19 immunization services – provided the declared public health emergency is in effect.
- Health care providers without a regulatory college or credentialling body (e.g.,
Respiratory Therapists, Medical Laboratory Assistants, Medical Laboratory Technicians), who have retained membership with their society.

## Project structure

### Tech stack

- Runtime environment - NodeJS
- Programming language - Typescript
- Backend API server - NestJS
  - Express
  - TypeORM
  - Swagger
  - CHES
- Database - PostgreSQL 
- Frontend React framework - NextJS
  - Formik
  - Tailwind CSS
  - class-validator
- Deployment
  - GitHub Actions
  - Terraform
  - AWS CloudFront/S3/Lambda/RDS

### Yarn workspaces

| Workspace or Package   | Description                   | README                                     |
|------------------------|-------------------------------|--------------------------------------------|
| apps/api               | Backend **NestJS** API server | [README](apps/api/README.md)               |
| apps/web               | Frontend **NextJS** React app | [README](apps/web/README.md)               |
| packages/common        | Shared library                | [README](packages/common/README.md)        |
| packages/accessibility | Test **Accessibility**        | [README](packages/accessibility/README.md) |
| packages/scripts       | Maintenance utilities         | [README](packages/scripts/README.md)       |


## Check pull request

When you create a pull request, be aware that a GitHub action for each project will be executed to check its validity.

- [pr-check-api](.github/workflows/pr-check-api.yml)
- [pr-check-web](.github/workflows/pr-check-web.yml)
- [pr-check-common](.github/workflows/pr-check-common.yml)
- [pr-check-web](.github/workflows/pr-check-web.yml)
- [pr-check-web-a11y](.github/workflows/pr-check-web-a11y.yml)
- [pr-check-terraform](.github/workflows/pr-check-terraform.yml)

## How to run the apps

### Preparation

- Install NodeJS 16+ as a runtime environment by [nvm](https://github.com/nvm-sh/nvm)
- Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) as a package manager
- Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Check out the repository
  ```bash
  $ git clone https://github.com/bcgov/ehpr2
  $ cd ehpr2
  ```
- Install dependencies
  ```bash
  $ yarn
  ```
- Define environment variables in .env

  Copy [.env.example](.config/.env-example) to .env

  ```bash
  $ cp .config/.env.example .env
  ```

  Define variables for database connection.  
  ```
  PROJECT=ehpr
  RUNTIME_ENV=local
  POSTGRES_HOST=db
  POSTGRES_USERNAME=
  POSTGRES_PASSWORD=
  POSTGRES_DATABASE=
  ```
  > **Database Initialization**
  > 
  > The local `.pgdata` folder is mapped to a volume in db container, and it is initialized at the initial launch. If you change env variables to authenticate a db connection, delete `.pgdata` so that database could be reinitialized.

  > **Slack Integration**
  > 
  >`SLACK_ALERTS_WEBHOOK_URL=`
  > 
  > If SLACK_ALERTS_WEBHOOK_URL is defined and a submission fails with an exception, the error message will be sent to the Slack channel.

### Run as docker containers

The `Make` command `docker-run` to build and launch containers is defined in [Makefile](Makefile).

```bash
$ make docker-run
```

Containers:
- ehpr_db
- ehpr_common
- ehpr_web
- ehpr_api

Containers are configured by [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml)

> If you get a **DockerException**, make sure Docker Desktop is running.
 
```
docker.errors.DockerException: Error while fetching server API version: ('Connection aborted.', ConnectionRefusedError(61, 'Connection refused'))
[80774] Failed to execute script docker-compose
```

### Run as local NodeJS instances

It is recommended to run database as a container in any case. On the other hand, you can run common, api, and web as NodeJS instances. 

#### Start database as a container.

```bash
$ make start-local-db
```

#### Starting a local SES instance

You can use [aws-ses-v2-local](https://www.npmjs.com/package/aws-ses-v2-local) to run a local SES instance, follow the package guide to set up and run SES locally, this would avoid extra AWS charges from developing.

#### Make apps connect to each other.

> **Database Hostname Resolution**
> 
> `POSTGRES_HOST` env is defined as `db`, which is used as a service name in [docker-compose.yml](docker-compose.yml). As `api` uses it to connect to the database and a service name is resolved as an address only in Docker environment, you need to redefine it to resolve it on your local machine. You can set it to `localhost` if you persistently run the app in this way. Otherwise, add `127.0.0.1 db` to `/etc/hosts`.

> **API Calls**
> 
> `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
> 
> To make successful requests from `web` to `api`, you need to set `NEXT_PUBLIC_API_URL` environment variable. It is set by default when using Docker, but if you run the application on its own, you should supply this value by creating a file named `.env.local` placed in `apps/web`.

#### Start the apps.

Always run apps using `make` commands to ensure that envs are loaded properly.

```bash
$ make app-local
```

or if you want `hot reloading` or want to debug, run apps in `watch` mode.

```bash
$ make watch-app-local
```

> In order to make breakpoints work in `watch` mode, set `sourceMap` to `true` in [tsconfig.json](tsconfig.json) and restart the apps.

## Tests

Unit and integration tests are run against the API in the CI pipeline on pull request as well as deploy.

### Running Locally

#### API Unit Tests

Run API unit tests with `make api-unit-test`

#### API Integration Tests

Run API integration tests with `make api-integration-test`

This command will spin up a postgres container, run the API integration tests, then close the created container.

## Deployments: 

The application is hosted in the OCIO Cloud platform - AWS LZ2. 

In order to access the AWS Accounts for each environment, your IDIRs would have to be onboarded on to LZ2 for the project code `bcbwlp` -  EHPR

All Deployments to AWS environments are managed through github actions. 

The following actions trigger deployments as follows: 

`make tag-dev` / Merge to main - Deploy to dev
`make tag-test` - Deploy to test
`make tag-prod` - Deploy to prod after approval. 


#### Infrastructure and Deployments: 

The AWS infrastructure is created and updated using Terraform and Terraform Cloud as the backend. 

The TFC keys required to run terraform can be found in SSM store in AWS. 

Make commands are listed under `terraform commands` in make file for initialization, plan and deployment of resources. 

Service accounts are created with IAM permissions to deploy cloud resources such as - S3 static file uploads, update lambda function, cloudfront invalidation etc. 

### Promotion process: 

Use `make tag-dev` to deploy your changes directly in dev environment without a pr if required. 

Raise a PR to `main` . Once merged, the dev environment will be updated. 

For QA testing, run `make tag-test` only in the main branch once the code is merged into main branch.

#### Production Release: 

All changes in main are released to production by tagging `make tag-prod` along with the version number of the release. 

This creates a release tag and also a production tag, deploying to production, once approved by the Leads / DevOps team members. 


As a part of the production release approval:

1. Validate the latest ZAP scan results to ensure no new vulnerabilites are introduced. 
1. Review the latest code quality analysis results in Sonar Cloud to ensure no new vulnerabilities are introduced. 

## Security Requirements: 

All BC gov projects must pass the STRA (Security Threat and Risk Assessment Standard) and maintain the approved SoAR

More details on STRA [here](https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/information-security/security-threat-and-risk-assessment)

Regular review of ZAP Scan and Sonar Qube results must be performed. Especially before release to production. 

Current STRA and SoAR [here](https://freshworks.atlassian.net/browse/EHPR-251)

> Portal should be SSl, process for certificate renewal - [Refer](./cert/readme.md)
