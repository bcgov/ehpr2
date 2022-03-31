// Master is lambada function dedicated (sequential) to execute any background task for the application 
resource "aws_lambda_function" "background_task" {
  description      = "Lambda for any background task for the application"
  function_name    = local.background_task_name
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = var.api_artifact
  source_code_hash = filebase64sha256(var.api_artifact)
  handler          = "lambda.taskHandler"
  reserved_concurrent_executions  = 1
  memory_size      = var.api_function_memory_mb
  timeout          = 600

  vpc_config {
    security_group_ids = [data.aws_security_group.app.id]
    subnet_ids         = data.aws_subnet_ids.app.ids
  }

  environment {
    variables = {
      TARGET_ENV = var.target_env

      DB_PASSWORD = data.aws_ssm_parameter.pgsql_password.value
      DB_HOST     = aws_rds_cluster.pgsql.endpoint
      DB_NAME     = aws_rds_cluster.pgsql.database_name

      AUTH_URL      = var.keycloak_auth_url
      AUTH_REALM    = var.keycloak_auth_realm
      AUTH_CLIENTID = var.keycloak_auth_clientid
      AUTH_API_KEY  = data.aws_ssm_parameter.api_key.value
      
      EXPORT_EMAIL = var.export_email 
      XLSX_PASSWORD = random_password.password.result

      
    }
  }
}


resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_ssm_parameter" "secret" {
  name        = "/production/database/password/master"
  description = "The parameter description"
  type        = "SecureString"
  value       = random_password.password.result

  tags = {
    environment = "production"
  }
}