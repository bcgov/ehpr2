terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.10.0"
    }
  }

  backend "s3" {
    encrypt = true
  }
}

provider "aws" {
  region = var.region
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

locals {
  namespace = "${var.project_code}-${var.target_env}"
  app_name  = "${local.namespace}-app"
  api_name  = "${local.namespace}-api"
  db_name = "${local.namespace}-db"

  has_domain = var.domain != ""
  is_prod = var.domain == "ehpr.gov.bc.ca"
}
